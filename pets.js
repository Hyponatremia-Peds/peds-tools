/* pets.js — a Neko-style desktop pet that follows the cursor. No dependencies.
 *
 * Pets: "neko" (Web Neko's black cat, loaded from webneko.net as its license requires)
 *       and PMD Sprite Collab sprites in sprites/<name>/ ("eevee", "jolteon", "espeon").
 *
 * Which pet shows:
 *   1. the visitor's choice from the secret-code picker (saved in localStorage), else
 *   2. data-pet="..." on this <script> tag, else
 *   3. none.
 *
 * PMD sheet format (read from each AnimData.xml at runtime):
 *   - each animation has FrameWidth/FrameHeight and a list of Durations (in game ticks, 1/60 s);
 *     the number of columns in the sheet equals the number of durations;
 *   - directional sheets have 8 rows in this order:
 *     0 Down, 1 Down-Right, 2 Right, 3 Up-Right, 4 Up, 5 Up-Left, 6 Left, 7 Down-Left;
 *   - a sheet with a single row (e.g. Sleep) is not directional;
 *   - an animation may say <CopyOf>Other</CopyOf> to reuse another animation's sheet.
 *
 * Off on touch-only devices (there's no cursor to follow). It does run with reduced motion
 * turned on: it's an opt-in easter egg that only appears when the visitor picks it.
 */
