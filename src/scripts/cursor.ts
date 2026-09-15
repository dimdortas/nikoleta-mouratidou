/**
 * Ο κύκλος που ακολουθεί τον κέρσορα.
 *
 * Ένα rAF loop: ο κύκλος κινείται με lerp (μένει λίγο πίσω), η κουκκίδα
 * ακολουθεί ακριβώς. Μία φορά ανά καρέ ελέγχουμε τι βρίσκεται κάτω από τον
 * κέρσορα, για να αλλάξει χρώμα ανάλογα με την ενότητα και το αν είναι
 * κάτι πατήσιμο.
 */

const EASE = 0.16;

const INTERACTIVE = 'a[href], button, [role="button"], label, summary, [data-disclosure-trigger]';
const TEXT_FIELD = 'input[type="text"], input[type="tel"], input[type="email"], textarea';

export function initCursor() {
  const ring = document.querySelector<HTMLElement>('[data-cursor-ring]');
  if (!ring) return;

  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !window.matchMedia('(pointer: fine)').matches
  ) {
    ring.remove();
    return;
  }

  let px = -100;
  let py = -100; // πραγματική θέση κέρσορα
  let rx = -100;
  let ry = -100; // θέση του κύκλου
  let visible = false;
  let placed = false; // έχει τοποθετηθεί έστω μία φορά
  let raf = 0;

  let surface = '';
  let active = '';

  const frame = () => {
    rx += (px - rx) * EASE;
    ry += (py - ry) * EASE;

    ring.style.setProperty('--cursor-x', `${rx.toFixed(1)}px`);
    ring.style.setProperty('--cursor-y', `${ry.toFixed(1)}px`);
    /* η κουκκίδα διορθώνει τη διαφορά, ώστε να κάθεται ακριβώς στον κέρσορα */
    ring.style.setProperty('--dot-x', `${(px - rx).toFixed(1)}px`);
    ring.style.setProperty('--dot-y', `${(py - ry).toFixed(1)}px`);

    /* ---- τι υπάρχει από κάτω ---- */
    const el = document.elementFromPoint(px, py);

    let nextSurface = '';
    let nextActive = '';

    if (el) {
      if (el.closest('.is-deep')) nextSurface = 'deep';
      else if (el.closest('.is-cream')) nextSurface = 'cream';

      if (el.closest(TEXT_FIELD)) nextActive = 'text';
      else if (el.closest(INTERACTIVE)) nextActive = 'true';
    }

    if (nextSurface !== surface) {
      surface = nextSurface;
      if (surface) ring.dataset.surface = surface;
      else delete ring.dataset.surface;
    }

    if (nextActive !== active) {
      active = nextActive;
      if (active) ring.dataset.active = active;
      else delete ring.dataset.active;
    }

    const settled = Math.abs(px - rx) < 0.2 && Math.abs(py - ry) < 0.2;
    raf = settled ? 0 : requestAnimationFrame(frame);
  };

  const run = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const show = () => {
    if (visible) return;
    visible = true;
    ring.classList.add('is-visible');
  };

  const hide = () => {
    visible = false;
    ring.classList.remove('is-visible');
  };

  window.addEventListener(
    'pointermove',
    (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      px = event.clientX;
      py = event.clientY;

      if (!placed) {
        /* πρώτη τοποθέτηση: χωρίς «πέταγμα» από το -100,-100 */
        rx = px;
        ry = py;
        placed = true;
      }

      /* Κάθε κίνηση τον επαναφέρει: αν κάποιο mouseleave τον έκρυψε
         (π.χ. φεύγοντας από το παράθυρο), δεν μένει ποτέ κρυμμένος. */
      show();
      run();
    },
    { passive: true },
  );

  document.addEventListener('mouseleave', hide, { passive: true });
  document.addEventListener('mouseenter', show, { passive: true });
  window.addEventListener('blur', hide, { passive: true });

  /* Το scroll αλλάζει τι βρίσκεται κάτω από τον κέρσορα */
  window.addEventListener('scroll', run, { passive: true });
}
