# IBAN Guard

![Icona dell'estensione](https://raw.githubusercontent.com/GabrielTripodi/IBAN-Guard/main/assets/images/icon.png)

**Lingue disponibili / Available languages**: [IT](README.md) | [EN](README-en.md)

**IBAN Guard** è un’estensione per il client di posta elettronica Mozilla Thunderbird progettata per prevenire attacchi di tipo **Business Email Compromise** (BEC), rilevando potenziali truffe basate sulla sostituzione fraudolenta dell'IBAN nelle email. L'estensione analizza automaticamente i messaggi per verificare se il codice IBAN presente nel corpo del'e-mail o nei relativi allegati PDF e XML corrisponda effettivamente al mittente dell'email tramite l'utilizzo di un'apposita [API bancaria](https://github.com/GabrielTripodi/Banking-API).

---

## 🧠 Motivazioni

L’estensione nasce dalla necessità di creare uno strumento innovativo, attualmente assente sul mercato, in grado di offrire una linea di difesa proattiva contro le truffe legate agli attacchi BEC, che ogni anno causano miliardi di euro di danni alle aziende. In particolare, mira a identificare le frodi in cui un IBAN viene alterato durante la comunicazione via email per dirottare i pagamenti su conti controllati da truffatori. 

---

## 🎯 Obiettivi

- Individuare automaticamente i codici IBAN presenti nei messaggi email e nei loro allegati.
- Verificare se l’IBAN trovato corrisponde al nome del mittente.
- Segnalare tempestivamente all’utente possibili tentativi di truffe legate alla manipolazione dell'IBAN.
- Consentire anche una verifica manuale da parte dell’utente.

---

## 🔧 Funzionalità Principali

### ✅ Verifica automatica

- Si attiva alla **visualizzazione di un'e-mail** o alla **ricezione di nuove e-mail**.
- Estrae l'IBAN da tre diverse posizioni:  

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1. **Corpo dell'e-mail.**  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. **Allegati PDF** (es. fatture tradizionali).  
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3. **Allegati XML** (specializzato per le **fatture elettroniche italiane**).

- Supporta anche l'analisi di fatture elettroniche firmate digitalmente con formato CAdES-BES (file `.p7m`).
- Mostra un avviso chiaro e immediato sopra il messaggio...

### 🧑‍💼 Verifica manuale

- Accessibile tramite un pulsante **"Verify IBAN"** nella barra degli strumenti di visualizzazione dei messaggi.
- Apre un popup dove l'utente può inserire manualmente un IBAN e il nome dell'intestatario (persona fisica o azienda) per una verifica istantanea.
- Ideale per controllare IBAN in situazioni ambigue o quando la verifica automatica non può essere eseguita.

### ⚙️ Interfaccia delle opzioni

- Permette all'utente di abilitare/disabilitare le modalità di verifica automatica secondo le proprie preferenze.
- Consente di impostare un numero massimo di nuovi messaggi da controllare per bilanciare sicurezza e prestazioni.

### ❌ Gestione Avanzata degli Errori:

- Notifica l'utente in modo trasparente in caso di problemi, come:

    - IBAN non trovato nel messaggio.
    - IBAN formalmente non valido.
    - Impossibilità di connettersi all'API bancaria.
    - IBAN non presente nel database dell'API.

---

## 🛠️ Tecnologie utilizzate

- WebExtension API
- JavaScript / HTML / CSS

---

## 🖥️ Requisiti

- Thunderbird (versione compatibile con WebExtension API)
- Connessione con l’API Flask per la verifica degli IBAN (eseguibile in locale o su server remoto)

---

## 🚀 Installazione (modalità sviluppatore)

### 1. Clona il repository

```bash
git clone https://github.com/GabrielTripodi/IBAN-Guard.git
cd IBAN-Guard
```

### 2. Avvia l’API bancaria

```bash
cd Banking-API/
python initialize_database.py  # Crea il database e inserisce dati simulati
python app.py                  # Avvia il server Flask su localhost:5000
```

### 3. Carica l’estensione su Thunderbird

- Apri Thunderbird
- Vai in `Componenti aggiuntivi e temi` → `Strumenti` → `Debug componenti aggiuntivi` →  `Carica componente aggiuntivo temporaneo...`
-  Clicca sull'icona a forma di ingranaggio e seleziona `Debug componenti aggiuntivi`.
-  Clicca su `Carica componente aggiuntivo temporaneo...`.
-  Navigare fino alla cartella del progetto e seleziona il file `manifest.json`.

L'estensione "IBAN Guard" verrà caricata e sarà attiva fino al riavvio di Thunderbird.

---

## 💡 Utilizzo

Una volta installata, l'estensione funzionerà automaticamente in background.

* **Verifica Automatica**: Apri un'email che contiene un IBAN (nel corpo o in un allegato PDF/XML). Un avviso e una notifica appariranno nella parte superiore del messaggio dopo pochi istanti.
* **Verifica Manuale**: Apri qualsiasi messaggio, clicca sul pulsante **"Verify IBAN"** nella barra degli strumenti, compila i campi e clicca su "Verify IBAN". Riceverai una notifica con il risultato della verifica.
* **Configurazione**: Per modificare le impostazioni, vai alla scheda dei componenti aggiuntivi, trova "IBAN Guard" e clicca sulla scheda "Opzioni".

---

## 🎓 Progetto di Tesi

L'estensione **IBAN Guard** è stata sviluppata come lavoro di tesi sperimentale.
- **Titolo**: Progettazione e sviluppo di un’estensione per Thunderbird finalizzata alla prevenzione di attacchi Business Email Compromise.
- **Candidato**: Gabriel Tripodi
- **Relatore**: Prof. Giovambattista Ianni
- **Università**: Università della Calabria, Dipartimento di Matematica e Informatica
- **Corso**: Laurea Magistrale in Artificial Intelligence and Computer Science
- **Anno Accademico**: 2024/2025

