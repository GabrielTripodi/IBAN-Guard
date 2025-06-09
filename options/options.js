import { NUM_NEW_MESSAGES } from "/modules/utilities.js";

const storedSettings = await messenger.storage.local.get({
  ibanCheckOnMessageDisplay: true,
  ibanCheckOnNewMessages: false,
  numNewMessagesToCheck: NUM_NEW_MESSAGES
});

const messageDisplaySwitch = document.getElementById("message-display");
const newMessagesSwitch = document.getElementById("new-messages");
const numberContainer = document.getElementById("number-container");
const newMessagesNumber = document.getElementById("new-messages-number");

messageDisplaySwitch.checked = storedSettings.ibanCheckOnMessageDisplay;
newMessagesSwitch.checked = storedSettings.ibanCheckOnNewMessages;
numberContainer.style.display = storedSettings.ibanCheckOnNewMessages ? "block" : "none";
newMessagesNumber.value = storedSettings.numNewMessagesToCheck;

messageDisplaySwitch.addEventListener("change", async function () {
  await messenger.storage.local.set({
    ibanCheckOnMessageDisplay: this.checked,
  });
});

newMessagesSwitch.addEventListener("change", async function () {
  await messenger.storage.local.set({ 
    ibanCheckOnNewMessages: this.checked 
  });
  if (this.checked) {
    numberContainer.style.display = "block";
  } 
  else {
    numberContainer.style.display = "none";
    const setting = await messenger.storage.local.get("numNewMessagesToCheck");
    if (setting.hasOwnProperty("numNewMessagesToCheck")) {
      await messenger.storage.local.set({ 
        numNewMessagesToCheck: NUM_NEW_MESSAGES 
      });
      newMessagesNumber.value = NUM_NEW_MESSAGES;
    }
  }
});

newMessagesNumber.addEventListener("change", async function () {
  await messenger.storage.local.set({
    numNewMessagesToCheck: Number(this.value)
  });
});

newMessagesNumber.addEventListener("keydown", (event) =>
  event.preventDefault()
);
