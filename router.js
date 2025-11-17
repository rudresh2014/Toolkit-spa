// router.js — SPA controller (open/close iframe apps) + loader + animation
const homeEl = document.getElementById("home");
const appView = document.getElementById("app-view");
const appFrame = document.getElementById("app-frame");
const backBtn = document.getElementById("backBtn");
const loader = document.getElementById("loader");

// attach click to tiles (delegation)
document.querySelectorAll(".tile").forEach(tile => {
  tile.addEventListener("click", () => openApp(tile.dataset.app, tile));
});

let currentClone = null;

async function openApp(name, tileEl) {
  // show loader
  loader.classList.remove("hidden");

  // clone tile for expanding animation
  const rect = tileEl.getBoundingClientRect();
  const clone = tileEl.cloneNode(true);
  clone.style.position = "fixed";
  clone.style.top = `${rect.top}px`;
  clone.style.left = `${rect.left}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.margin = 0;
  clone.style.zIndex = 9999;
  clone.style.transition = "all 360ms cubic-bezier(.2,.9,.2,1)";
  document.body.appendChild(clone);
  currentClone = clone;

  // small zoom effect on tile itself
  tileEl.style.transform = "scale(0.98)";
  tileEl.style.transition = "transform 220ms ease";

  // force reflow
  void clone.offsetWidth;

  // expand clone to cover screen center
  const targetW = window.innerWidth * 0.96;
  const targetH = window.innerHeight * 0.92;
  const targetLeft = (window.innerWidth - targetW) / 2;
  const targetTop = (window.innerHeight - targetH) / 2;

  clone.style.left = `${targetLeft}px`;
  clone.style.top = `${targetTop}px`;
  clone.style.width = `${targetW}px`;
  clone.style.height = `${targetH}px`;
  clone.style.borderRadius = "12px";
  clone.style.boxShadow = "0 40px 120px rgba(2,6,23,0.6)";

  // slide out/hide home
  setTimeout(() => {
    homeEl.classList.add("hidden");
    appView.classList.remove("hidden");
    appView.style.opacity = "0";
    // set iframe src
    appFrame.src = `/apps/${name}/index.html`;
    // animate appView fade in
    setTimeout(() => {
      appView.style.transition = "opacity 220ms ease";
      appView.style.opacity = "1";
    }, 50);
  }, 380);

  // remove clone after app loads / timeout
  setTimeout(() => {
    try { clone.remove(); } catch(e){}
    currentClone = null;
    tileEl.style.transform = "";
    loader.classList.add("hidden");
  }, 800);
}

// back button
backBtn.addEventListener("click", async () => {
  // show loader
  loader.classList.remove("hidden");

  // hide app view
  appView.style.transition = "opacity 220ms ease";
  appView.style.opacity = "0";

  setTimeout(() => {
    appView.classList.add("hidden");
    appFrame.src = "";
    loader.classList.add("hidden");
    // reveal home
    homeEl.classList.remove("hidden");
    // small entry effect
    homeEl.style.opacity = "0";
    setTimeout(()=> homeEl.style.transition = "opacity 260ms ease", 0);
    setTimeout(()=> homeEl.style.opacity = "1", 20);
    setTimeout(()=> homeEl.style.opacity = "", 400);
  }, 260);
});

// listen for auth or child-app messages
window.addEventListener("message", (e) => {
  const data = e.data || {};
  if (data?.type === "login-success") {
    // after login, reload homepage user data
    if (window.refreshHomeUser) window.refreshHomeUser();
    // ensure home is visible
    appFrame.src = "";
    appView.classList.add("hidden");
    homeEl.classList.remove("hidden");
  }

  if (data?.type === "navigate" && data?.target) {
    // allow child iframe to ask router to open another app (optional)
    const tile = [...document.querySelectorAll(".tile")].find(t => t.dataset.app === data.target);
    if (tile) tile.click();
  }
});
