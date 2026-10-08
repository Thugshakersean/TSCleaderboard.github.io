let data = [];
let sortKey = "score";
let sortDir = -1; // -1 = descending

async function load() {
  const res = await fetch("data.json");
  data = await res.json();
  render();
}

function render() {
  const q = document.getElementById("search").value.toLowerCase();
  let rows = data.filter(r => r.name.toLowerCase().includes(q));

  rows.sort((a, b) => {
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

document.getElementById("search").addEventListener("input", render);
document.querySelectorAll("th").forEach(th => {
  th.addEventListener("click", () => {
    const key = th.dataset.key;
    sortDir = sortKey === key ? -sortDir : -1;
    sortKey = key;
    render();
  });
});

load();
