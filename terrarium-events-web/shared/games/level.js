import { events } from '../config.js';
import { el, createItemArt, itemLabel, resolveItemImage } from '../ui.js';
import { fx } from '../fx.js';
import { sfx } from '../sfx.js';

export function createLevelGame({ root, runAction, getAssets, getWalletEl }) {
  let built = false;
  let els = {};

  function gardenerRank(lv) {
    if (lv >= 50) return 'Bậc Thầy Hệ Sinh Thái';
    if (lv >= 15) return 'Nghệ Nhân Terrarium';
    if (lv >= 5) return 'Người Chăm Vườn';
    return 'Mầm Non Mới Nhú';
  }

  function build() {
    built = true;
    root.replaceChildren();
    const wrap = el('div', undefined, 'milestone-stage level-stage');

    const maxLv = events.level.milestones.at(-1);
    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    const hero = el('div', undefined, 'bio-hero level-hero');
    const crest = el('div', undefined, 'level-crest');
    crest.innerHTML = `
      <svg class="level-ring" viewBox="0 0 124 124" aria-hidden="true">
        <defs>
          <linearGradient id="lvGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#cbfa8a"/>
            <stop offset="100%" stop-color="#ffdc89"/>
          </linearGradient>
        </defs>
        <circle class="ring-bg" cx="62" cy="62" r="${radius}"/>
        <circle class="ring-fg" cx="62" cy="62" r="${radius}" stroke="url(#lvGrad)"
          stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"/>
      </svg>
      <div class="level-shield">
        <span class="lv-prefix">LEVEL</span>
        <strong class="lv-num">0</strong>
      </div>
    `;

    const meta = el('div', undefined, 'bio-meta');
    const rankBadge = el('span', '', 'rank-badge');
    const desc = el('p', 'Dựa trên Level tài khoản. Đã vượt mốc trước sự kiện vẫn được nhận quà ngay!', 'bio-meta-desc');
    const barWrap = el('div', undefined, 'energy-bar');
    const barFill = el('div', undefined, 'energy-bar-fill level-fill');
    barWrap.appendChild(barFill);
    const barText = el('div', '', 'energy-bar-label');
    meta.append(rankBadge, desc, barWrap, barText);

    hero.append(crest, meta);

    const track = el('div', undefined, 'milestone-list vine-list');
    const cards = events.level.milestones.map((milestone, i) => {
      const rewardId = events.level.rewardIds[i];
      const card = el('div', undefined, 'milestone-card');
      const node = el('div', `Lv.${milestone}`, 'milestone-node level-node');
      const artHolder = el('div', undefined, 'milestone-art');
      const info = el('div', undefined, 'milestone-info');
      const title = el('div', `Đạt Level ${milestone}`, 'milestone-target');
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
        const res = await runAction('claimReward', { milestone }, `Đã nhận quà Level ${milestone}!`);
        if (res) {
          sfx.claim();
          fx.burstElement(card, { count: 28, spread: 7.5, colors: ['#cbfa8a', '#ffdc89', '#ffffff'] });
          fx.floatText(actionBtn, `LV.${milestone} ĐÃ NHẬN!`, 'gold');
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
      ringFg: crest.querySelector('.ring-fg'),
      circumference,
      lvNum: crest.querySelector('.lv-num'),
      rankBadge,
      barFill,
      barText,
      cards,
      maxLv
    };
  }

  function update(state, assets, busy) {
    if (!built) build();

    const lv = state.level ?? 0;
    const ratio = Math.min(1, lv / els.maxLv);
    const pct = Math.round(ratio * 100);

    els.lvNum.textContent = String(lv);
    els.ringFg.style.strokeDashoffset = String(els.circumference * (1 - ratio));
    els.rankBadge.textContent = `🌿 ${gardenerRank(lv)}`;
    els.barFill.style.width = `${pct}%`;
    els.barText.textContent = `Level ${lv} / ${els.maxLv} (Mốc cao nhất)`;

    for (const item of els.cards) {
      const claimed = state.claims.includes(`level-${item.milestone}`);
      const ready = !claimed && lv >= item.milestone;
      const itemRatio = Math.min(100, Math.round((lv / item.milestone) * 100));

      item.card.classList.toggle('is-claimed', claimed);
      item.card.classList.toggle('is-ready', ready);
      item.card.classList.toggle('is-locked', !claimed && !ready);

      item.node.textContent = claimed ? '✓' : `Lv.${item.milestone}`;
      item.artHolder.replaceChildren(createItemArt(item.rewardId, assets, { size: 'md' }));
      item.rewardName.textContent = itemLabel(item.rewardId, assets, events.level.rewardQuantities?.[item.rewardId]);

      if (claimed) {
        item.sub.textContent = 'Đã nhận phần thưởng cấp độ';
        item.miniBar.style.display = 'none';
        item.actionBtn.textContent = 'Đã nhận';
        item.actionBtn.className = 'btn btn-claimed milestone-btn';
        item.actionBtn.disabled = true;
      } else if (ready) {
        item.sub.textContent = 'Đã vượt mốc · Nhận ngay!';
        item.miniBar.style.display = 'none';
        item.actionBtn.textContent = 'Nhận quà';
        item.actionBtn.className = 'btn btn-arcade milestone-btn';
        item.actionBtn.disabled = busy;
      } else {
        const left = item.milestone - lv;
        item.sub.textContent = `Cần thêm ${left} Level nữa`;
        item.miniBar.style.display = 'block';
        item.miniFill.style.width = `${itemRatio}%`;
        item.actionBtn.textContent = `${lv}/${item.milestone}`;
        item.actionBtn.className = 'btn btn-locked milestone-btn';
        item.actionBtn.disabled = true;
      }
    }
  }

  return { update, isAnimating: () => false };
}
