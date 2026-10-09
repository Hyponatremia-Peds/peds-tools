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
 * Entering the secret code saves "peds-tools-pet-unlocked" in localStorage; after that the picker
 * shows in the footer of every page on that device.
 *
 * On phones and tablets the pet walks to wherever the screen is tapped or a finger is dragged.
 * It does run with reduced motion turned on: it's an opt-in easter egg that only appears when
 * the visitor picks it.
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
  const ARRIVE = 18;          // stop this close to the cursor or finger (px)
  const SLEEP_AFTER = 10000;  // ms without mouse or touch movement before sleeping

  const touchOnly = () => window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  let running = null;         // { name, stop } for the pet on screen

  function read() { try { return localStorage.getItem(STORE); } catch (e) { return null; } }
  function write(v) { try { v ? localStorage.setItem(STORE, v) : localStorage.removeItem(STORE); } catch (e) {} }
  // Once the secret code has been entered, this device remembers it and keeps showing the picker.
  const UNLOCK = "peds-tools-pet-unlocked";
  function isUnlocked() { try { return localStorage.getItem(UNLOCK) === "1"; } catch (e) { return false; } }
  function unlock() { try { localStorage.setItem(UNLOCK, "1"); } catch (e) {} }
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
    s.onload = () => {
      document.write = realWrite;
      if (typeof window.startANeko !== "function") return;
      window.startANeko();
      // Web Neko only chases after it's clicked and only listens to the mouse. On touch devices,
      // start it chasing and pass taps and finger drags to its mouse handler.
      if (touchOnly() && window.aNekos && window.aNekos.length) {
        // Its target starts at (0, 0); aim it at its own start so it waits there for a tap.
        if (window.mouse) { window.mouse.x = window.startNekoX; window.mouse.y = window.startNekoY; }
        window.aNekos[window.aNekos.length - 1].active = true;
        const onTouch = e => {
          const t = e.touches[0];
          if (t && typeof document.onmousemove === "function") document.onmousemove({ pageX: t.pageX, pageY: t.pageY });
        };
        window.addEventListener("touchstart", onTouch, { passive: true });
        window.addEventListener("touchmove", onTouch, { passive: true });
      }
    };
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
      // Wait for onload rather than img.decode(): decode() is unreliable on older iPhones.
      const img = new Image();
      await new Promise((ok, fail) => { img.onload = ok; img.onerror = fail; img.src = new URL(name + "/" + a.sheet + "-Anim.png", base).href; });
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
    try { anims = await loadAnim(name); } catch (e) {
      console.warn("pets.js: could not load " + name, e);
      status("Couldn't load " + LABELS[name] + ": " + (e && e.message || e));
      return;
    }
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    el.style.cssText = "position:fixed;left:0;top:0;pointer-events:none;z-index:2147483000;" +
      "image-rendering:pixelated;background-repeat:no-repeat;will-change:transform";
    document.body.appendChild(el);

    const pet = { x: window.innerWidth / 2, y: 120, row: 0, state: "Idle", frame: 0, acc: 0 };
    const mouse = { x: pet.x, y: pet.y, moved: performance.now() };
    // Mouse: follow the pointer. Touch: walk to where the screen is tapped or a finger drags.
    const aim = (x, y) => { mouse.x = x; mouse.y = y; mouse.moved = performance.now(); };
    const onMouse = e => aim(e.clientX, e.clientY);
    const onTouch = e => { const t = e.touches[0]; if (t) aim(t.clientX, t.clientY); };
    const opts = { passive: true };
    window.addEventListener("mousemove", onMouse, opts);
    window.addEventListener("touchstart", onTouch, opts);
    window.addEventListener("touchmove", onTouch, opts);
    let stopped = false;
    const stop = () => {
      stopped = true; el.remove();
      window.removeEventListener("mousemove", onMouse, opts);
      window.removeEventListener("touchstart", onTouch, opts);
      window.removeEventListener("touchmove", onTouch, opts);
    };

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
      if (stopped) return;
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
    return stop;
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
      const saved = document.createElement("span");
      saved.setAttribute("role", "status");
      saved.style.cssText = "font-size:14px";
      // Switch pets in place: reloading the page while a phone's own select menu was still
      // closing crashed some phone browsers.
      sel.addEventListener("change", () => {
        sel.blur();
        write(sel.value === "none" ? "" : sel.value);
        saved.textContent = switchTo(sel.value) ? "" : "Saved.";
      });
      box.append(label, sel, saved);
      if (anchor) anchor.insertAdjacentElement("afterend", box);
      else document.body.appendChild(box);
    }
    return box;
  }

  // Called when the secret code is entered: remember it on this device and show the picker there.
  function openPicker(anchor) {
    unlock();
    const box = showPicker(anchor);
    // Focusing a select on a phone pops its menu open by itself, so only do it with a mouse.
    if (!touchOnly()) box.querySelector("select").focus();
  }

  window.PedsPets = { showPicker: openPicker, current: chosen, set: v => { write(v === "none" ? "" : v); switchTo(v); } };

  // Message next to the picker, if it's on the page (e.g. a load error, so it's visible on phones).
  function status(text) { const s = document.querySelector("#pet-picker [role=status]"); if (s) s.textContent = text; }

  // Show pet `name` now. Web Neko can't be removed once started, so leaving it needs a reload
  // (deferred so a phone's select menu has closed first). Returns false if a reload is coming.
  function switchTo(name) {
    if (running && running.name === name) return true;
    if (running && running.name === "neko") { setTimeout(() => location.reload(), 400); return false; }
    if (running) { running.stop(); running = null; }
    if (name === "neko") { startNeko(); running = { name, stop: null }; }
    else if (PMD.includes(name)) {
      const r = running = { name, stop: () => { r.cancelled = true; } };
      startPmd(name).then(stop => { if (!stop) return; if (r.cancelled) stop(); else r.stop = stop; });
    }
    return true;
  }

  function start() {
    // Already unlocked on this device: show the picker in the footer of every page.
    if (isUnlocked()) showPicker(document.querySelector(".sprite-credit") || document.querySelector("footer"));
    switchTo(chosen());
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
