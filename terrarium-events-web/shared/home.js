import { events } from './config.js';
import { fx } from './fx.js';
import { el, createItemArt } from './ui.js';

fx.init();

const grid = document.querySelector('#events');
for (const [id, event] of Object.entries(events)) {
  const card = el('a', undefined, `lobby-card theme-${event.theme}`);
  card.href = `events/${id}.html?demo=1`;

  const top = el('div', undefined, 'lobby-card-top');
  top.append(
    el('span', event.icon, 'lobby-icon'),
    el('span', event.badge, 'lobby-badge')
  );

  const title = el('h2', event.title, 'lobby-title');
  const desc = el('p', event.description, 'lobby-desc');

  const preview = el('div', undefined, 'lobby-preview');
  const uniqueRewards = [...new Set(event.rewardIds)];
  for (const rId of uniqueRewards) {
    preview.appendChild(createItemArt(rId, {}, { size: 'xs', basePrefix: '' }));
  }
  preview.appendChild(el('span', 'Chơi ngay →', 'lobby-cta'));

  card.append(top, title, desc, preview);
  grid.appendChild(card);
}
