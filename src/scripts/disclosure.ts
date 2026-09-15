/**
 * Ανοιγόμενες ενότητες (υπηρεσίες + συχνές ερωτήσεις).
 * Δουλεύει με πραγματικά <button aria-expanded> + region,
 * ώστε να παραμένει προσβάσιμο. Χωρίς JS όλα είναι ανοιχτά.
 */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function collapse(panel: HTMLElement) {
  panel.style.height = panel.scrollHeight + 'px';
  requestAnimationFrame(() => {
    panel.style.height = '0px';
    panel.style.opacity = '0';
  });
}

function expand(panel: HTMLElement) {
  panel.style.height = panel.scrollHeight + 'px';
  panel.style.opacity = '1';
  const done = () => {
    panel.style.height = 'auto';
    panel.removeEventListener('transitionend', done);
  };
  panel.addEventListener('transitionend', done);
}

export function initDisclosures() {
  const groups = document.querySelectorAll<HTMLElement>('[data-disclosure-group]');

  groups.forEach((group) => {
    const exclusive = group.dataset.disclosureGroup === 'exclusive';
    const items = Array.from(group.querySelectorAll<HTMLElement>('[data-disclosure]'));

    items.forEach((item, i) => {
      const trigger = item.querySelector<HTMLButtonElement>('[data-disclosure-trigger]');
      const panel = item.querySelector<HTMLElement>('[data-disclosure-panel]');
      if (!trigger || !panel) return;

      const openByDefault = exclusive && i === 0;

      panel.style.overflow = 'hidden';
      panel.style.transition = reduced()
        ? 'none'
        : 'height var(--dur-md) var(--ease-out-soft), opacity var(--dur-md) var(--ease-out-soft)';

      if (!openByDefault) {
        panel.style.height = '0px';
        panel.style.opacity = '0';
        panel.hidden = false;
      } else {
        panel.style.height = 'auto';
        panel.style.opacity = '1';
      }

      trigger.setAttribute('aria-expanded', String(openByDefault));
      item.classList.toggle('is-open', openByDefault);

      trigger.addEventListener('click', () => {
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';

        if (isOpen && exclusive) return; // πάντα ένα ανοιχτό

        if (!isOpen && exclusive) {
          items.forEach((other) => {
            if (other === item) return;
            const t = other.querySelector<HTMLButtonElement>('[data-disclosure-trigger]');
            const p = other.querySelector<HTMLElement>('[data-disclosure-panel]');
            if (t?.getAttribute('aria-expanded') === 'true' && p) {
              t.setAttribute('aria-expanded', 'false');
              other.classList.remove('is-open');
              collapse(p);
            }
          });
        }

        trigger.setAttribute('aria-expanded', String(!isOpen));
        item.classList.toggle('is-open', !isOpen);
        if (isOpen) collapse(panel);
        else expand(panel);
      });
    });

    // Επαναϋπολογισμός στο resize για τα ανοιχτά panels
    let t: number | undefined;
    window.addEventListener('resize', () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        items.forEach((item) => {
          const panel = item.querySelector<HTMLElement>('[data-disclosure-panel]');
          if (panel && item.classList.contains('is-open')) panel.style.height = 'auto';
        });
      }, 160);
    });
  });
}
