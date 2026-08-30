// Simple in-memory "state" for demo
const state = {
  isLoggedIn: false,
  farmerName: "Ramesh Kumar",
  selectedCentre: "",
  bookedSlot: null, // { date, time }
  queueNumber: null,
  procurementStatus: "Pending", // Pending, Completed, Rejected
  paymentStatus: "Not Initiated" // Not Initiated, Initiated, Credited
};

const app = document.getElementById("app");

// Render functions for each screen
function renderLogin() {
  app.innerHTML = `
    <h2>Login</h2>
    <div class="form-group">
      <label>Mobile Number</label>
      <input type="tel" id="mobile" placeholder="9876543210" />
      <div id="mobileError" class="error"></div>
    </div>
    <div class="form-group">
      <label>OTP (demo: any 4 digits)</label>
      <input type="text" id="otp" placeholder="1234" maxlength="4" />
      <div id="otpError" class="error"></div>
    </div>
    <button id="loginBtn">Login</button>
    <p class="small" style="margin-top:0.75rem;">
      Demo: Use any mobile number and any 4-digit OTP.
    </p>
  `;

  document.getElementById("loginBtn").addEventListener("click", () => {
    const mobile = document.getElementById("mobile").value.trim();
    const otp = document.getElementById("otp").value.trim();
    const mobileError = document.getElementById("mobileError");
    const otpError = document.getElementById("otpError");

    mobileError.textContent = "";
    otpError.textContent = "";

    if (!/^\d{10}$/.test(mobile)) {
      mobileError.textContent = "Enter a valid 10-digit mobile number.";
      return;
    }
    if (!/^\d{4}$/.test(otp)) {
      otpError.textContent = "Enter a 4-digit OTP.";
      return;
    }

    state.isLoggedIn = true;
    renderDashboard();
  });
}

function renderDashboard() {
  if (!state.isLoggedIn) return renderLogin();

  app.innerHTML = `
    <div class="nav-top">
      <strong>Farmer Dashboard</strong>
      <button id="logoutBtn">Logout</button>
    </div>
    <p>Welcome, ${state.farmerName}!</p>

    <div class="card">
      <strong>Next Steps</strong>
      <ol style="margin-left:1.2rem; margin-top:0.4rem;">
        <li>Select Procurement Centre</li>
        <li>Check Available Slots</li>
        <li>Book Slot</li>
        <li>Check My Queue Status</li>
        <li>View Procurement Status</li>
        <li>Track Payment Status</li>
      </ol>
    </div>

    <button id="selectCentreBtn" style="margin-top:0.5rem;">
      Select Procurement Centre
    </button>
  `;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    state.isLoggedIn = false;
    state.selectedCentre = "";
    state.bookedSlot = null;
    renderLogin();
  });

  document.getElementById("selectCentreBtn").addEventListener("click", () => {
    renderSelectCentre();
  });
}

function renderSelectCentre() {
  if (!state.isLoggedIn) return renderLogin();

  app.innerHTML = `
    <div class="nav-top">
      <strong>Select Procurement Centre</strong>
      <button id="backToDash1">Back</button>
    </div>

    <div class="form-group">
      <label>District</label>
      <select id="district">
        <option value="">-- Select District --</option>
        <option value="Alwar">Alwar</option>
        <option value="Jaipur">Jaipur</option>
        <option value="Bharatpur">Bharatpur</option>
      </select>
    </div>

    <div class="form-group">
      <label>Procurement Centre</label>
      <select id="centre" disabled>
        <option value="">-- Select District First --</option>
      </select>
    </div>

    <button id="confirmCentreBtn">Continue to Slots</button>
  `;

  const districtSel = document.getElementById("district");
  const centreSel = document.getElementById("centre");
  const centresByDistrict = {
    Alwar: ["Alwar Mandi", "Ramgarh Centre", "Thanagazi Centre"],
    Jaipur: ["Jaipur Main Mandi", "Sanganer Centre", "Chomu Centre"],
    Bharatpur: ["Bharatpur Mandi", "Nagar Centre", "Weir Centre"]
  };

  districtSel.addEventListener("change", () => {
    const dist = districtSel.value;
    centreSel.innerHTML = '<option value="">-- Select Centre --</option>';
    if (!dist) {
      centreSel.disabled = true;
      return;
    }
    const centres = centresByDistrict[dist] || [];
    centres.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      centreSel.appendChild(opt);
    });
    centreSel.disabled = false;
  });

  document.getElementById("backToDash1").addEventListener("click", renderDashboard);

  document.getElementById("confirmCentreBtn").addEventListener("click", () => {
    const centre = centreSel.value;
    if (!centre) {
      alert("Please select a procurement centre.");
      return;
    }
    state.selectedCentre = centre;
    renderAvailableSlots();
  });
}

