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

// Scroll-in animations using IntersectionObserver
(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const elems = Array.from(document.querySelectorAll('.scroll-animate'));
  if (!elems.length) return;

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // allow per-element delay using data-delay (ms) or CSS custom property
        const delay = el.getAttribute('data-delay');
        if (delay) {
          el.style.transitionDelay = `${parseInt(delay, 10)}ms`;
        }
        el.classList.add('in-view');
        obs.unobserve(el);
      }
    });
  }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

  elems.forEach((el) => io.observe(el));
})();

(function () {
  const journey = document.getElementById('founder-journey');
  if (!journey) return;

  const spacer = journey.querySelector('.journey-spacer');
  const spine = journey.querySelector('.journey-spine');
  const nodes = Array.from(journey.querySelectorAll('.journey-node'));

  function alignJourneyNodes() {
    if (window.matchMedia('(max-width: 840px)').matches) {
      // reset any transforms/inline tops on small screens
      nodes.forEach((n) => { n.style.top = ''; n.style.transform = ''; });
      journey.querySelectorAll('.journey-stage').forEach((s) => { s.style.transform = ''; });
      spine.style.top = '';
      spine.style.height = '';
      return;
    }

    // reset inline tops/transforms so measurements reflect natural layout
    nodes.forEach((n) => { n.style.top = ''; });
    journey.querySelectorAll('.journey-stage').forEach((s) => { s.style.transform = ''; });

    const spacerBounds = spacer.getBoundingClientRect();

    // map nodes -> their corresponding stages (may be multiple) and measured center positions
    const mapped = nodes.map((node) => {
      const stages = Array.from(journey.querySelectorAll(`[data-align="${node.dataset.node}"]`));
      const stageBounds = stages.map((s) => s.getBoundingClientRect());
      const centersRel = stageBounds.map((b) => b.top - spacerBounds.top + (b.height / 2));
      const centersAbs = stageBounds.map((b) => b.top + (b.height / 2));
      // average center when multiple stages share the same node
      const centerRel = centersRel.reduce((a, c) => a + c, 0) / centersRel.length;
      const centerAbs = centersAbs.reduce((a, c) => a + c, 0) / centersAbs.length;
      return { node, stages, stageBounds, centersRel, centersAbs, centerRel, centerAbs };
    });

    if (!mapped.length) return;

    const start = mapped[0].centerRel;
    const end = mapped.at(-1).centerRel;
    const count = mapped.length;

    // evenly distribute positions along the spine between first and last centers
    const evenly = mapped.map((_, i) => (count > 1 ? start + (i * (end - start) / (count - 1)) : start));

    // measure a node height (use first node) for centering if needed
    const nodeRect = nodes[0].getBoundingClientRect();

    // apply evenly spaced node tops and gently nudge stages to match
    mapped.forEach((m, i) => {
      const nodeTop = evenly[i];
      m.node.style.top = `${nodeTop}px`;

      const desiredCenterAbs = spacerBounds.top + nodeTop;
      // nudge each stage individually to line up with the shared node
      m.stages.forEach((stage, si) => {
        let delta = desiredCenterAbs - m.centersAbs[si];
        // small visual nudge for left-side node 3 to improve perceived alignment
        const stageRect = stage.getBoundingClientRect();
        const isLeftStage = (stageRect.right < spacerBounds.left + (spacerBounds.width / 2));
        if (stage.dataset && stage.dataset.align === '3' && isLeftStage) {
          delta += 6; // tweak this value if you want stronger/weaker nudge
        }
        stage.style.transform = `translateY(${delta}px)`;
      });
    });

    spine.style.top = `${start}px`;
    spine.style.height = `${end - start}px`;

    // Draw connectors from the spine/node to the stage blocks
    let connectors = spacer.querySelector('.journey-connectors');
    if (!connectors) {
      connectors = document.createElement('div');
      connectors.className = 'journey-connectors';
      spacer.appendChild(connectors);
    }
    connectors.innerHTML = '';

    const nodeCenterX = spacerBounds.left + (spacerBounds.width / 2);
    mapped.forEach((m, i) => {
      const nodeTop = evenly[i];
      // create a connector for each stage sharing this node
      m.stageBounds.forEach((stageBounds, si) => {
        const isRight = (stageBounds.left > spacerBounds.left + spacerBounds.width / 2);
        const stageEdgeX = isRight ? stageBounds.left : stageBounds.right;
        const left = Math.min(nodeCenterX, stageEdgeX) - spacerBounds.left;
        const width = Math.max(6, Math.abs(nodeCenterX - stageEdgeX));

        // compute the stage center after the visual nudge (delta)
        const desiredCenterAbs = spacerBounds.top + nodeTop;
        const delta = desiredCenterAbs - m.centersAbs[si];
        const stageCenterRel = (m.centersAbs[si] + delta) - spacerBounds.top;
        const top = stageCenterRel - 1; // center the 2px connector

        const el = document.createElement('div');
        el.className = 'connector';
        el.style.left = `${left}px`;
        el.style.width = `${width}px`;
        el.style.top = `${top}px`;
        connectors.appendChild(el);
      });
    });
  }

  window.addEventListener('resize', alignJourneyNodes);
  window.addEventListener('load', () => requestAnimationFrame(alignJourneyNodes));
  requestAnimationFrame(alignJourneyNodes);
})();

