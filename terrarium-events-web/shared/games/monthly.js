import { MONTHLY_MILESTONE_DAYS, MONTHLY_REWARD_SPECS } from '../monthlyRewards.js';
import { call, isDemo } from '../bridge.js';
import { el, createItemArt, itemDisplayName, resolveItemImage, showModal, closeModals } from '../ui.js';
import { fx } from '../fx.js';
import { sfx } from '../sfx.js';

const RARITY_LABELS = {
  common: 'Thường',
  uncommon: 'Ít gặp',
  rare: 'Hiếm',
  epic: 'Sử thi',
  legendary: 'Huyền thoại'
};

function formatMonthTitle(monthKey) {
  if (!monthKey || !monthKey.includes('-')) return 'Tháng này';
  const [y, m] = monthKey.split('-');
  return `Tháng ${Number(m)}/${y}`;
}

export function createMonthlyGame({ root, runAction, getAssets, getWalletEl }) {
  let built = false;
  let els = {};
  let currentState = null;

  function build() {
    built = true;
    root.replaceChildren();
    const wrap = el('div', undefined, 'monthly-stage');

    const hud = el('div', undefined, 'stage-hud monthly-hud');
    const monthPill = el('span', '', 'hud-pill');
    const progressPill = el('span', '', 'hud-pill hud-pill--accent');
    hud.append(monthPill, progressPill);

    const vipBanner = el('button', undefined, 'monthly-vip-banner');
    vipBanner.type = 'button';
    vipBanner.onclick = handleVipAction;

    const legend = el('div', undefined, 'monthly-rarity-legend');
    for (const key of ['oxygen', 'fertilizer', 'shovel', 'gemstone', 'ticket']) {
      const spec = MONTHLY_REWARD_SPECS[key];
      const chip = el('span', undefined, `rarity-chip rarity-chip--${spec.rarity}`);
      chip.append(
        el('span', spec.rarityLabel, 'rarity-chip-tier'),
        el('span', `· ${itemDisplayName(spec.id)}`)
      );
      legend.appendChild(chip);
    }

    const grid = el('div', undefined, 'monthly-grid');

    const cta = el('button', undefined, 'btn btn-arcade daily-cta');
    cta.type = 'button';
    cta.innerHTML = '<span class="btn-shine"></span><span class="btn-label">ĐIỂM DANH THÁNG</span>';
    cta.onclick = () => triggerCheckIn(null);

    const tzNote = el(
      'p',
      'Mỗi tháng làm mới ngẫu nhiên 30 phần thưởng theo độ quý hiếm (Asia/Ho_Chi_Minh). Thành viên VIP tự động nhận ×2 số lượng mỗi ngày.',
      'daily-note'
    );

    wrap.append(hud, vipBanner, legend, grid, cta, tzNote);
    root.appendChild(wrap);

    els = { monthPill, progressPill, vipBanner, grid, cta, cards: [] };
  }

  async function handleVipAction() {
    sfx.tap();
    if (!isDemo && window.webkit?.messageHandlers?.terrariumEventV2) {
      try {
        await call('openVIP', { eventId: 'monthly' });
        return;
      } catch {
        // Fallback modal below if native doesn't support openVIP
      }
    }
    const body = el('div', undefined, 'rules-modal-body');
    body.append(
      el('p', 'Nâng cấp gói Terrarium VIP (Tháng / Năm) để nhận trọn bộ đặc quyền:', 'rules-lead'),
      el('p', '• Nhân đôi (×2) toàn bộ 30 phần thưởng điểm danh tháng.\n• Mở khóa ngay tất cả Âm nhạc & SFX thiên nhiên không cần trồng cây.\n• Mở khóa toàn bộ Phong cảnh & Hiệu ứng rơi.\n• Tăng +50% Oxygen mỗi lần chăm cây + gói quà chào mừng.', 'rules-detail')
    );
    showModal({
      title: 'Đặc quyền Terrarium VIP',
      badge: 'VIP CLUB',
      bodyNode: body,
      actions: [
        ...(isDemo
          ? [{
              label: currentState?.isVIP ? 'Tắt VIP (Mô phỏng)' : 'Bật thử VIP ×2 (Mô phỏng)',
              cls: 'btn btn-arcade',
              onClick: async () => {
                sfx.tap();
                closeModals();
                await runAction('toggleDemoVIP', {}, currentState?.isVIP ? 'Đã tắt mô phỏng VIP.' : 'Đã bật mô phỏng VIP ×2!');
              }
            }]
          : []),
        { label: 'Đóng', cls: 'btn btn-ghost', onClick: () => { sfx.tap(); closeModals(); } }
      ]
    });
  }

  async function triggerCheckIn(clickedIndex) {
    if (els.cta.disabled || !currentState) return;
    const day = currentState.monthlyDay ?? 0;
    const checkedToday = Boolean(currentState.monthlyCheckedToday);
    if (clickedIndex !== null && (clickedIndex !== day || checkedToday)) return;

    sfx.tap();
    const reward = (currentState.monthlyRewards || [])[day];
    const res = await runAction('monthlyCheckIn', {}, 'Điểm danh 30 ngày thành công!');
    if (res) {
      const cardObj = els.cards[day];
      sfx.stamp();
      if (cardObj) {
        cardObj.stamp.classList.remove('is-stamping');
        void cardObj.stamp.offsetWidth;
        cardObj.stamp.classList.add('is-stamping');
        const isMilestone = MONTHLY_MILESTONE_DAYS.has(day + 1);
        fx.burstElement(cardObj.card, { count: isMilestone ? 42 : 24, spread: 8 });
        fx.floatText(cardObj.card, `NGÀY ${day + 1} ✓`, 'gold');
        const imgSrc = resolveItemImage(reward?.rewardId, getAssets?.());
        fx.flyToWallet(cardObj.artWrap, getWalletEl?.(), imgSrc);
      }
      if (day === 29 || MONTHLY_MILESTONE_DAYS.has(day + 1)) {
        sfx.win();
        fx.celebrate();
      }
    }
  }

  function renderCards(rewards, day, checkedToday, isVIP, assets, busy) {
    els.grid.replaceChildren();
    els.cards = [];

    for (let i = 0; i < rewards.length; i++) {
      const item = rewards[i];
      const dayNum = item.day || i + 1;
      const isGrand = dayNum === 30;
      const isMilestone = MONTHLY_MILESTONE_DAYS.has(dayNum);
      const done = i < day;
      const today = i === day && !checkedToday;
      const upcoming = !done && !today;
      const rarity = item.rarity || 'common';
      const baseQty = Number(item.quantity || 1);
      const effectiveQty = isVIP ? baseQty * 2 : baseQty;

      const card = el(
        'button',
        undefined,
        `day-card monthly-card rarity-border--${rarity}${isMilestone ? ' monthly-card--milestone' : ''}${isGrand ? ' day-card--grand monthly-card--grand' : ''}${done ? ' is-done' : ''}${today ? ' is-today' : ''}${upcoming ? ' is-upcoming' : ''}`
      );
      card.type = 'button';
      card.disabled = busy || !today;
      card.onclick = () => triggerCheckIn(i);

      const top = el('div', undefined, 'day-card-top');
      top.append(
        el('span', isGrand ? 'Ngày 30 · Đại lễ' : `Ngày ${dayNum}`, 'day-label'),
        el('span', done ? 'Xong' : today ? 'HÔM NAY' : (RARITY_LABELS[rarity] || 'Quà'), 'day-tag')
      );

      const artWrap = el('div', undefined, 'day-art');
      artWrap.appendChild(createItemArt(item.rewardId, assets, { size: isGrand ? 'lg' : 'sm' }));

      const infoWrap = el('div', undefined, 'monthly-card-info');
      const nameEl = el('div', `${itemDisplayName(item.rewardId, assets)} × ${effectiveQty.toLocaleString('vi-VN')}`, 'day-reward');
      infoWrap.appendChild(nameEl);

      if (isVIP) {
        infoWrap.appendChild(el('span', `VIP ×2 (gốc ${baseQty.toLocaleString('vi-VN')})`, 'monthly-vip-tag'));
      } else if (isMilestone) {
        infoWrap.appendChild(el('span', 'Mốc đặc biệt', 'monthly-milestone-tag'));
      }

      const stamp = el('div', 'ĐÃ NHẬN ✓', 'day-stamp');

      card.append(top, artWrap, infoWrap, stamp);
      els.grid.appendChild(card);
      els.cards.push({ card, artWrap, stamp, index: i });
    }
  }

  function update(state, assets, busy) {
    if (!built) build();
    currentState = state;

    const rewards = Array.isArray(state.monthlyRewards) ? state.monthlyRewards : [];
    const day = state.monthlyDay ?? 0;
    const checkedToday = Boolean(state.monthlyCheckedToday);
    const isVIP = Boolean(state.isVIP);
    const monthKey = state.monthlyMonthKey || '';

    els.monthPill.textContent = `${formatMonthTitle(monthKey)} · 30 ngày ngẫu nhiên`;
    els.progressPill.textContent = day >= 30
      ? 'Hoàn thành 30/30 ngày!'
      : checkedToday
        ? `Đã nhận ${day}/30`
        : `Hôm nay: Ngày ${day + 1}/30`;

    els.vipBanner.replaceChildren();
    els.vipBanner.classList.toggle('is-active', isVIP);
    if (isVIP) {
      els.vipBanner.append(
        el('span', '👑 TERRARIUM VIP · ĐANG NHÂN ĐÔI (×2) QUÀ ĐIỂM DANH', 'vip-banner-title'),
        el('span', 'Toàn bộ âm nhạc & hiệu ứng đã mở khóa', 'vip-banner-sub')
      );
    } else {
      els.vipBanner.append(
        el('span', '👑 Nâng cấp VIP để nhận ×2 toàn bộ quà tháng này', 'vip-banner-title'),
        el('span', isDemo ? 'Chạm để xem đặc quyền & thử VIP ×2 →' : 'Mở khóa thêm toàn bộ âm thanh & hiệu ứng →', 'vip-banner-sub')
      );
    }

    renderCards(rewards, day, checkedToday, isVIP, assets, busy);

    const canClaim = !checkedToday && day < 30;
    els.cta.disabled = busy || !canClaim;
    els.cta.querySelector('.btn-label').textContent = day >= 30
      ? 'HOÀN THÀNH THÁNG 30/30 NGÀY ✓'
      : checkedToday
        ? `ĐÃ ĐIỂM DANH NGÀY ${day}/30 · HẸN NGÀY MAI ✓`
        : `ĐIỂM DANH NGÀY ${day + 1}/30${isVIP ? ' (VIP ×2)' : ''}`;
  }

  return { update, isAnimating: () => false };
}
