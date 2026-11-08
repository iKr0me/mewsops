# Full-app repair round

User requested consistent PAWDEX-style treatment across all screens, one animated mascot, real cat photography, organized colonies, usable maps and demo entry. Palette remains cream and ginger. Reference photography is not copied; bundled illustrative photographs have source/license notes under mobile/src/screens/assets/PROVENANCE.md.

Rebuilt routes: Today, Colonies, Cats, Needs, Report, About and Welcome. Shared pixel branding/navigation live in MewsDesign/MewsUI. Demo entry is in-memory onboarding, not authentication. No credentials are collected. Report supports draft review; it does not falsely claim server submission. Native account authentication, real upload and end-to-end backend submission remain separate work.

Motion includes focused mascot breathing with pause/reduced-motion behavior, screen entrance, press feedback and detail reveal. Actual browser/native motion acceptance must be measured separately from code presence. Browser automation timed out during the final multi-screen inspection; do not claim a complete visual pass.

Map components expose typed points, selectedId and onSelect for upcoming frontend integration. Provider behavior differs between native and web. No user GPS is requested. Demo locations are invented and not real rescue sites. Preserve attribution and review production tile-provider requirements before deployment.

Review roles: visual agent repaired Today/shared identity/motion; collection agent rebuilt colonies/cats/needs and photo provenance; integration agent repaired map contract and reviewed authentication boundaries; coordinator rebuilt demo entry/report/about and runs combined checks. User feedback remains the design acceptance criterion.
