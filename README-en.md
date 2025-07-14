# IBAN Guard

![Extension icon](https://raw.githubusercontent.com/GabrielTripodi/IBAN-Guard/main/assets/images/icon.png)

**Available languages / Lingue disponibili**: [IT](README.md) | [EN](README-en.md)

**IBAN Guard** is an extension for the Mozilla Thunderbird email client designed to prevent **Business Email Compromise** (BEC) attacks by detecting potential frauds based on the fraudulent replacement of IBANs in emails. The extension automatically analyzes messages to check whether the IBAN code found in the email body or its PDF/XML attachments actually matches the sender, using a dedicated [banking API](https://github.com/GabrielTripodi/Banking-API).

---

## 🧠 Motivation

The extension was born out of the need to create an innovative tool — currently absent in the market — capable of offering a proactive line of defense against BEC scams, which cause billions of euros in damages to businesses every year. In particular, it aims to identify frauds where an IBAN is altered during email communication to divert payments to accounts controlled by scammers.

---

## 🎯 Goals

- Automatically detect IBAN codes in emails and attachments.
- Verify whether the found IBAN matches the sender's name.
- Promptly notify the user of possible fraud attempts involving IBAN manipulation.
- Allow the user to manually verify an IBAN if desired.

---

## 🔧 Main Features

### ✅ Automatic verification

- Triggered on **email display** or **receipt of new emails**.
- Extracts IBANs from three sources:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1. **Email body**\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. **PDF attachments** (e.g., traditional invoices)\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3. **XML attachments** (optimized for **Italian electronic invoices**)

- Also supports digitally signed electronic invoices in CAdES-BES format (`.p7m` files).
- Displays a clear and immediate warning above the message...

### 🧑‍💼 Manual verification

- Accessible via a **"Verify IBAN"** button in the message viewer toolbar.
- Opens a popup where the user can manually enter an IBAN and the account holder’s name (individual or company) for instant verification.
- Ideal for checking IBANs in ambiguous situations or when automatic verification cannot be performed.

### ⚙️ Options interface

- Allows users to enable/disable automatic verification modes based on preferences.
- Lets users set a maximum number of new emails to check, balancing security and performance.

### ❌ Advanced Error Handling:

- Transparently notifies the user in case of issues, such as:

  - IBAN not found in the message
  - IBAN is syntactically invalid
  - Unable to connect to the banking API
  - IBAN not found in the API database

---

## 🛠️ Technologies Used

- WebExtension API
- JavaScript / HTML / CSS

---

## 🖥️ Requirements

- Thunderbird (version compatible with WebExtension API)
- Connection to the Flask API for IBAN verification (can be run locally or on a remote server)

---

## 🚀 Installation (Developer Mode)

### 1. Clone the repository

```bash
git clone https://github.com/GabrielTripodi/IBAN-Guard.git
cd IBAN-Guard
```

### 2. Start the banking API

```bash
cd Banking-API/
python initialize_database.py  # Creates the database and inserts simulated data
python app.py                  # Starts the Flask server on localhost:5000
```

### 3. Load the extension in Thunderbird

- Open Thunderbird
- Go to `Add-ons and Themes` → `Tools` → `Debug Add-ons` → `Load Temporary Add-on...`
- Click the gear icon and select `Debug Add-ons`
- Click `Load Temporary Add-on...`
- Navigate to the project folder and select the `manifest.json` file

The "IBAN Guard" extension will be loaded and remain active until Thunderbird is restarted.

---

## 💡 Usage

Once installed, the extension will operate automatically in the background.

- **Automatic Verification**: Open an email containing an IBAN (in the body or in a PDF/XML attachment). A warning and notification will appear at the top of the message after a few moments.
- **Manual Verification**: Open any message, click the **"Verify IBAN"** button in the toolbar, fill in the fields, and click "Verify IBAN". You will receive a notification with the verification result.
- **Configuration**: To modify settings, go to the add-ons tab, find "IBAN Guard", and click the "Options" tab.

---

## 🎓 Thesis Project

The **IBAN Guard** extension was developed as part of an experimental thesis project.
- **Title**: Design and development of a Thunderbird extension aimed at preventing Business Email Compromise attacks
- **Candidate**: Gabriel Tripodi
- **Supervisor**: Prof. Giovambattista Ianni
- **University**: University of Calabria, Department of Mathematics and Computer Science
- **Degree Program**: Master's Degree in Artificial Intelligence and Computer Science
- **Academic Year**: 2024/2025

