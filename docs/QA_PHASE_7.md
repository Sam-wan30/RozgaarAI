# RozgaarAI Phase 7 QA Checklist

Last updated: 2026-07-28

## Viewports

Verify the primary flows at:

- 1366 x 768
- 1440 x 900
- 1536 x 960
- 1920 x 1080
- mobile width below 900 px

## Smoke Tests

| Flow | Checks |
| --- | --- |
| Landing | Navigation tabs work, login opens, demo entry works, no console crash |
| Worker | Create profile, generate identity, resume, income record, job matches, interview coach |
| Employer real | Dashboard opens clean, fake demo records hidden, post job remains available |
| Employer demo | Demo button opens workspace, five demo workers appear, exit restores real workspace |
| NGO real | Empty states are honest, no fake workers/jobs/pipeline stats, onboarding works |
| NGO demo | Demo badge visible, demo workers/jobs/pipeline/training/reports visible, exit restores real workspace |
| Admin | `/admin/diagnostics` is admin-protected and shows environment checks |

## Accessibility

- Keyboard focus visible on buttons, links, inputs, and menus.
- Icon-only controls have accessible labels or visible tooltips.
- Text contrast remains readable on blue, green, purple, and orange accents.
- Forms expose labels, validation text, and disabled states.
- Internal scroll regions are reachable by keyboard.

## Security

- No production secrets in `.env.example`, docs, browser logs, or diagnostics output.
- Demo mode does not write demo records into production database helpers.
- Role guards protect NGO and admin routes.
- Public profile routes expose only intended worker identity fields.
- Error boundary logs are redacted and user-friendly.

## Performance

- Vite production build completes.
- Images are lazy-loaded where possible and compressed assets are preferred.
- Dashboard routes avoid full-page scroll unless required on mobile.
- Large lists use internal scroll regions.

## Known Limitations

- Several persistence helpers still use localStorage fallback until Supabase tables are connected in production.
- AI providers fall back to deterministic local logic when API keys are missing.
- Pilot imports require manual review before production use.
