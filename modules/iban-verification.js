import { API, PATH, sendRequest, showNotification, showFailureNotification, getActiveTabId } from "./utilities.js";

export async function verifySenderIban(iban, message, ibanSource = "email body", fileName = null) {
  const mailbox = (await messenger.messengerUtilities.parseMailboxString(message.author))[0];
  const senderName = mailbox.name?.toLowerCase();
  if (senderName === undefined || senderName.includes("@")) {
    showNotification(
      `${PATH}error.png`,
      "Unknown sender name",
      "It was not possible to retrieve the sender's full name"
    );
    return;
  }
  const url = `${API}sender-iban-verification`;
  const data = {
    sender: senderName,
    iban: iban
  };
  const response = await sendRequest(url, data);
  if (response.hasOwnProperty("failed")) {
    showFailureNotification();
    console.error("Error: Unable to connect to the server.");
    return;
  }
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 404) {
      fileName = fileName && fileName.length > 10 ? fileName.slice(0, 10) + "..." : fileName;
      showNotification(
        `${PATH}error.png`,
        "Unknown IBAN",
        `The IBAN found in the ${ibanSource}${
          fileName ? ` '${fileName}'` : ""
        } is not registered in the system. It may be unknown, incorrect or non-existent.`
      );
    } 
    else {
      showFailureNotification();
      console.error(`Error: ${result.error}`);
    }
    return;
  }
  const activeTabId = await getActiveTabId();
  if (result.message === "IBAN matches") {
    showNotification(
      `${PATH}success.png`,
      result.message,
      `The IBAN found in the ${ibanSource} matches the sender ${mailbox.name}.`
    );
    messenger.tabs.sendMessage(activeTabId, {
      title: result.message,
      text: `The IBAN found in the ${ibanSource}${
        fileName ? ` '${fileName}'` : ""
      } matches the sender ${mailbox.name}.`
    });
  } 
  else {
    showNotification(
      `${PATH}warning.png`,
      result.message,
      `The IBAN found in the ${ibanSource} DOES NOT match the sender ${mailbox.name}.`
    );
    messenger.tabs.sendMessage(activeTabId, {
      title: result.message,
      text: `The IBAN found in the ${ibanSource}${
        fileName ? ` '${fileName}'` : ""
      } DOES NOT match the sender ${
        mailbox.name
      }. Please review the email carefully before making any payments!`,
    });
  }
}

export async function verifyBeneficiaryIban(iban, beneficiary, fileName) {
  const url = `${API}sender-iban-verification`;
  const data = {
    sender: beneficiary,
    iban: iban
  };
  const response = await sendRequest(url, data);
  if (response.hasOwnProperty("failed")) {
    showFailureNotification();
    console.error("Error: Unable to connect to the server.");
    return;
  }
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 404) {
      fileName = fileName.length > 10 ? fileName.slice(0, 10) + "..." : fileName;
      showNotification(
        `${PATH}error.png`,
        "Unknown IBAN",
        `The IBAN found in the attached XML '${fileName}' is not registered in the system. It may be unknown, incorrect or non-existent.`
      );
    } 
    else {
      showFailureNotification();
      console.error(`Error: ${result.error}`);
    }
    return;
  }
  const activeTabId = await getActiveTabId();
  if (result.message === "IBAN matches") {
    showNotification(
      `${PATH}success.png`,
      result.message,
      `The IBAN found in the attached XML matches the beneficiary ${beneficiary}.`
    );
    messenger.tabs.sendMessage(activeTabId, {
      title: result.message,
      text: `The IBAN found in the attached XML '${fileName}' matches the beneficiary ${beneficiary}.`
    });
  } 
  else {
    showNotification(
      `${PATH}warning.png`,
      result.message,
      `The IBAN found in the attached XML DOES NOT match the beneficiary ${beneficiary}.`
    );
    messenger.tabs.sendMessage(activeTabId, {
      title: result.message,
      text: `The IBAN found in the attached XML '${fileName}' DOES NOT match the beneficiary ${
        beneficiary
    }. Please review the email carefully before making any payments!`
    });
  }
}

export function verifyIban(name, surname, result) {
  if (result.message === "IBAN matches") {
    showNotification(
      `${PATH}success.png`,
      result.message,
      `The entered IBAN matches ${name}${surname ? ` ${surname}` : ""}.`
    );
  } 
  else {
    showNotification(
      `${PATH}warning.png`,
      result.message,
      `The entered IBAN DOES NOT match ${name}${surname ? ` ${surname}` : ""}.`
    );
  }
}
