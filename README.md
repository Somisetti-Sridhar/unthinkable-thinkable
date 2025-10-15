# Healthcare Symptom Checker — Demo

> ⚠️ Educational demo only. This project is **not a diagnostic tool** and **not a substitute for professional medical advice**.

---

## 🩺 Overview

This is a lightweight, single-file **Node.js + Express** application that allows users to enter symptom text and receive possible conditions with general advice and disclaimers.  
It is designed for **screening or hackathon evaluation** — focusing on correctness, safety, code clarity, and responsible AI behavior.

---

## ⚙️ Features

-  **Single-file deployable backend + frontend**
-  Accepts symptom input via POST request (`/check`)
-  Matches symptoms to a **limited set of common conditions**
-  Detects **red-flag emergencies** and advises immediate care
-  Displays **educational disclaimers** to ensure user safety
-  Simple HTML/CSS frontend with `fetch()` API calls
-  No external database or LLM dependency (works offline)

---

## How It Works

1. **Frontend (GET `/`)**  
   Serves a small HTML page with a textarea for symptoms and a button to check them.

2. **Backend (POST `/check`)**  
   - Accepts JSON `{ "symptoms": "<user text>" }`  
   - Checks for emergency *red-flag* keywords (e.g., "chest pain", "difficulty breathing")  
   - Matches known symptom patterns against a small set of predefined conditions  
   - Returns:
     ```json
     {
       "redFlags": ["..."],
       "possibleConditions": [
         { "name": "...", "explanation": "...", "advice": "..." }
       ],
       "disclaimers": ["..."]
     }
     ```

3. **Display**  
   The results, advice, and disclaimers are rendered dynamically in the frontend.

---

## Supported Example Conditions

| Condition | Example Keywords | General Advice |
|------------|------------------|----------------|
| Common Cold | runny nose, sore throat, sneezing | Rest, fluids, OTC relief |
| Influenza (Flu) | fever, body ache, chills | Rest, fluids, see doctor if severe |
| Allergic Rhinitis | itchy eyes, sneezing | Avoid triggers, antihistamines |
| Migraine / Tension Headache | headache, migraine, light sensitivity | Rest, OTC relief |
| Gastroenteritis | vomiting, diarrhea, nausea | Hydration, rest |
| Urinary Tract Infection | burning urination, pelvic pain | See clinician for antibiotics |

---

## Red-Flag Emergency Alerts

The app immediately warns users if they enter critical phrases like:

- “chest pain”, “pressure in chest”
- “shortness of breath”, “difficulty breathing”
- “severe bleeding”
- “loss of consciousness”
- “slurred speech”, “sudden weakness”

Each red flag shows an **emergency message** advising immediate care.

---

## Installation & Run

```bash
# 1. Install dependencies
npm init -y
npm install express body-parser

# 2. Run the app
node app.js

# 3. Open in browser
http://localhost:3000
