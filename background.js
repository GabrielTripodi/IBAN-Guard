import { iterateMessagePages, NUM_NEW_MESSAGES } from "/modules/utilities.js";
import { verifyIban } from "/modules/iban-verification.js";
import { extractIbanFromAttachments, extractIbanFromBody } from "/modules/iban-extractors.js";
import * as pdfjsLib from "/modules/pdfjs/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/modules/pdfjs/pdf.worker.mjs";
const mailTab = (await messenger.tabs.query({ type: "mail" }))[0];

messenger.messageDisplayScripts.register({
  js: [{ file: "messageDisplayAlert/alert-message.js" }],
  css: [
    { file: "assets/bootstrap/bootstrap.min.css" },
    { file: "messageDisplayAlert/alert-message-style.css" }
  ]
});

messenger.runtime.onMessage.addListener(
  async (message, sender, sendResponse) => {
    const { action } = message;
    if (action === "verify") {
      const { name, surname, result } = message;
      return verifyIban(name, surname, result);
    }
    return false;
  }
);

messenger.messageDisplay.onMessageDisplayed.addListener(async (tab, message) => {
    const { ibanCheckOnMessageDisplay } = await messenger.storage.local.get({
      ibanCheckOnMessageDisplay: true
    });
    const selectedMessages = (await messenger.mailTabs.getSelectedMessages(mailTab.id)).messages;
    if (ibanCheckOnMessageDisplay && selectedMessages.length === 1) {
      const attachments = await messenger.messages.listAttachments(message.id);
      const ibanFoundOnAttachments = await extractIbanFromAttachments(message, attachments);
      if (!ibanFoundOnAttachments) {
        extractIbanFromBody(message);
      }
    }
  }
);

messenger.messages.onNewMailReceived.addListener(async (folder, messages) => {
  const { ibanCheckOnNewMessages, numNewMessagesToCheck } =
    await messenger.storage.local.get({
      ibanCheckOnNewMessages: false,
      numNewMessagesToCheck: NUM_NEW_MESSAGES
    });
  if (ibanCheckOnNewMessages) {
    let messageCount = 0;
    for await (let message of iterateMessagePages(messages)) {
      if (messageCount === numNewMessagesToCheck) {
        break;
      }
      const attachments = await messenger.messages.listAttachments(message.id);
      const ibanFoundOnAttachments = await extractIbanFromAttachments(message, attachments);
      if (!ibanFoundOnAttachments) {
        extractIbanFromBody(message);
      }
      messageCount++;
    }
  }
});
