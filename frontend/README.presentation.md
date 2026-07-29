# e-Shram vs RozgaarAI Digital Worker Identity

Presentation-style website for hackathon mentorship or judging sessions.

## Run Locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173/presentation
```

## Controls

- Left and right arrow keys move between slides.
- On-screen arrows move to previous or next slide.
- The grid button opens slide overview.
- The full-screen button starts presentation mode.
- The print button opens the browser print dialog for PDF export.

## Structure

- `src/presentation/presentationSlides.js` stores the 10-slide content.
- `src/presentation/Presentation.jsx` contains reusable components:
  - `SlideLayout`
  - `Navigation`
  - `ProgressBar`
  - `FeatureCard`
  - `ComparisonTable`
  - `ProcessFlow`
- `src/presentation/presentation.css` contains responsive and print styles.

## Print Export

Use the print button or browser print command. The print stylesheet outputs one slide per landscape page and disables animations.
