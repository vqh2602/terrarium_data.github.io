import { events, catalog } from './config.js';
import { call, isDemo, requestId } from './bridge.js';
import { fx } from './fx.js';
import { sfx } from './sfx.js';
import { el, createItemArt, itemLabel, resolveItemImage, showModal, closeModals } from './ui.js';
import { createSlotGame } from './games/slot.js';
import { createMatchGame } from './games/match.js';
import { createOxygenGame } from './games/oxygen.js';
import { createLevelGame } from './games/level.js';
import { createDailyGame } from './games/daily.js';
import { createMonthlyGame } from './games/monthly.js';
import { createHarvestGame } from './games/harvest.js';

const rootEl = document.querySelector('[data-event]');
const eventId = rootEl.dataset.event;
const event = events[eventId];
const $ = id => document.getElementById(id);

let state = null;
let assets = {};
let busy = false;
let gameController = null;
const requests = new Map();

fx.init();

// Populate static shell headers
$('title').textContent = event.title;
if ($('subtitle')) $('subtitle').textContent = event.subtitle || event.description;
if ($('modeBadge')) {
  $('modeBadge').textContent = isDemo ? 'MÔ PHỎNG' : 'SỰ KIỆN';
  $('modeBadge').classList.toggle('is-demo', isDemo);
}
if ($('backBtn')) {
  if (!isDemo) {
    $('backBtn').remove();
  } else {
    $('backBtn').hidden = false;
  }
}
if ($('demoReplay')) {
  $('demoReplay').hidden = !isDemo;
  $('demoReplay').onclick = () => {
    sfx.tap();
    location.reload();
  };
}
if ($('demoLink')) {
  const inApp = Boolean(window.webkit?.messageHandlers?.terrariumEventV2);
  $('demoLink').hidden = isDemo || inApp;
}

// Sound button
if ($('soundBtn')) {
  const syncSoundUI = () => {
    $('soundBtn').textContent = sfx.muted ? '🔇' : '🔊';
    $('soundBtn').setAttribute('aria-label', sfx.muted ? 'Bật âm thanh' : 'Tắt âm thanh');
    $('soundBtn').classList.toggle('is-muted', sfx.muted);
  };
  syncSoundUI();
  $('soundBtn').onclick = () => {
    sfx.toggle();
    if (!sfx.muted) sfx.tap();
    syncSoundUI();
  };
}

// Rules modal button
if ($('rulesBtn')) {
  $('rulesBtn').onclick = () => {
    sfx.tap();
    const body = el('div', undefined, 'rules-modal-body');
    body.append(
      el('p', event.description, 'rules-lead'),
      el('p', event.rule, 'rules-detail')
    );
    if (isDemo) {
      body.append(
        el('div', 'Đang chạy chế độ mô phỏng trên trình duyệt: dữ liệu lưu tạm trong RAM và tự reset khi tải lại trang.', 'demo-note')
      );
    }
    showModal({
      title: `Thể lệ · ${event.title}`,
      badge: event.badge,
      bodyNode: body,
      actions: [{ label: 'Đã hiểu', cls: 'btn btn-primary', onClick: () => { sfx.tap(); closeModals(); } }]
    });
  };
}

function setNotice(message, tone = 'info') {
  const n = $('notice');
  if (!n) return;
  n.textContent = message || '';
  n.className = `notice-pill${message ? ' is-visible' : ''} notice-${tone}`;
}

async function runAction(type, payload = {}, success = '') {
  if (busy) return null;
  const key = `${type}:${JSON.stringify(payload)}`;
  if (!requests.has(key)) requests.set(key, requestId());
  busy = true;
  if (!gameController?.isAnimating?.()) render();
  setNotice('Đang đồng bộ…', 'pending');
  try {
    state = await call(type, { eventId, ...payload, requestId: requests.get(key) });
    requests.delete(key);
    setNotice(success, success ? 'success' : 'info');
    return state;
  } catch (error) {
    sfx.error();
    setNotice(error.message || 'Chưa kết nối được. Hãy đồng bộ lại trước khi thử tiếp.', 'error');
    return null;
  } finally {
    busy = false;
    if (!gameController?.isAnimating?.()) render();
  }
}

