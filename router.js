// router.js — Premium SPA controller with Apple-grade smooth transitions & micro-interactions
const homeEl = document.getElementById("home");
const appView = document.getElementById("app-view");
const appFrame = document.getElementById("app-frame");
const backBtn = document.getElementById("backBtn");
const loader = document.getElementById("loader");

// Inject premium transition styles into document head
const transitionStyles = `
  <style>
    /* Page Transition Wrapper */
    @keyframes pageEnter {
      from {
        opacity: 0;
        transform: scale(0.96) translateY(12px);
        filter: blur(8px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
        filter: blur(0);
      }
    }

    @keyframes pageExit {
      from {
        opacity: 1;
        transform: scale(1) translateY(0);
        filter: blur(0);
      }
      to {
        opacity: 0;
        transform: scale(0.94) translateY(-12px);
        filter: blur(8px);
      }
    }

    @keyframes tileExpand {
      from {
        opacity: 1;
        transform: scale(1);
      }
      to {
        opacity: 0.95;
        transform: scale(1.02);
      }
    }

    @keyframes tilePress {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(0.97);
      }
      100% {
        transform: scale(1);
      }
    }

    @keyframes ripple {
      0% {
        box-shadow: 0 0 0 0 rgba(94, 252, 232, 0.7);
      }
      70% {
        box-shadow: 0 0 0 12px rgba(94, 252, 232, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(94, 252, 232, 0);
      }
    }

    @keyframes slideInFromRight {
      from {
        opacity: 0;
        transform: translateX(40px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideOutToLeft {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(-40px);
      }
    }

    .app-view-wrapper {
      animation: pageEnter 420ms cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform, opacity;
    }

    .app-view-exit {
      animation: pageExit 320ms cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .tile:active {
      animation: tilePress 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .tile-ripple {
      animation: ripple 600ms ease-out forwards;
    }

    @media (prefers-reduced-motion: reduce) {
      @keyframes pageEnter {
        from { opacity: 0; } to { opacity: 1; }
      }
      @keyframes pageExit {
        from { opacity: 1; } to { opacity: 0; }
      }
      @keyframes tileExpand { from { opacity: 1; } to { opacity: 1; } }
      @keyframes tilePress { 0%, 100% { transform: scale(1); } }
      @keyframes ripple { 0%, 100% { box-shadow: 0 0 0 0 rgba(94, 252, 232, 0); } }
    }
  </style>
`;

document.head.insertAdjacentHTML('beforeend', transitionStyles);

// Function to attach tile listeners (call on page load and after back button)
function attachTileListeners() {
  document.querySelectorAll(".tile").forEach(tile => {
    // Remove old listeners if they exist
    if (tile._clickHandler) {
      tile.removeEventListener("click", tile._clickHandler);
    }
    if (tile._mouseEnterHandler) {
      tile.removeEventListener("mouseenter", tile._mouseEnterHandler);
    }
    if (tile._mouseLeaveHandler) {
      tile.removeEventListener("mouseleave", tile._mouseLeaveHandler);
    }

    // Define handlers and store them for removal
    tile._clickHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      createRippleEffect(tile, e);
      setTimeout(() => openApp(tile.dataset.app, tile), 60);
    };

    tile._mouseEnterHandler = () => {
      tile.style.transform = "translateY(-4px)";
      tile.style.transition = "all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)";
      tile.style.boxShadow = "0 20px 60px rgba(94, 252, 232, 0.2)";
    };

    tile._mouseLeaveHandler = () => {
      tile.style.transform = "";
      tile.style.boxShadow = "";
    };

    // Attach listeners
    tile.addEventListener("click", tile._clickHandler);
    tile.addEventListener("mouseenter", tile._mouseEnterHandler);
    tile.addEventListener("mouseleave", tile._mouseLeaveHandler);
  });
}

// Initial attach on page load
attachTileListeners();

// Ripple micro-interaction
function createRippleEffect(element, event) {
  const ripple = document.createElement('div');
  ripple.style.position = 'absolute';
  ripple.style.pointerEvents = 'none';
  ripple.style.inset = '0';
  ripple.style.borderRadius = 'inherit';
  ripple.style.background = 'rgba(94, 252, 232, 0.3)';
  ripple.style.animation = 'ripple 600ms ease-out forwards';
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 600);
}

let currentClone = null;

