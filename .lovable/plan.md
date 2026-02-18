# Manual Configuration Flow Redesign

## What's Changing and Why

The current 6-step wizard (`Select Project → Configure Interviewer → Interview Content → Review → Test → Deploy`) conflates research design with delivery logistics, treats all fields equally regardless of importance, and ends with a review-only step that adds friction without value.

The redesign restructures this into a 3-step Phase 1 ("Design Your Interview") that lands the user on the interviewer detail page ready to test, plus a deferred Phase 2 ("Prepare to Launch") accessed from the detail page when ready.

---

## New Step Structure (Phase 1)

```text
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Project & Setup                                     │
│  Project selection + Title + Description + Archetype +      │
│  Language + Duration + Expert Source (conditional)          │
├─────────────────────────────────────────────────────────────┤
│  Step 2: Interview Content          [Sections A, B, C]      │
│  A: Research Context (interview context rich text)          │
│  B: Interview Guide (screener/warm-up toggle + guide)       │
│  C: Knowledge Base (conditional on archetype)               │
├─────────────────────────────────────────────────────────────┤
│  Step 3: Fine-Tune (Optional)                               │
│  Voice selector + preview + Intro context + Close context   │
│  + Pronunciation reference                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓ (Save & Continue)
                   Interviewer Detail Page
                   (ready to test)
                          ↓ (when ready)
              Phase 2: Prepare to Launch
              Channel + Participant settings + Billing
```

---

## Key Design Decisions

### Step 1 Consolidation

All foundational decisions that constrain later choices are grouped together:

- Project (create/select, same as now)
- Title + Description (from old Step 1)
- Archetype selection (from old Step 1) — governs what appears in Steps 2 and 3
- Language + Duration (from old Step 1) — language constrains voice options in Step 3
- Expert Source toggle (conditional, only for `expert_interview` archetype)

**Interviewer Name is moved to Step 3** (Fine-Tune) since it's a stylistic detail, not a research decision.

### Step 2 — Section-Based Layout

Step 2 uses an **accordion/section-based layout within a single step** rather than additional sub-steps. Users see three labeled sections — A, B, C — with clear visual hierarchy. Navigation is free-form within the step.

Section B changes the screener UX: instead of a hidden toggle, the user picks one of two visible modes:

- **Screen participants** — screener criteria field appears
- **Warm-up only** — warm-up questions field appears

This matches the feature spec's intent: "This research design choice was previously buried as a toggle."

The Interview Guide field remains a `RichTextEditor` (not the structured `InterviewGuideEditor`) matching the current implementation's simpler approach for the manual flow.

### Step 3 — Clearly Optional

The stepper shows "Optional" next to Step 3. The footer has both "Skip & Save" and "Save" buttons. Voice defaults to `alloy`. Greeter/closer context and pronunciation are all optional.

**Pronunciation:** A new simple textarea field for pronunciation hints (e.g., "McKinsey = mak-IN-zee"). This is a new field to add to the form and API call.

### Removal of Review Step

The old Step 3 (Review) is eliminated. Instead:

- Inline validation on each step catches errors before proceeding
- The interviewer is created/saved when the user clicks "Save & Go to Dashboard" on Step 3 (or "Skip & Save" from Step 3)
- In edit mode, a "Save Changes" button appears in the footer at all steps

### Edit Flow

- Edit mode still lands on Step 2 (Interview Content, the most commonly edited section) rather than a dead-end Review page
- Completed steps show checkmarks, all steps remain freely navigable
- No "Review" step — user saves directly from any step with a "Save Changes" button in footer

### Phase 2 — Prepare to Launch (Detail Page)

Channel, participant settings, and billing move to the interviewer detail page as a "Launch" workflow. This is **not** part of this redesign task — it lives in `InterviewerOverview.tsx` and will be a follow-up. For now, the existing Deploy dialog in `InterviewerOverview.tsx` already handles channel selection, so we just remove it from the creation wizard.

---

## Validation Changes


| Field               | Step (New) | Required?              |
| ------------------- | ---------- | ---------------------- |
| Project             | 1          | Yes                    |
| Title               | 1          | Yes                    |
| Description         | 1          | No                     |
| Archetype           | 1          | Yes                    |
| Language            | 1          | Yes (default: English) |
| Duration            | 1          | Yes                    |
| Expert Source       | 1          | Conditional            |
| Research Context    | 2          | Yes                    |
| Screener or Warm-up | 2          | Yes (one or the other) |
| Interview Guide     | 2          | Yes                    |
| Knowledge Base      | 2          | No (optional)          |
| Voice               | 3          | No (default applied)   |
| Interviewer Name    | 3          | No                     |
| Intro Context       | 3          | No                     |
| Close Context       | 3          | No                     |
| Pronunciation       | 3          | No                     |


`channel` and `caseCode` are removed from the creation form entirely.

---

## Files to Modify


