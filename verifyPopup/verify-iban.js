import { API, sendRequest, showFailureNotification, showConfirmationAlert, handleApiResponse } from "/modules/utilities.js";

const verifyButton = document.getElementById("verify-btn");
const nameInput = document.getElementById("name");
const surnameInput = document.getElementById("surname");
const ibanInput = document.getElementById("iban");
const companyNameCheckbox = document.getElementById("company-name");

companyNameCheckbox.addEventListener("change", function () {
  surnameInput.disabled = this.checked;
  if (this.checked) {
    surnameInput.value = "";
  }
});

verifyButton.addEventListener("click", async function () {
  const name = nameInput.value;
  const surname = surnameInput.value;
  const iban = ibanInput.value;
  const isCompanyName = companyNameCheckbox.checked;
  const url = `${API}iban-verification`;

  const data = {
    name: name,
    ...(!isCompanyName && { surname: surname }),
    iban: iban
  };
  const response = await sendRequest(url, data);

  if (response.hasOwnProperty("failed")) {
    showFailureNotification();
    console.error("Error: unable to connect to the server.");
    return;
  }

  if (response.status === 400) {
    handleApiResponse(response);
    return;
  }

  showConfirmationAlert(name, surname, iban, "verify", isCompanyName).then(async (result) => {
      if (result.isConfirmed) {
        handleApiResponse(response, { name: name, surname: surname });
      }
    }
  );
});
