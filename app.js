(() => {
const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const scenes = {};
document.querySelectorAll(".scene").forEach(s => scenes[s.id] = s);
const go = n => { Object.values(scenes).forEach(s => s.classList.remove("active")); scenes[n].classList.add("active"); };
const PHOTOS = (CONFIG.photos || []).map(p => /^https?:|^photos\//.test(p) ? p : "photos/" + p);

/* ---------- starfield ---------- */
const sc = $("#stars"), sx = sc.getContext("2d");
let stars = [];
function initStars() {
  sc.width = innerWidth; sc.height = innerHeight;
  stars = Array.from({ length: Math.min(220, Math.floor(innerWidth / 5)) }, () => ({
    x: Math.random() * sc.width, y: Math.random() * sc.height,
    r: Math.random() * 1.4 + .3, p: Math.random() * 6 }));
}
function drawStars(t) {
  sx.clearRect(0, 0, sc.width, sc.height);
  sx.fillStyle = "#fff";
  stars.forEach(s => { sx.globalAlpha = .35 + .65 * Math.abs(Math.sin(t / 900 + s.p)); sx.beginPath(); sx.arc(s.x, s.y, s.r, 0, 7); sx.fill(); });
  requestAnimationFrame(drawStars);
}
addEventListener("resize", initStars); initStars(); requestAnimationFrame(drawStars);

/* ---------- floating hearts ---------- */
let heartTimer;
function startHearts() {
  heartTimer = setInterval(() => {
    const h = document.createElement("span");
    h.className = "fh"; h.textContent = "♥";
    h.style.left = Math.random() * 100 + "%";
    h.style.fontSize = 10 + Math.random() * 18 + "px";
    h.style.animationDuration = 6 + Math.random() * 5 + "s";
    $("#hearts").appendChild(h);
    setTimeout(() => h.remove(), 11500);
  }, 700);
}

/* ---------- music ---------- */
const audio = CONFIG.music ? new Audio(CONFIG.music) : null;
const muteBtn = $("#mute");
if (audio) {
  audio.loop = true; audio.volume = .6;
  audio.addEventListener("error", () => { muteBtn.hidden = true; });
  muteBtn.addEventListener("click", () => {
    audio.muted = !audio.muted;
    muteBtn.classList.toggle("off", audio.muted);
  });
}

/* ---------- scene 1: matrix rain + countdown ---------- */
async function runRain() {
  go("rain");
  const c = $("#rainCanvas"), x = c.getContext("2d");
  c.width = innerWidth; c.height = innerHeight;
  const fs = 16, drops = Array.from({ length: Math.ceil(c.width / fs) }, () => Math.random() * -40);
  const timer = setInterval(() => {
    x.fillStyle = "rgba(8,2,12,.13)"; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = "#ff4f9a"; x.font = fs + "px monospace";
    drops.forEach((d, i) => {
      x.fillText(String(Math.random() * 10 | 0), i * fs, d * fs);
      if (d * fs > c.height && Math.random() > .975) drops[i] = 0;
      drops[i]++;
    });
  }, 45);
  const t = $("#rainText");
  for (const [txt, ms] of [["3", 900], ["2", 900], ["1", 900], [CONFIG.introWord || "Happy", 1100], [CONFIG.name, 1500], ["♥", 1500]]) {
    t.textContent = txt; t.classList.remove("pop"); void t.offsetWidth; t.classList.add("pop");
    await sleep(ms);
  }
  clearInterval(timer);
  startHearts();
  showBirthday();
}

/* ---------- scene 2: cake ---------- */
function showBirthday() {
  $("#cakeTitle").textContent = CONFIG.cakeTitle || "Happy Birthday";
  $("#cakeName").textContent = CONFIG.name;
  $("#giftBtn").textContent = CONFIG.cakeButton || "Open your gift";
  go("bday");
}

/* ---------- scene 3: book ---------- */
$("#giftBtn").addEventListener("click", () => {
  $("#bookBtn").classList.remove("open");
  go("book");
});
$("#bookBtn").addEventListener("click", async () => {
  $("#bookBtn").classList.add("open");
  await sleep(1200);
  idx = 0; renderSpread(false); go("spread");
});

/* ---------- scene 4: photo pages ---------- */
const spreads = [];
for (let i = 0; i < PHOTOS.length; i += 2) spreads.push(PHOTOS.slice(i, i + 2));
let idx = 0;

function pic(src) {
  const d = document.createElement("div"); d.className = "pic";
  const im = new Image(); im.alt = ""; im.onerror = () => im.remove(); im.src = src;
  d.appendChild(im); return d;
}
async function renderSpread(animate = true) {
  const sp = $("#spread");
  if (animate) { sp.classList.add("turn"); await sleep(350); }
  $("#note").textContent = (CONFIG.messages || [])[idx] || "";
  const box = $("#pics"); box.innerHTML = "";
  const s = spreads[idx] || [];
  box.classList.toggle("single", s.length === 1);
  s.forEach(p => box.appendChild(pic(p)));
  $("#count").textContent = (idx + 1) + " / " + spreads.length;
  $("#back").style.visibility = idx === 0 ? "hidden" : "visible";
  $("#next").textContent = idx === spreads.length - 1 ? "Finish" : "Next";
  sp.classList.remove("turn");
}
function next() {
  if (idx >= spreads.length - 1) return showFinale();
  idx++; renderSpread();
}
function back() { if (idx > 0) { idx--; renderSpread(); } }
$("#next").addEventListener("click", next);
$("#back").addEventListener("click", back);
addEventListener("keydown", e => {
  if (!scenes.spread.classList.contains("active")) return;
  if (e.key === "ArrowRight") next(); if (e.key === "ArrowLeft") back();
});
let tx = 0;
scenes.spread.addEventListener("touchstart", e => { tx = e.touches[0].clientX; }, { passive: true });
scenes.spread.addEventListener("touchend", e => {
  const dx = e.changedTouches[0].clientX - tx;
  if (dx < -50) next(); else if (dx > 50) back();
});

/* ---------- scene 5: heart collage ---------- */
function showFinale() {
  $("#finalMsg").textContent = CONFIG.finalMessage || "";
  go("finale");
  setTimeout(buildHeart, 120);
}
function buildHeart() {
  const box = $("#heart"); box.innerHTML = "";
  if (!PHOTOS.length) return;
  const W = box.clientWidth, H = box.clientHeight;
  const k = Math.min(W / 42, (H - 140) / 29), cx = W / 2, cy = H / 2 - k * 2.5;
  const dense = [];
  for (let i = 0; i <= 720; i++) {
    const t = i / 720 * Math.PI * 2;
    dense.push([cx + k * 16 * Math.sin(t) ** 3,
      cy - k * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]);
  }
  const cum = [0];
  for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  const L = cum[cum.length - 1];
  const n = Math.max(PHOTOS.length, 18);
  const size = Math.max(34, Math.min(110, L / n * 1.5));
  let j = 0;
  for (let i = 0; i < n; i++) {
    const target = i / n * L;
    while (j < cum.length - 1 && cum[j] < target) j++;
    const [px, py] = dense[j];
    const el = document.createElement("div");
    el.className = "hc";
    el.style.width = size + "px"; el.style.height = size * 1.15 + "px";
    el.style.left = px - size / 2 + "px"; el.style.top = py - size * .575 + "px";
    el.style.opacity = 0;
    el.style.transform = `translate(${(Math.random() - .5) * W}px,${(Math.random() - .5) * H}px) scale(.2) rotate(${Math.random() * 180}deg)`;
    const inner = document.createElement("div");
    const im = new Image(); im.alt = ""; im.onerror = () => im.remove(); im.src = PHOTOS[i % PHOTOS.length];
    inner.appendChild(im); el.appendChild(inner); box.appendChild(el);
    const rot = (Math.random() - .5) * 24;
    setTimeout(() => { el.style.opacity = 1; el.style.transform = `rotate(${rot}deg)`; }, 80 + i * 70);
  }
}
$("#replay").addEventListener("click", () => { idx = 0; renderSpread(false); go("spread"); });

/* ---------- start ---------- */
$("#start").addEventListener("click", () => {
  if (audio) { audio.play().then(() => { muteBtn.hidden = false; }).catch(() => {}); }
  runRain();
});
})();
