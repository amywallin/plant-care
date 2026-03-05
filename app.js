const STORAGE = "plantApp";
let plants = JSON.parse(localStorage.getItem(STORAGE) || "[]");
let editId = null;

function saveData() {
  localStorage.setItem(STORAGE, JSON.stringify(plants));
}

function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysUntil(dateObj) {
  if (!dateObj) return null;
  const today = new Date();
  today.setHours(0,0,0,0);
  const d = new Date(dateObj);
  d.setHours(0,0,0,0);
  return Math.floor((d - today) / 86400000);
}

function nextDate(lastISO, days) {
  if (!lastISO || !days || Number(days) <= 0) return null;
  const d = new Date(lastISO);
  d.setDate(d.getDate() + Number(days));
  return d;
}

function nextMonth(lastISO, months) {
  if (!lastISO || !months || Number(months) <= 0) return null;
  const d = new Date(lastISO);
  d.setMonth(d.getMonth() + Number(months));
  return d;
}

// Seasonal watering: Mar–Sep = “summer”, Oct–Feb = “winter”
function currentWaterDays(plant) {
  const month = new Date().getMonth() + 1; // 1-12
  const summer = Number(plant.waterSummer || 0);
  const winter = Number(plant.waterWinter || 0);
  return (month >= 3 && month <= 9) ? summer : winter;
}

function markDone(plantId, taskKey) {
  const t = todayISO();
  plants = plants.map(p => {
    if (p.id !== plantId) return p;
    if (taskKey === "water") return { ...p, lastWater: t };
    if (taskKey === "mist") return { ...p, lastMist: t };
    if (taskKey === "fert") return { ...p, lastFert: t };
    if (taskKey === "repot") return { ...p, lastRepot: t };
    return p;
  });
  saveData();
  render();
}

function render() {
  const todayDiv = document.getElementById("todayList");
  const soonDiv = document.getElementById("soonList");
  const listDiv = document.getElementById("plantList");
  dueDiv.innerHTML = "";
  listDiv.innerHTML = "";

  plants.forEach(p => {
    // Compute next dates
    const waterDays = currentWaterDays(p);
    const w = nextDate(p.lastWater, waterDays);
    const m = nextDate(p.lastMist, p.mistEvery);
    const f = nextDate(p.lastFert, p.fertEvery);
    const r = nextMonth(p.lastRepot, p.repotEvery);

    if(tasksDue.length){

    const dueCard = document.createElement("div")
    dueCard.className="card"

    const dueLeft = document.createElement("div")
    dueLeft.style.flex="1"
    dueLeft.innerHTML=`<b>${p.name}</b><br>${tasksDue.map(t=>t.label).join(", ")}`
    dueCard.appendChild(dueLeft)

    const dueActions = document.createElement("div")
    dueActions.style.display="flex"
    dueActions.style.gap="8px"

    tasksDue.forEach(t=>{
        const b=document.createElement("button")
        b.textContent=`Done: ${t.label}`
        b.onclick=()=>markDone(p.id,t.key)
        dueActions.appendChild(b)
    })

    dueCard.appendChild(dueActions)
    todayDiv.appendChild(dueCard)

} else {

    const soonCard=document.createElement("div")
    soonCard.className="card"
    soonCard.innerHTML=`<b>${p.name}</b>`

    soonDiv.appendChild(soonCard)

}

    // --- All Plants card ---
    const card = document.createElement("div");
    card.className = "card";

    // Photo thumbnail
    if (p.photo) {
      const img = document.createElement("img");
      img.src = p.photo;
      img.style.width = "64px";
      img.style.height = "64px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "8px";
      img.style.marginRight = "10px";
      card.appendChild(img);
    }

    const left = document.createElement("div");
    left.style.flex = "1";
    left.style.minWidth = "0";
    left.innerHTML = `<b>${escapeHTML(p.name || "")}</b><br>${escapeHTML(p.location || "")}`;

    card.appendChild(left);

    // Actions: Water Now + Edit
    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "8px";

    const waterNowBtn = document.createElement("button");
    waterNowBtn.textContent = "Water Now";
    waterNowBtn.onclick = () => markDone(p.id, "water");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => openPlant(p.id);

    actions.appendChild(waterNowBtn);
    actions.appendChild(editBtn);

    card.appendChild(actions);
    listDiv.appendChild(card);

    // --- Due list cards ---
    if (tasksDue.length) {
      const dueCard = document.createElement("div");
      dueCard.className = "card";

      const dueLeft = document.createElement("div");
      dueLeft.style.flex = "1";
      dueLeft.innerHTML = `<b>${escapeHTML(p.name || "")}</b><br>${tasksDue.map(t => t.label).join(", ")}`;
      dueCard.appendChild(dueLeft);

      const dueActions = document.createElement("div");
      dueActions.style.display = "flex";
      dueActions.style.gap = "8px";

      // Show “Done” buttons for each due task
      tasksDue.forEach(t => {
        const b = document.createElement("button");
        b.textContent = `Done: ${t.label}`;
        b.onclick = () => markDone(p.id, t.key);
        dueActions.appendChild(b);
      });

      // Quick edit
      const e = document.createElement("button");
      e.textContent = "Edit";
      e.onclick = () => openPlant(p.id);
      dueActions.appendChild(e);

      dueCard.appendChild(dueActions);
      dueDiv.appendChild(dueCard);
    }
  });
}

