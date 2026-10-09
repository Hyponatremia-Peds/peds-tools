# Handoff: Pediatric Tools (for a new Claude Code session)

Owner: Dr. Christian Rada, DO (GitHub: **Hyponatremia-Peds**). Written 2026-10-08 at the end of the first build session.

Start a new session by asking Claude to read this file:
`https://github.com/Hyponatremia-Peds/peds-tools/blob/main/HANDOFF.md`

---

## 1. What exists

| Site | Live address | Repository | Main file |
|---|---|---|---|
| Hub (families + clinicians) | https://hyponatremia-peds.github.io/peds-tools/ | `Hyponatremia-Peds/peds-tools` | `index.html` |
| ASM dosing (clinician) | https://hyponatremia-peds.github.io/peds-tools/asm-dosing.html | `peds-tools` | `asm-dosing.html` |
| Ballard Score (clinician) | https://hyponatremia-peds.github.io/peds-tools/ballard.html | `peds-tools` | `ballard.html` |
| Febrile infant pathway (clinician) | https://hyponatremia-peds.github.io/peds-tools/febrile-infant.html | `peds-tools` | `febrile-infant.html` |
| Kawasaki pathway (clinician) | https://hyponatremia-peds.github.io/peds-tools/kawasaki.html | `peds-tools` | `kawasaki.html` |
| Constipation Cleanout Planner (families) | https://hyponatremia-peds.github.io/cleanout-planner/ | `Hyponatremia-Peds/cleanout-planner` | `index.html` |

- Everything is plain single-file HTML/CSS/JS. No build step, no server, no frameworks. GitHub Pages serves each repo from `main`, at the root.
- Shared files in `peds-tools`: `pets.js`, `sprites/`, `favicon.svg`, `apple-touch-icon.png`, `og-image.png`. The planner loads `pets.js` from the hub by absolute URL.
- The planner's QR code (`cleanout-planner/qr-code.png`) points at the planner address; never change that address.

## 2. How to publish

On a new computer: install Git and GitHub CLI, run `gh auth login` (the owner signs in through the browser), then
`gh repo clone Hyponatremia-Peds/peds-tools` and `gh repo clone Hyponatremia-Peds/cleanout-planner`.
Edit, commit, push to `main`. Pages rebuilds in about 1 minute. Check with
`gh api repos/Hyponatremia-Peds/<repo>/pages/builds/latest --jq .status` (wait for `built`).
After publishing, always open the live page and re-run the checks below.

## 3. Rules the owner decided (keep unless told otherwise)

**Cleanout planner dosing** (source: a published 3-day cleanout protocol; the owner does **not** want the source institution named anywhere):
- Dose by weight only. Block under 10 kg / under 22 lb with "contact your provider" and no dose.
- Pounds use the printed pound column. Exactly 55, 66, 88 and 110 lb move **up** to the next row.
- Cleanout: Miralax 2×/day for 3 days, plus senna **or** bisacodyl at bedtime. Original protocol doses; don't change them.
- Maintenance from day 4: same single Miralax dose once daily, **capped at 2 capfuls/day** (≥70 kg: cleanout 2½, maintenance 2 in 8–12 oz). Wording everywhere: "Do not give more than 2 capfuls a day for daily (maintenance) dosing unless your provider tells you to."
- Bisacodyl from 15 kg / **33 lb** (the source printed 23 lb, a typo). ≥40 kg bisacodyl shows "1 to 2 tablets".
- Parent must tick "Yes, this weight is correct" before medicines appear. Switching lb/kg clears the weight.
- Stool goal: Bristol **Type 5–6** during maintenance; 6–7 expected during cleanout. The chart is **original inline SVG**: never add third-party chart images.
- No FDA PEG neuropsychiatric note. English only.

