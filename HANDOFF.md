# Handoff: Pediatric Tools

Owner: Dr. Christian Rada, DO (GitHub: **Hyponatremia-Peds**). Last updated 2026-10-09.

To continue in a new Claude Code session, say:
"Read https://github.com/Hyponatremia-Peds/peds-tools/blob/main/HANDOFF.md and continue from there."

---

## 1. What exists

| Page | Live address | Repo / file | Audience |
|---|---|---|---|
| Hub | https://hyponatremia-peds.github.io/peds-tools/ | `peds-tools` / `index.html` | Families + clinicians |
| Constipation Cleanout Planner | https://hyponatremia-peds.github.io/cleanout-planner/ | `cleanout-planner` / `index.html` | Families |
| Anti-Seizure Medication Dosing | …/peds-tools/asm-dosing.html | `asm-dosing.html` | Clinicians (PIN) |
| Ballard Score | …/peds-tools/ballard.html | `ballard.html` | Clinicians (PIN) |
| Febrile Infant 8–60 Days (AAP 2021) | …/peds-tools/febrile-infant.html | `febrile-infant.html` | Clinicians (PIN) |
| Febrile Infant ≤ 56 Days (CHOP version) | …/peds-tools/febrile-infant-chop.html | `febrile-infant-chop.html` | Clinicians (PIN) |
| Kawasaki Disease | …/peds-tools/kawasaki.html | `kawasaki.html` | Clinicians (PIN) |
| IV Fluids and Sodium | …/peds-tools/fluids.html | `fluids.html` | Clinicians (PIN) |
| Credits | …/peds-tools/credits.html | `credits.html` | Everyone |

- Plain single-file HTML/CSS/JS pages. No build step, no server, no frameworks. GitHub Pages serves each repo from `main`, at the root.
- Shared files in `peds-tools`: `pets.js`, `sprites/`, `favicon.svg`, `apple-touch-icon.png`, `og-image.png`. The planner loads `pets.js` from the hub by absolute URL.
- The planner's QR code (`cleanout-planner/qr-code.png`) points at the planner address: never change that address.
- `openevidence-review.txt` in the local folder is a scratch export; it's git-ignored (`.git/info/exclude`) and not published.

## 2. Working on it

**Setup (new computer):** install Git and GitHub CLI, run `gh auth login` (the owner approves in the browser), then `gh repo clone Hyponatremia-Peds/peds-tools` and `gh repo clone Hyponatremia-Peds/cleanout-planner`. Commits use the identity `Hyponatremia-Peds <50968675+Hyponatremia-Peds@users.noreply.github.com>` (set per repo with `git config user.name/user.email`).
On the owner's Windows PC the repos are at `C:\Users\Chris\peds-tools` and `C:\Users\Chris\cleanout-planner`; `gh` lives in `C:\Program Files\GitHub CLI` (add it to PATH in Bash).

**Publish:** commit and push to `main`. Pages rebuilds in about 1 minute; check `gh api repos/Hyponatremia-Peds/<repo>/pages/builds/latest --jq .status` until `built`, then open the live page.

**Local preview:** `.claude/launch.json` (untracked) runs `python -m http.server 8123` in the repo. To see PIN-gated pages locally, set `localStorage['peds-tools-clinician']='1'` in the browser, and clear it afterwards.

**New clinician pages** reuse the Ballard page's shell (head and styles, PIN form, footer, PIN and theme scripts). Copy `ballard.html`, keep everything outside `<main>` and the two scripts at the bottom, and replace the page content and the page script. Footers say where the content came from.

## 3. Content rules (keep unless the owner says otherwise)

- **Nothing medical from Claude's memory.** Every dose, threshold and criterion comes from a source: OpenEvidence (usually the Snow model), the owner, or an official source read directly (CHOP pathways, ballardscore.com). Note the source in the page footer and in a code comment above the data.
- When sources disagree, show the value with a **VERIFY** tag (row `verify: "..."` or a note starting `VERIFY:`) until it's settled, and say so in this file.
- **Copyright:** summarize guidelines and pathways in our own words and link to them. Don't copy figures (the Ballard drawings are original SVGs made for this site).
- Don't bypass bot checks or CAPTCHAs (the AAP journal site blocks the browser; use OpenEvidence instead). Decline optional cookies on sites that ask.

