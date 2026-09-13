const button = document.querySelector('.menuBtn');
const menu = document.querySelector('.mobileMenu');
function setMenu(open) {
  button.classList.toggle('open', open);
  menu.classList.toggle('open', open);
  menu.inert = !open;
  button.setAttribute('aria-expanded', String(open));
  button.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  document.body.style.overflow = open ? 'hidden' : '';
}
button.addEventListener('click', () => setMenu(button.getAttribute('aria-expanded') !== 'true'));
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', event => {
  if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { setMenu(false); button.focus(); }
});
matchMedia('(min-width:761px)').addEventListener('change', event => { if (event.matches) setMenu(false); });
if (!matchMedia('(prefers-reduced-motion:reduce)').matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: 0.08 });
  document.documentElement.classList.add('motion');
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
document.querySelectorAll('[data-offer]').forEach(link => link.addEventListener('click', () => {
  document.querySelector('#offer').value = link.dataset.offer;
}));
const form = document.querySelector('#contactForm');
const message = document.querySelector('#formMsg');
let sending = false;
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending || !form.reportValidity()) return;
  const endpoint = window.YASSKY_CONFIG?.formEndpoint;
  if (!endpoint) { message.dataset.state = 'error'; message.textContent = 'L’envoi est momentanément indisponible. Votre message reste dans le formulaire.'; return; }
  sending = true;
  const submit = form.querySelector('[type=submit]');
  submit.disabled = true;
  submit.textContent = 'Envoi en cours…';
  message.dataset.state = '';
  message.textContent = '';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const values = Object.fromEntries(new FormData(form));
    const response = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...values, _subject: 'YASSKY STUDIO — Nouvelle demande de devis', _template: 'table' }),
      signal: controller.signal
    });
    const result = await response.json();
    if (!response.ok || (result.success !== true && result.success !== 'true')) throw new Error('Delivery failed');
    message.dataset.state = 'success';
    message.textContent = 'Votre demande a été transmise au service d’envoi. Merci pour votre confiance.';
    form.reset();
  } catch {
    message.dataset.state = 'error';
    message.textContent = 'L’envoi n’a pas pu être confirmé. Vos informations sont conservées : réessayez ou écrivez à yassin45mtr@gmail.com.';
  } finally {
    clearTimeout(timeout); sending = false; submit.disabled = false; submit.textContent = 'Demander mon devis ↗';
  }
});
