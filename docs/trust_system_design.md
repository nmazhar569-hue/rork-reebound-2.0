# Ree Trust System Design (The "Trust OS")

This document defines the logic, tone, and mechanics for Reebound's relationship with the user. These are system-level rules that govern how the AI speaks and behaves.

---

## 1. The Learning Phase Contract
**Goal**: Make the user understand *why* Ree needs time, and visualize the journey from "Stranger" to "Partner."

### Phase Definitions

| Phase | Duration | User Requirements | Ree Status | UI Indicator |
|-------|----------|-------------------|------------|--------------|
| **1. Calibration** | Days 1-7 | Complete 3 workouts + 3 daily logs | "Building Baseline" | Empty ring filling up (0-33%) |
| **2. Patterning** | Days 8-21 | Consistent weekly frequency | "Analyzing Patterns" | Ring filling (33-66%) |
| **3. Integration** | Days 21-30 | 1 full microcycle completion | "Refining Model" | Ring filling (66-99%) |
| **4. Validated** | Day 30+ | N/A | "Baseline Established" | Gold/Teal checkmark |

### System Behavior During Phases
* **Phase 1**: Ree asks more questions. "How did that feel compared to last time?"
* **Phase 2**: Ree proposes hypotheses. "I think you recover better with 2 days rest. Let's test that."
* **Phase 3**: Ree makes confident adjustments.
* **Phase 4**: Ree predicts. "You're likely fatigued today."

---

## 2. Confidence Calibration
**Goal**: Admit uncertainty to build trust in certainty.

### Confidence Levels

| Level | Internal Score | UI Tag | Language Style |
|-------|----------------|--------|----------------|
| **High** | > 85% data match | `High Confidence` (Solid Icon) | Direct. "Increase weight." "Stop now." |
| **Moderate** | 60-85% match | `Data Trend` (Outlined Icon) | Suggestive. "It looks like..." "Consider..." |
| **Exploratory** | < 60% or new stimulus | `Hypothesis` (Dotted/Sparkle) | Collaborative. "Let's try..." "Testing this..." |

### Display Rules
* **Never** show "High Confidence" on a prediction with < 3 data points.
* **Always** default to "Exploratory" for new exercises or comeback after break.

---

## 3. Failure Without Shame (Tone Rules)
**Goal**: Protect user momentum by reframing "failure" as "data."

### The "No-Guilt" Dictionary

| Traditional App Speak | Ree Speak (Reebound) | Why? |
|-----------------------|----------------------|------|
| "You missed a workout" | "Momentum paused" | Removes active blame. |
| "You broke your streak" | "Last active: X days ago" | Focuses on fact, not loss. |
| "You didn't hit your goal" | "Inputs changed" | Objectifies the outcome. |
| "Get back to it!" | "Ready when you are" | Respects user autonomy. |
| "Week failed" | "Volume adjusted down" | Frames it as a regulation decision. |

### The "Off-Track" Protocol
When a user is inactive for > 7 days:
1. **Silence** implies waiting, not judging.
2. **First re-engagement**: "Welcome back. Let's do a shorter session to recalibrate." (No "Where were you?")
3. **Adjustment**: Automatically lower intensity targets by 10-20% (The "Comeback Ease-in").

---

## 4. User Agency Reinforcement ("Good Call")
**Goal**: Make the user feel like the expert of their own body.

### Trigger Moments
* **User reduces weight**: "Smart regulation. Lower weight today builds capacity for the heavy session later."
* **User takes extra rest day**: "Good call. Your recovery data suggested you needed this."
* **User overrides Ree**: "Noted. You know your energy best."

---

## 5. Implementation Checklist

### Phase 1 (Data Model)
- [ ] Add `learningPhase` to UserProfile context
- [ ] Add `confidenceScore` to Recommendation engine
- [ ] Create `ToneGuard` utility function to filter message output

### Phase 2 (UI)
- [ ] **Home**: Add "Learning Status" pill to Dynamic Panel
- [ ] **Plan**: Add Confidence Tags to workout cards
- [ ] **Progress**: Add "Monthly Narrative" section (replacing generic motivation)
