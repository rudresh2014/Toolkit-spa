// apps/expense/script.js
import { supabase } from '../../supabaseClient.js';

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

searchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value.toLowerCase().trim();
  render();
});

addBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const amt = Number(amountInput.value);
  const cat = categoryInput.value;
  if (!title || !amt || amt <= 0) {
    titleInput.style.animation = "shake .4s";
    amountInput.style.animation = "shake .4s";
    setTimeout(()=>{ titleInput.style.animation=""; amountInput.style.animation=""; }, 400);
    return;
  }

  const user = await getUser();
  if (user) {
    const { data, error } = await supabase.from("expenses").insert([{
      user_id: user.id, title, amount: amt, category: cat
    }]).select();
    if (!error && data) {
      expenses.unshift({ id: data[0].id, title, amount: amt, category: cat, createdAt: Date.now() });
      localStorage.setItem("expenses", JSON.stringify(expenses));
      titleInput.value = ""; amountInput.value = "";
      render();
      return;
    }
  }

  // fallback local
  expenses.unshift({ id: Date.now(), title, amount: amt, category: cat, createdAt: Date.now() });
  localStorage.setItem("expenses", JSON.stringify(expenses));
  titleInput.value = ""; amountInput.value = "";
  render();
});

list.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("delete-btn")) return;
  const id = e.target.dataset.id;
  const user = await getUser();
  const li = e.target.closest("li");
  li.style.opacity = "0.0";
  setTimeout(async () => {
    if (user) {
      await supabase.from("expenses").delete().eq("id", id).eq("user_id", user.id);
    }
    expenses = expenses.filter(x => String(x.id) !== String(id));
    localStorage.setItem("expenses", JSON.stringify(expenses));
    render();
  }, 260);
});

function render() {
  list.innerHTML = "";
  const filtered = expenses.filter(exp => {
    const s = currentSearch;
    return !s || exp.title.toLowerCase().includes(s) || exp.category.toLowerCase().includes(s) || String(exp.amount).includes(s);
  });

  if (filtered.length === 0) {
    list.innerHTML = `<li class="empty-state">No expenses yet</li>`;
    updateTotals([]);
    return;
  }

  filtered.forEach(exp => {
    const li = document.createElement("li");
    li.className = "expense-item-wrapper";
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

function updateTotals(src) {
  const total = src.reduce((s,e) => s + Number(e.amount), 0);
  totalExpEl.textContent = formatNumber(total);
  expenseCountEl.textContent = src.length;
}

function formatNumber(n){ return Number(n).toLocaleString('en-IN',{minimumFractionDigits:0,maximumFractionDigits:2}); }
function escapeHtml(t){const d=document.createElement('div');d.textContent=t;return d.innerHTML;}