function openClaimModal(reward) {
  const body = el('div', undefined, 'reward-modal-body');
  const stage = el('div', undefined, 'reward-sunburst');
  const rays = el('div', undefined, 'sunburst-rays');
  const art = createItemArt(reward.rewardId, assets, { size: 'xl' });
  stage.append(rays, art);
  body.append(
    stage,
    el('div', itemLabel(reward.rewardId, assets, reward.quantity ?? event.rewardQuantities?.[reward.rewardId]), 'reward-modal-name')
  );

  showModal({
    title: 'Chúc mừng bạn trúng quà!',
    badge: 'PHẦN THƯỞNG',
    className: 'modal-celebrate',
    bodyNode: body,
    actions: [
      {
        label: 'Nhận vào kho',
        cls: 'btn btn-arcade',
        onClick: async () => {
          sfx.tap();
          closeModals();
          const res = await runAction(
            'claimReward',
            { rewardId: reward.id },
            isDemo ? 'Đã lưu quà vào kho mô phỏng.' : 'Đã lưu phần thưởng.'
          );
          if (res) {
            sfx.claim();
            fx.celebrate();
            const imgSrc = resolveItemImage(reward.rewardId, assets);
            fx.flyToWallet($('play'), $('wallet'), imgSrc);
          }
        }
      },
      {
        label: 'Để sau',
        cls: 'btn btn-ghost',
        onClick: () => { sfx.tap(); closeModals(); }
      }
    ]
  });
}

function ensureGameController() {
  if (gameController) return gameController;
  const ctx = {
    root: $('play'),
    runAction,
    getAssets: () => assets,
    getWalletEl: () => $('wallet'),
    openClaimModal
  };
  switch (eventId) {
    case 'slot': gameController = createSlotGame(ctx); break;
    case 'match': gameController = createMatchGame(ctx); break;
    case 'oxygen': gameController = createOxygenGame(ctx); break;
    case 'level': gameController = createLevelGame(ctx); break;
    case 'daily': gameController = createDailyGame(ctx); break;
    case 'monthly': gameController = createMonthlyGame(ctx); break;
    case 'harvest': gameController = createHarvestGame(ctx); break;
  }
  return gameController;
}

function renderPendingRewards() {
  const boxWrap = $('rewards');
  boxWrap.replaceChildren();
  const pendingList = state?.pending?.filter(x => x.eventId === eventId) || [];
  for (const reward of pendingList) {
    const box = el('div', undefined, 'pending-card');
    const art = createItemArt(reward.rewardId, assets, { size: 'md' });
    const info = el('div', undefined, 'pending-info');
    info.append(
      el('span', 'Quà đang chờ nhận', 'pending-eyebrow'),
      el('strong', itemLabel(reward.rewardId, assets, reward.quantity ?? event.rewardQuantities?.[reward.rewardId]), 'pending-name')
    );
    const btn = el('button', 'Nhận vào kho', 'btn btn-arcade pending-btn');
    btn.type = 'button';
    btn.disabled = busy;
    btn.onclick = async () => {
      sfx.tap();
      const res = await runAction(
        'claimReward',
        { rewardId: reward.id },
        isDemo ? 'Đã lưu quà vào kho mô phỏng.' : 'Đã lưu phần thưởng.'
      );
      if (res) {
        sfx.claim();
        fx.burstElement(box, { count: 28, spread: 8 });
        fx.flyToWallet(art, $('wallet'), resolveItemImage(reward.rewardId, assets));
      }
    };
    box.append(art, info, btn);
    boxWrap.appendChild(box);
  }
}

function openWalletModal(items) {
  const list = el('div', undefined, 'wallet-history-list');
  const ordered = [...items].reverse();
  for (const w of ordered) {
    const row = el('div', undefined, 'wallet-history-row');
    const qty = w.quantity || catalog[w.id]?.quantity || 1;
    const name = w.name || assets[w.id]?.name || catalog[w.id]?.name || w.id;
    const timeText = w.claimedAt || w.time || '';

    const info = el('div', undefined, 'wallet-history-info');
    info.appendChild(el('div', `${name} × ${qty}`, 'wallet-history-name'));
    if (timeText) {
      info.appendChild(el('div', timeText, 'wallet-history-time'));
    }

    row.append(createItemArt(w.id, assets, { size: 'sm' }), info);
    list.appendChild(row);
  }

  showModal({
    title: `Lịch sử nhận quà (${items.length})`,
    badge: isDemo ? 'MÔ PHỎNG' : 'KHO QUÀ',
    bodyNode: list,
    actions: [{ label: 'Đóng', cls: 'btn btn-primary', onClick: () => { sfx.tap(); closeModals(); } }]
  });
}

