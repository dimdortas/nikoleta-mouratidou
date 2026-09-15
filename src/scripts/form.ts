/**
 * Φόρμα αιτήματος ραντεβού.
 *
 * Αν υπάρχει endpoint (data-endpoint) → κανονική POST υποβολή (JSON).
 * Αν δεν υπάρχει → ανοίγει το email client με προσυμπληρωμένο μήνυμα,
 * ώστε η φόρμα να είναι λειτουργική από την πρώτη μέρα.
 */

type Messages = {
  success: string;
  successMailto: string;
  error: string;
  submit: string;
  submitting: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function showError(field: HTMLElement, message: string | null) {
  const wrap = field.closest<HTMLElement>('[data-field]');
  if (!wrap) return;
  const msg = wrap.querySelector<HTMLElement>('[data-field-error]');
  wrap.classList.toggle('has-error', Boolean(message));
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (msg) msg.textContent = message ?? '';
}

export function initForm() {
  const formEl = document.querySelector<HTMLFormElement>('[data-appointment-form]');
  if (!formEl) return;

  const status = formEl.querySelector<HTMLElement>('[data-form-status]');
  const submitBtn = formEl.querySelector<HTMLButtonElement>('[type="submit"]');
  const submitLabel = submitBtn?.querySelector<HTMLElement>('.btn__label');
  const messages: Messages = JSON.parse(formEl.dataset.messages || '{}');
  const errors = JSON.parse(formEl.dataset.errors || '{}');
  const endpoint = formEl.dataset.endpoint || '';
  const mailto = formEl.dataset.mailto || '';

  const get = (name: string) =>
    formEl.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`);

  const validate = (): boolean => {
    let ok = true;

    const name = get('name');
    const phone = get('phone');
    const email = get('email');
    const consent = formEl.querySelector<HTMLInputElement>('[name="consent"]');

    if (name) {
      const bad = name.value.trim().length < 2;
      showError(name, bad ? errors.name : null);
      if (bad) ok = false;
    }
    if (phone) {
      const bad = phone.value.replace(/\D/g, '').length < 8;
      showError(phone, bad ? errors.phone : null);
      if (bad) ok = false;
    }
    if (email) {
      const bad = !EMAIL_RE.test(email.value.trim());
      showError(email, bad ? errors.email : null);
      if (bad) ok = false;
    }
    if (consent) {
      const bad = !consent.checked;
      showError(consent, bad ? errors.consent : null);
      if (bad) ok = false;
    }

    if (!ok) {
      const first = formEl.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
    }
    return ok;
  };

  // Καθάρισμα σφάλματος μόλις ο χρήστης διορθώσει
  formEl.addEventListener('input', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-field].has-error')) showError(t as HTMLElement, null);
  });

  const setBusy = (busy: boolean) => {
    if (!submitBtn || !submitLabel) return;
    submitBtn.disabled = busy;
    submitLabel.textContent = busy ? messages.submitting : messages.submit;
  };

  const say = (text: string, tone: 'ok' | 'bad') => {
    if (!status) return;
    status.textContent = text;
    status.dataset.tone = tone;
    status.hidden = false;
  };

  formEl.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (status) status.hidden = true;
    if (!validate()) return;

    const data = Object.fromEntries(new FormData(formEl).entries()) as Record<string, string>;

    if (!endpoint) {
      const subject = `Αίτημα ραντεβού — ${data.name ?? ''}`;
      const body = [
        `Ονοματεπώνυμο: ${data.name ?? ''}`,
        `Τηλέφωνο: ${data.phone ?? ''}`,
        `Email: ${data.email ?? ''}`,
        `Τρόπος συνεδρίας: ${data.mode ?? ''}`,
        '',
        'Μήνυμα:',
        data.message || '—',
      ].join('\n');

      window.location.href = `${mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      say(messages.successMailto, 'ok');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(String(res.status));
      formEl.reset();
      say(messages.success, 'ok');
    } catch {
      say(messages.error, 'bad');
    } finally {
      setBusy(false);
    }
  });
}
