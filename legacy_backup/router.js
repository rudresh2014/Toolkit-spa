// router.js — Apple macOS Sonoma Grade SPA with Buttery-Smooth GPU-Accelerated Transitions
const homeEl = document.getElementById("home");
const appView = document.getElementById("app-view");
const appFrame = document.getElementById("app-frame");
const backBtn = document.getElementById("backBtn");
const loader = document.getElementById("loader");

// Inject premium Apple-style card-lift transition animations
const transitionStyles = `
  <style>
    /* ========================= PREMIUM APPLE CARD-LIFT ANIMATIONS ========================= */
    
    /* Home screen exit: blur + scale down */
    @keyframes cardLiftExit {
      from {
        opacity: 1;
        transform: scale(1) translateZ(0);
        filter: blur(0px);
      }
      to {
        opacity: 0.7;
        transform: scale(0.96) translateZ(0);
        filter: blur(6px);
      }
    }

    /* New page enter: scale up from small + fade in + shadow depth */
    @keyframes cardLiftEnter {
      from {
        opacity: 0;
        transform: scale(0.92) translateZ(0);
        filter: blur(4px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateZ(0);
        filter: blur(0px);
      }
    }

    /* Backdrop blur for depth effect */
    @keyframes backdropBlur {
      from {
        backdrop-filter: blur(0px);
      }
      to {
        backdrop-filter: blur(8px);
      }
    }

    /* Premium depth shadow (appears as page lifts) */
    @keyframes depthShadow {
      from {
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
      to {
        box-shadow: 0 40px 100px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      }
    }

    /* Home screen blur state (while app is open) */
    .home-blurred {
      filter: blur(6px);
      transform: scale(0.96);
      opacity: 0.7;
      transition: none;
    }

    /* App view with card-lift elevation */
    .app-view-card-lift {
      box-shadow: 0 40px 100px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      animation: cardLiftEnter 320ms cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .tile:active {
      animation: tilePress 240ms cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .tile-ripple {
      animation: ripple 700ms cubic-bezier(0.25, 0.8, 0.3, 1) forwards;
    }

    @keyframes tilePress {
      0% { transform: scale(1); }
      50% { transform: scale(0.96); }
      100% { transform: scale(1); }
    }

    @keyframes ripple {
      0% {
        box-shadow: 0 0 0 0 rgba(94, 252, 232, 0.8);
      }
      60% {
        box-shadow: 0 0 0 16px rgba(94, 252, 232, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(94, 252, 232, 0);
      }
    }

    /* Smooth glass-wrapper scale transition */
    .glass-wrapper {
      transform-origin: center;
      will-change: transform, filter, opacity;
    }

    @media (prefers-reduced-motion: reduce) {
      @keyframes cardLiftExit { from { opacity: 1; } to { opacity: 1; } }
      @keyframes cardLiftEnter { from { opacity: 0; } to { opacity: 1; } }
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
      setTimeout(() => openApp(tile.dataset.app, tile), 50);
    };

    tile._mouseEnterHandler = () => {
      tile.style.transform = "translateY(-6px)";
      tile.style.transition = "all 280ms cubic-bezier(0.34, 1.56, 0.64, 1)";
      tile.style.boxShadow = "0 28px 72px rgba(124, 120, 255, 0.25)";
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

// Premium ripple micro-interaction with glow effect
function createRippleEffect(element, event) {
  const ripple = document.createElement('div');
  ripple.style.position = 'absolute';
  ripple.style.pointerEvents = 'none';
  ripple.style.inset = '0';
  ripple.style.borderRadius = 'inherit';
  ripple.style.background = 'rgba(94, 252, 232, 0.35)';
  ripple.style.animation = 'ripple 700ms cubic-bezier(0.25, 0.8, 0.3, 1) forwards';
  element.style.position = 'relative';
  element.style.overflow = 'hidden';
  element.appendChild(ripple);
  
  setTimeout(() => ripple.remove(), 700);
}

let currentClone = null;

/**
 * PREMIUM APPLE CARD-LIFT TRANSITION
 * - Home blurs & scales down (0.96)
 * - New page scales up from 0.92 → 1.00 with depth shadow
 * - Smooth 320ms animation with premium easing
 * - No Supabase modifications (auth/data calls untouched)
 */
async function openApp(name, tileEl) {
  // Show loader (optional subtle feedback)
  loader.classList.remove("hidden");
  loader.style.opacity = "0";
  loader.style.animation = "none";
  void loader.offsetWidth;
  loader.style.animation = "pageEnter 280ms cubic-bezier(0.16, 1, 0.3, 1)";
  loader.style.opacity = "1";

  // ===== PHASE 1: HOME SCREEN EXIT (blur + scale down) =====
  const glassWrapper = homeEl.querySelector(".glass-wrapper");
  if (glassWrapper) {
    glassWrapper.style.transition = "all 320ms cubic-bezier(0.25, 0.8, 0.3, 1)";
    glassWrapper.style.transform = "scale(0.96)";
    glassWrapper.style.filter = "blur(6px)";
    glassWrapper.style.opacity = "0.7";
  }
  homeEl.style.pointerEvents = "none";

  // ===== PHASE 2: APP VIEW ENTER (scale up from 0.92 + fade in + depth shadow) =====
  setTimeout(() => {
    homeEl.classList.add("hidden");
    appView.classList.remove("hidden");
    
    // Reset to initial state
    appView.style.transition = "none";
    appView.style.opacity = "0";
    appView.style.transform = "scale(0.92)";
    appView.style.filter = "blur(4px)";
    appView.style.pointerEvents = "auto";
    
    // Set iframe src (Supabase connections will work normally)
    appFrame.src = `/apps/${name}/index.html`;
    
    // Force reflow
    void appView.offsetWidth;
    
    // Animate in with card-lift effect
    appView.style.transition = "all 320ms cubic-bezier(0.16, 1, 0.3, 1)";
    appView.style.opacity = "1";
    appView.style.transform = "scale(1)";
    appView.style.filter = "blur(0px)";
  }, 0);

  // ===== FADE OUT LOADER =====
  setTimeout(() => {
    loader.style.transition = "opacity 260ms cubic-bezier(0.4, 0, 0.2, 1)";
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.classList.add("hidden");
      loader.style.opacity = "1";
    }, 260);
  }, 400);
}

// back button with premium apple card-lift EXIT animation
backBtn.addEventListener("click", async () => {
  // ===== PHASE 1: APP VIEW EXIT (scale down + blur + fade) =====
  appView.style.transition = "all 320ms cubic-bezier(0.25, 0.8, 0.3, 1)";
  appView.style.opacity = "0";
  appView.style.transform = "scale(0.92)";
  appView.style.filter = "blur(4px)";
  appView.style.pointerEvents = "none";

  // Show loader
  loader.classList.remove("hidden");
  loader.style.opacity = "0";
  loader.style.animation = "none";
  void loader.offsetWidth;
  loader.style.animation = "pageEnter 280ms cubic-bezier(0.16, 1, 0.3, 1)";
  loader.style.opacity = "1";

  // ===== PHASE 2: HOME SCREEN ENTER (scale up from blur) =====
  setTimeout(() => {
    appView.classList.add("hidden");
    appFrame.src = "";
    homeEl.classList.remove("hidden");
    
    // Reset home to initial blurred state
    const glassWrapper = homeEl.querySelector(".glass-wrapper");
    if (glassWrapper) {
      glassWrapper.style.transition = "none";
      glassWrapper.style.transform = "scale(0.96)";
      glassWrapper.style.filter = "blur(6px)";
      glassWrapper.style.opacity = "0.7";
      
      // Force reflow
      void glassWrapper.offsetWidth;
      
      // Animate home back to normal (card-lift reverse)
      glassWrapper.style.transition = "all 320ms cubic-bezier(0.16, 1, 0.3, 1)";
      glassWrapper.style.transform = "scale(1)";
      glassWrapper.style.filter = "blur(0px)";
      glassWrapper.style.opacity = "1";
    }
    homeEl.style.pointerEvents = "auto";
    
    // Reset tile styles
    document.querySelectorAll(".tile").forEach(tile => {
      tile.style.transition = "none";
      tile.style.transform = "";
      tile.style.opacity = "";
      tile.style.boxShadow = "";
    });
    
    // Reattach tile listeners
    setTimeout(() => {
      attachTileListeners();
    }, 120);
  }, 320);

  // Fade out loader
  setTimeout(() => {
    loader.style.transition = "opacity 260ms cubic-bezier(0.4, 0, 0.2, 1)";
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.classList.add("hidden");
      loader.style.opacity = "1";
    }, 260);
  }, 400);
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