## Folder Structure

```
evaerahealth/
├── index.html                    ← Main HTML shell (links all CSS + JS)
│
├── css/
│   ├── variables-base.css        ← CSS variables, reset, body, nav
│   ├── auth-consent.css          ← Auth screen, OTP, consent card
│   ├── form-assessment.css       ← Step cards, progress, all field types
│   ├── results.css               ← Loading screen, results, rings, care cards
│   ├── hcp-portal.css            ← Full HCP portal dark theme
│   └── admin-responsive.css      ← Admin classes + mobile breakpoints
│
├── js/
│   ├── state.js                  ← Global S{} state, STEPS[], GATE_* vars
│   ├── consent.js                ← CONSENT_ITEMS, session/auth, startForm
│   ├── navigation.js             ← renderStep, stepNext/Back, gateChoice
│   ├── field-helpers.js          ← setAns/Likert/Radio, all buildStep* builders
│   ├── hardstop.js               ← Hard stop screens, buildStepSummary
│   ├── scoring.js                ← EVR_RULES, computeScores, runRuleEngine, saveResult
│   ├── demo.js                   ← quickDemoFill and aliases
│   ├── results.js                ← startProcessing, showResults, care cards
│   ├── hcp-portal.js             ← HCP dashboard, patient list/detail, reports
│   ├── wearable.js               ← WEARABLE_CORROBORATION[], calcWearableMod
│   ├── utilities.js              ← exportMyData, deleteMyData, filters
│   ├── integration.js            ← Booking flow, admin portal, cross-tab sync
│   └── supabase.js               ← ★ Supabase integration (saves assessments to DB)
│
│
├── data/
│   ├── metadata.json
│   ├── scoring_rules.json
│   ├── instruments.json
│   ├── clinical_data.json
│   ├── triage_flags.json
│   └── demo_config.json
│
└── README.md
```

## How to Run

Open `index.html` in a browser — no build step required.
