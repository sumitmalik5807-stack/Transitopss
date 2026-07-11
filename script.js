const USERS = {
  "manager@transitops.com": ["Morgan Lee", "Fleet Manager"],
  "dispatcher@transitops.com": ["Jordan Kim", "Dispatcher"],
  "safety@transitops.com": ["Taylor Reed", "Safety Officer"],
  "finance@transitops.com": ["Avery Shah", "Financial Analyst"]
};

const initialData = {
  vehicles: [
    {
      id: 1,
      reg: "TX-4821",
      name: "Freightliner M2",
      type: "Truck",
      capacity: 8000,
      odometer: 84250,
      cost: 85000,
      region: "North",
      status: "Available"
    },
    {
      id: 2,
      reg: "VAN-050",
      name: "Ford Transit Van",
      type: "Van",
      capacity: 500,
      odometer: 32140,
      cost: 38000,
      region: "Central",
      status: "On Trip"
    },
    {
      id: 3,
      reg: "BUS-118",
      name: "Mercedes Sprinter",
      type: "Bus",
      capacity: 2500,
      odometer: 61105,
      cost: 62000,
      region: "South",
      status: "In Shop"
    }
  ],

  drivers: [
    {
      id: 1,
      name: "Alex Morgan",
      license: "DL-984211",
      category: "Heavy",
      expiry: "2027-05-18",
      phone: "+1 555 401 8821",
      safety: 94,
      status: "Available"
    },
    {
      id: 2,
      name: "Sam Rivera",
      license: "DL-662801",
      category: "Light",
      expiry: "2026-10-12",
      phone: "+1 555 309 2271",
      safety: 88,
      status: "On Trip"
    },
    {
      id: 3,
      name: "Chris Lane",
      license: "DL-761901",
      category: "Light",
      expiry: "2025-01-11",
      phone: "+1 555 821 0053",
      safety: 72,
      status: "Suspended"
    }
  ],

  trips: [
    {
      id: 1,
      source: "Dallas",
      destination: "Austin",
      vehicleId: 2,
      driverId: 2,
      cargo: 420,
      distance: 315,
      status: "Dispatched",
      revenue: 1500,
      completedDistance: 0,
      fuel: 0
    }
  ],

  maintenance: [
    {
      id: 1,
      vehicleId: 3,
      work: "Brake inspection",
      cost: 850,
      date: "2026-07-08",
      status: "Active"
    }
  ],

  expenses: [
    {
      id: 1,
      vehicleId: 2,
      type: "Toll",
      amount: 48,
      liters: 0,
      date: "2026-07-10"
    },
    {
      id: 2,
      vehicleId: 3,
      type: "Maintenance",
      amount: 850,
      liters: 0,
      date: "2026-07-08"
    }
  ]
};

let db = JSON.parse(localStorage.getItem("transitops-db")) || initialData;
let activePage = "dashboard";

function saveData() {
  localStorage.setItem("transitops-db", JSON.stringify(db));
}

function getById(array, id) {
  return array.find((item) => item.id == id);
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value || 0);
}

function statusClass(status) {
  return status.toLowerCase().replace(/\s/g, "-");
}

function badge(status) {
  return `<span class="badge ${statusClass(status)}">${status}</span>`;
}

/* Authentication */

function login(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.toLowerCase();
  const password = document.getElementById("password").value;

  if (!USERS[email] || password !== "transit123") {
    toast("Invalid email or password.");
    return;
  }

  const user = {
    email,
    name: USERS[email][0],
    role: USERS[email][1]
  };

  localStorage.setItem("transitops-user", JSON.stringify(user));
  loadApp();
}

function logout() {
  localStorage.removeItem("transitops-user");
  location.reload();
}

function loadApp() {
  const user = JSON.parse(localStorage.getItem("transitops-user"));

  if (!user) return;

  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("app").style.display = "block";

  document.getElementById("userName").textContent = user.name;
  document.getElementById("userRole").textContent = user.role;

  document.getElementById("today").textContent =
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });

  render();
}

