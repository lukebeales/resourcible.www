// Simple lead capture: posts to Formspree (or any form-endpoint service).
// Replace FORM_ENDPOINT with your real endpoint (e.g. https://formspree.io/f/xxxxxxx).
const FORM_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";

document.getElementById("year").textContent = new Date().getFullYear();

async function submitLead(form, statusEl) {
  const data = new FormData(form);

  if (FORM_ENDPOINT.includes("YOUR_FORM_ID")) {
    if (statusEl) {
      statusEl.textContent = "Form endpoint not configured yet: see README.";
      statusEl.className = "form-status error";
    }
    return;
  }

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      form.reset();
      if (statusEl) {
        statusEl.textContent = "Thanks! We'll be in touch.";
        statusEl.className = "form-status success";
      }
    } else {
      throw new Error("Request failed");
    }
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = "Something went wrong. Please try again.";
      statusEl.className = "form-status error";
    }
  }
}

const heroForm = document.getElementById("hero-form");
heroForm.addEventListener("submit", (e) => {
  e.preventDefault();
  submitLead(heroForm, null);
  heroForm.reset();
});

const mainForm = document.getElementById("main-form");
const statusEl = document.getElementById("form-status");
mainForm.addEventListener("submit", (e) => {
  e.preventDefault();
  submitLead(mainForm, statusEl);
});
