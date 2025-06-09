import { IBAN_PATTERN, PATH, XML_CONTENT_TYPES, XML_EXTENSIONS, getActiveTabId, showNotification, toLower } from "./utilities.js";
import { verifySenderIban, verifyBeneficiaryIban } from "./iban-verification.js";
import * as asn1js from "/modules/asn1js/index.es.js";
import * as pkijs from "/modules/pkijs/index.es.js";

function getEmailBody(full) {
  let email = full.parts[0];
  while ( email.contentType !== "text/html" && email.contentType !== "text/plain") {
    email = email.parts[0];
  }
  return email.body || "";
}

function removeIbanSpaces(iban) {
  return iban.replace(/\s+/g, "");
}

function isValidIban(iban) {
  const rearrangedIban = iban.substring(4) + iban.substring(0, 4);
  let remainder = 0;
  for (let i = 0; i < rearrangedIban.length; i++) {
    const charCode = rearrangedIban.charCodeAt(i);
    let numericValue;
    if (48 <= charCode && charCode <= 57) {
      numericValue = charCode - 48;
    } 
    else {
      numericValue = charCode - 55;
    }
    if (numericValue > 9) {
      remainder = (100 * remainder + numericValue) % 97;
    }
    else { 
      remainder = (10 * remainder + numericValue) % 97;
    }
  }
  return remainder === 1;
}

function getFileBaseName(fileName) {
  const fileBaseName = toLower(fileName).endsWith(".xml.p7m")
    ? fileName.slice(0, -8)
    : fileName.slice(0, -4);
  return fileBaseName;
}

export async function extractIbanFromBody(message) {
  const full = await messenger.messages.getFull(message.id);
  const emailBody = getEmailBody(full);
  const plainText = await messenger.messengerUtilities.convertToPlainText(emailBody);
  const match = plainText.match(IBAN_PATTERN);
  const iban = match ? removeIbanSpaces(match[0]).toUpperCase() : null;
  if (iban) {
    const allIbans = [...new Set(match.map((iban) => removeIbanSpaces(iban).toUpperCase()))];
    if (allIbans.length > 1) {
      const activeTabId = await getActiveTabId();
      messenger.tabs.sendMessage(activeTabId, {
        title: "Multiple IBANs",
        text: 
          `Multiple IBANs were found in the email body. This may indicate a fraud attempt. Only the first IBAN will be verified.<br>Detected IBANs: ${allIbans.join(", ")}.`
      });
    }
    if (!isValidIban(iban)) {
      showNotification(
        `${PATH}error.png`,
        "Invalid IBAN",
        "The IBAN found in the email body is not valid. It may be non-existent or incorrect."
      );
      return;
    }
    verifySenderIban(iban, message);
  } 
  else {
    showNotification(
      `${PATH}error.png`,
      "No IBAN found",
      "No IBAN was detected in the email body and attachments. Make sure the email contains a valid IBAN if required."
    );
  }
}

function extractXmlTextFromSignedP7m(arrayBuffer) {
  const asn1 = asn1js.fromBER(arrayBuffer);
  const contentInfo = new pkijs.ContentInfo({ schema: asn1.result });
  const signedData = new pkijs.SignedData({ schema: contentInfo.content });
  const eContent = signedData.encapContentInfo.eContent;
  const xmlText = new TextDecoder().decode(eContent.valueBlock.valueHex);
  return xmlText;
}

async function extractXmlTextFromFile(file, fileName) {
  if (toLower(fileName).endsWith(".p7m")) {
    const arrayBuffer = await file.arrayBuffer();
    return extractXmlTextFromSignedP7m(arrayBuffer);
  }
  return await file.text();
}

function isElectronicInvoice(xmlRoot) {
  return (
    xmlRoot.localName === "FatturaElettronica" &&
    xmlRoot.namespaceURI === "http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2" &&
    ["FPA12", "FPR12"].includes(xmlRoot.getAttribute("versione"))
  );
}

function getInvoiceBeneficiary(beneficiaryNode, supplierNode) {
  if (beneficiaryNode) {
    return beneficiaryNode.textContent;
  }
  const companyName = supplierNode.getElementsByTagName("Denominazione")[0];
  if (companyName) {
    return companyName.textContent;
  }
  const nameNode = supplierNode.getElementsByTagName("Nome")[0];
  const surnameNode = supplierNode.getElementsByTagName("Cognome")[0];
  return nameNode.textContent + " " + surnameNode.textContent;
}

