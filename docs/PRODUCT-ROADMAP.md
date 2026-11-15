# Kids Assessment Kit — Product Roadmap

## Product direction

Evolve the existing local-first quiz website into a parent-facing adaptive learning platform. Preserve the working quiz engine and JSON question bank; add capabilities in small, testable increments.

## Product principles

1. **Reuse before rebuild** — retain the current quiz, feedback, mistake import/export and browser storage until a replacement is proven.
2. **Local-first and low-cost** — core quizzes, scoring, progress and practice selection must work without paid AI/API calls.
3. **Evidence-led learning** — recommendations must be traceable to learner attempts and specific skills, not just an overall score.
4. **Curriculum traceability** — production questions should carry year level, subject, skill/outcome and source references. Demo questions must remain clearly labelled.
5. **Parent control and privacy** — learner records stay local in the MVP; exports are explicit; no child data is sent to an external service by default.
6. **Incremental delivery** — each phase leaves the application usable.

## Delivery phases

### Phase 0 — Repository and baseline
- [x] Confirm existing GitHub repository and inspect current files.
- [x] Preserve the current working MVP on `main`.
- [ ] Establish feature branch and project documentation.
- [ ] Record current behaviour as the regression baseline.

### Phase 1 — Stabilise and modularise the existing app
- Separate styles and JavaScript from `index.html` without changing quiz behaviour.
- Add lightweight validation for the question-bank JSON.
- Keep the current schema compatible during the refactor.
- Verify quiz, subject filter, answer feedback, mistake export/import and local persistence.

### Phase 2 — Learner profile and parent dashboard
- Add learner profile (display name, year level, curriculum jurisdiction).
- Show attempts, accuracy trends and subject/skill summaries.
- Keep learner data separate from the reusable question bank.
- Support more than one learner without mixing their records.

### Phase 3 — Assessment and skill evidence
- Tag questions to stable skill IDs and curriculum references.
- Record each attempt, answer, timestamp and result.
- Distinguish a first signal from a confirmed learning gap.
- Identify strengths, developing skills and focus skills.

### Phase 4 — Adaptive practice planner
- Convert confirmed skill gaps into a practice plan.
- Allocate question slots across skills and define progression.
- Track practice completion and re-assess improvement.
- Preserve the assessment evidence behind each recommendation.

### Phase 5 — Question-bank and content pipeline
- Import reviewed questions from JSON.
- Maintain provenance: source document, page/section, curriculum mapping and review status.
- Use uploaded workbooks and curriculum documents as source material when their contents have been inspected and mapped.
- Keep generated questions separate until reviewed and approved.

### Phase 6 — AI-assisted question generation (optional)
- Use ChatGPT-assisted generation from exported learner evidence and approved source material.
- Import generated JSON back into the platform.
- Do not make paid API access a requirement for the core learning loop.

## Immediate next build task

Complete Phase 1 in a small change: extract the current inline CSS and JavaScript into separate files, preserve the existing UI and data contract, and verify all current features before adding new product modules.

## Definition of done for each increment

- The existing app still opens through a local web server and GitHub Pages.
- No existing feature silently disappears.
- JSON remains valid and documented.
- Changes are committed on a feature branch and reviewed before merging to `main`.
- The parent can see and test a working result after each increment.