(function () {
  "use strict";
  if (window.PedsPets) return;

  const STORE = "peds-tools-pet";
  const PMD = ["eevee", "jolteon", "espeon"];
  const LABELS = { none: "No pet", neko: "Neko (black cat)", eevee: "Eevee", jolteon: "Jolteon", espeon: "Espeon" };
  const script = document.currentScript;
  const base = new URL("sprites/", script ? script.src : location.href);
  const SCALE = 2;            // 2x pixel scale
  const SLOW = 1.5;           // play animations about 33% slower than AnimData.xml's timing
  const SPEED = 2.4 / SLOW;   // px per 1/60 s while walking, slowed to match the animation
  const ARRIVE = 18;          // stop this close to the cursor (px)
  const SLEEP_AFTER = 10000;  // ms without mouse movement before sleeping

  const touchOnly = () => window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const canRun = () => !touchOnly();

  function read() { try { return localStorage.getItem(STORE); } catch (e) { return null; } }
  function write(v) { try { v ? localStorage.setItem(STORE, v) : localStorage.removeItem(STORE); } catch (e) {} }
  function chosen() {
    const saved = read();
    if (saved) return saved;
    const attr = script && script.dataset.pet;
    return attr && (attr === "neko" || PMD.includes(attr)) ? attr : "none";
  }

  /* ---------------- Web Neko ---------------- */
  function startNeko() {
    window.NekoType = "black";
    window.NekoNoDefault = true;              // the page has already loaded; we start it ourselves
    window.startNekoX = Math.round(window.innerWidth / 2);
    window.startNekoY = Math.round(window.scrollY + 80);
    // Its script calls document.write once (to add a style); after load that could wipe
    // the page, so turn it into a harmless style insert while the script loads.
    const realWrite = document.write;
    document.write = html => document.head.insertAdjacentHTML("beforeend", html);
    const s = document.createElement("script");
    s.src = "https://webneko.net/n20171213.js";   // license: link it from webneko.net, don't copy it
    s.onload = () => { document.write = realWrite; if (typeof window.startANeko === "function") window.startANeko(); };
    s.onerror = () => { document.write = realWrite; };
    document.head.appendChild(s);
  }

  /* ---------------- PMD sprite pet ---------------- */
  async function loadAnim(name) {
    const xmlText = await fetch(new URL(name + "/AnimData.xml", base)).then(r => { if (!r.ok) throw new Error("AnimData"); return r.text(); });
    const xml = new DOMParser().parseFromString(xmlText, "application/xml");
    const anims = {};
    xml.querySelectorAll("Anims > Anim").forEach(a => {
      const get = t => a.querySelector(t) && a.querySelector(t).textContent.trim();
      anims[get("Name")] = {
        copyOf: get("CopyOf") || null,
        w: +get("FrameWidth") || 0, h: +get("FrameHeight") || 0,
        durations: [...a.querySelectorAll("Durations > Duration")].map(d => +d.textContent)
      };
    });
    const resolve = n => { let a = anims[n], guard = 0; while (a && a.copyOf && guard++ < 5) { n = a.copyOf; a = anims[n]; } return a ? { ...a, sheet: n } : null; };
    const out = {};
    for (const n of ["Walk", "Idle", "Sleep"]) {
      const a = resolve(n);
      if (!a || !a.w || !a.h || !a.durations.length) throw new Error("missing " + n);
      const img = new Image();
      img.src = new URL(name + "/" + a.sheet + "-Anim.png", base).href;
      await img.decode();
      a.img = img; a.rows = Math.round(img.naturalHeight / a.h); a.cols = a.durations.length;
      out[n] = a;
    }
    return out;
  }

  // Screen angle -> sheet row (0 Down, 1 Down-Right, 2 Right, 3 Up-Right, 4 Up, 5 Up-Left, 6 Left, 7 Down-Left)
  function rowFor(dx, dy) {
    const sector = ((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8; // 0 Right, 2 Down, 4 Left, 6 Up
    return [2, 1, 0, 7, 6, 5, 4, 3][sector];
  }

  async function startPmd(name) {
    let anims;
    try { anims = await loadAnim(name); } catch (e) { console.warn("pets.js: could not load " + name, e); return; }
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = "position:fixed;left:0;top:0;pointer-events:none;z-index:2147483000;" +
      "image-rendering:pixelated;background-repeat:no-repeat;will-change:transform";
    document.body.appendChild(el);

    const pet = { x: window.innerWidth / 2, y: 120, row: 0, state: "Idle", frame: 0, acc: 0 };
    const mouse = { x: pet.x, y: pet.y, moved: performance.now() };
    window.addEventListener("mousemove", e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.moved = performance.now(); }, { passive: true });

    function setState(s) { if (pet.state !== s) { pet.state = s; pet.frame = 0; pet.acc = 0; } }
    function draw() {
      const a = anims[pet.state];
      const row = a.rows > 1 ? pet.row : 0;
      el.style.width = a.w * SCALE + "px";
      el.style.height = a.h * SCALE + "px";
      el.style.backgroundImage = "url('" + a.img.src + "')";
      el.style.backgroundSize = a.img.naturalWidth * SCALE + "px " + a.img.naturalHeight * SCALE + "px";
      el.style.backgroundPosition = -(pet.frame * a.w * SCALE) + "px " + -(row * a.h * SCALE) + "px";
      // (x, y) is the pet's feet: centre horizontally, bottom of the frame vertically
      el.style.transform = "translate(" + Math.round(pet.x - a.w * SCALE / 2) + "px," + Math.round(pet.y - a.h * SCALE) + "px)";
    }

    let last = performance.now();
    function tick(now) {
      const dt = Math.min(100, now - last); last = now;
      const dx = mouse.x - pet.x, dy = mouse.y - pet.y, dist = Math.hypot(dx, dy);
      if (now - mouse.moved > SLEEP_AFTER && dist <= ARRIVE * 2) setState("Sleep");
      else if (dist > ARRIVE) {
        setState("Walk");
        pet.row = rowFor(dx, dy);
        const step = Math.min(dist - ARRIVE / 2, SPEED * dt / (1000 / 60));
        pet.x += dx / dist * step; pet.y += dy / dist * step;
      } else setState("Idle");
      // advance frames using the durations from AnimData.xml (1 tick = 1/60 s), stretched by SLOW
      const a = anims[pet.state];
      const ms = i => a.durations[i] * 1000 / 60 * SLOW;
      pet.acc += dt;
      while (pet.acc >= ms(pet.frame)) { pet.acc -= ms(pet.frame); pet.frame = (pet.frame + 1) % a.cols; }
      draw();
      requestAnimationFrame(tick);
    }
    draw();
    requestAnimationFrame(tick);
  }

  /* ---------------- picker (shown by the secret code) ---------------- */
  function showPicker(anchor) {
    let box = document.getElementById("pet-picker");
    if (!box) {
      box = document.createElement("div");
      box.id = "pet-picker";
      box.style.cssText = "margin-top:10px;display:flex;flex-wrap:wrap;gap:8px;align-items:center";
      const label = document.createElement("label");
      label.htmlFor = "pet-select"; label.textContent = "Choose a pet:";
      label.style.cssText = "margin:0;font-weight:600";
      const sel = document.createElement("select");
      sel.id = "pet-select";
      sel.style.cssText = "font:inherit;padding:8px 10px;min-height:44px;border-radius:4px;border:1px solid currentColor;background:transparent;color:inherit";
      ["none", "neko", ...PMD].forEach(v => { const o = document.createElement("option"); o.value = v; o.textContent = LABELS[v]; sel.appendChild(o); });
      sel.value = chosen();
      // Switching pets reloads the page so the old pet is cleanly removed.
      sel.addEventListener("change", () => { write(sel.value === "none" ? "" : sel.value); location.reload(); });
      box.append(label, sel);
      if (!canRun()) {
        const note = document.createElement("p");
        note.style.cssText = "margin:4px 0 0;width:100%;font-size:14px";
        note.textContent = "Pets follow a mouse pointer, so they don't appear on touch-only devices.";
        box.appendChild(note);
      }
      (anchor || document.body).insertAdjacentElement("afterend", box);
    }
    box.querySelector("select").focus();
  }

  window.PedsPets = { showPicker, current: chosen, set: v => { write(v === "none" ? "" : v); location.reload(); } };

  function start() {
    if (!canRun()) return;
    const p = chosen();
    if (p === "neko") startNeko();
    else if (PMD.includes(p)) startPmd(p);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