export async function extractIbanFromXml(messageId, attachments) {
  for (let attachment of attachments) {
    const file = await messenger.messages.getAttachmentFile(messageId, attachment.partName);
    const xmlText = await extractXmlTextFromFile(file, attachment.name);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "application/xml");
    if (isElectronicInvoice(xmlDoc.documentElement)) {
      const ibanNode = xmlDoc.getElementsByTagName("IBAN")[0];
      const beneficiaryNode = xmlDoc.getElementsByTagName("Beneficiario")[0];
      const supplierNode = xmlDoc.getElementsByTagName("CedentePrestatore")[0];
      if (ibanNode) {
        const iban = ibanNode.textContent;
        const beneficiary = getInvoiceBeneficiary(beneficiaryNode, supplierNode);
        const fileName = getFileBaseName(attachment.name);
        return [removeIbanSpaces(iban).toUpperCase(), beneficiary, fileName];
      }
    }
  }
  return [];
}

function isPdfFile(pdfData) {
  const header = new TextDecoder().decode(pdfData.slice(0, 5));
  return header === "%PDF-";
}

function reconstructTextInFlow(items, maxWordGap = 1.5) {
  const groupedByLine = {};
  for (let item of items) {
    const y = item.transform[5].toFixed(1);
    if (!groupedByLine[y]) {
      groupedByLine[y] = [];
    }
    groupedByLine[y].push(item);
  }
  const sortedLines = Object.keys(groupedByLine).sort((a, b) => b - a).map((y) => groupedByLine[y]);
  let output = "";
  let firstLine = true;
  for (let line of sortedLines) {
    line.sort((a, b) => a.transform[4] - b.transform[4]);
    let currentLine = [];
    let previousItem = null;
    for (let item of line) {
      const text = item.str.trim();
      if (!text) {
        continue;
      }
      const currX = item.transform[4];
      if (!previousItem) {
        currentLine.push(text);
      } 
      else {
        const prevX = previousItem.transform[4];
        const prevW = previousItem.width;
        const gap = currX - (prevX + prevW);
        if (gap < maxWordGap) {
          const last = currentLine.pop();
          currentLine.push(last + text);
        } 
        else {
          currentLine.push(text);
        }
      }
      previousItem = item;
    }

    if (!firstLine) output += "\n";
    output += currentLine.join(" ");
    firstLine = false;
  }
  return output;
}

export async function extractIbanFromPdf(messageId, attachments) {
  for (let attachment of attachments) {
    const file = await messenger.messages.getAttachmentFile(messageId, attachment.partName);
    const arrayBuffer = await file.arrayBuffer();
    const pdfData = new Uint8Array(arrayBuffer);
    if (isPdfFile(pdfData)) {
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += reconstructTextInFlow(textContent.items) + "\n\n";
      }
      const match = text.match(IBAN_PATTERN);
      const iban = match ? removeIbanSpaces(match[0]).toUpperCase() : null;
      if (iban) {
        const fileName = getFileBaseName(attachment.name);
        const allIbans = [...new Set(match.map((iban) => removeIbanSpaces(iban).toUpperCase()))];
        if (allIbans.length > 1) {
          const activeTabId = await getActiveTabId();
          messenger.tabs.sendMessage(activeTabId, {
            title: "Multiple IBANs",
            text: `Multiple IBANs were found in the attached PDF '${
              fileName
            }'. This may indicate a fraud attempt. Only the first IBAN will be verified.<br>Detected IBANs: ${allIbans.join(", ")}.`
          });
        }
        return [iban, fileName];
      }
    }
  }
  return [];
}

export async function extractIbanFromAttachments(message, attachments) {
  const messageId = message.id;
  const pdfAttachments = attachments.filter((attachment) =>
      attachment.contentType === "application/pdf" && toLower(attachment.name).endsWith(".pdf")
  );
  if (pdfAttachments.length > 0) {
    let [iban = null, fileName = null] = await extractIbanFromPdf(messageId, pdfAttachments);
    if (iban) {
      if (isValidIban(iban)) {
        verifySenderIban(iban, message, "attached PDF", fileName);
      } 
      else {
        fileName = fileName.length > 10 ? fileName.slice(0, 10) + "..." : fileName;
        showNotification(
          `${PATH}error.png`,
          "Invalid IBAN",
          `The IBAN found in the attached PDF '${fileName}' is not valid. It may be non-existent or incorrect.`
        );
      }
      return true;
    }
  }
  const xmlAttachments = attachments.filter((attachment) =>
      XML_CONTENT_TYPES.includes(attachment.contentType) &&
      XML_EXTENSIONS.some((extension) => toLower(attachment.name).endsWith(extension))
  );
  if (xmlAttachments.length > 0) {
    let [iban = null, beneficiary = null, fileName = null] = await extractIbanFromXml(messageId, xmlAttachments);
    if (iban) {
      if (isValidIban(iban)) {
        verifyBeneficiaryIban(iban, beneficiary, fileName);
      } 
      else {
        fileName = fileName.length > 10 ? fileName.slice(0, 10) + "..." : fileName;
        showNotification(
          `${PATH}error.png`,
          "Invalid IBAN",
          `The IBAN found in the attached XML '${fileName}' is not valid. It may be non-existent or incorrect.`
        );
      }
      return true;
    }
  }
  return false;
}