/* Navigation */

function navigate(page, button) {
  activePage = page;

  document.querySelectorAll(".nav button").forEach((item) => {
    item.classList.remove("active");
  });

  button.classList.add("active");
  render();
}

function render() {
  const titles = {
    dashboard: ["Operations Dashboard", "Your fleet overview and real-time performance."],
    vehicles: ["Vehicle Registry", "Manage fleet vehicles, status, and capacities."],
    drivers: ["Driver Management", "Track driver profiles, licenses, and safety scores."],
    trips: ["Trip Management", "Create, validate, dispatch, and complete trips."],
    maintenance: ["Maintenance Center", "Keep fleet vehicles safe and road-ready."],
    expenses: ["Fuel & Expense Management", "Track fuel, toll, and maintenance expenses."],
    reports: ["Reports & Analytics", "Review operational and financial performance."]
  };

  document.getElementById("pageTitle").textContent = titles[activePage][0];
  document.querySelector(".topbar p").textContent = titles[activePage][1];

  const renderFunction =
    window["render" + activePage.charAt(0).toUpperCase() + activePage.slice(1)];

  document.getElementById("view").innerHTML = renderFunction();
}

/* Dashboard */

function renderDashboard() {
  const activeVehicles = db.vehicles.filter((v) => v.status === "On Trip").length;
  const availableVehicles = db.vehicles.filter((v) => v.status === "Available").length;
  const maintenanceVehicles = db.vehicles.filter((v) => v.status === "In Shop").length;
  const activeTrips = db.trips.filter((t) => t.status === "Dispatched").length;

  const utilization = db.vehicles.length
    ? Math.round((activeVehicles / db.vehicles.length) * 100)
    : 0;

  return `
    <div class="grid-kpi">
      <div class="card kpi">
        <div class="label">ACTIVE VEHICLES</div>
        <div class="value">${activeVehicles}</div>
        <div class="note">Currently on trips</div>
      </div>

      <div class="card kpi">
        <div class="label">AVAILABLE VEHICLES</div>
        <div class="value">${availableVehicles}</div>
        <div class="note">Ready for dispatch</div>
      </div>

      <div class="card kpi">
        <div class="label">IN MAINTENANCE</div>
        <div class="value">${maintenanceVehicles}</div>
        <div class="note">Require attention</div>
      </div>

      <div class="card kpi">
        <div class="label">FLEET UTILIZATION</div>
        <div class="value">${utilization}%</div>
        <div class="note">${activeTrips} active trip(s)</div>
      </div>
    </div>

    <div class="card table-card" style="margin-top:20px">
      <div style="padding:20px 20px 0">
        <h3 style="margin:0">Recent Trips</h3>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${db.trips.map((trip) => {
              const vehicle = getById(db.vehicles, trip.vehicleId);
              const driver = getById(db.drivers, trip.driverId);

              return `
                <tr>
                  <td><b>${trip.source} → ${trip.destination}</b></td>
                  <td>${vehicle ? vehicle.reg : "—"}</td>
                  <td>${driver ? driver.name : "—"}</td>
                  <td>${badge(trip.status)}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* Vehicles */

function renderVehicles() {
  return `
    <div class="section-head">
      <div>
        <h3>Fleet Vehicles</h3>
        <p>${db.vehicles.length} registered assets</p>
      </div>

      <button class="btn btn-primary" onclick="vehicleForm()">
        + Add Vehicle
      </button>
    </div>

    <div class="card table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Registration / Vehicle</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Odometer</th>
              <th>Region</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${db.vehicles.map((vehicle) => `
              <tr>
                <td>
                  <b>${vehicle.reg}</b><br />
                  <small>${vehicle.name}</small>
                </td>
                <td>${vehicle.type}</td>
                <td>${Number(vehicle.capacity).toLocaleString()} kg</td>
                <td>${Number(vehicle.odometer).toLocaleString()} km</td>
                <td>${vehicle.region}</td>
                <td>${badge(vehicle.status)}</td>
                <td>
                  <button class="btn btn-outline" onclick="vehicleForm(${vehicle.id})">
                    Edit
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function vehicleForm(id = null) {
  const vehicle = id ? getById(db.vehicles, id) : {};

  modal(`
    <h3>${id ? "Edit Vehicle" : "Register Vehicle"}</h3>

    <form onsubmit="saveVehicle(event, ${id})">
      <div class="form-grid">
        <label>
          Registration Number
          <input name="reg" value="${vehicle.reg || ""}" required />
        </label>

        <label>
          Vehicle Name / Model
          <input name="name" value="${vehicle.name || ""}" required />
        </label>

        <label>
          Vehicle Type
          <select name="type">
            <option ${vehicle.type === "Truck" ? "selected" : ""}>Truck</option>
            <option ${vehicle.type === "Van" ? "selected" : ""}>Van</option>
            <option ${vehicle.type === "Bus" ? "selected" : ""}>Bus</option>
          </select>
        </label>

        <label>
          Maximum Capacity (kg)
          <input name="capacity" type="number" min="1" value="${vehicle.capacity || ""}" required />
        </label>

        <label>
          Odometer (km)
          <input name="odometer" type="number" min="0" value="${vehicle.odometer || 0}" required />
        </label>

        <label>
          Acquisition Cost ($)
          <input name="cost" type="number" min="0" value="${vehicle.cost || 0}" required />
        </label>

        <label>
          Region
          <input name="region" value="${vehicle.region || "Central"}" required />
        </label>

        <label>
          Status
          <select name="status">
            ${["Available", "On Trip", "In Shop", "Retired"].map((status) => `
              <option ${vehicle.status === status ? "selected" : ""}>${status}</option>
            `).join("")}
          </select>
        </label>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary">Save Vehicle</button>
      </div>
    </form>
  `);
}

function saveVehicle(event, id) {
  event.preventDefault();

  const formData = Object.fromEntries(new FormData(event.target));
  const duplicate = db.vehicles.find(
    (vehicle) =>
      vehicle.reg.toLowerCase() === formData.reg.toLowerCase() &&
      vehicle.id !== id
  );

  if (duplicate) {
    toast("Vehicle registration number must be unique.");
    return;
  }

  formData.capacity = Number(formData.capacity);
  formData.odometer = Number(formData.odometer);
  formData.cost = Number(formData.cost);

  if (id) {
    Object.assign(getById(db.vehicles, id), formData);
  } else {
    db.vehicles.push({
      ...formData,
      id: Date.now()
    });
  }

  saveData();
  closeModal();
  render();
  toast("Vehicle saved successfully.");
}

/* Drivers */

function renderDrivers() {
  return `
    <div class="section-head">
      <div>
        <h3>Driver Directory</h3>
        <p>Manage driver availability and license compliance.</p>
      </div>

      <button class="btn btn-primary" onclick="driverForm()">
        + Add Driver
      </button>
    </div>

    <div class="card table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Driver</th>
              <th>License</th>
              <th>Expiry</th>
              <th>Safety Score</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            ${db.drivers.map((driver) => `
              <tr>
                <td>
                  <b>${driver.name}</b><br />
                  <small>${driver.category} vehicle license</small>
                </td>
                <td>${driver.license}</td>
                <td>${driver.expiry}</td>
                <td><b>${driver.safety}/100</b></td>
                <td>${driver.phone}</td>
                <td>${badge(driver.status)}</td>
                <td>
                  <button class="btn btn-outline" onclick="driverForm(${driver.id})">
                    Edit
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function driverForm(id = null) {
  const driver = id ? getById(db.drivers, id) : {};

  modal(`
    <h3>${id ? "Edit Driver" : "Add Driver"}</h3>

    <form onsubmit="saveDriver(event, ${id})">
      <div class="form-grid">
        <label>
          Full Name
          <input name="name" value="${driver.name || ""}" required />
        </label>

        <label>
          License Number
          <input name="license" value="${driver.license || ""}" required />
        </label>

        <label>
          License Category
          <select name="category">
            <option ${driver.category === "Light" ? "selected" : ""}>Light</option>
            <option ${driver.category === "Heavy" ? "selected" : ""}>Heavy</option>
          </select>
        </label>

        <label>
          License Expiry Date
          <input name="expiry" type="date" value="${driver.expiry || ""}" required />
        </label>

        <label>
          Contact Number
          <input name="phone" value="${driver.phone || ""}" required />
        </label>

        <label>
          Safety Score
          <input name="safety" type="number" min="0" max="100" value="${driver.safety || 80}" required />
        </label>

        <label>
          Status
          <select name="status">
            ${["Available", "On Trip", "Off Duty", "Suspended"].map((status) => `
              <option ${driver.status === status ? "selected" : ""}>${status}</option>
            `).join("")}
          </select>
        </label>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary">Save Driver</button>
      </div>
    </form>
  `);
}

function saveDriver(event, id) {
  event.preventDefault();

  const formData = Object.fromEntries(new FormData(event.target));
  formData.safety = Number(formData.safety);

  if (id) {
    Object.assign(getById(db.drivers, id), formData);
  } else {
    db.drivers.push({
      ...formData,
      id: Date.now()
    });
  }

  saveData();
  closeModal();
  render();
  toast("Driver saved successfully.");
}

/* Trips */

function renderTrips() {
  return `
    <div class="section-head">
      <div>
        <h3>Trips</h3>
        <p>Create, dispatch, complete, or cancel transport trips.</p>
      </div>

      <button class="btn btn-primary" onclick="tripForm()">
        + Create Trip
      </button>
    </div>

    <div class="card table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Route</th>
              <th>Vehicle</th>
              <th>Driver</th>
              <th>Cargo</th>
              <th>Distance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            ${db.trips.map((trip) => {
              const vehicle = getById(db.vehicles, trip.vehicleId);
              const driver = getById(db.drivers, trip.driverId);

              return `
                <tr>
                  <td>
                    <b>${trip.source} → ${trip.destination}</b><br />
                    <small>#TR-${String(trip.id).slice(-4)}</small>
                  </td>
                  <td>${vehicle ? vehicle.reg : "—"}</td>
                  <td>${driver ? driver.name : "—"}</td>
                  <td>${trip.cargo} kg</td>
                  <td>${trip.distance} km</td>
                  <td>${badge(trip.status)}</td>
                  <td>
                    ${
                      trip.status === "Draft"
                        ? `<button class="btn btn-primary" onclick="dispatchTrip(${trip.id})">Dispatch</button>`
                        : ""
                    }

                    ${
                      trip.status === "Dispatched"
                        ? `
                          <button class="btn btn-primary" onclick="completeTrip(${trip.id})">Complete</button>
                          <button class="btn btn-danger" onclick="cancelTrip(${trip.id})">Cancel</button>
                        `
                        : ""
                    }
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function tripForm() {
  const availableVehicles = db.vehicles.filter(
    (vehicle) => vehicle.status === "Available"
  );

  const eligibleDrivers = db.drivers.filter(
    (driver) =>
      driver.status === "Available" &&
      new Date(driver.expiry) >= new Date()
  );

  modal(`
    <h3>Create Trip</h3>

    <form onsubmit="saveTrip(event)">
      <div class="form-grid">
        <label>
          Source
          <input name="source" required />
        </label>

        <label>
          Destination
          <input name="destination" required />
        </label>

        <label>
          Available Vehicle
          <select name="vehicleId" required>
            <option value="">Select vehicle</option>
            ${availableVehicles.map((vehicle) => `
              <option value="${vehicle.id}">
                ${vehicle.reg} — ${vehicle.capacity} kg
              </option>
            `).join("")}
          </select>
        </label>

        <label>
          Eligible Driver
          <select name="driverId" required>
            <option value="">Select driver</option>
            ${eligibleDrivers.map((driver) => `
              <option value="${driver.id}">
                ${driver.name}
              </option>
            `).join("")}
          </select>
        </label>

        <label>
          Cargo Weight (kg)
          <input name="cargo" type="number" min="1" required />
        </label>

        <label>
          Planned Distance (km)
          <input name="distance" type="number" min="1" required />
        </label>

        <label>
          Expected Revenue ($)
          <input name="revenue" type="number" min="0" required />
        </label>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary">Create Draft</button>
      </div>
    </form>
  `);
}

function saveTrip(event) {
  event.preventDefault();

  const formData = Object.fromEntries(new FormData(event.target));

  formData.vehicleId = Number(formData.vehicleId);
  formData.driverId = Number(formData.driverId);
  formData.cargo = Number(formData.cargo);
  formData.distance = Number(formData.distance);
  formData.revenue = Number(formData.revenue);

  const vehicle = getById(db.vehicles, formData.vehicleId);

  if (formData.cargo > vehicle.capacity) {
    toast(`Cargo cannot exceed ${vehicle.capacity} kg.`);
    return;
  }

  db.trips.push({
    ...formData,
    id: Date.now(),
    status: "Draft",
    completedDistance: 0,
    fuel: 0
  });

  saveData();
  closeModal();
  render();
  toast("Trip created as draft.");
}

function dispatchTrip(id) {
  const trip = getById(db.trips, id);
  const vehicle = getById(db.vehicles, trip.vehicleId);
  const driver = getById(db.drivers, trip.driverId);

  if (vehicle.status !== "Available") {
    toast("Vehicle is not available for dispatch.");
    return;
  }

  if (driver.status !== "Available") {
    toast("Driver is not available for dispatch.");
    return;
  }

  if (new Date(driver.expiry) < new Date()) {
    toast("Driver license has expired.");
    return;
  }

  if (trip.cargo > vehicle.capacity) {
    toast("Cargo weight exceeds vehicle capacity.");
    return;
  }

  trip.status = "Dispatched";
  vehicle.status = "On Trip";
  driver.status = "On Trip";

  saveData();
  render();
  toast("Trip dispatched successfully.");
}

function completeTrip(id) {
  const trip = getById(db.trips, id);
  const vehicle = getById(db.vehicles, trip.vehicleId);
  const driver = getById(db.drivers, trip.driverId);

  trip.status = "Completed";
  trip.completedDistance = trip.distance;

  vehicle.status = "Available";
  driver.status = "Available";

  saveData();
  render();
  toast("Trip completed. Vehicle and driver are now Available.");
}

function cancelTrip(id) {
  const trip = getById(db.trips, id);
  const vehicle = getById(db.vehicles, trip.vehicleId);
  const driver = getById(db.drivers, trip.driverId);

  trip.status = "Cancelled";
  vehicle.status = "Available";
  driver.status = "Available";

  saveData();
  render();
  toast("Trip cancelled. Vehicle and driver restored.");
}

/* Maintenance */

function renderMaintenance() {
  return `
    <div class="section-head">
      <div>
        <h3>Maintenance Logs</h3>
        <p>Active maintenance automatically puts vehicles In Shop.</p>
      </div>

      <button class="btn btn-primary" onclick="maintenanceForm()">
        + Log Maintenance
      </button>
    </div>

    <div class="card table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Work</th>
              <th>Date</th>
              <th>Cost</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            ${db.maintenance.map((item) => {
              const vehicle = getById(db.vehicles, item.vehicleId);

              return `
                <tr>
                  <td><b>${vehicle ? vehicle.reg : "—"}</b></td>
                  <td>${item.work}</td>
                  <td>${item.date}</td>
                  <td>${money(item.cost)}</td>
                  <td>${badge(item.status)}</td>
                  <td>
                    ${
                      item.status === "Active"
                        ? `<button class="btn btn-primary" onclick="closeMaintenance(${item.id})">Close</button>`
                        : "Closed"
                    }
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function maintenanceForm() {
  const vehicles = db.vehicles.filter(
    (vehicle) => vehicle.status === "Available"
  );

  modal(`
    <h3>Create Maintenance Log</h3>

    <form onsubmit="saveMaintenance(event)">
      <div class="form-grid">
        <label>
          Vehicle
          <select name="vehicleId" required>
            <option value="">Select vehicle</option>
            ${vehicles.map((vehicle) => `
              <option value="${vehicle.id}">
                ${vehicle.reg} — ${vehicle.name}
              </option>
            `).join("")}
          </select>
        </label>

        <label>
          Maintenance Work
          <input name="work" placeholder="Oil change" required />
        </label>

        <label>
          Date
          <input name="date" type="date" required />
        </label>

        <label>
          Cost ($)
          <input name="cost" type="number" min="0" required />
        </label>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary">Open Maintenance</button>
      </div>
    </form>
  `);
}

function saveMaintenance(event) {
  event.preventDefault();

  const formData = Object.fromEntries(new FormData(event.target));

  formData.vehicleId = Number(formData.vehicleId);
  formData.cost = Number(formData.cost);

  const vehicle = getById(db.vehicles, formData.vehicleId);

  vehicle.status = "In Shop";

  db.maintenance.push({
    ...formData,
    id: Date.now(),
    status: "Active"
  });

  db.expenses.push({
    id: Date.now() + 1,
    vehicleId: formData.vehicleId,
    type: "Maintenance",
    amount: formData.cost,
    liters: 0,
    date: formData.date
  });

  saveData();
  closeModal();
  render();
  toast("Maintenance opened. Vehicle status is now In Shop.");
}

function closeMaintenance(id) {
  const maintenance = getById(db.maintenance, id);
  const vehicle = getById(db.vehicles, maintenance.vehicleId);

  maintenance.status = "Closed";

  if (vehicle.status !== "Retired") {
    vehicle.status = "Available";
  }

  saveData();
  render();
  toast("Maintenance closed. Vehicle is now Available.");
}

/* Expenses */

function renderExpenses() {
  const totalCost = db.expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  return `
    <div class="grid-kpi" style="grid-template-columns: repeat(3, 1fr); margin-bottom:20px;">
      <div class="card kpi">
        <div class="label">TOTAL OPERATIONAL COST</div>
        <div class="value">${money(totalCost)}</div>
        <div class="note">All recorded operating costs</div>
      </div>

      <div class="card kpi">
        <div class="label">FUEL SPEND</div>
        <div class="value">${money(
          db.expenses
            .filter((expense) => expense.type === "Fuel")
            .reduce((total, expense) => total + Number(expense.amount), 0)
        )}</div>
        <div class="note">Fuel expenses</div>
      </div>

      <div class="card kpi">
        <div class="label">TOTAL FUEL VOLUME</div>
        <div class="value">${db.expenses.reduce(
          (total, expense) => total + Number(expense.liters || 0),
          0
        )} L</div>
        <div class="note">Recorded fuel consumption</div>
      </div>
    </div>

    <div class="section-head">
      <div>
        <h3>Expense Ledger</h3>
        <p>Fuel, tolls, maintenance, and other costs.</p>
      </div>

      <button class="btn btn-primary" onclick="expenseForm()">
        + Add Expense
      </button>
    </div>

    <div class="card table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Vehicle</th>
              <th>Type</th>
              <th>Fuel Volume</th>
              <th>Amount</th>
            </tr>
          </thead>

          <tbody>
            ${db.expenses.slice().reverse().map((expense) => {
              const vehicle = getById(db.vehicles, expense.vehicleId);

              return `
                <tr>
                  <td>${expense.date}</td>
                  <td>${vehicle ? vehicle.reg : "—"}</td>
                  <td>${expense.type}</td>
                  <td>${expense.liters ? expense.liters + " L" : "—"}</td>
                  <td><b>${money(expense.amount)}</b></td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function expenseForm() {
  modal(`
    <h3>Add Expense</h3>

    <form onsubmit="saveExpense(event)">
      <div class="form-grid">
        <label>
          Vehicle
          <select name="vehicleId">
            ${db.vehicles.map((vehicle) => `
              <option value="${vehicle.id}">${vehicle.reg}</option>
            `).join("")}
          </select>
        </label>

        <label>
          Expense Type
          <select name="type">
            <option>Fuel</option>
            <option>Toll</option>
            <option>Maintenance</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          Date
          <input name="date" type="date" required />
        </label>

        <label>
          Amount ($)
          <input name="amount" type="number" min="0" required />
        </label>

        <label>
          Fuel Volume (Liters)
          <input name="liters" type="number" min="0" step="0.1" value="0" />
        </label>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary">Save Expense</button>
      </div>
    </form>
  `);
}

function saveExpense(event) {
  event.preventDefault();

  const formData = Object.fromEntries(new FormData(event.target));

  db.expenses.push({
    ...formData,
    id: Date.now(),
    vehicleId: Number(formData.vehicleId),
    amount: Number(formData.amount),
    liters: Number(formData.liters)
  });

  saveData();
  closeModal();
  render();
  toast("Expense saved successfully.");
}

/* Reports */

function renderReports() {
  const completedTrips = db.trips.filter(
    (trip) => trip.status === "Completed"
  );

  const totalRevenue = completedTrips.reduce(
    (total, trip) => total + Number(trip.revenue || 0),
    0
  );

  const totalCost = db.expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const acquisitionCost = db.vehicles.reduce(
    (total, vehicle) => total + Number(vehicle.cost),
    0
  );

  const roi = acquisitionCost
    ? (((totalRevenue - totalCost) / acquisitionCost) * 100).toFixed(1)
    : 0;

  return `
    <div class="section-head">
      <div>
        <h3>Performance Summary</h3>
        <p>Fleet operational and financial analysis.</p>
      </div>

      <button class="btn btn-primary" onclick="exportCSV()">
        ⇩ Export CSV
      </button>
    </div>

    <div class="grid-kpi">
      <div class="card kpi">
        <div class="label">TRIP REVENUE</div>
        <div class="value">${money(totalRevenue)}</div>
        <div class="note">${completedTrips.length} completed trip(s)</div>
      </div>

      <div class="card kpi">
        <div class="label">OPERATIONAL COST</div>
        <div class="value">${money(totalCost)}</div>
        <div class="note">Fuel + maintenance + expenses</div>
      </div>

      <div class="card kpi">
        <div class="label">VEHICLE ACQUISITION VALUE</div>
        <div class="value">${money(acquisitionCost)}</div>
        <div class="note">Current registered fleet</div>
      </div>

      <div class="card kpi">
        <div class="label">VEHICLE ROI</div>
        <div class="value">${roi}%</div>
        <div class="note">(Revenue − Cost) / Acquisition Cost</div>
      </div>
    </div>
  `;
}

/* CSV Export */

function exportCSV() {
  const rows = [
    ["Date", "Vehicle", "Type", "Liters", "Amount"]
  ];

  db.expenses.forEach((expense) => {
    const vehicle = getById(db.vehicles, expense.vehicleId);

    rows.push([
      expense.date,
      vehicle ? vehicle.reg : "",
      expense.type,
      expense.liters,
      expense.amount
    ]);
  });

  const csvContent = rows.map((row) => row.join(",")).join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "transitops-expenses.csv";
  link.click();

  URL.revokeObjectURL(link.href);
}

/* Modal / Toast */

function modal(content) {
  document.getElementById("modal").innerHTML = content;
  document.getElementById("modalOverlay").style.display = "grid";
}

function closeModal() {
  document.getElementById("modalOverlay").style.display = "none";
}

function toast(message) {
  const element = document.getElementById("toast");

  element.textContent = message;
  element.style.display = "block";

  setTimeout(() => {
    element.style.display = "none";
  }, 2800);
}

/* Start application */

loadApp();
