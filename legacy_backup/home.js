/* ============================================================
   HOME.JS — Dashboard Logic (Supabase + Local UI)
   ============================================================ */

   import { supabase } from "./supabaseClient.js";

   /* ============================
      SELECT ELEMENTS
      ============================ */
   
   const usernameEl = document.getElementById("username");
   const greetingEl = document.getElementById("greeting");
   const dateDisplay = document.getElementById("dateDisplay");
   const timeDisplay = document.getElementById("timeDisplay");
   
   const notesInput = document.getElementById("notesInput");
   const notesClear = document.getElementById("notesClear");
   const notesCount = document.getElementById("notesCount");
   
   const activityFeed = document.getElementById("activityFeed");
   const activityClear = document.getElementById("activityClear");
   
   const logoutBtn = document.getElementById("logoutBtn");
   
   /* ============================
      LOAD USER (Supabase)
      ============================ */
   
   export async function refreshHomeUser() {
     const { data } = await supabase.auth.getUser();
     const user = data.user;
   
     if (!user) {
       usernameEl.textContent = "Guest";
       return;
     }
   
     const name = user.user_metadata?.name || user.email.split("@")[0];
     usernameEl.textContent = name;
   }
   
   // Load user once at page load
   refreshHomeUser();
   
   /* ============================
      GREETING MESSAGE (with Emoji & Time-based personalisation)
      ============================ */
   
   function updateGreeting() {
     const hour = new Date().getHours();
     const greetings = [
       { range: [0, 4], text: "🌙 Late Night", emoji: "🌙" },
       { range: [5, 11], text: "🌅 Good Morning", emoji: "🌅" },
       { range: [12, 16], text: "☀️ Good Afternoon", emoji: "☀️" },
       { range: [17, 20], text: "🌆 Good Evening", emoji: "🌆" },
       { range: [21, 23], text: "🌃 Night Owl Mode", emoji: "🌃" }
     ];
   
     const greeting = greetings.find(g => hour >= g.range[0] && hour <= g.range[1]) || greetings[2];
     greetingEl.textContent = greeting.text;
   }
   
   /* ============================
      CLOCK + DATE (Live)
      ============================ */
   
   function updateClock() {
     const now = new Date();
   
     dateDisplay.textContent = now.toLocaleDateString("en-IN", {
       weekday: "long",
       day: "numeric",
       month: "long",
       year: "numeric",
     });
   
     timeDisplay.textContent = now.toLocaleTimeString("en-IN", {
       hour: "2-digit",
       minute: "2-digit",
     });
   }
   
   // Init at load
   updateGreeting();
   updateClock();
   
   // Update frequently
   setInterval(() => {
     updateClock();
     updateGreeting();
   }, 30000);
   
   /* ============================
      NOTES — LocalStorage
      ============================ */
   
   const LS_NOTES_KEY = "home_notes";
   
   function loadNotes() {
     notesInput.value = localStorage.getItem(LS_NOTES_KEY) || "";
     notesCount.textContent = `${notesInput.value.length} characters`;
   }
   
   function saveNotes() {
     localStorage.setItem(LS_NOTES_KEY, notesInput.value);
     notesCount.textContent = `${notesInput.value.length} characters`;
   }
   
   loadNotes();
   
   notesInput.addEventListener("input", saveNotes);
   
   notesClear.onclick = () => {
     notesInput.value = "";
     saveNotes();
   };
   
   /* ============================
      ACTIVITY — LocalStorage
      ============================ */
   
   const LS_ACTIVITY_KEY = "home_activity";
   
   function getActivity() {
     return JSON.parse(localStorage.getItem(LS_ACTIVITY_KEY)) || [];
   }
   
   function saveActivity(arr) {
     localStorage.setItem(LS_ACTIVITY_KEY, JSON.stringify(arr));
   }
   
   export function addActivity(text, icon = "✨") {
     const list = getActivity();
   
     list.unshift({
       text,
       icon,
       time: new Date().toLocaleTimeString("en-IN", {
         hour: "2-digit",
         minute: "2-digit"
       })
     });
   
     saveActivity(list);
     renderActivity();
   }
   
   function renderActivity() {
     const items = getActivity();
   
     if (items.length === 0) {
       activityFeed.innerHTML = `
         <div class="activity-item">
           <div class="activity-icon">📭</div>
           <div class="activity-content">
             <div class="activity-text">No activity yet — start creating! 🚀</div>
           </div>
         </div>
       `;
       return;
     }
   
     activityFeed.innerHTML = items.slice(0, 8).map(
       a => `
         <div class="activity-item">
           <div class="activity-icon">${a.icon}</div>
           <div class="activity-content">
             <div class="activity-text">${a.text}</div>
             <div class="activity-time">${a.time}</div>
           </div>
         </div>
       `
     ).join("");
   }
   
   renderActivity();
   
   activityClear.onclick = () => {
     if (!confirm("Clear activity history?")) return;
     saveActivity([]);
     renderActivity();
   };
   
   /* ============================
      TILE PARALLAX ANIMATION
      ============================ */
   
   document.querySelectorAll(".tile").forEach(tile => {
     tile.addEventListener("mousemove", e => {
       const r = tile.getBoundingClientRect();
       const x = (e.clientX - r.left) / r.width - 0.5;
       const y = (e.clientY - r.top) / r.height - 0.5;
       tile.style.transform = `rotateX(${y * -6}deg) rotateY(${x * 6}deg) scale(1.03)`;
     });
   
     tile.addEventListener("mouseleave", () => {
       tile.style.transform = "rotateX(0) rotateY(0) scale(1)";
     });
   });
   
   /* ============================
      LOGOUT
      ============================ */
   
   logoutBtn.onclick = async () => {
     await supabase.auth.signOut();
     window.location.href = "/apps/auth/auth.html";
   };
   
   /* ============================
      FIRST-TIME DAILY WELCOME
      ============================ */
   
   (function dailyWelcome() {
     const today = new Date().toDateString();
     const last = localStorage.getItem("lastActivityDate");
   
     if (today !== last) {
       addActivity("Welcome to Toolkit — let's build something great! 🎯", "🎯");
       localStorage.setItem("lastActivityDate", today);
     }
   })();

   /* ============================
      LISTEN FOR ACTIVITY FROM CHILD APPS (iframes)
      ============================ */

   window.addEventListener("message", (e) => {
     // Security: only accept messages from same origin
     const data = e.data || {};
     
     if (data?.type === "activity") {
       addActivity(data.text, data.icon || "✨");
     }
   });
   