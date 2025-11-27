// apps/todo/script.js — Premium interactions with smooth animations
import { supabase } from '../../supabaseClient.js';

// Helper to send activity to parent home page
function reportActivity(text, icon = "📝") {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: "activity",
      text,
      icon
    }, "*");
  }
}

// DOM
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const prioritySelect = document.getElementById("prioritySelect");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const completionRateEl = document.getElementById("completionRate");

let tasks = JSON.parse(localStorage.getItem("tasks")) || []; // local fallback
let currentFilter = "all";
let searchQuery = "";

// NOTE: this version uses localStorage for instant UX + Supabase sync where present.
// If user is logged in we will try to load/save from Supabase.

async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

async function loadTasksFromSupabaseIfAvailable() {
  const user = await getUser();
  if (!user) return; // keep local
  try {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      tasks = data.map(row => ({
        id: row.id,
        text: row.text,
        priority: row.priority || "Medium",
        completed: row.completed || false,
        createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
      }));
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  } catch (e) { console.error(e); }
}

loadTasksFromSupabaseIfAvailable();
renderTasks();
updateStats();

// Add with smooth animation
addBtn.addEventListener("click", async () => {
  const text = taskInput.value.trim();
  if (!text) return;
  const priority = prioritySelect.value || "Medium";

  // Button micro-interaction
  addBtn.style.transform = "scale(0.95)";
  addBtn.style.transition = "transform 100ms cubic-bezier(0.34, 1.56, 0.64, 1)";
  
  setTimeout(() => {
    addBtn.style.transform = "scale(1)";
  }, 100);

  const user = await getUser();
  if (user) {
    // save to supabase
    const { data, error } = await supabase.from("todos").insert([{
      user_id: user.id,
      text, priority, completed: false
    }]).select();
    if (error) {
      console.error("Todo insert error:", error);
      // fallback to local
    } else {
      tasks.unshift({
        id: data[0].id,
        text, priority, completed: false,
        createdAt: Date.now()
      });
      localStorage.setItem("tasks", JSON.stringify(tasks));
      taskInput.value = "";
      renderTasks();
      updateStats();
      reportActivity(`Added: ${text.substring(0, 40)}...`, "➕");
      return;
    }
  }

  // local fallback
  const localTask = { id: Date.now(), text, priority, completed: false, createdAt: Date.now() };
  tasks.unshift(localTask);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  taskInput.value = "";
  renderTasks();
  updateStats();
  reportActivity(`Added: ${text.substring(0, 40)}...`, "➕");
});

// Search with smooth filter
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  // Smooth transition
  taskList.style.transition = "opacity 200ms ease";
  taskList.style.opacity = "0.6";
  
  setTimeout(() => {
    renderTasks();
    taskList.style.opacity = "1";
  }, 100);
});

// Filters with ripple effect
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    // Ripple effect
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = 'inherit';
    ripple.style.background = 'rgba(255, 255, 255, 0.4)';
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = 'buttonRipple 600ms ease-out';
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    
    // Smooth re-render
    taskList.style.transition = "opacity 200ms ease";
    taskList.style.opacity = "0.6";
    setTimeout(() => {
      renderTasks();
      taskList.style.opacity = "1";
    }, 100);
  });
});

// Clear completed with confirmation
clearCompletedBtn.addEventListener("click", async () => {
  const completed = tasks.filter(t => t.completed);
  if (completed.length === 0) return;
  if (!confirm(`Delete ${completed.length} completed tasks?`)) return;
  
  // Button loading state
  clearCompletedBtn.disabled = true;
  clearCompletedBtn.style.opacity = "0.6";
  
  const user = await getUser();
  if (user) {
    for (const t of completed) {
      if (t.id) {
        await supabase.from("todos").delete().eq("id", t.id).eq("user_id", user.id);
      }
    }
  }
  tasks = tasks.filter(t => !t.completed);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  updateStats();
  
  clearCompletedBtn.disabled = false;
  clearCompletedBtn.style.opacity = "1";
});