### Using OpenEvidence (the owner is signed in in the Claude app's built-in browser)
- Use the **Snow** model (5–11 minutes per answer). Check "Model: Snow" right before sending: it can reset to Osler, especially after attaching a file.
- Questions over about 30 KB fail with `URI_TOO_LONG`. Put a short question in the box and attach the data as a `.txt` file (the paperclip input accepts text/plain).
- Type questions with real keystrokes (not programmatic value setting) so the page registers them. On a chat page, press Enter in the follow-up box; on the home page, click "Submit question".
- Owner's polling preference: wait 3 minutes after sending, then check every 2 minutes. Reload the chat page to see progress; it doesn't always update by itself.

## 4. Owner's decisions by page

**Cleanout planner** (source: a published 3-day cleanout protocol; never name the source institution):
- Dose by weight only. Block under 10 kg / 22 lb with "contact your provider" and no dose.
- Pounds use the printed pound column; exactly 55, 66, 88 and 110 lb move **up** a row.
- Cleanout: Miralax twice daily for 3 days plus senna **or** bisacodyl at bedtime (original doses). Maintenance from day 4: the same single Miralax dose once daily, **capped at 2 capfuls/day** (≥ 70 kg: cleanout 2½, maintenance 2 in 8–12 oz). Wording everywhere: "Do not give more than 2 capfuls a day for daily (maintenance) dosing unless your provider tells you to."
- Bisacodyl from 15 kg / **33 lb** (the source's 23 lb was a typo); ≥ 40 kg shows "1 to 2 tablets".
- Parent must tick "Yes, this weight is correct" first; switching lb/kg clears the weight.
- Stool goal Bristol 5–6 during maintenance, 6–7 expected during cleanout; the chart is original inline SVG. No FDA PEG neuropsychiatric note. English only.

**Anti-seizure medication dosing** (DRAFT banner removed 2026-10-09 at the owner's request; no VERIFY items remain):
- 20 maintenance drugs (incl. rufinamide, vigabatrin, felbamate, perampanel), 8 first-line benzodiazepines, second-line IV loads, a **clonazepam (Klonopin) bridge** section, and an **Infantile spasms** section (ACTH by BSA from height, prednisolone, vigabatrin), all collapsible.
- Reviewed by OpenEvidence five times plus targeted checks. Settled points: clonazepam adult dosing only when **over 10 years AND over 30 kg** (the bridge uses the same rule; one Snow answer read it as OR, so the owner may want to decide); phenobarbital maintenance 3–6 mg/kg/day; lacosamide 6 to < 11 kg 7.5–15 mg/kg/day (merged label table cell; a one-time look at the Vimpat PDF, Table 1, section 2.1, was suggested); valproate requires age; vigabatrin bands 10–15, > 15–20, > 20–25, > 25–60, > 60 kg.
- Not covered on purpose: levetiracetam < 1 month, oxcarbazepine < 2 y, ethosuximide and gabapentin < 3 y.

**Ballard Score:** every criterion and technique checked against the official score sheet at ballardscore.com (OpenEvidence's scarf sign, heel-to-ear and posture-4 wording was wrong). GA = 24 + 0.4 × total; below −10 is "under 20 weeks", above 50 "over 44 weeks". Original schematic drawings under each neuromuscular item (tap to select). Accuracy and limits from OpenEvidence.

**Febrile infant:**
- `febrile-infant.html` follows the **AAP 2021 guideline** (Pantell et al.; still current as of 2026; post-erratum "procalcitonin with ANC" wording), with should/may/need-not and KAS grades, Table 3 doses (all confirmed; 29–60 d meningitis ceftazidime is every 6 h), and the AAP 2024 implementation flowcharts for edge cases. The guideline has no CSF WBC cutoff; the page shows literature values (16 for ≤ 28 d, 10 for 29–60 d) as a hint only.
- `febrile-infant-chop.html` follows the CHOP pathway (0–56 days, last revised Aug 2026). The two pages link to each other.

**Kawasaki:** CHOP pathway (AHA 2017; last revised May 2025), read in full from chop.edu. Infliximab "nearest 50 mg" is shown as at least 50 mg (it would otherwise round to 0 in tiny infants), with a pharmacy-check note.

**IV fluids and sodium:** rules from an OpenEvidence Snow answer (AAP 2018 maintenance fluids, Holliday-Segar/4-2-1, dehydration, 3% saline, correction limits, Adrogué–Madias, TBW fractions). The 100 mL/h maintenance cap is an optional checkbox labeled institutional. Dehydration buttons use 4%, 7.5% and 10% unless an exact % or pre-illness weight is given.

**Re-check over time:** CHOP pathways (they're revised periodically) and the AAP febrile infant guideline (watch for a revision).

## 5. Design (all pages)

- Light mode: TypeUI "Vertical" (page #F4F4F5, white panels, charcoal #232323, 4px corners, EB Garamond headings, Inter body, Geist Mono labels). Dark mode is the **default**: warm "Claude" palette (page #141413, panels #1C1B19, ivory #FAF9F6). Light/dark switch top right (setting `peds-tools-theme`; the planner keeps its own `cleanout-planner-theme`). Printing is black on white.
- Minimal text, no filler, no small uppercase "eyebrow" labels above headings. Warnings are soft red (#FEF2F2 / #FCA5A5 / #7F1D1D); the serious stop box uses #E40014 / #C10007.
- Icon: Rod of Asclepius with one cute baby snake (`favicon.svg`).
- Footer: sources paragraph, then "Made with [red pixel heart] Claude" (links to claude.com/claude-code), then **Credits**, then "Source code on GitHub", hidden until the clinician PIN has been entered on that device. Pages have a "← Pediatric Tools" link at the top left.

## 6. Clinician PIN and pets

- 4-digit PIN; only a SHA-256 hash of `"cleanout-hub:" + PIN` is in the code. It's a convenience gate, **not security** (public site). The unlock is saved in localStorage `peds-tools-clinician` until "Lock clinician section".
- **To change the PIN,** replace `PIN_HASH` in every PIN page: `index.html`, `asm-dosing.html`, `ballard.html`, `febrile-infant.html`, `febrile-infant-chop.html`, `kawasaki.html`, `fluids.html`.
- A second hashed code (the easter egg; keep it out of READMEs) opens the pet picker and saves `peds-tools-pet-unlocked`, so the picker then shows in every page's footer on that device. The chosen pet is `peds-tools-pet`.
- `pets.js`: Neko (Web Neko, loaded from webneko.net as its license requires) plus Eevee, Jolteon and Espeon (PMD Sprite Collab, CC BY-NC 4.0; the site must stay non-commercial). Pets work on phones (walk to taps; Neko starts chasing). Picking a pet switches in place without reloading (reloading crashed phone browsers). Runs with reduced motion on (owner's choice); animations at `SLOW = 1.5`.
- Every page loads `pets.js?v=5` (the planner too). **Bump the number on all pages whenever `pets.js` changes.**

## 7. Open items

- Owner to review the planner's "When to call your child's healthcare provider" list (Claude's wording).
- Real-phone checks not done: iPhone "Copy link for Safari" from Brave; the planner's Google Calendar buttons on Android.
- Optional: decide the clonazepam age/weight rule (AND vs OR, see section 4).
- Ideas the owner liked but hasn't scheduled: AAP 2022 newborn jaundice thresholds, a family fever/pain medicine chart (acetaminophen/ibuprofen), common antibiotic dosing, a resuscitation/code sheet, corrected age, pediatric GCS/PECARN, an asthma action plan, a newborn feeding/diaper log. OpenEvidence also offered second-line infantile spasms treatment and refractory status epilepticus infusions.
- The hub's "Coming soon" cards are generic until new tools are named.

## 8. Checks after any change

- **Planner:** run `computeDoses(weight, unit)` in the console at every boundary (9.9/10/14.9/15/…/70 kg; 21.9/22/32.9/33/54.9/55/65.9/66/87.9/88/109.9/110/154/154.1 lb); `maintenanceDose()` must cap at 2 capfuls.
- **Anti-seizure page:** loop every entry in `DRUGS`, `BENZO`, `IS` and `RESCUE` over many weights and ages (and each regimen select: `ltg-reg`, `ruf-reg`, `pmp-reg`); nothing may show NaN, undefined or Infinity, and every cap must apply.
- **Pathway and calculator pages:** walk every branch (each age group, normal/abnormal results, edge cases) and hand-check a few doses.
- **All pages:** no console errors, phone width (375 px) without sideways scroll, light and dark mode, then open the live page after Pages shows `built`.
