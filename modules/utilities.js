export const API = "http://localhost:5000/api/v1/";

export const PATH = "/assets/images/";

// /IT[0-9]{2}[A-Z]{1}[0-9]{10}[A-z0-9]{12}/i
// /IT[0-9]{2}[ ]?[A-Z]{1}[0-9]{3}[ ]?[0-9]{4}[ ]?[0-9]{3}[A-Z0-9]{1}[ ]?[A-Z0-9]{4}[ ]?[A-Z0-9]{4}[ ]?[A-Z0-9]{3}/i

export const IBAN_PATTERN = /IT[0-9]{2}[ ]*[A-Z]{1}[0-9]{3}[ ]*[0-9]{4}[ ]*[0-9]{3}[A-Z0-9]{1}[ ]*[A-Z0-9]{4}[ ]*[A-Z0-9]{4}[ ]*[A-Z0-9]{3}/gi;

export const NUM_NEW_MESSAGES = 4;

export const XML_CONTENT_TYPES = [
  "application/xml",
  "text/xml",
  "application/pkcs7-mime"
];

export const XML_EXTENSIONS = [".xml", ".xml.p7m"];

export function getAlert(title, text, icon) {
  Swal.fire({
    title: title,
    text: text,
    icon: icon,
    confirmButtonText: "Ok",
    confirmButtonColor: "#3085d6",
    heightAuto: false,
    allowOutsideClick: false,
    allowEscapeKey: false
  });
}

export async function sendRequest(url, data) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data)
    });
    return response;
  } 
  catch (error) {
    console.error(`Request to ${url} failed: ${error.name} - ${error.message}`);
    return { failed: true };
  }
}

export function showConfirmationAlert(name, surname, iban, action, isCompanyName) {
  const htmlContent = `
    <div style="text-align: left;">
        ${
            isCompanyName
            ? `<p><strong>Company:</strong> ${name}</p>`
            : `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Surname:</strong> ${surname}</p>`
        }
        <p><strong>IBAN:</strong> ${iban}</p>
    </div>
  `;
  const options = {
    title: "Are you sure?",
    html: htmlContent,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: `Yes, ${action} it`,
    allowOutsideClick: false,
    allowEscapeKey: false,
    width: "auto",
    customClass: {
      popup: "tall-alert"
    }
  };
  return Swal.fire(options);
}

export async function handleApiResponse(response, { name, surname } = {}) {
  const result = await response.json();
  if (response.ok) {
    messenger.runtime.sendMessage({
      action: "verify",
      name: name,
      surname: surname,
      result: result
    });
  } 
  else {
    getAlert("Error!", result.error, "error");
  }
}

export async function* iterateMessagePages(page) {
  for (let message of page.messages) {
    yield message;
  }
  while (page.id) {
    page = await messenger.messages.continueList(page.id);
    for (let message of page.messages) {
      yield message;
    }
  }
}

export function showNotification(iconUrl, title, message) {
  messenger.notifications.create({
    type: "basic",
    iconUrl: iconUrl,
    title: title,
    message: message
  });
}

export function showFailureNotification() {
  messenger.notifications.create({
    type: "basic",
    iconUrl: `${PATH}error.png`,
    title: "IBAN verification failed",
    message:
      "There was a problem verifying the IBAN. Please try again later, or use the button in the message toolbar to verify the IBAN manually."
  });
}

export async function getActiveTabId() {
  const activeTab = (await messenger.tabs.query({ active: true, currentWindow: true }))[0];
  return activeTab.type !== "mail" ? activeTab.id : null;
  // return activeTab.id;
}

export function toLower(string) {
  return string.toLowerCase();
}
