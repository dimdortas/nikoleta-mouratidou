/**
 * Header: γίνεται διακριτικά πιο ορισμένο στο scroll,
 * κρύβεται όταν ο χρήστης κατεβαίνει, επανέρχεται όταν ανεβαίνει,
 * και συγχρονίζει το ενεργό link με την ορατή ενότητα.
 */

export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  /* ---------- κατάσταση scroll ---------- */
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;

    header.classList.toggle('is-stuck', y > 24);

    const menuOpen = header.classList.contains('is-open');
    if (!menuOpen) {
      const goingDown = y > lastY && y > 320;
      header.classList.toggle('is-hidden', goingDown);
    }

    lastY = y;
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(onScroll);
    },
    { passive: true },
  );
  onScroll();

  /* ---------- mobile menu ---------- */
  const toggle = header.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = header.querySelector<HTMLElement>('[data-menu-panel]');

  if (toggle && panel) {
    const setOpen = (open: boolean) => {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.documentElement.style.overflow = open ? 'hidden' : '';
      if (open) header.classList.remove('is-hidden');
    };

    toggle.addEventListener('click', () => {
      setOpen(!header.classList.contains('is-open'));
    });

    panel.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    const mq = window.matchMedia('(min-width: 1100px)');
    mq.addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* ---------- ενεργό link ---------- */
  const links = Array.from(header.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));
  const sections = links
    .map((l) => {
      const id = l.getAttribute('href');
      return id && id !== '#top' ? document.querySelector<HTMLElement>(id) : null;
    })
    .filter(Boolean) as HTMLElement[];

  if (!sections.length || !('IntersectionObserver' in window)) return;

  const setActive = (id: string | null) => {
    links.forEach((l) => {
      const match = l.getAttribute('href') === id;
      l.classList.toggle('is-active', match);
      if (match) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
  };

  const io = new IntersectionObserver(
    (entries) => {
      const seen = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (seen[0]) setActive('#' + seen[0].target.id);
      else if (window.scrollY < 200) setActive('#top');
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.2, 0.5] },
  );

  sections.forEach((s) => io.observe(s));
}
