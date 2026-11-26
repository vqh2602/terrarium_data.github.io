import { events } from '../config.js';
import { el, createItemArt, itemLabel, resolveItemImage } from '../ui.js';
import { fx } from '../fx.js';
import { sfx } from '../sfx.js';

export function createDailyGame({ root, runAction, getAssets, getWalletEl }) {
  let built = false;
  let els = {};

  function build() {
    built = true;
    root.replaceChildren();
    const wrap = el('div', undefined, 'daily-stage');

    const hud = el('div', undefined, 'stage-hud');
    const streakPips = el('div', undefined, 'streak-pips');
    const pips = Array.from({ length: 7 }, (_, i) => {
      const p = el('span', `${i + 1}`, 'streak-pip');
      streakPips.appendChild(p);
      return p;
    });
    const hudPill = el('span', '', 'hud-pill');
    hud.append(streakPips, hudPill);

    const grid = el('div', undefined, 'daily-grid');
    const cards = events.daily.rewardIds.map((rewardId, i) => {
      const isGrand = i === 6;
      const card = el('button', undefined, `day-card${isGrand ? ' day-card--grand' : ''}`);
      card.type = 'button';

      const top = el('div', undefined, 'day-card-top');
      top.append(
        el('span', isGrand ? 'Ngày 7 · Đặc biệt' : `Ngày ${i + 1}`, 'day-label'),
        el('span', '', 'day-tag')
      );

      const artWrap = el('div', undefined, 'day-art');
      const nameEl = el('div', '', 'day-reward');
      const stamp = el('div', 'ĐÃ NHẬN ✓', 'day-stamp');

      card.append(top, artWrap, nameEl, stamp);
      card.onclick = () => triggerCheckIn(i);
      grid.appendChild(card);

      return { card, tag: top.querySelector('.day-tag'), artWrap, nameEl, stamp, rewardId, index: i };
    });

    const cta = el('button', undefined, 'btn btn-arcade daily-cta');
    cta.type = 'button';
    cta.innerHTML = '<span class="btn-shine"></span><span class="btn-label">ĐIỂM DANH NHẬN QUÀ</span>';
    cta.onclick = () => triggerCheckIn(null);

    const tzNote = el('p', 'Ngày mới tính theo 00:00 (Asia/Ho_Chi_Minh). Bỏ ngày không mất tiến độ.', 'daily-note');

    wrap.append(hud, grid, cta, tzNote);
    root.appendChild(wrap);

    els = { pips, hudPill, cards, cta };
  }

  let currentDay = 0;
  let currentChecked = false;

  async function triggerCheckIn(clickedIndex) {
    if (els.cta.disabled) return;
    if (clickedIndex !== null && (clickedIndex !== currentDay || currentChecked)) return;

    sfx.tap();
    const dayBefore = currentDay;
    const rewardId = events.daily.rewardIds[dayBefore];
    const res = await runAction('checkIn', {}, 'Điểm danh thành công!');

    if (res) {
      const cardObj = els.cards[dayBefore];
      sfx.stamp();
      if (cardObj) {
        cardObj.stamp.classList.remove('is-stamping');
        void cardObj.stamp.offsetWidth;
        cardObj.stamp.classList.add('is-stamping');
        fx.burstElement(cardObj.card, { count: dayBefore === 6 ? 40 : 24, spread: 8 });
        fx.floatText(cardObj.card, `NGÀY ${dayBefore + 1} ✓`, 'gold');
        const imgSrc = resolveItemImage(rewardId, getAssets?.());
        fx.flyToWallet(cardObj.artWrap, getWalletEl?.(), imgSrc);
      }
      if (dayBefore === 6) {
        sfx.win();
        fx.celebrate();
      }
    }
  }

  function update(state, assets, busy) {
    if (!built) build();

    const day = state.day ?? 0;
    const checkedToday = Boolean(state.checkedToday);
    currentDay = day;
    currentChecked = checkedToday;

    els.pips.forEach((p, i) => {
      p.classList.toggle('is-done', i < day);
      p.classList.toggle('is-today', i === day && !checkedToday);
    });

    els.hudPill.textContent = day >= 7
      ? 'Hoàn thành 7/7 ngày!'
      : checkedToday
        ? `Đã nhận ${day}/7 ngày`
        : `Sẵn sàng Ngày ${day + 1}/7`;

    els.cards.forEach(item => {
      const i = item.index;
      const done = i < day;
      const today = i === day && !checkedToday;
      const upcoming = !done && !today;

      item.card.classList.toggle('is-done', done);
      item.card.classList.toggle('is-today', today);
      item.card.classList.toggle('is-upcoming', upcoming);
      item.card.disabled = busy || !today;

      item.tag.textContent = done ? 'Xong' : today ? 'HÔM NAY' : 'Sắp tới';
      item.artWrap.replaceChildren(createItemArt(item.rewardId, assets, { size: i === 6 ? 'lg' : 'md' }));
      item.nameEl.textContent = itemLabel(item.rewardId, assets);
    });

    const canClaim = !checkedToday && day < 7;
    els.cta.disabled = busy || !canClaim;
    els.cta.querySelector('.btn-label').textContent = day >= 7
      ? 'HOÀN THÀNH CHUỖI 7 NGÀY ✓'
      : checkedToday
        ? 'HẸN BẠN NGÀY MAI ✓'
        : `ĐIỂM DANH NGÀY ${day + 1}`;
  }

  return { update, isAnimating: () => false };
}
