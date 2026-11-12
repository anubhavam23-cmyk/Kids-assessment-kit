# Kids Assessment Kit

A local-first, browser-based assessment and targeted-practice starter for school-age learners.

## MVP features

- Loads questions from `data/question-bank.json`
- Filters questions by subject
- Runs a multiple-choice quiz and gives immediate feedback
- Collects incorrect answers into a review list
- Exports mistakes as JSON for use in a future question-generation workflow
- Stores a small session history in browser local storage

## Run locally

Because the app loads JSON using `fetch()`, open it through a local web server rather than opening `index.html` directly.

For example, from this folder run:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Question-bank structure

Each question has an ID, year level, subject, skill, prompt, options, answer index, explanation and source type. Keep curriculum source references with each production question when the source-mapping stage is added.

## Important content note

The initial questions are illustrative demo questions only. They are not claimed to be extracted from the uploaded curriculum or workbook resources. Curriculum alignment and source references will be added after those files are successfully read and mapped.

## Planned next increments

1. Source-map Victorian Curriculum learning outcomes and uploaded workbooks.
2. Add learner profiles and assessment attempts.
3. Analyse errors by skill, not just total score.
4. Generate targeted practice sets from mistake exports without requiring a paid API for the core quiz.
5. Add teacher/parent review and controlled question-bank imports.
6. Configure and verify hosted publishing.

## Privacy

The MVP does not send answers to a server. Attempts are stored in the browser's local storage. Exported JSON files should be handled as private learner data.
