import './style.css';
import { STATES, VIEWBOX, type UsState } from './states';
import { CONFIG } from './config';

const SVG_NS = 'http://www.w3.org/2000/svg';

const svg = document.querySelector<SVGSVGElement>('#us-map')!;
const tooltip = document.querySelector<HTMLDivElement>('#tooltip')!;
const select = document.querySelector<HTMLSelectElement>('#state-select')!;
const refreshBtn = document.querySelector<HTMLButtonElement>('#refresh')!;
const navToggle = document.querySelector<HTMLButtonElement>('.nav__toggle')!;
const navLinks = document.querySelector<HTMLElement>('#nav-links')!;

let highlighted = new Set(CONFIG.highlighted);

function goTo(state: UsState): void {
  const url = CONFIG.jobsUrl(state.code, state.name);
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
  for (const s of STATES) select.add(new Option(s.name, s.code));
  select.addEventListener('change', () => {
    const state = STATES.find((s) => s.code === select.value);
    if (state) goTo(state);
  });
}

/* ---------- Demo: refresh highlights ---------- */
refreshBtn.addEventListener('click', () => {
  const pool = [...CONFIG.highlightPool].sort(() => Math.random() - 0.5);
  highlighted = new Set(pool.slice(0, 5 + Math.floor(Math.random() * 4)));
  paintHighlights();
});

/* ---------- Mobile nav ---------- */
navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!open));
  navToggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
  navLinks.classList.toggle('is-open', !open);
});

renderMap();
renderSelect();