| File                                     | Change                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/pages/InterviewerConfiguration.tsx` | Major rewrite: new step structure, new form shape, updated validation, new UI layout |
| `src/components/Stepper.tsx`             | Add optional "Optional" label support for steps                                      |
| `src/types/index.ts`                     | Add `pronunciationHints?: string` to `Agent` / `CreateInterviewerForm`               |
| `src/services/interviewers.ts`           | Pass `pronunciationHints` in create/update calls                                     |


No new component files are required — all UI is built inline in `InterviewerConfiguration.tsx` using existing UI primitives.

---

## Technical Implementation Plan

### 1. Update `CreateInterviewerForm` type

Remove `channel` and `caseCode` from the form. Add `pronunciationHints`. Move `voiceId` and `name` usage to Step 3. The form keeps the same `targetDuration`, `language`, and all content fields.

```typescript
interface CreateInterviewerForm {
  // Step 1
  selectedProjectId: string | null;
  title: string;
  description: string;
  archetype: Archetype | null;
  expertSource: ExpertSource;
  language: string;
  targetDuration: string;

  // Step 2
  interviewContext: string;
  enableScreener: boolean;
  screenerQuestions: string;
  introductionQuestions: string;   // warm-up mode
  interviewGuide: string;
  guideStructured: GuideSchema | null;
  knowledgeText: string;
  knowledgeFiles: File[];

  // Step 3
  voiceId: string;
  name: string;
  introContext: string;
  closeContext: string;
  pronunciationHints: string;      // NEW
}
```

### 2. Update steps array

```typescript
const steps = [
  { id: "setup",    title: "Project & Setup",    description: "Foundation" },
  { id: "content",  title: "Interview Content",  description: "Research design" },
  { id: "finetune", title: "Fine-Tune",          description: "Optional", optional: true },
];
```

### 3. Update Stepper to show optional badge

Add `optional?: boolean` to the Step interface and render a small "Optional" badge next to the step title when true.

### 4. Step 1 UI restructuring

Merge the old Step 0 (Project) and Step 1 (Configure Interviewer) into a single step with clear sections:

- Project selector (same as now, with create inline)
- Title + Description (same fields, same validation)
- Archetype selection grid (same `ArchetypeCard` components)
- Expert Source radio (same conditional logic)
- Language + Duration in a 2-column grid (separating them from voice)

The "Interviewer Persona" card (Voice + Name) is removed from Step 1.

### 5. Step 2 UI — Section A/B/C with clear headings

Replace the flat card list with three visually distinct sections using `<section>` tags with prominent heading labels:

**Section A — Research Context**

- A descriptive label: "What are you trying to learn?"
- `RichTextEditor` for `interviewContext` (same field, same validation, same char limit)

**Section B — Interview Guide**  

- Screening mode picker: two radio-card options ("Screen participants" / "Warm-up only") — replaces the current hidden `Switch`
- Conditional field based on selection (same fields: `screenerQuestions` / `introductionQuestions`)
- `RichTextEditor` for `interviewGuide` (same field, required)
- Intro context (`introContext`) moves here from old Step 1 — it's a content decision, not a fine-tune
- Close context (`closeContext`) stays here for the same reason

Wait — re-reading the spec: Intro and Close context are in Step 3 (Fine-Tune). Keep them there as the spec says. The spec puts screening approach in Section B of Step 2.

**Section C — Knowledge Base** (only shown if archetype supports it)

- Text area + file upload (same as current)
- Conditional: hidden for archetypes that don't use KB

### 6. Step 3 UI — Fine-Tune

All fields optional, clearly labeled:

- **Voice** — Select + preview button (same as current `voiceId` logic)
- **Interviewer Name** — Input (same validation)
- **Conversation Flow** — Two textareas: Intro Context + Close Context with helpful description text
- **Pronunciation** — New textarea for pronunciation hints

Add "Skip & Save" button in footer alongside "Save".

### 7. Footer logic

- Step 1: Previous (disabled) | Save Draft | Next
- Step 2: Previous | Save Draft | Next
- Step 3: Previous | Save Draft | Skip & Save | Save (creates/updates interviewer)
- Edit mode: "Save Changes" replaces "Next" at the last step; appears at all steps as an available action

### 8. `createInterviewer` and `updateInterviewer`

Remove `channel` and `caseCode` from the create call. Add `pronunciationHints`. Default `channel` to `'web_link'` server-side or pass `null`. The create flow navigates to the interviewer detail page as before.

### 9. Edit mode

- Start on Step 2 (Interview Content) instead of Step 3 (Review)  
- All steps are marked completed and freely navigable
- Save Changes button in footer at all steps

---

## What Stays the Same

- `ConfigurationLayout` (viewport-constrained, sticky header/footer) — no changes
- `ArchetypeCard` component — no changes
- `RichTextEditor` component — no changes
- `ChannelSelector` component — not used in Phase 1 anymore (stays in detail page)
- `ProjectCombobox` + `CreateProjectDialog` — no changes
- All validation logic (same rules, reorganized by step)
- `agentsService` API calls (minimal additions)
- Cancel/discard dialog behavior
- Save draft to localStorage behavior

---

## Implementation Order

1. Update `Stepper.tsx` — add `optional` step support
2. Update `CreateInterviewerForm` interface and default state
3. Rewrite `renderStepContent` for new Steps 1, 2, 3
4. Update `validateStep` for new step numbering
5. Update footer logic (3-step navigation, "Skip & Save")
6. Update `createInterviewer` and `updateInterviewer` API calls
7. Update edit mode start step (Step 2 instead of Step 3)
8. Add `pronunciationHints` to types and services