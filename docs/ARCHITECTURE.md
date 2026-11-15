# Architecture — Kids Assessment Kit

## Current implementation (inspected baseline)

The current MVP is a static browser application:
- `index.html` contains the page markup, styles and application JavaScript.
- `data/question-bank.json` contains the question bank.
- Browser `localStorage` stores assessment history and imported mistake records.
- Mistake exports are downloaded as JSON.
- GitHub Actions publishes the static site through GitHub Pages.

There is no backend or external AI/API dependency in the current quiz flow.

## Target architecture

```text
Browser application
├── Parent dashboard
│   ├── Learner profile selector
│   ├── Progress and skill summaries
│   └── Practice plan
├── Learning experiences
│   ├── Quiz / practice runner
│   └── Assessment runner
├── Domain logic
│   ├── Scoring and attempt recording
│   ├── Skill evidence analyser
│   └── Practice-plan allocator
├── Data access
│   ├── Question bank (read-only source content)
│   ├── Learner profiles
│   ├── Attempts and assessment history
│   └── Practice plans
└── Import / export
    ├── Mistake and attempt export
    └── Reviewed question import
```

## Data separation

Keep these concepts separate:

- **Question bank:** reusable educational content. A learner's answer must never mutate the source question.
- **Learner profile:** year level, curriculum and learner settings.
- **Attempt history:** immutable record of what the learner answered and when.
- **Skill evidence:** derived view of performance across relevant attempts.
- **Practice plan:** a recommendation with explicit links to the evidence that produced it.

## Proposed question contract

The existing schema remains supported during Phase 1. The target production question shape extends it with stable identifiers and provenance:

- `id`
- `yearLevel`
- `subject`
- `skillId` and human-readable `skill`
- `prompt`
- `options`
- `answerIndex`
- `explanation`
- `sourceType` (for example: demo, workbook, curriculum-derived, reviewed-generated)
- `sourceReference` (document and page/section where available)
- `curriculumReference` (jurisdiction, version and outcome identifier where verified)
- `reviewStatus`

These are target fields, not a claim that every existing question already contains them.

## Storage strategy

For the MVP, use browser storage and explicit JSON export/import. Introduce a versioned storage adapter so the UI does not depend directly on `localStorage`. A server/database can be considered later if multi-device sync, accounts or collaboration become necessary.

## Privacy and AI

- Do not transmit learner data to external services by default.
- Keep AI generation optional and outside the core quiz runtime.
- Prefer an export → ChatGPT-assisted generation/review → JSON import workflow initially.
- Do not mark generated content as curriculum-aligned until its source and outcome mapping have been checked.

## Compatibility rule

Refactor in small steps. First preserve the existing quiz and mistake workflow; then add new modules behind the existing UI. Avoid a framework migration unless a demonstrated requirement justifies it.