// Render with staggered animations
function renderTasks() {
  taskList.innerHTML = "";
  let filtered = [...tasks];
  if (searchQuery) filtered = filtered.filter(t => t.text.toLowerCase().includes(searchQuery));
  if (currentFilter === "active") filtered = filtered.filter(t => !t.completed);
  if (currentFilter === "completed") filtered = filtered.filter(t => t.completed);

  if (filtered.length === 0) {
    taskList.innerHTML = `<li class="empty-state" style="opacity: 0; animation: fadeIn 400ms ease 100ms both;">No tasks yet</li>`;
    return;
  }

  filtered.forEach((task, idx) => {
    const li = document.createElement("li");
    li.dataset.index = tasks.indexOf(task);
    li.innerHTML = `
      <label class="checkbox-wrapper">
        <input type="checkbox" class="task-checkbox" data-index="${li.dataset.index}" ${task.completed ? "checked" : ""}/>
      </label>
      <div class="task-text ${task.completed ? "strikethrough" : ""}">${escapeHtml(task.text)}</div>
      <div class="task-buttons">
        <button class="edit-btn" data-index="${li.dataset.index}">Edit</button>
        <button class="delete-btn" data-index="${li.dataset.index}">×</button>
      </div>
    `;
    li.style.setProperty('--stagger-delay', `${idx * 60}ms`);
    taskList.appendChild(li);
  });
}

// Events for list (delegation) with smooth interactions
taskList.addEventListener("click", async (e) => {
  const idx = e.target.dataset.index;
  if (e.target.classList.contains("delete-btn")) {
    const i = Number(idx);
    const li = e.target.closest("li");
    const taskText = li.querySelector(".task-text").textContent;
    
    // Delete animation
    li.style.animation = "taskDelete 300ms cubic-bezier(0.2, 0.8, 0.2, 1)";
    
    setTimeout(async () => {
      const task = tasks[i];
      const user = await getUser();
      if (user && task.id) {
        await supabase.from("todos").delete().eq("id", task.id).eq("user_id", user.id);
      }
      tasks.splice(i, 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      renderTasks();
      updateStats();
      reportActivity(`Deleted: ${taskText.substring(0, 40)}...`, "🗑️");
    }, 300);
  } else if (e.target.classList.contains("task-checkbox")) {
    const i = Number(idx);
    const checked = e.target.checked;
    const task = tasks[i];
    const li = e.target.closest("li");
    
    // Checkmark animation
    if (checked) {
      const checkbox = li.querySelector(".checkbox-wrapper input");
      checkbox.style.animation = "checkmarkAnimation 400ms cubic-bezier(0.34, 1.56, 0.64, 1)";
    }
    
    const user = await getUser();
    if (user && task.id) {
      await supabase.from("todos").update({ completed: checked }).eq("id", task.id).eq("user_id", user.id);
    }
    task.completed = checked;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    updateStats();
    reportActivity(`${checked ? "Completed" : "Unmarked"}: ${task.text.substring(0, 40)}...`, checked ? "✅" : "⭕");
  } else if (e.target.classList.contains("edit-btn")) {
    const i = Number(idx);
    const li = e.target.closest("li");
    const task = tasks[i];
    const textDiv = li.querySelector(".task-text");
    
    // Smooth transition to input
    textDiv.style.transition = "opacity 200ms ease";
    textDiv.style.opacity = "0";
    
    setTimeout(() => {
      textDiv.innerHTML = `<input class="edit-input" value="${escapeHtml(task.text)}" style="animation: slideInScale 300ms cubic-bezier(0.25, 0.8, 0.3, 1);"/> <button class="save-edit" data-index="${i}">Save</button>`;
      textDiv.style.opacity = "1";
      textDiv.querySelector(".edit-input").focus();
    }, 200);
  } else if (e.target.classList.contains("save-edit")) {
    const i = Number(e.target.dataset.index);
    const li = e.target.closest("li");
    const input = li.querySelector(".edit-input");
    const newText = input.value.trim();
    if (!newText) return;
    
    const task = tasks[i];
    const user = await getUser();
    if (user && task.id) {
      await supabase.from("todos").update({ text: newText }).eq("id", task.id).eq("user_id", user.id);
    }
    task.text = newText;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    updateStats();
  }
});

// Stats with smooth updates
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const rate = total ? Math.round((completed/total)*100) : 0;
  
  // Animate number changes
  animateNumberChange(totalTasksEl, total);
  animateNumberChange(completedTasksEl, completed);
  animateNumberChange(completionRateEl, rate + "%");
  
  if (completed > 0) {
    clearCompletedBtn.classList.remove("hidden");
  } else {
    clearCompletedBtn.classList.add("hidden");
  }
}

function animateNumberChange(el, newValue) {
  if (el.textContent !== String(newValue)) {
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

// helpers
function escapeHtml(text){
  const d = document.createElement('div');
  d.textContent = text; return d.innerHTML;
}