// Basic HTML escaping for safety
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[s]));
}

function openPlant(id) {
  document.getElementById("plantModal").style.display = "block";

  // Reset fields
  plantName.value = "";
  plantLocation.value = "";
  waterSummer.value = "";
  waterWinter.value = "";
  lastWater.value = "";
  mistEvery.value = "";
  lastMist.value = "";
  fertEvery.value = "";
  lastFert.value = "";
  repotEvery.value = "";
  lastRepot.value = "";
  notes.value = "";
  photoPreview.src = "";
  photoPreview.style.display = "none";

  if (!id) {
    editId = null;
    document.getElementById("modalTitle").textContent = "Add Plant";
    return;
  }

  const p = plants.find(x => x.id == id);
  editId = id;
  document.getElementById("modalTitle").textContent = "Edit Plant";

  plantName.value = p.name || "";
  plantLocation.value = p.location || "";
  waterSummer.value = p.waterSummer || "";
  waterWinter.value = p.waterWinter || "";
  lastWater.value = p.lastWater || "";

  mistEvery.value = p.mistEvery || "";
  lastMist.value = p.lastMist || "";

  fertEvery.value = p.fertEvery || "";
  lastFert.value = p.lastFert || "";

  repotEvery.value = p.repotEvery || "";
  lastRepot.value = p.lastRepot || "";

  notes.value = p.notes || "";

  if (p.photo) {
    photoPreview.src = p.photo;
    photoPreview.style.display = "block";
  }
}

function closePlant() {
  document.getElementById("plantModal").style.display = "none";
}

function savePlant() {
  const plant = {
    id: editId || Date.now(),
    name: (plantName.value || "").trim(),
    location: (plantLocation.value || "").trim(),

    waterSummer: Number(waterSummer.value || 0),
    waterWinter: Number(waterWinter.value || 0),
    lastWater: lastWater.value || "",

    mistEvery: Number(mistEvery.value || 0),
    lastMist: lastMist.value || "",

    fertEvery: Number(fertEvery.value || 0),
    lastFert: lastFert.value || "",

    repotEvery: Number(repotEvery.value || 0),
    lastRepot: lastRepot.value || "",

    notes: (notes.value || "").trim(),

    // IMPORTANT: only store photo if it’s a data URL
    photo: (photoPreview.src && photoPreview.src.startsWith("data:")) ? photoPreview.src : ""
  };

  if (!plant.name) {
    alert("Please enter a plant name.");
    return;
  }

  if (editId) {
    plants = plants.map(p => p.id == editId ? plant : p);
  } else {
    plants.push(plant);
  }

  saveData();
  render();
  closePlant();
}

function deletePlant() {
  if (!editId) return;
  plants = plants.filter(p => p.id != editId);
  saveData();
  render();
  closePlant();
}

// Photo upload -> store as base64 data URL
document.getElementById("photoInput").addEventListener("change", function(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function() {
    photoPreview.src = reader.result;
    photoPreview.style.display = "block";
  };
  reader.readAsDataURL(file);
});


render();
