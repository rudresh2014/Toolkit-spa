// apps/auth/auth.js — Premium auth with smooth micro-interactions
import { supabase } from '../../supabaseClient.js';

const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const nameEl = document.getElementById("name");
const submitBtn = document.getElementById("submitBtn");
const goSignup = document.getElementById("goSignup");
const goLogin = document.getElementById("goLogin");
const signupPrompt = document.getElementById("signupPrompt");
const backToLogin = document.getElementById("backToLogin");
const notice = document.getElementById("notice");
const formTitle = document.getElementById("form-title");
const formSub = document.getElementById("form-sub");

let mode = "login";

// Smooth mode transition animation
function smoothModeTransition(isSignup) {
  formTitle.style.transition = "all 300ms cubic-bezier(0.25, 0.8, 0.3, 1)";
  formSub.style.transition = "all 300ms cubic-bezier(0.25, 0.8, 0.3, 1)";
  nameEl.style.transition = "all 300ms cubic-bezier(0.25, 0.8, 0.3, 1)";
  signupPrompt.style.transition = "all 300ms cubic-bezier(0.25, 0.8, 0.3, 1)";
  backToLogin.style.transition = "all 300ms cubic-bezier(0.25, 0.8, 0.3, 1)";

  // Fade out
  formTitle.style.opacity = "0";
  formSub.style.opacity = "0";
  signupPrompt.style.opacity = "0";
  backToLogin.style.opacity = "0";

  setTimeout(() => {
    // Fade in with new content
    formTitle.style.opacity = "1";
    formSub.style.opacity = "1";
    signupPrompt.style.opacity = isSignup ? "0" : "1";
    backToLogin.style.opacity = isSignup ? "1" : "0";
  }, 150);
}

goSignup.onclick = () => {
  if (mode === "signup") return;
  
  mode = "signup";
  smoothModeTransition(true);
  
  formTitle.textContent = "Create Account ✨";
  formSub.textContent = "Sign up to continue";
  submitBtn.textContent = "Sign Up";
  
  signupPrompt.classList.add("hidden");
  backToLogin.classList.remove("hidden");
  nameEl.classList.remove("hidden");
  notice.style.display = "none";

  // Input animation
  nameEl.style.animation = "slideInScale 400ms cubic-bezier(0.25, 0.8, 0.3, 1)";
};

goLogin.onclick = () => {
  if (mode === "login") return;
  
  mode = "login";
  smoothModeTransition(false);
  
  formTitle.textContent = "Welcome Back 👋";
  formSub.textContent = "Login to continue";
  submitBtn.textContent = "Login";
  
  signupPrompt.classList.remove("hidden");
  backToLogin.classList.add("hidden");
  nameEl.classList.add("hidden");
  notice.style.display = "none";
};

function showNotice(msg, isError = true) {
  notice.textContent = msg;
  notice.style.display = "block";
  notice.style.animation = "none";
  
  // Color based on success/error
  if (isError) {
    notice.style.background = "linear-gradient(135deg, rgba(255, 92, 141, 0.12), rgba(255, 92, 141, 0.06))";
    notice.style.borderColor = "rgba(255, 92, 141, 0.35)";
    notice.style.color = "#ffe7ef";
  } else {
    notice.style.background = "linear-gradient(135deg, rgba(94, 252, 232, 0.12), rgba(123, 245, 255, 0.06))";
    notice.style.borderColor = "rgba(94, 252, 232, 0.35)";
    notice.style.color = "#c0fff9";
  }

  // Trigger animation
  void notice.offsetWidth;
  notice.style.animation = "slideInScale 400ms cubic-bezier(0.25, 0.8, 0.3, 1)";
}

submitBtn.onclick = async () => {
  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();
  const displayName = nameEl.value.trim();

  if (!email || !password) {
    showNotice("Fill all fields.", true);
    return;
  }

  // Button loading state with premium animation
  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = mode === "login" ? "Logging in..." : "Creating...";
  submitBtn.style.opacity = "0.7";
  submitBtn.style.cursor = "wait";
  submitBtn.style.transition = "all 200ms ease";

  try {
    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Success animation before redirect
      submitBtn.style.background = "linear-gradient(120deg, rgba(94, 252, 232, 1), rgba(123, 245, 255, 1))";
      submitBtn.style.transform = "scale(0.98)";
      
      showNotice("Login successful! Redirecting...", false);
      
      // Smooth redirect
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 400);
    } else {
      // signup
      const metadata = displayName ? { name: displayName } : undefined;
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: metadata }
      });
      if (error) throw error;

      showNotice("Signup successful! Check your email (if email verification enabled). Now login.", false);
      
      // Auto-switch to login after a delay
      setTimeout(() => goLogin.click(), 1200);
    }
  } catch (err) {
    showNotice(err.message || String(err), true);
    
    // Reset button on error
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    submitBtn.style.opacity = "1";
    submitBtn.style.cursor = "pointer";
    submitBtn.style.background = "";
    submitBtn.style.transform = "";
  }
};

// Add input focus micro-interactions
[emailEl, passwordEl, nameEl].forEach(input => {
  input.addEventListener("focus", () => {
    input.style.transform = "translateY(-2px)";
  });
  
  input.addEventListener("blur", () => {
    input.style.transform = "";
  });
});