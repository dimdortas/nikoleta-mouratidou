/**
 * Ήπια αντίδραση της σύνθεσης του hero στον κέρσορα.
 *
 *  · Κάθε τροχιά/γραμμή κινείται ελαφρά ΠΡΟΣ τον κέρσορα, ανάλογα με το
 *    `data-pull` της (τα μικρά στοιχεία κινούνται πιο πολύ — δίνει βάθος).
 *  · Όσο ο κέρσορας πλησιάζει το σήμα, οι τρεις κύκλοι μαζεύονται προς το
 *    κοινό τους κέντρο και η τομή τους μεγαλώνει — «ενώνονται».
 *
 * Όλα περνούν από CSS variables, οπότε η διάταξη και τα breakpoints
 * παραμένουν αποκλειστικά στο CSS. Χωρίς ποντίκι ή με
 * prefers-reduced-motion δεν τρέχει τίποτα.
 */

const AMP = 30; // μέγιστη μετατόπιση σε px (× data-pull)
const EASE = 0.07; // πόσο «μαλακά» ακολουθεί

const clamp = (n: number, min = -1, max = 1) => Math.min(max, Math.max(min, n));

export function initHeroArt() {
  const field = document.querySelector<HTMLElement>('[data-hero-art]');
  const hero = field?.parentElement;
  if (!field || !hero) return;

  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !window.matchMedia('(pointer: fine)').matches
  ) {
    return;
  }

  const items = Array.from(field.querySelectorAll<HTMLElement>('[data-pull]')).map((el) => ({
    el,
    pull: parseFloat(el.dataset.pull || '0.3'),
  }));

  const mark = field.querySelector<SVGElement>('[data-converge]');
  if (!items.length && !mark) return;

  /* στόχοι → τρέχουσες τιμές */
  let tx = 0;
  let ty = 0;
  let tc = 0;
  let cx = 0;
  let cy = 0;
  let cc = 0;
  let raf = 0;

  const paint = () => {
    raf = 0;

    cx += (tx - cx) * EASE;
    cy += (ty - cy) * EASE;
    cc += (tc - cc) * EASE;

    for (const { el, pull } of items) {
      el.style.setProperty('--px', `${(cx * pull * AMP).toFixed(2)}px`);
      el.style.setProperty('--py', `${(cy * pull * AMP).toFixed(2)}px`);
    }

    mark?.style.setProperty('--cv', cc.toFixed(3));

    const settled =
      Math.abs(tx - cx) < 0.0015 && Math.abs(ty - cy) < 0.0015 && Math.abs(tc - cc) < 0.0015;

    if (!settled) raf = requestAnimationFrame(paint);
  };

  const run = () => {
    if (!raf) raf = requestAnimationFrame(paint);
  };

  const onMove = (event: PointerEvent) => {
    const rect = hero.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    tx = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1);
    ty = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1);

    if (mark) {
      const m = mark.getBoundingClientRect();
      const distance = Math.hypot(
        event.clientX - (m.left + m.width / 2),
        event.clientY - (m.top + m.height / 2),
      );
      // 1 πάνω στο σήμα → 0 σε απόσταση μιας διαμέτρου
      tc = clamp(1 - distance / (m.width || 1), 0, 1);
    }

    run();
  };

  const release = () => {
    tx = 0;
    ty = 0;
    tc = 0;
    run();
  };

  hero.addEventListener('pointermove', onMove, { passive: true });
  hero.addEventListener('pointerleave', release, { passive: true });
  document.addEventListener('mouseleave', release, { passive: true });
  window.addEventListener('blur', release, { passive: true });
}
