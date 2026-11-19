import './style.css';
import { STATES, VIEWBOX, type UsState } from './states';
import { CONFIG } from './config';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Everything is looked up inside the banner, so it can live on any page without clashing.
const root: ParentNode = document.querySelector('.usmb') ?? document;
const svg = root.querySelector<SVGSVGElement>('.usmb-map')!;
const tooltip = root.querySelector<HTMLDivElement>('.tooltip')!;
const select = root.querySelector<HTMLSelectElement>('.state-picker select');
const navToggle = root.querySelector<HTMLButtonElement>('.nav__toggle');
const navLinks = root.querySelector<HTMLElement>('.nav__links');

const highlighted = new Set(CONFIG.highlighted);

function goTo(state: UsState): void {
  const url = CONFIG.jobsUrl(state.code, state.name);
  if (DEMO) return demoToast(url);
  if (CONFIG.openInNewTab) window.open(url, '_blank', 'noopener');
  else window.location.href = url;
}

/* ---------- Map ---------- */
function renderMap(): void {
  svg.setAttribute('viewBox', VIEWBOX);

  for (const state of STATES) {
    const link = document.createElementNS(SVG_NS, 'a');
    link.setAttribute('href', CONFIG.jobsUrl(state.code, state.name));
    if (CONFIG.openInNewTab) link.setAttribute('target', '_blank');
    link.setAttribute('aria-label', `${state.name} — view jobs`);
    link.dataset.code = state.code;
    link.classList.add('state');

    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', state.d);
    link.append(path);

    link.addEventListener('pointerenter', () => showTooltip(state));
    link.addEventListener('pointermove', (e) => moveTooltip(e));
    link.addEventListener('pointerleave', hideTooltip);
    link.addEventListener('focus', () => showTooltip(state, true));
    link.addEventListener('blur', hideTooltip);

    svg.append(link);
  }
  paintHighlights();
}

function paintHighlights(): void {
  svg.querySelectorAll<SVGAElement>('.state').forEach((el) => {
    el.classList.toggle('state--hl', highlighted.has(el.dataset.code!));
  });
}

/* ---------- Tooltip ---------- */
function showTooltip(state: UsState, anchorToState = false): void {
  tooltip.textContent = `${state.name} · View jobs →`;
  tooltip.hidden = false;
  if (anchorToState) {
    // keyboard focus: place tooltip over the state's centroid
    const [, , w, h] = VIEWBOX.split(' ').map(Number);
    const box = svg.getBoundingClientRect();
    const fig = svg.parentElement!.getBoundingClientRect();
    tooltip.style.left = `${box.left - fig.left + (state.cx / w) * box.width}px`;
    tooltip.style.top = `${box.top - fig.top + (state.cy / h) * box.height}px`;
  }
}

function moveTooltip(e: PointerEvent): void {
  const fig = svg.parentElement!.getBoundingClientRect();
  tooltip.style.left = `${e.clientX - fig.left}px`;
  tooltip.style.top = `${e.clientY - fig.top}px`;
}

function hideTooltip(): void {
  tooltip.hidden = true;
}

/* ---------- Select fallback (small states are hard to tap on phones) ---------- */
function renderSelect(): void {
  if (!select) return;
  for (const s of STATES) select.add(new Option(s.name, s.code));
  select.addEventListener('change', () => {
    const state = STATES.find((s) => s.code === select.value);
    if (state) goTo(state);
  });
}

/* ---------- Mobile nav ---------- */
navToggle?.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!open));
  navToggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
  navLinks?.classList.toggle('is-open', !open);
});

/* ---------- Demo mode: no job board behind GitHub Pages, so show the target instead of a 404 ---------- */
const DEMO = location.hostname.endsWith('github.io');
let toastTimer = 0;
function demoToast(url: string): void {
  let t = document.querySelector<HTMLDivElement>('#demo-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'demo-toast';
    t.setAttribute('role', 'status');
    t.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:10;max-width:calc(100vw - 32px);padding:12px 18px;border-radius:8px;background:#fff;color:#10254f;font:600 14px/1.4 var(--font);box-shadow:0 8px 24px rgba(0,0,0,.3)';
    document.body.append(t);
  }
  t.textContent = `Demo: on the live job board this opens ${url}`;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => (t!.hidden = true), 3500);
}
if (DEMO) {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest('a.state, .hero__actions a.btn--primary');
    if (!a) return;
    e.preventDefault();
    demoToast(a.getAttribute('href')!);
  });
}

renderMap();
renderSelect();
