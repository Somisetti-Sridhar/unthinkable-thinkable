const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const CONDITIONS = [
  {
    name: 'Common cold',
    keywords: ['runny nose', 'sore throat', 'sneezing', 'stuffy nose', 'congestion'],
    explanation: 'Viral upper respiratory infection — usually mild, resolves in a few days.',
    advice: 'Rest, fluids, OTC symptom relief. See a doctor if symptoms worsen or persist >10 days.'
  },
  {
    name: 'Influenza (flu)',
    keywords: ['fever', 'high fever', 'body ache', 'muscle ache', 'chills', 'fatigue', 'severe fatigue'],
    explanation: 'Seasonal viral illness that can be more severe than a cold.',
    advice: 'Rest, fluids, consider antivirals if early and high risk. See doctor especially if shortness of breath or high fever.'
  },
  {
    name: 'Allergic rhinitis (allergy)',
    keywords: ['itchy eyes', 'itchy', 'sneezing', 'watery eyes', 'allergy'],
    explanation: 'Allergic reaction — often seasonal or to indoor allergens.',
    advice: 'Antihistamines, avoid triggers. See allergist if persistent.'
  },
  {
    name: 'Migraine / Tension headache',
    keywords: ['headache', 'migraine', 'throbbing', 'sensitivity to light', 'sensitivity to sound', 'aura'],
    explanation: 'Headache disorders vary — migraines often have light/sound sensitivity.',
    advice: 'Rest in a dark room, OTC pain relief. Seek urgent care for sudden severe headache or neurologic deficits.'
  },
  {
    name: 'Gastroenteritis (stomach flu / food poisoning)',
    keywords: ['vomiting', 'diarrhea', 'stomach pain', 'nausea', 'abdominal cramps'],
    explanation: 'Often viral or foodborne; causes vomiting & diarrhea.',
    advice: 'Stay hydrated, use ORS if needed, rest. Seek care for severe dehydration, bloody stools, or high fever.'
  },
  {
    name: 'Urinary tract infection (UTI)',
    keywords: ['burning urination', 'frequent urination', 'urinary frequency', 'pelvic pain'],
    explanation: 'Common bacterial infection of urinary tract, particularly in females.',
    advice: 'See a clinician for urine testing and antibiotics if confirmed.'
  }
];

const RED_FLAGS = [
  { keywords: ['chest pain', 'pressure in chest', 'squeezing chest', 'severe chest pain'], message: 'Chest pain can be a sign of a heart attack — seek emergency care immediately.' },
  { keywords: ['difficulty breathing', 'shortness of breath', 'cant breathe', 'unable to breathe', 'severe breathlessness'], message: 'Difficulty breathing is urgent — seek emergency care now.' },
  { keywords: ['severe bleeding', 'uncontrolled bleeding'], message: 'Severe bleeding — go to emergency department immediately.' },
  { keywords: ['loss of consciousness', 'fainting', 'passed out'], message: 'Loss of consciousness — seek emergency help right away.' },
  { keywords: ['sudden weakness', 'sudden numbness', 'facial droop', 'slurred speech'], message: 'Possible stroke symptoms — call emergency services immediately.' }
];