function renderAvailableSlots() {
  if (!state.isLoggedIn) return renderLogin();

  app.innerHTML = `
    <div class="nav-top">
      <strong>Available Slots – ${state.selectedCentre}</strong>
      <button id="backToDash2">Back</button>
    </div>

    <p class="small" style="margin-bottom:0.75rem;">
      Choose a date and time slot for procurement.
    </p>

    <div class="form-group">
      <label>Date</label>
      <input type="date" id="slotDate" />
    </div>

    <div class="form-group">
      <label>Time Slot</label>
      <select id="slotTime">
        <option value="">-- Select Time --</option>
        <option value="08:00-09:00">08:00 – 09:00</option>
        <option value="09:00-10:00">09:00 – 10:00</option>
        <option value="10:00-11:00">10:00 – 11:00</option>
        <option value="11:00-12:00">11:00 – 12:00</option>
        <option value="14:00-15:00">14:00 – 15:00</option>
        <option value="15:00-16:00">15:00 – 16:00</option>
      </select>
    </div>

    <button id="bookSlotBtn">Book Slot</button>
  `;

  // Set min date to today
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("slotDate").setAttribute("min", today);

  document.getElementById("backToDash2").addEventListener("click", renderDashboard);

  document.getElementById("bookSlotBtn").addEventListener("click", () => {
    const date = document.getElementById("slotDate").value;
    const time = document.getElementById("slotTime").value;
    if (!date || !time) {
      alert("Please select both date and time slot.");
      return;
    }
    state.bookedSlot = { date, time };
    // Simulate queue number generation
    state.queueNumber = Math.floor(100 + Math.random() * 900);
    state.procurementStatus = "Pending";
    state.paymentStatus = "Not Initiated";
    renderMyQueueStatus();
  });
}

function renderMyQueueStatus() {
  if (!state.isLoggedIn) return renderLogin();

  const statusClass =
    state.procurementStatus === "Completed"
      ? "status-done"
      : state.procurementStatus === "In Process"
      ? "status-processing"
      : "status-pending";

  app.innerHTML = `
    <div class="nav-top">
      <strong>My Queue Status</strong>
      <button id="backToDash3">Back</button>
    </div>

    <div class="card">
      <strong>Booking Details</strong>
      <div class="small">
        Centre: ${state.selectedCentre}<br />
        Date: ${state.bookedSlot?.date || "-"}<br />
        Time: ${state.bookedSlot?.time || "-"}<br />
        Queue Number: <strong>${state.queueNumber ?? "-"}</strong>
      </div>
    </div>

    <div class="card">
      <strong>Current Status</strong>
      <div class="small">
        Queue Status: 
        <span class="status-badge ${statusClass}">
          ${state.procurementStatus}
        </span>
      </div>
      <div class="small" style="margin-top:0.4rem;">
        Estimated Turn: Around your booked slot time.
      </div>
    </div>

    <button id="viewProcurementBtn" style="margin-top:0.5rem;">
      View Procurement Status
    </button>
  `;

  document.getElementById("backToDash3").addEventListener("click", renderDashboard);
  document.getElementById("viewProcurementBtn").addEventListener("click", renderProcurementStatus);
}

function renderProcurementStatus() {
  if (!state.isLoggedIn) return renderLogin();

  const procStatusClass =
    state.procurementStatus === "Completed"
      ? "status-done"
      : state.procurementStatus === "In Process"
      ? "status-processing"
      : "status-pending";

  app.innerHTML = `
    <div class="nav-top">
      <strong>Procurement Status</strong>
      <button id="backToDash4">Back</button>
    </div>

    <div class="card">
      <strong>Procurement Details</strong>
      <div class="small">
        Centre: ${state.selectedCentre}<br />
        Date: ${state.bookedSlot?.date || "-"}<br />
        Status: 
        <span class="status-badge ${procStatusClass}">
          ${state.procurementStatus}
        </span>
      </div>
    </div>

    <div class="card">
      <strong>Crop Details (Demo)</strong>
      <div class="small">
        Crop: Paddy<br />
        Expected Quantity: 1000 kg<br />
        Grade: Common (demo)
      </div>
    </div>

    <button id="simulateCompleteBtn" style="margin-top:0.5rem;">
      Simulate: Mark Procurement as Completed
    </button>

    <button id="viewPaymentBtn" style="margin-top:0.5rem; background:#2563eb;">
      View Payment Status
    </button>
  `;

  document.getElementById("backToDash4").addEventListener("click", renderDashboard);

  document.getElementById("simulateCompleteBtn").addEventListener("click", () => {
    state.procurementStatus = "Completed";
    state.paymentStatus = "Initiated";
    alert("Procurement marked as Completed. Payment initiated.");
    renderProcurementStatus();
  });

  document.getElementById("viewPaymentBtn").addEventListener("click", renderPaymentStatus);
}

function renderPaymentStatus() {
  if (!state.isLoggedIn) return renderLogin();

  const payStatusClass =
    state.paymentStatus === "Credited"
      ? "status-done"
      : state.paymentStatus === "Initiated"
      ? "status-processing"
      : "status-pending";

  app.innerHTML = `
    <div class="nav-top">
      <strong>Payment Status</strong>
      <button id="backToDash5">Back</button>
    </div>

    <div class="card">
      <strong>Payment Details</strong>
      <div class="small">
        Centre: ${state.selectedCentre}<br />
        Procurement Status: ${state.procurementStatus}<br />
        Payment Status: 
        <span class="status-badge ${payStatusClass}">
          ${state.paymentStatus}
        </span>
      </div>
    </div>

    <div class="card">
      <strong>Bank Details (Demo)</strong>
      <div class="small">
        Account: XXXX XXXX 4321<br />
        Bank: State Bank of India<br />
        IFSC: SBIN0001234
      </div>
    </div>

    <button id="simulateCreditBtn" style="margin-top:0.5rem; background:#059669;">
      Simulate: Mark Payment as Credited
    </button>
  `;

  document.getElementById("backToDash5").addEventListener("click", renderDashboard);

  document.getElementById("simulateCreditBtn").addEventListener("click", () => {
    state.paymentStatus = "Credited";
    alert("Payment marked as Credited.");
    renderPaymentStatus();
  });
}

// Initial render
renderLogin();