async function openApp(name, tileEl) {
  // show loader with smooth entrance
  loader.classList.remove("hidden");
  loader.style.opacity = "0";
  loader.style.animation = "none";
  void loader.offsetWidth;
  loader.style.animation = "pageEnter 280ms cubic-bezier(0.16, 1, 0.3, 1)";
  loader.style.opacity = "1";

  // clone tile for premium expanding animation
  const rect = tileEl.getBoundingClientRect();
  const clone = tileEl.cloneNode(true);
  clone.style.position = "fixed";
  clone.style.top = `${rect.top}px`;
  clone.style.left = `${rect.left}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.margin = 0;
  clone.style.zIndex = 9999;
  clone.style.pointerEvents = "none";
  clone.style.willChange = "transform, opacity";
  clone.style.transition = "all 420ms cubic-bezier(0.16, 1, 0.3, 1)";
  document.body.appendChild(clone);
  currentClone = clone;

  // small tactile feedback on tile
  tileEl.style.transform = "scale(0.96)";
  tileEl.style.transition = "transform 180ms cubic-bezier(0.34, 1.56, 0.64, 1)";
  tileEl.style.opacity = "0.8";

  // force reflow for smooth animation
  void clone.offsetWidth;

  // expand clone to cover screen with premium easing
  const targetW = window.innerWidth * 0.96;
  const targetH = window.innerHeight * 0.92;
  const targetLeft = (window.innerWidth - targetW) / 2;
  const targetTop = (window.innerHeight - targetH) / 2;

  clone.style.left = `${targetLeft}px`;
  clone.style.top = `${targetTop}px`;
  clone.style.width = `${targetW}px`;
  clone.style.height = `${targetH}px`;
  clone.style.borderRadius = "16px";
  clone.style.boxShadow = "0 50px 140px rgba(5, 8, 26, 0.85)";
  clone.style.opacity = "0.98";

  // slide out/hide home with smooth transition
  setTimeout(() => {
    homeEl.style.animation = "slideOutToLeft 320ms cubic-bezier(0.2, 0.8, 0.2, 1)";
    homeEl.style.pointerEvents = "none";

    setTimeout(() => {
      homeEl.classList.add("hidden");
      appView.classList.remove("hidden");
      appView.style.opacity = "0";
      appView.style.transform = "scale(0.98)";
      appView.style.filter = "blur(6px)";
      
      // set iframe src
      appFrame.src = `/apps/${name}/index.html`;
      
      // animate appView fade and scale in with premium easing
      setTimeout(() => {
        appView.style.transition = "all 420ms cubic-bezier(0.16, 1, 0.3, 1)";
        appView.style.opacity = "1";
        appView.style.transform = "scale(1)";
        appView.style.filter = "blur(0)";
      }, 50);
    }, 240);
  }, 280);

  // remove clone after app loads / timeout
  setTimeout(() => {
    try { clone.remove(); } catch(e){}
    currentClone = null;
    tileEl.style.transform = "";
    tileEl.style.opacity = "";
    tileEl.style.transition = "";
    
    // smooth loader fade out
    loader.style.transition = "opacity 200ms ease";
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.classList.add("hidden");
      loader.style.opacity = "1";
    }, 200);
  }, 900);
}

// back button with premium exit animation
backBtn.addEventListener("click", async () => {
  // smooth loader entrance
  loader.classList.remove("hidden");
  loader.style.opacity = "0";
  loader.style.animation = "pageEnter 200ms cubic-bezier(0.16, 1, 0.3, 1)";
  loader.style.opacity = "1";

  // smooth app view exit with slide and scale
  appView.style.transition = "all 380ms cubic-bezier(0.2, 0.8, 0.2, 1)";
  appView.style.opacity = "0";
  appView.style.transform = "scale(0.97) translateX(20px)";
  appView.style.filter = "blur(8px)";

  setTimeout(() => {
    appView.classList.add("hidden");
    appFrame.src = "";
    
    // reveal home with premium enter animation
    homeEl.classList.remove("hidden");
    
    // Reset transition and animation
    homeEl.style.transition = "none";
    homeEl.style.animation = "none";
    
    // Clear all inline styles from home element
    homeEl.style.opacity = "";
    homeEl.style.pointerEvents = "";
    homeEl.style.transform = "";
    homeEl.style.filter = "";
    
    // Force reflow
    void homeEl.offsetWidth;
    
    // Apply fresh animation after reflow
    homeEl.style.animation = "slideInFromRight 420ms cubic-bezier(0.16, 1, 0.3, 1)";
    homeEl.style.pointerEvents = "auto";
    
    // Reset tile styles that were modified during open
    document.querySelectorAll(".tile").forEach(tile => {
      tile.style.transition = "none";
      tile.style.transform = "";
      tile.style.opacity = "";
      tile.style.boxShadow = "";
    });
    
    // Reattach tile listeners after home is revealed and styles cleared
    setTimeout(() => {
      attachTileListeners();
    }, 100);
    
    // smooth loader fade out
    setTimeout(() => {
      loader.style.transition = "opacity 200ms ease";
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.classList.add("hidden");
        loader.style.opacity = "1";
      }, 200);
    }, 100);
  }, 340);
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
