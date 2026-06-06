/**
 * ஆழ்கடலில் ஒரு பயணம் — IARRD Marine Technology Masterclass
 * script.js — Landing page logic, payment gateways, and data sheets.
 */

const BACKEND_URL = "https://theatlantisprotocol.onrender.com/";
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxujEPR387qZMVDqTh7KaNVLKBnH7-YJOp6yXduT1Nx9WarFX092LfbrcmADFaEXKcL/exec";
const ADMIN_PASSWORD = "iarrdadmin2026";

/* ═══════════════════════════════════════
   BIOLUMINESCENT CANVAS SYSTEM
   ═══════════════════════════════════════ */
(function initMarineCanvas() {
  const canvas = document.getElementById("marine-canvas") || document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let particles = [];
  let sonarWaves = [];
  const PARTICLE_COUNT = window.innerWidth < 768 ? 60 : 120;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        speedY: -(Math.random() * 0.2 + 0.05), // float upwards
        speedX: (Math.random() - 0.5) * 0.15,  // slow sway
        alpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? 'rgba(0, 245, 255, ' : 'rgba(139, 92, 246, '
      });
    }
  }

  function emitSonar(x, y) {
    sonarWaves.push({
      x: x || Math.random() * canvas.width,
      y: y || Math.random() * canvas.height,
      radius: 0,
      maxRadius: Math.random() * 120 + 80,
      speed: Math.random() * 0.6 + 0.4,
      alpha: 0.35
    });
  }

  // Periodic sonar emitter (every 5 seconds)
  setInterval(() => {
    if (sonarWaves.length < 5) emitSonar();
  }, 5000);

  // Mouse interactivity for sonar ripples
  window.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON" && e.target.tagName !== "A" && e.target.tagName !== "INPUT" && e.target.tagName !== "SELECT") {
      emitSonar(e.clientX, e.clientY);
    }
  });

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Sonar Waves
    for (let i = sonarWaves.length - 1; i >= 0; i--) {
      const w = sonarWaves[i];
      w.radius += w.speed;
      w.alpha = 0.35 * (1 - (w.radius / w.maxRadius));

      if (w.radius >= w.maxRadius) {
        sonarWaves.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 245, 255, ${w.alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Double ring effect
      if (w.radius > 20) {
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.radius - 20, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(139, 92, 246, ${w.alpha * 0.5})`;
        ctx.stroke();
      }
    }

    // 2. Draw Bioluminescent Particles (Marine Snow)
    for (const p of particles) {
      // Float up
      p.y += p.speedY;
      p.x += p.speedX;

      // Wrap boundaries
      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
      if (p.x < -10 || p.x > canvas.width + 10) {
        p.speedX *= -1;
      }

      // Twinkle calculation
      const twinkle = 0.5 + 0.5 * Math.sin(t * p.twinkleSpeed + p.twinkleOffset);

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + (p.alpha * twinkle) + ')';
      ctx.fill();

      // Glow halo for larger particles
      if (p.r > 1.8) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color + (p.alpha * twinkle * 0.2) + ')';
        ctx.fill();
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  window.addEventListener("resize", () => { resize(); createParticles(); });
  requestAnimationFrame(draw);
})();

/* ═══════════════════════════════════════
   SOUND TOGGLE
   ═══════════════════════════════════════ */
(function initSound() {
  const soundBtn = document.getElementById("ambient-sound-toggle");
  if (!soundBtn) return;

  const audio = new Audio("audio/vinvelil-audio.mpeg");
  audio.loop = true;
  audio.volume = 0.35;
  let playing = false;

  audio.addEventListener("loadedmetadata", () => {
    if (audio.duration > 60) {
      audio.currentTime = 60; // start at 1 minute for ambient loop
    }
  });

  soundBtn.addEventListener("click", () => {
    if (!playing) {
      audio.play().then(() => {
        playing = true;
        soundBtn.innerHTML = "🔊 Sound";
        soundBtn.classList.add("playing");
      }).catch(err => {
        console.warn("Audio blocked by browser policy:", err);
      });
    } else {
      audio.pause();
      playing = false;
      soundBtn.innerHTML = "🔇 Sound";
      soundBtn.classList.remove("playing");
    }
  });
})();

/* ═══════════════════════════════════════
   COUNTDOWN TIMER (Index page)
   ═══════════════════════════════════════ */
(function initCountdown() {
  const cdDays = document.getElementById("cd-days");
  if (!cdDays) return;

  // Masterclass date: July 4, 2026
  const targetTime = new Date("2026-07-04T10:00:00+05:30").getTime();

  function update() {
    const now = Date.now();
    const diff = Math.max(0, targetTime - now);

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
    document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
    document.getElementById('cd-mins').textContent = String(m).padStart(2, '0');
    document.getElementById('cd-secs').textContent = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
})();

/* ═══════════════════════════════════════
   EMBEDDED LANDING REGISTRATION FORM HANDLER
   ═══════════════════════════════════════ */
(function initEmbeddedForm() {
  const submitBtn = document.getElementById("submit-reg-btn");
  if (!submitBtn) return;

  submitBtn.addEventListener("click", async () => {
    const name = document.getElementById("reg-name").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const phone = document.getElementById("reg-phone").value.trim();
    const category = document.getElementById("reg-category").value;
    const org = document.getElementById("reg-org") ? document.getElementById("reg-org").value.trim() : "";
    const privacyCheck = document.getElementById("reg-privacy-agree");

    // Validations
    if (!name) { shake("reg-name"); return; }
    if (!email || !email.includes("@")) { shake("reg-email"); return; }
    if (!phone) { shake("reg-phone"); return; }
    if (document.getElementById("reg-org") && document.getElementById("reg-org").style.display !== "none" && !org) {
      shake("reg-org"); return;
    }

    if (!privacyCheck || !privacyCheck.checked) {
      const consentBox = privacyCheck.closest(".privacy-consent");
      consentBox.style.borderColor = "#ff7f50";
      consentBox.style.boxShadow = "0 0 10px rgba(255, 127, 80, 0.2)";
      setTimeout(() => {
        consentBox.style.borderColor = "";
        consentBox.style.boxShadow = "";
      }, 2000);
      return;
    }

    // Build the submission payload following Google Sheets Columns
    const submission = {
      name: name,
      email: email,
      phone: phone,
      category: category,
      school: category === "school" ? org : "",
      standard: "", // blank for single step
      college: category === "college" ? org : "",
      dept: "",
      year: "",
      company: category === "professional" ? org : "",
      role: "",
      description: category === "enthusiast" ? org : "",
      timestamp: new Date().toISOString()
    };

    const spinner = document.getElementById("submit-spinner");
    const errEl = document.getElementById("submit-error");

    submitBtn.style.display = "none";
    spinner.style.display = "block";
    errEl.style.display = "none";

    // Demo Mode check
    if (GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_SCRIPT_URL") {
      await new Promise(res => setTimeout(res, 1200));
      window.location.href = "success.html";
      return;
    }

    try {
      console.log("📤 Initializing payment system...", submission);

      // STEP 1: CREATE PAYMENT ORDER
      const orderRes = await fetch(`${BACKEND_URL}/api/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!orderRes.ok) {
        const errText = await orderRes.text();
        throw new Error(`Server error ${orderRes.status}: ${errText || "Order creation failed"}`);
      }

      const orderData = await orderRes.json();
      if (!orderData.success || !orderData.order) {
        throw new Error(orderData.message || "Failed to create checkout order.");
      }

      // STEP 2: LAUNCH CHECKOUT WINDOW
      let checkoutOpened = false;

      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "IARRD Marine Academy",
        description: "Masterclass Registration — ஆழ்கடலில் ஒரு பயணம்",
        order_id: orderData.order.id,
        theme: { color: "#00f5ff" },
        prefill: {
          email: email,
          contact: phone,
          name: name
        },

        // Payment verified callback
        handler: async function (response) {
          console.log("✅ Checkout completed successfully.");
          try {
            // STEP 3: VERIFY SIGNATURE
            console.log("🔐 Verifying checkout digital signature...");
            const verifyRes = await fetch(`${BACKEND_URL}/api/payment/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response)
            });

            if (!verifyRes.ok) {
              const errText = await verifyRes.text();
              throw new Error(`Signature verification failed: ${errText}`);
            }

            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
              throw new Error(verifyData.message || "Verification response invalid.");
            }

            // STEP 4: RECORD REGISTRATION TO SPREADSHEET
            console.log("📊 Archiving registration details...");
            try {
              await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify({
                  ...submission,
                  paymentStatus: "PAID",
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpayOrderId: response.razorpay_order_id
                })
              });
            } catch (sheetsErr) {
              console.warn("Sheets response unreadable (cors restriction):", sheetsErr.message);
            }

            await new Promise(res => setTimeout(res, 1200));
            window.location.href = "success.html";

          } catch (err) {
            console.error("❌ Checkout response processing failure:", err);
            spinner.style.display = "none";
            submitBtn.style.display = "block";
            errEl.style.display = "block";
            errEl.textContent = `❌ Error: ${err.message}`;
          }
        },

        modal: {
          ondismiss: function () {
            console.log("⚠️ Checkout interface dismissed by user.");
            if (spinner.style.display === "block") {
              spinner.style.display = "none";
              submitBtn.style.display = "block";
              errEl.style.display = "block";
              errEl.textContent = "Checkout cancelled. Please retry.";
            }
          }
        }
      };

      if (!checkoutOpened) {
        checkoutOpened = true;
        const rpay = new Razorpay(options);
        rpay.open();
      }

    } catch (e) {
      console.error("❌ Submission process failure:", e);
      spinner.style.display = "none";
      submitBtn.style.display = "block";
      errEl.style.display = "block";
      errEl.textContent = `❌ Error: ${e.message}`;
    }
  });

  function shake(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.borderColor = "#ff7f50";
    el.animate([
      { transform: "translateX(0)" },
      { transform: "translateX(-5px)" },
      { transform: "translateX(5px)" },
      { transform: "translateX(0)" }
    ], { duration: 250, easing: "ease" });
    el.focus();
    setTimeout(() => { el.style.borderColor = ""; }, 1500);
  }
})();

/* ═══════════════════════════════════════
   LEGACY MULTI-STEP REGISTRATION FORM (form.html compatibility)
   ═══════════════════════════════════════ */
if (document.querySelector(".page-form")) {
  const formData = {
    category: "", name: "", email: "", phone: "",
    schoolName: "", standard: "", collegeName: "", department: "",
    year: "", company: "", role: "", describe: "", timestamp: "",
  };

  let currentStep = 1;
  const TOTAL = 4;

  const steps = document.querySelectorAll(".form-step");
  const progSteps = document.querySelectorAll(".progress-step");
  const progressFill = document.getElementById("progressFill");

  function showStep(n) {
    steps.forEach(s => s.classList.remove("active"));
    document.getElementById(`step-${n}`).classList.add("active");

    progSteps.forEach((ps, i) => {
      ps.classList.remove("active", "done");
      if (i + 1 === n) ps.classList.add("active");
      if (i + 1 < n) ps.classList.add("done");
    });

    const pct = ((n - 1) / (TOTAL - 1)) * 100;
    if (progressFill) progressFill.style.width = pct + "%";
    currentStep = n;
  }

  function val(id) { return (document.getElementById(id)?.value || "").trim(); }

  const catCards = document.querySelectorAll(".cat-card");
  const next1 = document.getElementById("next-1");

  catCards.forEach(card => {
    card.addEventListener("click", () => {
      catCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      formData.category = card.dataset.cat;
      if (next1) next1.disabled = false;
    });
  });

  if (next1) next1.addEventListener("click", () => showStep(2));

  const next2 = document.getElementById("next-2");
  if (next2) {
    next2.addEventListener("click", () => {
      const name = val("name");
      const email = val("email");
      const phone = val("phone");

      if (!name) { shakeField("name"); return; }
      if (!email || !email.includes("@")) { shakeField("email"); return; }
      if (!phone) { shakeField("phone"); return; }

      formData.name = name;
      formData.email = email;
      formData.phone = phone;

      document.querySelectorAll(".dynamic-fields").forEach(f => f.classList.remove("active"));
      document.getElementById(`fields-${formData.category}`)?.classList.add("active");

      const titles = {
        school: "Your School Details",
        college: "Your College Details",
        professional: "Your Professional Details",
        enthusiast: "About You",
      };
      const titleEl = document.getElementById("step3-title");
      if (titleEl) titleEl.textContent = titles[formData.category] || "Additional Info";

      showStep(3);
    });
  }

  const back2 = document.getElementById("back-2");
  if (back2) back2.addEventListener("click", () => showStep(1));

  const next3 = document.getElementById("next-3");
  if (next3) {
    next3.addEventListener("click", () => {
      const cat = formData.category;

      if (cat === "school") {
        formData.schoolName = val("school-name");
        formData.standard = val("standard");
        if (!formData.schoolName) { shakeField("school-name"); return; }
      } else if (cat === "college") {
        formData.collegeName = val("college-name");
        formData.department = val("department");
        formData.year = val("year");
        if (!formData.collegeName) { shakeField("college-name"); return; }
      } else if (cat === "professional") {
        formData.company = val("company");
        formData.role = val("role");
        if (!formData.company) { shakeField("company"); return; }
      } else if (cat === "enthusiast") {
        formData.describe = val("describe");
      }

      buildReview();
      showStep(4);
    });
  }

  const back3 = document.getElementById("back-3");
  if (back3) back3.addEventListener("click", () => showStep(2));
  
  const back4 = document.getElementById("back-4");
  if (back4) back4.addEventListener("click", () => showStep(3));

  function buildReview() {
    const cat = formData.category;
    const catLabels = {
      school: "School Student", college: "College Student",
      professional: "Working Professional", enthusiast: "Enthusiast"
    };

    let rows = [
      { k: "Category", v: catLabels[cat] || cat },
      { k: "Name", v: formData.name },
      { k: "Email", v: formData.email },
      { k: "Phone", v: formData.phone },
    ];

    if (cat === "school") {
      rows.push({ k: "School", v: formData.schoolName });
      rows.push({ k: "Standard", v: formData.standard });
    } else if (cat === "college") {
      rows.push({ k: "College", v: formData.collegeName });
      rows.push({ k: "Department", v: formData.department });
      rows.push({ k: "Year", v: formData.year });
    } else if (cat === "professional") {
      rows.push({ k: "Company", v: formData.company });
      rows.push({ k: "Role", v: formData.role });
    } else if (cat === "enthusiast") {
      if (formData.describe) rows.push({ k: "Description", v: formData.describe });
    }

    const reviewEl = document.getElementById("review-card");
    if (reviewEl) {
      reviewEl.innerHTML = rows
        .map(r => `<div class="review-row">
          <span class="review-key">${r.k}</span>
          <span class="review-val">${r.v || "—"}</span>
        </div>`).join("");
    }
  }

  const submitBtnLegacy = document.getElementById("submit-btn");
  if (submitBtnLegacy) {
    submitBtnLegacy.addEventListener("click", async () => {
      const privacyCheck = document.getElementById("privacy-agree");
      if (!privacyCheck || !privacyCheck.checked) {
        const consentBox = privacyCheck?.closest(".privacy-consent");
        if (consentBox) {
          consentBox.style.borderColor = "#ff7f50";
          setTimeout(() => { consentBox.style.borderColor = ""; }, 2000);
        }
        return;
      }

      formData.timestamp = new Date().toISOString();

      const spinner = document.getElementById("submit-spinner");
      const errEl = document.getElementById("submit-error");

      submitBtnLegacy.style.display = "none";
      if (spinner) spinner.style.display = "block";
      if (errEl) errEl.style.display = "none";

      if (GOOGLE_SCRIPT_URL === "YOUR_GOOGLE_SCRIPT_URL") {
        await new Promise(res => setTimeout(res, 1200));
        window.location.href = "success.html";
        return;
      }

      try {
        const submission = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          category: formData.category,
          school: formData.category === "school" ? formData.schoolName : "",
          standard: formData.category === "school" ? formData.standard : "",
          college: formData.category === "college" ? formData.collegeName : "",
          dept: formData.category === "college" ? formData.department : "",
          year: formData.category === "college" ? formData.year : "",
          company: formData.category === "professional" ? formData.company : "",
          role: formData.category === "professional" ? formData.role : "",
          description: formData.category === "enthusiast" ? formData.describe : "",
          timestamp: formData.timestamp,
        };

        const orderRes = await fetch(`${BACKEND_URL}/api/payment/create-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });

        if (!orderRes.ok) throw new Error(`Order API status ${orderRes.status}`);
        const orderData = await orderRes.json();
        if (!orderData.success) throw new Error(orderData.message);

        let opened = false;
        const options = {
          key: orderData.key,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "IARRD Marine Academy",
          description: "Masterclass Registration — ஆழ்கடலில் ஒரு பயணம்",
          order_id: orderData.order.id,
          theme: { color: "#00f5ff" },
          prefill: { email: formData.email, contact: formData.phone, name: formData.name },
          handler: async function (response) {
            try {
              const verifyRes = await fetch(`${BACKEND_URL}/api/payment/verify-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response)
              });

              if (!verifyRes.ok) throw new Error("Verification network error");
              const verifyData = await verifyRes.json();
              if (!verifyData.success) throw new Error(verifyData.message);

              try {
                await fetch(GOOGLE_SCRIPT_URL, {
                  method: "POST",
                  mode: "no-cors",
                  headers: { "Content-Type": "text/plain" },
                  body: JSON.stringify({
                    ...submission,
                    paymentStatus: "PAID",
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpayOrderId: response.razorpay_order_id
                  })
                });
              } catch (e) {}

              await new Promise(r => setTimeout(r, 1200));
              window.location.href = "success.html";
            } catch (err) {
              if (spinner) spinner.style.display = "none";
              submitBtnLegacy.style.display = "block";
              if (errEl) {
                errEl.style.display = "block";
                errEl.textContent = `Error: ${err.message}`;
              }
            }
          },
          modal: {
            ondismiss: function () {
              if (spinner) spinner.style.display = "none";
              submitBtnLegacy.style.display = "block";
            }
          }
        };

        if (!opened) {
          opened = true;
          const rpay = new Razorpay(options);
          rpay.open();
        }
      } catch (err) {
        if (spinner) spinner.style.display = "none";
        submitBtnLegacy.style.display = "block";
        if (errEl) {
          errEl.style.display = "block";
          errEl.textContent = `Error: ${err.message}`;
        }
      }
    });
  }

  function shakeField(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.borderColor = "#ff7f50";
    el.animate([
      { transform: "translateX(0)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(4px)" },
      { transform: "translateX(0)" }
    ], { duration: 250 });
    el.focus();
    setTimeout(() => { el.style.borderColor = ""; }, 1500);
  }
}

/* ═══════════════════════════════════════
   ADMIN SCRIPT DASHBOARD
   ═══════════════════════════════════════ */
if (document.querySelector(".page-admin")) {
  const loginEl = document.getElementById("admin-login");
  const dashEl = document.getElementById("admin-dashboard");
  const loginBtn = document.getElementById("admin-login-btn");
  const passInput = document.getElementById("admin-pass");
  const loginError = document.getElementById("login-error");
  const catFilter = document.getElementById("cat-filter");
  const refreshBtn = document.getElementById("refresh-btn");
  const logoutBtn = document.getElementById("admin-logout");

  let allData = [];

  function attemptLogin() {
    if (passInput.value === ADMIN_PASSWORD) {
      loginEl.style.display = "none";
      dashEl.style.display = "block";
      loadData();
    } else {
      loginError.style.display = "block";
      passInput.value = "";
      passInput.focus();
    }
  }

  if (loginBtn) loginBtn.addEventListener("click", attemptLogin);
  if (passInput) passInput.addEventListener("keydown", e => { if (e.key === "Enter") attemptLogin(); });
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      loginEl.style.display = "flex";
      dashEl.style.display = "none";
      passInput.value = "";
    });
  }

  function normalizeRow(r) {
    const m = {};
    for (const k of Object.keys(r)) {
      m[k.toLowerCase().trim()] = String(r[k] || "").trim();
    }

    const name = m["name"] || "";
    const email = m["email"] || "";
    const phone = m["phone"] || "";
    let rawCat = (m["category"] || "").toLowerCase();
    let cat = "";
    if (rawCat === "school") cat = "school";
    else if (rawCat === "college") cat = "college";
    else if (rawCat === "professional") cat = "professional";
    else if (rawCat === "enthusiast") cat = "enthusiast";

    const schoolName = m["school"] || "";
    const standard = m["standard"] || "";
    const collegeName = m["college"] || "";
    const department = m["dept"] || "";
    const year = m["year"] || "";
    const company = m["company"] || "";
    const role = m["role"] || "";
    const describe = m["description"] || "";
    const timestamp = m["timestamp"] || "";

    return {
      _raw: r, name, email, phone, category: cat,
      schoolName, standard, collegeName, department, year,
      company, role, describe, timestamp
    };
  }

  async function loadData() {
    const loading = document.getElementById("admin-loading");
    const table = document.getElementById("admin-table");
    const emptyEl = document.getElementById("admin-empty");
    const fetchErr = document.getElementById("admin-fetch-error");
    const debugBox = document.getElementById("admin-debug");

    if (loading) loading.style.display = "block";
    if (table) table.style.display = "none";
    if (emptyEl) emptyEl.style.display = "none";
    if (fetchErr) fetchErr.style.display = "none";
    if (debugBox) debugBox.style.display = "none";

    try {
      const res = await fetch(`${GOOGLE_SCRIPT_URL}?token=admin123`);
      const json = await res.json();
      const raw = Array.isArray(json) ? json : (json.data || []);

      if (raw.length > 0 && debugBox) {
        const keys = Object.keys(raw[0]);
        debugBox.style.display = "block";
        debugBox.innerHTML = `<strong>📋 Sheet Columns:</strong> <code>${keys.join(", ")}</code>`;
      }

      allData = raw.map(normalizeRow);
      renderTable(allData);
    } catch (e) {
      if (loading) loading.style.display = "none";
      if (fetchErr) fetchErr.style.display = "block";
      console.error("Dashboard Sync Error:", e);
    }
  }

  function renderTable(data) {
    const loading = document.getElementById("admin-loading");
    const table = document.getElementById("admin-table");
    const emptyEl = document.getElementById("admin-empty");
    const tbody = document.getElementById("admin-tbody");

    if (loading) loading.style.display = "none";

    if (!data.length) {
      if (emptyEl) emptyEl.style.display = "block";
      if (table) table.style.display = "none";
      updateStats([]);
      return;
    }

    if (table) table.style.display = "table";
    if (emptyEl) emptyEl.style.display = "none";

    const catLabels = {
      school: "School Student", college: "College Student",
      professional: "Working Professional", enthusiast: "Enthusiast",
    };
    const badgeClass = {
      school: "badge-school", college: "badge-college",
      professional: "badge-professional", enthusiast: "badge-enthusiast",
    };

    if (tbody) {
      tbody.innerHTML = data.map((row, i) => {
        const cat = row.category;
        const det = buildDetailStr(row);
        const time = row.timestamp
          ? new Date(row.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })
          : "—";

        const knownCats = ["school", "college", "professional", "enthusiast"];
        const catDisplay = knownCats.includes(cat)
          ? `<span class="cat-badge ${badgeClass[cat]}">${catLabels[cat]}</span>`
          : `<span class="cat-badge" style="border-color:rgba(255,120,60,.4);color:#ff8844;background:rgba(255,120,60,.08)">⚠ ${esc(cat || "Other")}</span>`;

        return `<tr>
          <td style="color:var(--text-dim)">${i + 1}</td>
          <td><strong>${esc(row.name || "—")}</strong></td>
          <td style="color:var(--text-muted)">${esc(row.email || "—")}</td>
          <td style="color:var(--text-muted)">${esc(row.phone || "—")}</td>
          <td>${catDisplay}</td>
          <td style="color:var(--text-muted);font-size:.8rem">${det}</td>
          <td style="color:var(--text-dim);font-size:.78rem;white-space:nowrap">${time}</td>
        </tr>`;
      }).join("");
    }

    updateStats(data);
  }

  function buildDetailStr(row) {
    const cat = row.category;
    if (cat === "school") {
      return [row.schoolName, row.standard].filter(Boolean).map(esc).join(" · ") || "—";
    }
    if (cat === "college") {
      return [row.collegeName, row.department, row.year].filter(Boolean).map(esc).join(" · ") || "—";
    }
    if (cat === "professional") {
      return [row.company, row.role].filter(Boolean).map(esc).join(" · ") || "—";
    }
    if (cat === "enthusiast") {
      return esc(row.describe ? row.describe.slice(0, 80) + "..." : "—");
    }
    return "—";
  }

  function updateStats(data) {
    const setStat = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setStat("stat-total", data.length);
    setStat("stat-school", data.filter(r => r.category === "school").length);
    setStat("stat-college", data.filter(r => r.category === "college").length);
    setStat("stat-pro", data.filter(r => r.category === "professional").length);
    setStat("stat-enth", data.filter(r => r.category === "enthusiast").length);
  }

  function esc(str) {
    return String(str || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  if (catFilter) {
    catFilter.addEventListener("change", () => {
      const f = catFilter.value;
      const filtered = f === "all" ? allData : allData.filter(r => r.category === f);
      renderTable(filtered);
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      if (catFilter) catFilter.value = "all";
      loadData();
    });
  }
}