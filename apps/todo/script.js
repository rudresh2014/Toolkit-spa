// apps/todo/script.js
import { supabase } from '../../supabaseClient.js';

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

// Add
addBtn.addEventListener("click", async () => {
  const text = taskInput.value.trim();
  if (!text) return;
  const priority = prioritySelect.value || "Medium";

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
});

// Search
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderTasks();
});

// Filters
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Clear completed
clearCompletedBtn.addEventListener("click", async () => {
  const completed = tasks.filter(t => t.completed);
  if (completed.length === 0) return;
  if (!confirm(`Delete ${completed.length} completed tasks?`)) return;
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
});

// Render
function renderTasks() {
  taskList.innerHTML = "";
  let filtered = [...tasks];
  if (searchQuery) filtered = filtered.filter(t => t.text.toLowerCase().includes(searchQuery));
  if (currentFilter === "active") filtered = filtered.filter(t => !t.completed);
  if (currentFilter === "completed") filtered = filtered.filter(t => t.completed);

  if (filtered.length === 0) {
    taskList.innerHTML = `<li class="empty-state">No tasks yet</li>`;
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
    taskList.appendChild(li);
  });
}

// Events for list (delegation)
taskList.addEventListener("click", async (e) => {
  const idx = e.target.dataset.index;
  if (e.target.classList.contains("delete-btn")) {
    const i = Number(idx);
    const task = tasks[i];
    const user = await getUser();
    if (user && task.id) {
      await supabase.from("todos").delete().eq("id", task.id).eq("user_id", user.id);
    }
    tasks.splice(i,1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    updateStats();
  } else if (e.target.classList.contains("task-checkbox")) {
    const i = Number(idx);
    const checked = e.target.checked;
    const task = tasks[i];
    const user = await getUser();
    if (user && task.id) {
      await supabase.from("todos").update({ completed: checked }).eq("id", task.id).eq("user_id", user.id);
    }
    task.completed = checked;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    updateStats();
  } else if (e.target.classList.contains("edit-btn")) {
    const i = Number(idx);
    const li = e.target.closest("li");
    const task = tasks[i];
    const textDiv = li.querySelector(".task-text");
    li.querySelector(".task-text").innerHTML = `<input class="edit-input" value="${escapeHtml(task.text)}"/> <button class="save-edit" data-index="${i}">Save</button>`;
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

// Stats
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const rate = total ? Math.round((completed/total)*100) : 0;
  totalTasksEl.textContent = total;
  completedTasksEl.textContent = completed;
  completionRateEl.textContent = rate + "%";
  if (completed > 0) {
    clearCompletedBtn.classList.remove("hidden");
  } else {
    clearCompletedBtn.classList.add("hidden");
  }
}

// helpers
function escapeHtml(text){
  const d = document.createElement('div');
  d.textContent = text; return d.innerHTML;
}