function renderWallet() {
  const walletEl = $('wallet');
  walletEl.replaceChildren();
  const items = state?.wallet || [];
  if (!items.length) {
    walletEl.classList.remove('has-items');
    walletEl.appendChild(
      el('span', `Kho quà sự kiện${isDemo ? ' (mô phỏng)' : ''}: Chưa có quà nào — hãy chơi để nhận nhé!`, 'wallet-empty')
    );
    return;
  }

  walletEl.classList.add('has-items');
  const recent = [...items].reverse().slice(0, 3);

  walletEl.appendChild(el('span', `Quà gần đây${isDemo ? ' (mô phỏng)' : ''}:`, 'wallet-title'));
  const list = el('div', undefined, 'wallet-chips');
  for (const w of recent) {
    const qty = w.quantity || catalog[w.id]?.quantity || 1;
    const name = w.name || assets[w.id]?.name || catalog[w.id]?.name || w.id;
    const chip = el('div', undefined, 'wallet-chip');
    chip.append(
      createItemArt(w.id, assets, { size: 'xs' }),
      el('span', `${name} × ${qty}`)
    );
    list.appendChild(chip);
  }
  walletEl.appendChild(list);

  const moreBtn = el('button', items.length > 3 ? `Xem thêm (${items.length})` : 'Xem thêm', 'btn btn-ghost btn-sm wallet-more-btn');
  moreBtn.type = 'button';
  moreBtn.onclick = () => {
    sfx.tap();
    openWalletModal(items);
  };
  walletEl.appendChild(moreBtn);
}

function render() {
  if ($('refresh')) $('refresh').disabled = busy;

  if (!state) {
    const play = $('play');
    play.replaceChildren();
    const empty = el('div', undefined, 'auth-gate');
    empty.append(
      el('div', event.icon, 'auth-gate-icon'),
      el('h2', 'Kết nối với Terrarium', 'auth-gate-title'),
      el('p', 'Mở sự kiện từ trong app Terrarium đã đăng nhập để tải tiến độ và nhận quà thật.'),
      (() => {
        const a = el('a', 'Chơi thử bản mô phỏng', 'btn btn-arcade');
        a.href = `${eventId}.html?demo=1`;
        return a;
      })()
    );
    play.appendChild(empty);
    $('rewards').replaceChildren();
    $('wallet').replaceChildren();
    return;
  }

  const ctrl = ensureGameController();
  ctrl.update(state, assets, busy);
  renderPendingRewards();
  renderWallet();
}

async function load() {
  if (busy) return;
  busy = true;
  if ($('refresh')) $('refresh').disabled = true;
  try {
    state = await call('getContext', { eventId });
    const nativeSpecs = state?.eventSpecs?.[eventId];
    if (Array.isArray(nativeSpecs) && nativeSpecs.length) {
      event.rewardIds = nativeSpecs.map(x => x.id);
      event.rewardQuantities = Object.fromEntries(nativeSpecs.map(x => [x.id, x.quantity]));
      const milestones = nativeSpecs.map(x => x.milestone).filter(x => x !== undefined && x !== null);
      if (milestones.length) event.milestones = milestones;
    }
    const extraIds = [
      ...(state?.harvest?.requirements?.map(r => r.plantId) || []),
      ...(state?.harvest?.rewards?.map(r => r.id) || [])
    ];
    assets = await call('resolveAssets', { eventId, itemIds: [...new Set([...event.rewardIds, ...extraIds])] });
    setNotice(isDemo ? 'Sẵn sàng trải nghiệm mô phỏng' : 'Đã đồng bộ với app', 'info');
  } catch (error) {
    setNotice(error.message, 'error');
  } finally {
    busy = false;
    render();
  }
}

if ($('refresh')) {
  $('refresh').onclick = () => {
    sfx.tap();
    load();
  };
}

window.addEventListener('terrariumEventUpdated', load);
await load();
