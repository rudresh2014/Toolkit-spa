// apps/auth/auth.js
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

goSignup.onclick = () => {
  mode = "signup";
  formTitle.textContent = "Create Account ✨";
  formSub.textContent = "Sign up to continue";
  submitBtn.textContent = "Sign Up";
  signupPrompt.classList.add("hidden");
  backToLogin.classList.remove("hidden");
  nameEl.classList.remove("hidden");
  notice.style.display = "none";
};

goLogin.onclick = () => {
  mode = "login";
  formTitle.textContent = "Welcome Back 👋";
  formSub.textContent = "Login to continue";
  submitBtn.textContent = "Login";
  signupPrompt.classList.remove("hidden");
  backToLogin.classList.add("hidden");
  nameEl.classList.add("hidden");
  notice.style.display = "none";
};

function showNotice(msg) {
  notice.textContent = msg;
  notice.style.display = "block";
}

submitBtn.onclick = async () => {
  const email = emailEl.value.trim();
  const password = passwordEl.value.trim();
  const displayName = nameEl.value.trim();

  if (!email || !password) return showNotice("Fill all fields.");

  submitBtn.disabled = true;
  submitBtn.textContent = mode === "login" ? "Logging in..." : "Creating...";

  try {
    if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // redirect to root (home) after login
      window.location.href = "/index.html";
    } else {
      // signup
      const metadata = displayName ? { name: displayName } : undefined;
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { data: metadata }
      });
      if (error) throw error;

      showNotice("Signup successful! Check your email (if email verification enabled). Now login.");
      setTimeout(() => goLogin.click(), 1200);
    }
  } catch (err) {
    showNotice(err.message || String(err));
  }

  submitBtn.disabled = false;
  submitBtn.textContent = mode === "login" ? "Login" : "Sign Up";
};
