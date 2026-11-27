import { events } from '../config.js';
import { el, createItemArt, itemLabel, resolveItemImage } from '../ui.js';
import { fx } from '../fx.js';
import { sfx } from '../sfx.js';

export function createOxygenGame({ root, runAction, getAssets, getWalletEl }) {
  let built = false;
  let els = {};
  let displayedVal = 0;

  function build() {
    built = true;
    root.replaceChildren();
    const wrap = el('div', undefined, 'milestone-stage oxygen-stage');

    // Hero Glass Biosphere Tank
    const hero = el('div', undefined, 'bio-hero');
    const tank = el('div', undefined, 'bio-tank');
    tank.innerHTML = `
      <div class="bio-glass">
        <div class="bio-liquid">
          <svg class="bio-wave" viewBox="0 0 240 24" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 12 Q 30 0 60 12 T 120 12 T 180 12 T 240 12 V 24 H 0 Z"/>
          </svg>
        </div>
        <div class="bio-bubbles" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        <div class="bio-shine" aria-hidden="true"></div>
        <div class="bio-readout">
          <span class="bio-o2-tag">O₂ TÍCH LUỸ</span>
          <strong class="bio-counter">0</strong>
          <span class="bio-max">/ ${events.oxygen.milestones.at(-1).toLocaleString('vi-VN')}</span>
        </div>
      </div>
    `;

    const meta = el('div', undefined, 'bio-meta');
    meta.append(
      el('div', 'Hơi thở khu vườn', 'bio-meta-title'),
      el('p', 'Tổng O₂ kiếm được từ việc chăm cây trong sự kiện. Tiêu O₂ không làm giảm tiến độ!', 'bio-meta-desc')
    );
    const barWrap = el('div', undefined, 'energy-bar');
    const barFill = el('div', undefined, 'energy-bar-fill');
    barWrap.appendChild(barFill);
    const barPercent = el('div', '0%', 'energy-bar-label');
    meta.append(barWrap, barPercent);

    hero.append(tank, meta);

    // Milestone list
    const track = el('div', undefined, 'milestone-list');
    const cards = events.oxygen.milestones.map((milestone, i) => {
      const rewardId = events.oxygen.rewardIds[i];
      const card = el('div', undefined, 'milestone-card');
      const node = el('div', `${i + 1}`, 'milestone-node');
      const artHolder = el('div', undefined, 'milestone-art');
      const info = el('div', undefined, 'milestone-info');
      const title = el('div', `${milestone.toLocaleString('vi-VN')} O₂`, 'milestone-target');
      const rewardName = el('div', '', 'milestone-reward');
      const sub = el('div', '', 'milestone-sub');
      const miniBar = el('div', undefined, 'mini-meter');
      const miniFill = el('div', undefined, 'mini-meter-fill');
      miniBar.appendChild(miniFill);
      info.append(title, rewardName, sub, miniBar);

      const actionBtn = el('button', '', 'btn milestone-btn');
      actionBtn.type = 'button';
      actionBtn.onclick = async () => {
        if (actionBtn.disabled) return;
        sfx.tap();
        const res = await runAction('claimReward', { milestone }, 'Đã nhận quà mốc Oxygen!');
        if (res) {
          sfx.claim();
          fx.burstElement(card, { count: 28, spread: 7.5, colors: ['#67e8c2', '#cbfa8a', '#ffdc89'] });
          fx.floatText(actionBtn, 'ĐÃ NHẬN!', 'mint');
          const imgSrc = resolveItemImage(rewardId, getAssets?.());
          fx.flyToWallet(artHolder, getWalletEl?.(), imgSrc);
        }
      };

      card.append(node, artHolder, info, actionBtn);
      track.appendChild(card);
      return { card, node, artHolder, rewardName, sub, miniBar, miniFill, actionBtn, milestone, rewardId };
    });

    wrap.append(hero, track);
    root.appendChild(wrap);

    els = {
      liquid: tank.querySelector('.bio-liquid'),
      counter: tank.querySelector('.bio-counter'),
      barFill,
      barPercent,
      cards
    };
  }

  function animateCounter(target) {
    const start = displayedVal;
    const diff = target - start;
    if (diff === 0) {
      els.counter.textContent = target.toLocaleString('vi-VN');
      return;
    }
    const t0 = performance.now();
    const dur = 560;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - p, 3);
      const cur = Math.round(start + diff * ease);
      displayedVal = cur;
      els.counter.textContent = cur.toLocaleString('vi-VN');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function update(state, assets, busy) {
    if (!built) build();

    const progress = state.oxygenCollected ?? 0;
    const maxVal = events.oxygen.milestones.at(-1);
    const pct = Math.min(100, Math.round((progress / maxVal) * 100));

    animateCounter(progress);
    els.liquid.style.height = `${Math.max(8, Math.min(96, pct))}%`;
    els.barFill.style.width = `${pct}%`;
    els.barPercent.textContent = `${progress.toLocaleString('vi-VN')} / ${maxVal.toLocaleString('vi-VN')} O₂ (${pct}%)`;

    for (const item of els.cards) {
      const claimed = state.claims.includes(`oxygen-${item.milestone}`);
      const ready = !claimed && progress >= item.milestone;
      const ratio = Math.min(100, Math.round((progress / item.milestone) * 100));

      item.card.classList.toggle('is-claimed', claimed);
      item.card.classList.toggle('is-ready', ready);
      item.card.classList.toggle('is-locked', !claimed && !ready);

      item.node.textContent = claimed ? '✓' : ready ? '★' : '🔒';
      item.artHolder.replaceChildren(createItemArt(item.rewardId, assets, { size: 'md' }));
      item.rewardName.textContent = itemLabel(item.rewardId, assets, events.oxygen.rewardQuantities?.[item.rewardId]);

      if (claimed) {
        item.sub.textContent = 'Đã lưu vào kho của bạn';
        item.miniBar.style.display = 'none';
        item.actionBtn.textContent = 'Đã nhận';
        item.actionBtn.className = 'btn btn-claimed milestone-btn';
        item.actionBtn.disabled = true;
      } else if (ready) {
        item.sub.textContent = 'Đủ điều kiện mở khóa!';
        item.miniBar.style.display = 'none';
        item.actionBtn.textContent = 'Nhận quà';
        item.actionBtn.className = 'btn btn-arcade milestone-btn';
        item.actionBtn.disabled = busy;
      } else {
        const left = item.milestone - progress;
        item.sub.textContent = `Còn thiếu ${left.toLocaleString('vi-VN')} O₂`;
        item.miniBar.style.display = 'block';
        item.miniFill.style.width = `${ratio}%`;
        item.actionBtn.textContent = `${ratio}%`;
        item.actionBtn.className = 'btn btn-locked milestone-btn';
        item.actionBtn.disabled = true;
      }
    }
  }

  return { update, isAnimating: () => false };
}