/* Simple accessible carousel for case studies */
(function () {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const originalSlides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const prev = carousel.querySelector('.carousel-prev');
  const next = carousel.querySelector('.carousel-next');
  // dots may be placed outside the .carousel (below it) — prefer a sibling lookup
  const dotsWrap = carousel.querySelector('.carousel-dots') || carousel.parentElement.querySelector('.carousel-dots');
  let index = 0; // index relative to originalSlides
  let autoplayId = null;

  // helper to parse gap in px
  function getGap() {
    const gap = getComputedStyle(track).gap || getComputedStyle(track).getPropertyValue('gap');
    return gap ? parseFloat(gap) : 0;
  }

  // build clones for infinite scroll
  function buildClones() {
    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);
    firstClone.classList.add('clone');
    lastClone.classList.add('clone');
    track.appendChild(firstClone);
    track.insertBefore(lastClone, track.firstChild);
  }

  buildClones();

  // now query slides including clones
  let slides = Array.from(track.querySelectorAll('.carousel-slide'));

  // set starting translate so that the visual first slide is the real first (index 1 due to prepend)
  function setInitialPosition() {
    index = 0;
    const slideWidth = slides[1].getBoundingClientRect().width;
    const gap = getGap();
    const offset = -((slideWidth + gap) * 1); // start at the first real slide
    track.style.transition = 'none';
    track.style.transform = `translateX(${offset}px)`;
    // force reflow then restore transition
    // eslint-disable-next-line no-unused-expressions
    track.getBoundingClientRect();
    track.style.transition = '';
  }

  function moveTo(k) {
    const slideWidth = slides[1].getBoundingClientRect().width;
    const gap = getGap();
    const targetIndex = k + 1; // account for leading clone
    const offset = -((slideWidth + gap) * targetIndex);
    track.style.transform = `translateX(${offset}px)`;
    // update dots
    Array.from(dotsWrap.children).forEach((b, i) => b.setAttribute('aria-current', i === k ? 'true' : 'false'));
  }

  function createDots() {
    originalSlides.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.title = `Slide ${i + 1}`;
      b.addEventListener('click', () => { index = i; moveTo(index); resetAutoplay(); });
      if (i === 0) b.setAttribute('aria-current', 'true');
      dotsWrap.appendChild(b);
    });
  }

  function prevSlide() { index = (index - 1 + originalSlides.length) % originalSlides.length; moveTo(index); resetAutoplay(); }
  function nextSlide() { index = (index + 1) % originalSlides.length; moveTo(index); resetAutoplay(); }

  // handle wrap-around after transition ends
  track.addEventListener('transitionend', () => {
    // slides are: [clone-last, real-0, real-1, ..., real-N-1, clone-first]
    slides = Array.from(track.querySelectorAll('.carousel-slide'));
    const slideWidth = slides[1].getBoundingClientRect().width;
    const gap = getGap();
    const currentVisualIndex = index + 1; // account for leading clone
    if (currentVisualIndex === 0) return; // safety
    // when we've moved past the last real slide to the clone-first, snap to real-first
    if (currentVisualIndex > originalSlides.length) {
      // jumped to clone-first at end
      const offset = -((slideWidth + gap) * 1);
      track.style.transition = 'none';
      track.style.transform = `translateX(${offset}px)`;
      // force reflow
      // eslint-disable-next-line no-unused-expressions
      track.getBoundingClientRect();
      track.style.transition = '';
    }
    // when we've moved before the first real slide to clone-last, snap to real-last
    if (currentVisualIndex === 0) {
      const offset = -((slideWidth + gap) * originalSlides.length);
      track.style.transition = 'none';
      track.style.transform = `translateX(${offset}px)`;
      // eslint-disable-next-line no-unused-expressions
      track.getBoundingClientRect();
      track.style.transition = '';
    }
  });

  function startAutoplay() {
    if (autoplayId) clearInterval(autoplayId);
    autoplayId = setInterval(() => { nextSlide(); }, 4800);
  }
  function resetAutoplay() { startAutoplay(); }

  createDots();
  prev && prev.addEventListener('click', () => { prevSlide(); });
  next && next.addEventListener('click', () => { nextSlide(); });
  carousel.addEventListener('mouseenter', () => clearInterval(autoplayId));
  carousel.addEventListener('mouseleave', startAutoplay);
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });

  window.addEventListener('resize', () => { setInitialPosition(); });

  // initial layout
  requestAnimationFrame(() => { setInitialPosition(); startAutoplay(); });
})();
