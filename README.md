# Pediatric Tools

**By Dr. Christian Rada, DO**

A home page for planners and calculators, with a section for families and a section for clinicians.

### 👉 Open the hub: **https://hyponatremia-peds.github.io/peds-tools/**

> **Use these tools only as directed by your child's healthcare provider.** They do not replace medical advice.

---

## Tools

| Tool | For | Link |
|---|---|---|
| Constipation Cleanout Planner | Families | https://hyponatremia-peds.github.io/cleanout-planner/ |
| Cleanout Planner dosing and rules | Clinicians | [Dosing tables](https://github.com/Hyponatremia-Peds/cleanout-planner#the-plan) |
| Anti-Seizure Medication Dosing | Clinicians | [asm-dosing.html](https://hyponatremia-peds.github.io/peds-tools/asm-dosing.html) |
| Ballard Score | Clinicians | [ballard.html](https://hyponatremia-peds.github.io/peds-tools/ballard.html) |
| Febrile Infant 8–60 Days (AAP 2021) | Clinicians | [febrile-infant.html](https://hyponatremia-peds.github.io/peds-tools/febrile-infant.html) |
| Febrile Infant ≤ 56 Days (CHOP pathway) | Clinicians | [febrile-infant-chop.html](https://hyponatremia-peds.github.io/peds-tools/febrile-infant-chop.html) |
| Kawasaki Disease | Clinicians | [kawasaki.html](https://hyponatremia-peds.github.io/peds-tools/kawasaki.html) |
| IV Fluids and Sodium | Clinicians | [fluids.html](https://hyponatremia-peds.github.io/peds-tools/fluids.html) |

More tools are coming. Maintainers: see [HANDOFF.md](HANDOFF.md).

---

## For the maintainer

- The hub is a single file, [`index.html`](index.html), with no build step. GitHub Pages serves it from the `main` branch.
- Each tool lives in its own repository and keeps its own address, so links and QR codes for a tool never change.
- **To add a tool:** in `index.html`, copy one `<article class="tool">` block in the right section, then change its tag, name, description and link.
- **Clinician PIN:** the clinician section asks for a 4-digit PIN. Once entered, it stays unlocked on that device until someone taps **Lock clinician section**. The page stores only a SHA-256 hash of the PIN, not the PIN itself. The site is public and has no server, so the PIN keeps families out of that section but is **not security**. Don't put anything confidential there.
- The icons (`favicon.svg`, `apple-touch-icon.png`, `og-image.png`) are shared with the Cleanout Planner.
- **Clinician tools** (`asm-dosing.html`, `ballard.html`, `febrile-infant.html`, `febrile-infant-chop.html`, `kawasaki.html`, `fluids.html`): each is a single file with its data in a commented block near the bottom, and each footer names its sources (OpenEvidence summaries of FDA labels and guidelines, the AAP guideline, CHOP clinical pathways, the official Ballard score sheet). Each page has its own copy of the clinician PIN gate.
- **Pets** (`pets.js`): an optional cursor-following pet. It only appears if a visitor picks one; on phones it walks to where you tap. Sprites in `sprites/` are from the [PMD Sprite Repository](https://sprites.pmdcollab.org) (CC BY-NC 4.0); full attribution is on [`credits.html`](https://hyponatremia-peds.github.io/peds-tools/credits.html).

---

*These tools give general information. They are not medical advice for any individual child. Always follow the child's healthcare provider's instructions.*
