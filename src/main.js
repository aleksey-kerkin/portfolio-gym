// Мобильное меню
const burger = document.querySelector('.header__burger');
const nav = document.getElementById('nav');
const setMenu = (open) => {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  nav.classList.toggle('nav--open', open);
};
burger.addEventListener('click', () =>
  setMenu(burger.getAttribute('aria-expanded') !== 'true'),
);
nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setMenu(false);
});

// Табы услуг (WAI-ARIA tabs, стрелки на клавиатуре)
document.querySelectorAll('[data-tabs]').forEach((root) => {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('tabs__tab--active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      const next = tabs[(i + d + tabs.length) % tabs.length];
      next.focus();
      select(next);
    });
  });
});

// Форма записи в 4 шага
const form = document.getElementById('join-form');
const steps = [...form.querySelectorAll('[data-step]')];
const indicators = [...document.querySelectorAll('[data-step-indicator]')];
const backBtn = form.querySelector('[data-back]');
const nextBtn = form.querySelector('[data-next]');
const success = form.querySelector('.form__success');
const VOUCHERS = { GYM10: 0.1 };
const rub = (n) => new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽';
let current = 0;

const err = (name, msg = '') => {
  form.querySelector(`[data-error="${name}"]`).textContent = msg;
};

const validators = [
  () =>
    form.package.value ? true : (err('package', 'Выберите абонемент'), false),
  () =>
    form.payment.value
      ? true
      : (err('payment', 'Выберите способ оплаты'), false),
  () => {
    const v = form.voucher.value.trim().toUpperCase();
    if (v && !(v in VOUCHERS)) {
      err(
        'voucher',
        'Промокод не найден. Оставьте поле пустым или введите другой.',
      );
      form.voucher.setAttribute('aria-invalid', 'true');
      return false;
    }
    form.voucher.removeAttribute('aria-invalid');
    return true;
  },
  () =>
    form.terms.checked
      ? true
      : (err('terms', 'Нужно согласиться с условиями'), false),
];

const updateBill = () => {
  const pkg = form.querySelector('input[name="package"]:checked');
  if (!pkg) return;
  const price = Number(pkg.dataset.price);
  const rate = VOUCHERS[form.voucher.value.trim().toUpperCase()] || 0;
  form.querySelector('[data-bill="name"]').textContent = pkg.dataset.name;
  form.querySelector('[data-bill="price"]').textContent = rub(price);
  form.querySelector('[data-bill="discount-row"]').hidden = !rate;
  form.querySelector('[data-bill="discount"]').textContent =
    '−' + rub(price * rate);
  form.querySelector('[data-bill="total"]').textContent = rub(
    price * (1 - rate),
  );
};

const show = (i) => {
  current = i;
  steps.forEach((s, k) => (s.hidden = k !== i));
  indicators.forEach((el, k) => {
    el.classList.toggle('steps__item--active', k === i);
    el.classList.toggle('steps__item--done', k < i);
    if (k === i) el.setAttribute('aria-current', 'step');
    else el.removeAttribute('aria-current');
  });
  backBtn.hidden = i === 0;
  nextBtn.textContent = i === steps.length - 1 ? 'Оформить подписку' : 'Далее';
  if (i === steps.length - 1) updateBill();
  steps[i]
    .querySelector('legend')
    .scrollIntoView({ block: 'nearest', behavior: 'smooth' });
};

form.addEventListener('change', (e) => {
  if (e.target.name) err(e.target.name);
});
form.addEventListener('input', (e) => {
  if (e.target.name === 'voucher') err('voucher');
});
backBtn.addEventListener('click', () => show(current - 1));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  success.textContent = '';
  if (!validators[current]()) {
    const first = steps[current].querySelector('input');
    first && first.focus();
    return;
  }
  if (current < steps.length - 1) return show(current + 1);
  const pkg = form.querySelector('input[name="package"]:checked');
  success.textContent = `Готово! ${pkg.dataset.name} оформлен. Мы отправим подтверждение на почту.`;
});

show(0);
