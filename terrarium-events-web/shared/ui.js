import { catalog } from './config.js';

export function el(tag, text, cls) {
  const n = document.createElement(tag);
  if (text !== undefined && text !== null) n.textContent = text;
  if (cls) n.className = cls;
  return n;
}

export function svgIcon(type) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 64 64');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('svg-art');

  if (type === 'empty-leaf') {
    svg.innerHTML = `
      <circle cx="32" cy="32" r="24" fill="#d9e8d3" opacity="0.55"/>
      <path d="M44 18C28 19 19 29 19 42c13 0 23-9 25-24z" fill="#89a88b"/>
      <path d="M20 42c6-7 13-13 22-18" stroke="#5c7d60" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M18 44l-4 4" stroke="#7d6447" stroke-width="3" stroke-linecap="round"/>
    `;
  } else if (type === 'card-leaf') {
    svg.innerHTML = `
      <path d="M32 10c11 6 17 16 17 27 0 9-7 16-17 17-10-1-17-8-17-17 0-11 6-21 17-27z" fill="url(#leafGrad)"/>
      <path d="M32 16v35M32 28l-8-5M32 36l9-5" stroke="#184d3a" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.65"/>
      <defs>
        <linearGradient id="leafGrad" x1="16" y1="10" x2="48" y2="54" gradientUnits="userSpaceOnUse">
          <stop stop-color="#cbfa8a"/>
          <stop offset="1" stop-color="#58b982"/>
        </linearGradient>
      </defs>
    `;
  } else if (type === 'gift') {
    svg.innerHTML = `
      <rect x="12" y="26" width="40" height="26" rx="6" fill="#ffdc89"/>
      <rect x="10" y="19" width="44" height="10" rx="4" fill="#ffe9ad"/>
      <rect x="28" y="19" width="8" height="33" fill="#e86f52"/>
      <path d="M32 19c-5-8-14-7-14-1 0 4 6 5 14 1zm0 0c5-8 14-7 14-1 0 4-6 5-14 1z" fill="#e86f52"/>
    `;
  } else if (type === 'seven') {
    svg.innerHTML = `
      <rect x="8" y="8" width="48" height="48" rx="14" fill="#174c3a" stroke="#ffdc89" stroke-width="2.5"/>
      <path d="M21 20h23L28 47" stroke="#ffdc89" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    `;
  }
  return svg;
}

export function resolveItemImage(id, assets = {}, basePrefix = '../') {
  const remote = assets[id]?.image;
  if (remote && /^(data:image\/(png|jpeg|webp);base64,|https:\/\/)/.test(remote)) {
    return remote;
  }
  const local = catalog[id]?.localImage;
  if (local) return `${basePrefix}${local}`;
  return null;
}

export function itemDisplayName(id, assets = {}) {
  return assets[id]?.name || catalog[id]?.name || String(id || 'Quà bí ẩn');
}

export function itemLabel(id, assets = {}, quantityOverride = null) {
  const qty = quantityOverride ?? catalog[id]?.quantity ?? 1;
  return `${itemDisplayName(id, assets)} × ${qty}`;
}

export function createItemArt(id, assets = {}, { size = 'md', basePrefix = '../' } = {}) {
  const rarity = catalog[id]?.rarity || 'common';
  const wrap = el('span', undefined, `item-art item-art--${size} rarity--${rarity}`);

  if (id === null) {
    wrap.classList.add('item-art--empty');
    wrap.appendChild(svgIcon('empty-leaf'));
    return wrap;
  }
  if (id === '7') {
    wrap.appendChild(svgIcon('seven'));
    return wrap;
  }

  const src = resolveItemImage(id, assets, basePrefix);
  if (src) {
    const img = el('img');
    img.src = src;
    img.alt = itemDisplayName(id, assets);
    img.loading = 'eager';
    img.onerror = () => {
      wrap.replaceChildren(svgIcon('gift'));
    };
    wrap.appendChild(img);
  } else {
    wrap.appendChild(svgIcon('gift'));
  }
  return wrap;
}

export function showModal({ title, badge, bodyNode, actions = [], className = '' }) {
  closeModals();
  const backdrop = el('div', undefined, `modal-backdrop ${className}`);
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');

  const card = el('div', undefined, 'modal-card');
  if (badge) card.appendChild(el('div', badge, 'modal-badge'));
  if (title) card.appendChild(el('h2', title, 'modal-title'));
  if (bodyNode) card.appendChild(bodyNode);

  const footer = el('div', undefined, 'modal-actions');
  for (const act of actions) {
    const b = el('button', act.label, act.cls || 'btn btn-primary');
    b.disabled = Boolean(act.disabled);
    b.onclick = () => act.onClick?.(backdrop);
    footer.appendChild(b);
  }
  card.appendChild(footer);
  backdrop.appendChild(card);

  const onKey = e => {
    if (e.key === 'Escape') closeModals();
  };
  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) closeModals();
  });
  backdrop._cleanup = () => document.removeEventListener('keydown', onKey);
  document.addEventListener('keydown', onKey);
  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('is-visible'));
  return backdrop;
}

export function closeModals() {
  for (const m of document.querySelectorAll('.modal-backdrop')) {
    m._cleanup?.();
    m.remove();
  }
}
