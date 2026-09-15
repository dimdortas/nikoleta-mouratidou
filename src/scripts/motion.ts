/**
 * Σύστημα κίνησης — αργό, χαμηλής έντασης.
 * 1. Reveal on scroll (IntersectionObserver)
 * 2. Ήπιο parallax (rAF, μόνο όσο το στοιχείο είναι ορατό)
 * Σέβεται το prefers-reduced-motion.
 */

const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ */
/* Reveal                                                              */
/* ------------------------------------------------------------------ */

function initReveal() {
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal], [data-reveal-text]');
  if (!targets.length) return;

  if (reduced() || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
  );

  targets.forEach((el) => {
    // Στοιχεία που είναι ήδη πάνω από το viewport στο load δεν κρύβονται
    const r = el.getBoundingClientRect();
    if (r.bottom < 0) {
      el.classList.add('is-in');
      return;
    }
    io.observe(el);
  });
}

/* ------------------------------------------------------------------ */
/* Parallax                                                            */
/* ------------------------------------------------------------------ */

function initParallax() {
  if (reduced()) return;

  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (!items.length) return;

  const visible = new Set<HTMLElement>();

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target as HTMLElement);
        else visible.delete(e.target as HTMLElement);
      }
      if (visible.size) request();
    },
    { rootMargin: '20% 0px 20% 0px' },
  );

  items.forEach((el) => io.observe(el));

  let ticking = false;

  function frame() {
    ticking = false;
    const vh = window.innerHeight;

    visible.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax || '0.12');
      const rect = el.getBoundingClientRect();
      // -1 (κάτω από το viewport) → 1 (πάνω)
      const progress = (vh / 2 - (rect.top + rect.height / 2)) / (vh / 2 + rect.height / 2);
      const shift = progress * speed * 100;
      el.style.setProperty('--parallax-y', `${shift.toFixed(2)}px`);
    });
  }

  function request() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(frame);
  }

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request, { passive: true });
  request();
}

/* ------------------------------------------------------------------ */
/* Ομαλή κύλιση για in-page links (με σεβασμό στο header offset)       */
/* ------------------------------------------------------------------ */

function initSmoothScroll() {
  document.addEventListener('click', (ev) => {
    const link = (ev.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;

    const id = link.getAttribute('href');
    if (!id || id === '#') return;

    const target = document.querySelector<HTMLElement>(id);
    if (!target) return;

    ev.preventDefault();

    const top =
      id === '#top'
        ? 0
        : target.getBoundingClientRect().top +
          window.scrollY -
          (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 80) -
          16;

    window.scrollTo({ top, behavior: reduced() ? 'auto' : 'smooth' });

    // Κρατάμε σωστή τη σειρά πλοήγησης με πληκτρολόγιο
    if (id !== '#top') {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }

    history.replaceState(null, '', id === '#top' ? location.pathname : id);
  });
}

/* ------------------------------------------------------------------ */

export function initMotion() {
  document.documentElement.classList.add('js');
  initReveal();
  initParallax();
  initSmoothScroll();
}
