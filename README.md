# 🩺 PocketPal

**A post-surgical rehabilitation companion app that makes recovery personal, trackable, and connected.**

PocketPal guides patients through daily check-ins, physical therapy exercises, and health monitoring — all wrapped in an engaging virtual companion experience. It provides clinicians and physical therapists with AI-powered clinical summaries and rehab analytics to support better care decisions.

View our product demo: https://docs.google.com/presentation/d/1UBCnxqtw4bUFtfuNK_gyjROpWs-zGyabgTJrVGYBiX4/edit?usp=sharing!

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (or Bun)
- npm / yarn / bun

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd pocketpal

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Build for Production

```bash
npm run build
npm run preview
```

---

## ✨ Features

### For Patients
- **Conversational Daily Check-In** — Guided chat-based check-ins with text and voice input (powered by ElevenLabs Scribe). Tracks pain (0–10), medication adherence, falls, and free-form notes.
- **Virtual Companion** — Choose a plant 🌱 or pet 🐱 whose mood evolves based on your check-in streak, encouraging daily engagement.
- **PT Exercise Plan** — Phase-based knee rehabilitation program (early / mid / late) with exercise tracking, instructions, and daily progress.
- **Recovery Logs** — View your history of check-ins with pain trends, medication adherence, step counts, and gait symmetry.
- **Smart Reminders** — Configurable reminders that adapt urgency based on time of day (gentle → moderate → urgent).
- **AI Persona Selection** — Choose your check-in conversational style: Warm Elder, Friendly Adult, or Clinical.

### For Physical Therapists
- **Physical Therapist Dashboard** — Overview of patient progress, motion data, and exercise adherence.
- **Alarm System** — Automatic alerts triggered by concerning patterns (high pain, repeated falls, missed medications) with escalation to clinicians.

### For Clinicians
- **Clinician Dashboard** — Comprehensive view with sensor data, biomechanical metrics, sentiment analysis, and medication logs.
- **AI Clinical Summaries** — AI-generated findings with severity ratings, voice insights (emotional trends, concern keywords), and narrative summaries.
- **Rehab Analysis Engine** — Rule-based analytics computing gait symmetry index, neuromuscular efficiency, kinematic deviation, stride regularity, and risk levels.
- **Care Team Alerts** — Send clinical summaries to the care team, stored in the database for review.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3 + shadcn/ui |
| **Charts** | Recharts |
| **Routing** | React Router 6 |
| **State** | React Context + TanStack Query |
| **Backend** | Lovable Cloud (Supabase) — database, edge functions, auth |
| **Voice Input** | ElevenLabs Scribe |
| **AI Analysis** | Lovable AI Gateway |
| **Utilities** | date-fns, Zod, React Hook Form |

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── BottomNav.tsx          # Mobile bottom navigation
│   ├── ChatCheckIn.tsx        # Conversational check-in interface
│   ├── ClinicalSummaryCard.tsx# AI-generated clinical summary display
│   ├── CompanionDisplay.tsx   # Virtual companion (plant/pet)
│   ├── PTExercisePlan.tsx     # Physical therapy exercise tracker
│   ├── ReminderBanner.tsx     # Check-in reminder banner
│   └── RoleSwitcher.tsx       # Patient/PT/Clinician role toggle
├── context/
│   └── PatientContext.tsx     # Global patient state & business logic
├── data/
│   ├── mockData.ts            # Patient logs, medications, helpers
│   ├── clinicalMockData.ts    # Biomechanical & sensor mock data
│   └── ptExercises.ts         # Knee rehab exercise definitions
├── pages/
│   ├── Home.tsx               # Patient dashboard
│   ├── CheckIn.tsx            # Daily check-in page
│   ├── Exercises.tsx          # PT exercise plan page
│   ├── Logs.tsx               # Recovery log history
│   ├── CaregiverDashboard.tsx # Physical Therapist dashboard
│   ├── ClinicianDashboard.tsx # Clinician analytics dashboard
│   ├── Settings.tsx           # App configuration
│   ├── Help.tsx               # Help & support
│   └── Onboarding.tsx         # First-time setup wizard
├── utils/
│   ├── generateClinicalSummary.ts  # AI clinical summary generation
│   └── rehabAnalysis.ts            # Rule-based rehab analytics engine
└── integrations/
    └── supabase/              # Database client & types (auto-generated)

supabase/
└── functions/
    ├── analyze-checkins/      # AI-powered check-in analysis
    └── elevenlabs-scribe-token/ # Voice input authentication
```

---

## 🔑 Key Concepts

### Alarm Escalation
PocketPal monitors patient data for concerning patterns:
1. **Average pain ≥ 7/10** over 7 days → alarm triggered
2. **2+ falls** in 7 days → alarm triggered
3. **4+ missed medication days** in 7 days → alarm triggered

If the alarm isn't resolved by the physical therapist's next visit + 1 day, it automatically escalates to the clinician.

### Companion Mood System
The virtual companion's mood reflects the patient's engagement:
- **0 days** streak → Sad 😢
- **1–2 days** → Neutral 😐
- **3–5 days** → Happy 😊
- **6+ days** → Thriving 🌟

### Rehab Analysis Metrics
The clinician dashboard computes:
- Gait Symmetry Index
- Neuromuscular Efficiency
- Kinematic Deviation
- Stride Regularity
- Postural Stability
- Movement Quality Score

---

## 📄 License

This project is open source. See [LICENSE](LICENSE) for details.