**Design** (all pages):
- Light mode: TypeUI "Vertical" (page #F4F4F5, white panels, charcoal #232323, 4px corners, EB Garamond headings, Inter body, Geist Mono labels).
- Dark mode (the **default**): warm "Claude" palette (page #141413, panels #1C1B19, ivory #FAF9F6, warm grays). Light/dark switch at top right. Printing is always black on white.
- Minimal text: no filler lines, no small uppercase "eyebrow" labels above headings.
- Warning boxes are soft red (#FEF2F2 / #FCA5A5 / #7F1D1D); the serious stop box uses #E40014 / #C10007.
- Icon: Rod of Asclepius with one cute "baby snake" (`favicon.svg`; PNGs rendered from it).
- Every page's footer ends with "Made with [red pixel heart] Claude" (Claude links to claude.com/claude-code), then a **Credits** link to `credits.html` (sprites, Web Neko, fonts, design sources all live there, not in footers), then a "Source code on GitHub" link that stays **hidden until the clinician PIN has been entered** on that device.
- The planner has a "← Pediatric Tools" link back to the hub at the top left, like the other pages.

**Clinician section:**
- A 4-digit PIN gate. Only a SHA-256 hash of `"cleanout-hub:" + PIN` is in the code; the owner knows the PIN. It's a convenience gate, **not security** (public site), so never put confidential content behind it.
- The unlock is saved on the device (localStorage key `peds-tools-clinician`) until "Lock clinician section" is tapped.
- To change the PIN, replace `PIN_HASH` in both `index.html` and `asm-dosing.html` with the new hash.
- A second hashed code in the PIN box opens the **pet picker** (an easter egg; keep it out of READMEs).

**Pets (`pets.js`):**
- Neko (Web Neko black cat, loaded from webneko.net as its license requires), plus Eevee, Jolteon and Espeon (PMD Sprite Collab, CC BY-NC 4.0: Chunsoft; Jolteon also dmDash).
- The choice is saved in localStorage `peds-tools-pet` and shows on every page.
- `pets.js` is loaded as `pets.js?v=N`; bump N whenever pets.js changes so phones don't keep a cached copy.
- Works on phones too: the pet walks to wherever the screen is tapped or dragged (Neko is started already chasing and taps are forwarded to its mouse handler, since it normally needs a click first). Picking a pet switches it in place (no reload; reloading while a phone's select menu was closing crashed phone browsers). Entering the code saves `peds-tools-pet-unlocked`, so the picker then shows in every page's footer on that device. Owner's decision: it **does** run with reduced motion on, because it's an opt-in easter egg. Animations play about 33% slower than AnimData.xml (`SLOW = 1.5`). The site is non-commercial (required by the sprites' CC BY-NC license).
- Sheet format: Walk/Idle sheets have 8 direction rows (Down, DownRight, Right, UpRight, Up, UpLeft, Left, DownLeft); Sleep has 1 row; frame size and durations (1/60 s ticks) come from `AnimData.xml`.

## 4. Open items

**ASM dosing page: reviewed; the owner had the DRAFT banner removed on 2026-10-09.** All numbers came from OpenEvidence summaries the owner supplied; nothing was added from memory. A second OpenEvidence label review (2026-10-09) resolved VERIFY items 1-6 and 9 and they were applied: lacosamide <6 kg start 2 mg/kg/day (3.75 mg/kg BID is the alternate regimen), <11 kg partial-onset only; phenytoin 300 mg/day is the max starting dose, not a maintenance cap; oxcarbazepine start capped at 600 mg/day; brivaracetam twice daily; gabapentin >=12 y start 900 mg/day; fosphenytoin has no label max (rate-limited; institutional caps 1,500-2,000 mg PE); phenobarbital maintenance 4-8 mg/kg/day; valproate ESETT max 3,000 mg; ESETT cited as NEJM 2019 (Lancet 2020 = pediatric age-group analysis); AES guideline is Epilepsy Curr 2016.
Also applied from OpenEvidence's tables (2026-10-09, from the owner's screenshots): adult/older bands for levetiracetam >=16 y, oxcarbazepine >=17 y, lamotrigine >12 y (by regimen), clonazepam >10 y or >30 kg; and a first-line benzodiazepine picker (Diastat, Valtoco, Nayzilam, intranasal midazolam off-label, Buccolam, IM midazolam, IV lorazepam, IV diazepam) with caps, repeat rules and products. Still not covered by design: levetiracetam <1 month, oxcarbazepine <2, ethosuximide and gabapentin <3 years (not established).
A third review by OpenEvidence **Snow** (2026-10-09, run by Claude in the app's built-in browser; the dosing data was attached as a .txt file because long questions fail with URI_TOO_LONG) was applied: clonazepam adult band only when over 10 y AND over 30 kg; oxcarbazepine >=17 y 2,400 mg is the monotherapy-conversion dose (adjunct 1,200); lamotrigine >12 y with valproate weeks 1-2 = 25 mg every other day; brivaracetam adult start 100 mg/day; added valproate pancreatitis/fetal boxed warnings, oxcarbazepine HLA-B*1502, clobazam SJS/TEN, levetiracetam behavioral effects, topiramate <2 y guard, benzodiazepine respiratory-depression note, FDA IV diazepam label note; citations fixed (Chamberlain Lancet 2020, Bravo/Hirsch Drugs 2021 for lacosamide SE, Sezaby neonatal only).
A fourth review (Snow re-review of the published page) and a Snow follow-up were applied the same night: brivaracetam SE registry citations restored (Santamarina, Epilepsia 2019; Aicua-Rapun, Epilepsy Res 2019) and hepatic max corrected (~25% lower); lamotrigine 2-12 y valproate alone 1-3 mg/kg/day vs valproate plus others 1-5; added clobazam taper, cannabidiol <1 y guard and common AEs, valproate-lamotrigine and topiramate-valproate interactions, lacosamide AV block, levetiracetam IV:oral 1:1, Oxtellar XR note, Valtoco age note. **New drugs:** rufinamide, vigabatrin, felbamate, perampanel. **New collapsible "Infantile spasms" section** (last section): first-line choice by etiology, response definition, monitoring, and calculators for high-dose ACTH (needs height for BSA, Mosteller), low-dose ACTH, high-dose prednisolone, vigabatrin.
A fifth review (Snow, of the new drugs and infantile spasms section) confirmed all new drugs and every infantile spasms regimen; applied: phenobarbital settled at 3-6 mg/kg/day (Pellock 2004; Moffett 2018), brivaracetam hepatic wording, rufinamide DRESS warning, ICISS 18-month journal.
Lacosamide 6 to <11 kg was settled by a follow-up Snow check of the Vimpat label: 7.5-15 mg/kg/day (3.75-7.5 mg/kg BID); that row shares a merged table cell with the <6 kg row, which caused the earlier 6-12 reading. Snow suggested a one-time look at the rendered Vimpat PDF (Table 1, section 2.1) to be certain. No VERIFY items remain.

**Ballard Score page (added 2026-10-09):** New Ballard Score, behind the clinician PIN. All 12 items' criteria and techniques were checked against the official score sheet and training pages at ballardscore.com (OpenEvidence's wording for scarf sign, heel to ear and posture 4 was wrong, so the official landmarks are used). Accuracy, timing and limits come from OpenEvidence Snow (Ballard 1991; Donovan 1999; Lee 2016/2017; Sasidharan 2009; Alexander 1992; ACOG CO 700). GA = 24 + 0.4 x total; below -10 shows "under 20 weeks", above 50 "over 44 weeks". The official chart drawings are copyrighted, so they are not copied: each neuromuscular item has a collapsible "Show drawings" area with original schematic SVG drawings made from the verified criteria (tap one to select that score), plus a link to the official illustrated chart.

**Site review (2026-10-09):** vigabatrin and oxcarbazepine band labels/boundaries fixed, valproate requires age, footer sources updated, pet menu readable in dark mode and placed in the footer on every page, pets.js?v=5 everywhere including the planner.

**Febrile infant and Kawasaki pathways (added 2026-10-09):** both based on the CHOP clinical pathways (ED and inpatient), at the owner's request, read in full from chop.edu (flowchart branches checked visually) and summarized in our own words with links back to CHOP. Doses are CHOP's (febrile infant antimicrobial table; KD IVIG, aspirin, steroids, infliximab). Re-check against chop.edu when CHOP revises them (febrile infant last revised Aug 2026; KD May 2025). Pages are built from the Ballard page's shell (header, PIN gate, footer).

**Other:**
- The owner should review the planner's "When to call your child's healthcare provider" list (Claude's wording).
- Real-phone checks not yet done: iPhone "Copy link for Safari" from Brave; the Google Calendar buttons on Android.
- The hub's "coming soon" cards are generic until the owner names the next tools.

## 5. How to check after any change

- **Planner:** run `computeDoses(weight, unit)` in the browser console at every boundary: 9.9/10/14.9/15/…/70 kg and 21.9/22/32.9/33/54.9/55/65.9/66/87.9/88/109.9/110/154/154.1 lb. Check `maintenanceDose()` caps at 2 capfuls.
- **ASM:** loop every drug at several weights and ages; the page must never show NaN, undefined or Infinity; caps must apply.
- **Live:** open the live page after Pages shows `built`.
