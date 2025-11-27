// apps/expense/script.js — Premium expense tracker with smooth animations
import { supabase } from '../../supabaseClient.js';

// Helper to send activity to parent home page
function reportActivity(text, icon = "💰") {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: "activity",
      text,
      icon
    }, "*");
  }
}

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("list");
const totalExpEl = document.getElementById("totalExp");
const expenseCountEl = document.getElementById("expenseCount");
const searchInput = document.getElementById("searchInput");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let currentSearch = "";

async function getUser(){
  const { data } = await supabase.auth.getUser();
  return data.user;
}

async function loadExpensesFromSupabase(){
  const user = await getUser();
  if(!user) return;
  const { data, error } = await supabase.from("expenses").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (!error && data) {
    expenses = data.map(r => ({
      id: r.id, title: r.title, amount: r.amount, category: r.category, createdAt: r.created_at
    }));
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }
}
loadExpensesFromSupabase();
render();

// Search with smooth filter animation
searchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value.toLowerCase().trim();
  // Smooth transition
  list.style.transition = "opacity 200ms ease";
  list.style.opacity = "0.6";
  
  setTimeout(() => {
    render();
    list.style.opacity = "1";
  }, 100);
});

// Add with premium button interaction
addBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const amt = Number(amountInput.value);
  const cat = categoryInput.value;
  if (!title || !amt || amt <= 0) {
    // Shake animation
    titleInput.style.animation = "shake 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
    amountInput.style.animation = "shake 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
    setTimeout(()=>{ 
      titleInput.style.animation=""; 
      amountInput.style.animation=""; 
    }, 300);
    return;
  }

  // Button micro-interaction
  addBtn.style.transform = "scale(0.95)";
  addBtn.style.transition = "transform 100ms cubic-bezier(0.34, 1.56, 0.64, 1)";
  
  setTimeout(() => {
    addBtn.style.transform = "scale(1)";
  }, 100);

  const user = await getUser();
  if (user) {
    const { data, error } = await supabase.from("expenses").insert([{
      user_id: user.id, title, amount: amt, category: cat
    }]).select();
    if (!error && data) {
      expenses.unshift({ id: data[0].id, title, amount: amt, category: cat, createdAt: Date.now() });
      localStorage.setItem("expenses", JSON.stringify(expenses));
      titleInput.value = ""; 
      amountInput.value = "";
      render();
      reportActivity(`Spent ₹${formatNumber(amt)} on ${title}`, "💳");
      return;
    }
  }

  // fallback local
  expenses.unshift({ id: Date.now(), title, amount: amt, category: cat, createdAt: Date.now() });
  localStorage.setItem("expenses", JSON.stringify(expenses));
  titleInput.value = ""; 
  amountInput.value = "";
  render();
  reportActivity(`Spent ₹${formatNumber(amt)} on ${title}`, "💳");
});

// List events with smooth delete animation
list.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("delete-btn")) return;
  const id = e.target.dataset.id;
  const user = await getUser();
  const li = e.target.closest("li");
  const expTitle = li.querySelector(".expense-title").textContent;
  const expAmount = li.querySelector(".expense-amount").textContent;
  
  // Premium delete animation
  li.style.animation = "expenseDelete 300ms cubic-bezier(0.2, 0.8, 0.2, 1)";
  
  setTimeout(async () => {
    if (user) {
      await supabase.from("expenses").delete().eq("id", id).eq("user_id", user.id);
    }
    expenses = expenses.filter(x => String(x.id) !== String(id));
    localStorage.setItem("expenses", JSON.stringify(expenses));
    render();
    reportActivity(`Deleted: ${expTitle} ${expAmount}`, "🗑️");
  }, 300);
});

// Render with staggered animations
function render() {
  list.innerHTML = "";
  const filtered = expenses.filter(exp => {
    const s = currentSearch;
    return !s || exp.title.toLowerCase().includes(s) || exp.category.toLowerCase().includes(s) || String(exp.amount).includes(s);
  });

  if (filtered.length === 0) {
    list.innerHTML = `<li class="empty-state" style="opacity: 0; animation: fadeIn 400ms ease 100ms both;">No expenses yet</li>`;
    updateTotals([]);
    return;
  }

  filtered.forEach((exp, idx) => {
    const li = document.createElement("li");
    li.className = "expense-item-wrapper";
    li.style.setProperty('--stagger-delay', `${idx * 60}ms`);
    li.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center">
        <div class="expense-details">
          <div class="expense-title">${escapeHtml(exp.title)}</div>
          <div class="expense-meta" style="color:rgba(255,255,255,0.6);font-size:13px">${escapeHtml(exp.category)}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="expense-amount">₹${formatNumber(exp.amount)}</div>
        <button class="delete-btn" data-id="${exp.id}">×</button>
      </div>
    `;
    list.appendChild(li);
  });

  updateTotals(filtered);
}

// Update totals with smooth animation
function updateTotals(src) {
  const total = src.reduce((s,e) => s + Number(e.amount), 0);
  
  // Animate total amount change
  animateNumberChange(totalExpEl, formatNumber(total));
  
  // Animate expense count
  if (expenseCountEl.textContent !== String(src.length)) {
    expenseCountEl.style.transition = "all 300ms cubic-bezier(0.25, 0.8, 0.3, 1)";
    expenseCountEl.style.opacity = "0.5";
    expenseCountEl.style.transform = "scale(0.8)";
    
    setTimeout(() => {
      expenseCountEl.textContent = src.length;
      expenseCountEl.style.opacity = "1";
      expenseCountEl.style.transform = "scale(1)";
    }, 150);
  }
}

function animateNumberChange(el, newValue) {
  if (el.textContent !== newValue) {
    el.style.transition = "all 300ms cubic-bezier(0.25, 0.8, 0.3, 1)";
    el.style.opacity = "0.5";
    el.style.transform = "scale(0.8)";
    
    setTimeout(() => {
      el.textContent = newValue;
      el.style.opacity = "1";
      el.style.transform = "scale(1)";
    }, 150);
  }
}

function formatNumber(n){ return Number(n).toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:2}); }
function escapeHtml(t){const d=document.createElement('div');d.textContent=t;return d.innerHTML;}