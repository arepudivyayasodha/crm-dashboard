let leads = JSON.parse(localStorage.getItem("leads")) || [
  {
    id: 1,
    name: "Ravi",
    company: "TCS",
    status: "new",
    activities: ["10:00 AM → Called"],
    priority: "High",
    reminder: ""
  }
];

let customers = JSON.parse(localStorage.getItem("customers")) || [];
let chart;

function saveData() {
  localStorage.setItem("leads", JSON.stringify(leads));
  localStorage.setItem("customers", JSON.stringify(customers));
}

function addOrUpdateLead() {
  const id = document.getElementById("editId").value;
  const name = document.getElementById("name").value;
  const company = document.getElementById("company").value;
  const priority = document.getElementById("priority").value;
  const reminder = document.getElementById("reminder").value;

  if (!name || !company) return alert("Fill all fields");

  if (id) {
    leads = leads.map(l => {
      if (l.id == id) {
        l.name = name;
        l.company = company;
        l.priority = priority;
        l.reminder = reminder;
      }
      return l;
    });
  } else {
    leads.push({
      id: Date.now(),
      name,
      company,
      status: "new",
      activities: [],
      priority,
      reminder
    });
  }

  document.getElementById("editId").value = "";
  document.getElementById("name").value = "";
  document.getElementById("company").value = "";

  saveData();
  renderLeads();
}

function renderLeads() {
  document.querySelectorAll(".column").forEach(col => {
    col.innerHTML = `<h3>${col.id.toUpperCase()}</h3>`;
  });

  const searchValue = document.getElementById("search").value.toLowerCase();
  const filter = document.getElementById("filterStatus").value;

  const colors = {
    new: "blue",
    contacted: "orange",
    qualified: "green",
    converted: "darkgreen"
  };

  const priorityColors = {
    High: "red",
    Medium: "orange",
    Low: "green"
  };

  leads
    .filter(l =>
      (l.name.toLowerCase().includes(searchValue) ||
       l.company.toLowerCase().includes(searchValue)) &&
      (filter === "all" || l.status === filter)
    )
    .forEach(lead => {
      const card = document.createElement("div");
      card.className = "card";
      card.setAttribute("draggable", true);
      card.setAttribute("id", lead.id);
      card.ondragstart = drag;

      card.style.borderLeft = `5px solid ${colors[lead.status]}`;
      card.style.boxShadow = `0 0 5px ${priorityColors[lead.priority]}`;

      card.innerHTML = `
        <b>${lead.name}</b> (${lead.priority})<br>
        ${lead.company}<br>
        Reminder: ${lead.reminder || "None"}<br>

        <select onchange="handleAction(${lead.id}, this.value)">
          <option value="">Actions</option>
          <option value="next">Next Stage</option>
          <option value="edit">Edit</option>
          <option value="delete">Delete</option>
          <option value="activity">Add Activity</option>
          <option value="convert">Convert</option>
        </select>

        <div class="activities">
          ${lead.activities.map(a => `<div>➡️ ${a}</div>`).join("")}
        </div>
      `;

      document.getElementById(lead.status).appendChild(card);
    });

  updateDashboard();
  renderCustomers();
}

function handleAction(id, action) {
  if (action === "next") moveLead(id);
  if (action === "edit") editLead(id);
  if (action === "delete") deleteLead(id);
  if (action === "activity") addActivity(id);
  if (action === "convert") convertLead(id);
}

function moveLead(id) {
  const order = ["new", "contacted", "qualified", "converted"];
  leads.forEach(l => {
    if (l.id == id) {
      let i = order.indexOf(l.status);
      l.status = order[i + 1] || "converted";
    }
  });
  saveData();
  renderLeads();
}

function deleteLead(id) {
  leads = leads.filter(l => l.id !== id);
  saveData();
  renderLeads();
}

function editLead(id) {
  const lead = leads.find(l => l.id === id);
  document.getElementById("name").value = lead.name;
  document.getElementById("company").value = lead.company;
  document.getElementById("editId").value = lead.id;
  document.getElementById("priority").value = lead.priority || "Medium";
  document.getElementById("remainder").value = lead.reminder || "";
}

function addActivity(id) {
  const activity = prompt("Enter activity:");
  if (!activity) return;

  const time = new Date().toLocaleTimeString();
  leads.forEach(l => {
    if (l.id == id) {
      l.activities.push(`${time} → ${activity}`);
    }
  });

  saveData();
  renderLeads();
}

function convertLead(id) {
  let lead = leads.find(l => l.id === id);
  if (!lead) return;

  lead.status = "converted";
  customers.push(lead);

  saveData();
  renderLeads();
}

function renderCustomers() {
  const container = document.getElementById("customersList");
  container.innerHTML = "";

  customers.forEach(c => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<b>${c.name}</b><br>${c.company}`;
    container.appendChild(div);
  });
}

function updateDashboard() {
  const total = leads.length;
  const converted = leads.filter(l => l.status === "converted").length;
  const rate = total ? ((converted / total) * 100).toFixed(1) : 0;

  document.getElementById("totalLeads").innerText = total;
  document.getElementById("convertedLeads").innerText = converted;
  document.getElementById("conversionRate").innerText = rate + "%";

  const counts = { new:0, contacted:0, qualified:0, converted:0 };
  leads.forEach(l => counts[l.status]++);

  if (chart) chart.destroy();

  const ctx = document.getElementById("chart");
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["New","Contacted","Qualified","Converted"],
      datasets: [{ label:"Leads", data:Object.values(counts) }]
    }
  });
}

/* Drag & Drop */
function allowDrop(e){ e.preventDefault(); }
function drag(e){ e.dataTransfer.setData("text", e.target.id); }
function drop(e){
  e.preventDefault();
  const id = e.dataTransfer.getData("text");
  const column = e.currentTarget.id;

  leads.forEach(l => {
    if (l.id == id) l.status = column;
  });

  saveData();
  renderLeads();
}

renderLeads();