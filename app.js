import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let data = [];
let sortKey = "score";
let sortDir = -1;

async function load() {
  const { data: rows, error } = await db
    .from("scores")
    .select("name, score")
    .order("score", { ascending: false })
    .limit(200);

  if (error) { showStatus(error.message, true); return; }

  // keep only each player's best score
  const best = new Map();
  for (const r of rows) {
    if (!best.has(r.name) || best.get(r.name) < r.score) best.set(r.name, r.score);
  }
  data = [...best].map(([name, score]) => ({ name, score }));
  render();
}

function render() {
  const q = document.getElementById("search").value.toLowerCase();
  const rows = data
    .filter(r => r.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const x = a[sortKey], y = b[sortKey];
      if (typeof x === "string") return x.localeCompare(y) * sortDir;
      return (x - y) * sortDir;
    });

  const tbody = document.querySelector("#board tbody");
  tbody.innerHTML = "";
  rows.forEach((r, i) => {
    const tr = document.createElement("tr");
    if (sortKey === "score" && sortDir === -1 && i === 0) tr.className = "top1";
    tr.innerHTML = `<td>${i + 1}</td><td>${r.name}</td><td>${r.score}</td>`;
    tbody.appendChild(tr);
  });
}

function showStatus(msg, isError = false) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.style.color = isError ? "#f87171" : "#4ade80";
  if (!isError) setTimeout(() => (el.textContent = ""), 3000);
}

document.getElementById("submit-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("name-input").value.trim();
  const score = parseInt(document.getElementById("score-input").value, 10);
  if (!name || isNaN(score)) return;

  const { error } = await db.from("scores").insert({ name, score });
  if (error) { showStatus(error.message, true); return; }

  showStatus("Score submitted!");
  e.target.reset();
  load();
});

document.getElementById("search").addEventListener("input", render);
document.querySelectorAll("th").forEach(th => {
  th.addEventListener("click", () => {
    const key = th.dataset.key;
    if (key === "rank") return;
    sortDir = sortKey === key ? -sortDir : -1;
    sortKey = key;
    render();
  });
});

load();