function tokenize(text) {
  if (!text) return [];
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function checkRedFlags(symptomText) {
  const text = symptomText.toLowerCase();
  const matches = [];
  RED_FLAGS.forEach(flag => {
    flag.keywords.forEach(k => {
      if (text.includes(k)) matches.push(flag.message);
    });
  });
  return [...new Set(matches)];
}

function matchConditions(symptomText) {
  const text = symptomText.toLowerCase();
  const results = [];
  CONDITIONS.forEach(cond => {
    let score = 0;
    cond.keywords.forEach(k => {
      if (text.includes(k)) score++;
    });
    if (score > 0) {
      results.push({
        name: cond.name,
        explanation: cond.explanation,
        advice: cond.advice,
        score
      });
    }
  });
  results.sort((a, b) => b.score - a.score);
  return results;
}

function fallbackAdvice() {
  return {
    name: 'Uncertain / Not detected (limited-check)',
    explanation: 'The symptoms you provided do not strongly match the limited set of common conditions this demo checks for.',
    advice: 'This demo is intentionally limited. For persistent, worsening, or concerning symptoms, see a healthcare professional. If symptoms are severe, seek emergency care.'
  };
}

app.post('/check', (req, res) => {
  const { symptoms } = req.body;
  if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide symptom text in the "symptoms" field.' });
  }
  const redFlags = checkRedFlags(symptoms);
  const matches = matchConditions(symptoms);
  const response = {
    input: symptoms,
    timestamp: new Date().toISOString(),
    redFlags: redFlags,
    possibleConditions: matches.length ? matches.map(m => ({ name: m.name, explanation: m.explanation, advice: m.advice })) : [fallbackAdvice()],
    disclaimers: [
      'Educational purposes only — not medical advice.',
      'If you have severe or emergency symptoms (e.g., chest pain, difficulty breathing, heavy bleeding), seek emergency care immediately.',
      'AI-based symptom checkers can be wrong; consult a qualified healthcare professional for diagnosis and treatment.'
    ]
  };
  res.json(response);
});

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Healthcare Symptom Checker — Demo</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial; max-width:800px; margin:24px auto; padding:16px; line-height:1.5; }
    header { margin-bottom:12px; }
    textarea { width:100%; min-height:120px; font-size:14px; padding:8px; }
    button { padding:10px 14px; font-size:16px; border-radius:8px; cursor:pointer; }
    .card { border-radius:12px; padding:12px; margin-top:12px; box-shadow: 0 1px 6px rgba(0,0,0,0.08); }
    .red { color:#7b0710; font-weight:700; }
    .muted { color:#555; font-size:13px; }
    ul { margin:8px 0 12px 18px; }
    .footer { margin-top:18px; font-size:13px; color:#444; }
  </style>
</head>
<body>
  <header>
    <h1>Healthcare Symptom Checker — Demo</h1>
    <div class="muted">Type your symptoms (e.g., "fever and body aches", "runny nose and sore throat") and click Check. This demo is intentionally limited.</div>
  </header>
  <form id="symptomForm" class="card" onsubmit="return false;">
    <label for="symptoms"><strong>Describe your symptoms</strong></label>
    <textarea id="symptoms" placeholder="e.g., sore throat, runny nose, slight fever..."></textarea>
    <div style="margin-top:10px;">
      <button id="checkBtn" onclick="checkSymptoms()">Check symptoms</button>
    </div>
    <div id="result" style="margin-top:12px;"></div>
  </form>
  <section class="footer">
    <strong>Important:</strong> This tool is a demo and not a substitute for professional medical advice. If you have severe symptoms, call emergency services.
  </section>
  <script>
    async function checkSymptoms() {
      const symptoms = document.getElementById('symptoms').value.trim();
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = '<em>Checking...</em>';
      if (!symptoms) {
        resultDiv.innerHTML = '<div class="card red">Please enter your symptoms.</div>';
        return;
      }
      try {
        const resp = await fetch('/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symptoms })
        });
        if (!resp.ok) throw new Error('Server error: ' + resp.status);
        const data = await resp.json();
        let html = '';
        if (data.redFlags && data.redFlags.length) {
          html += '<div class="card" style="border-left:6px solid #c0392b;"><strong class="red">Emergency alert</strong><ul>';
          data.redFlags.forEach(m => html += '<li>' + escapeHtml(m) + '</li>');
          html += '</ul></div>';
        }
        html += '<div class="card"><strong>Possible conditions (limited demo)</strong><ul>';
        data.possibleConditions.forEach(c => {
          html += '<li><strong>' + escapeHtml(c.name) + '</strong><div class="muted">' + escapeHtml(c.explanation) + '</div><div style="margin-top:6px;"><em>Advice:</em> ' + escapeHtml(c.advice) + '</div></li>';
        });
        html += '</ul></div>';
        html += '<div class="card muted"><strong>Disclaimers</strong><ul>';
        data.disclaimers.forEach(d => html += '<li>' + escapeHtml(d) + '</li>');
        html += '</ul></div>';
        resultDiv.innerHTML = html;
      } catch (err) {
        resultDiv.innerHTML = '<div class="card red">An error occurred while checking symptoms. Try again.</div>';
      }
    }
    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
    }
  </script>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Healthcare Symptom Checker running on http://localhost:${PORT}`);
});
