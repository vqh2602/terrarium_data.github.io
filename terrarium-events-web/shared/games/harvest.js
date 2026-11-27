import { events } from '../config.js';
import { el, createItemArt, itemDisplayName, itemLabel, resolveItemImage, showModal, closeModals } from '../ui.js';
import { fx } from '../fx.js';
import { sfx } from '../sfx.js';

export function createHarvestGame({ root, runAction, getAssets, getWalletEl }) {
  let built = false;
  let els = {};

  function openConfirmHarvestModal(req, assets, cardEl) {
    const plantName = itemDisplayName(req.plantId, assets);
    const body = el('div', undefined, 'harvest-confirm-body');
    const preview = el('div', undefined, 'harvest-confirm-art');
    preview.appendChild(createItemArt(req.plantId, assets, { size: 'xl' }));

    const msg = el(
      'p',
      `Cắt 1 cây ${plantName} trưởng thành (Lv.3+) trong khu vườn về lại Lv.1 để đặt lên kệ thu hoạch?`,
      'harvest-confirm-lead'
    );
    const meta = el(
      'p',
      `Cần thêm ${req.remaining} cây nữa · Trong vườn hiện có ${req.matureInGarden} cây trưởng thành.`,
      'harvest-confirm-meta'
    );
    body.append(preview, msg, meta);

    showModal({
      title: 'Xác nhận thu hoạch cây?',
      badge: 'CẮT CÂY VỀ LV.1',
      bodyNode: body,
      actions: [
        {
          label: 'Xác nhận thu hoạch',
          cls: 'btn btn-arcade',
          onClick: async () => {
            sfx.tap();
            closeModals();
            const res = await runAction(
              'harvestPlant',
              { plantId: req.plantId },
              `Đã thu hoạch 1 cây ${plantName} lên kệ!`
            );
            if (res) {
              sfx.claim();
              fx.burstElement(cardEl, { count: 24, spread: 7, colors: ['#67e8c2', '#cbfa8a', '#ffdc89'] });
              fx.floatText(cardEl, '+1 LÊN KỆ!', 'mint');
            }
          }
        },
        {
          label: 'Huỷ',
          cls: 'btn btn-ghost',
          onClick: () => {
            sfx.tap();
            closeModals();
          }
        }
      ]
    });
  }

  function build() {
    built = true;
    root.replaceChildren();

    const wrap = el('div', undefined, 'harvest-stage');

    const header = el('div', undefined, 'harvest-header');
    const title = el('h2', 'Kệ vật phẩm thu hoạch', 'harvest-title');
    const desc = el('p', 'Thu hoạch cây trưởng thành (Lv.3+) trong khu vườn. Cây sau khi cắt sẽ trở về Lv.1 để bạn chăm lại.', 'harvest-desc');
    const barWrap = el('div', undefined, 'energy-bar');
    const barFill = el('div', undefined, 'energy-bar-fill');
    barWrap.appendChild(barFill);
    const barText = el('div', '0 / 0 cây', 'energy-bar-label');
    header.append(title, desc, barWrap, barText);

    const shelfGrid = el('div', undefined, 'harvest-shelf');

    const rewardCard = el('div', undefined, 'harvest-reward-box');
    const rewardTitle = el('div', 'Phần thưởng hoàn thành kệ', 'harvest-reward-title');
    const rewardList = el('div', undefined, 'harvest-reward-list');
    const claimBtn = el('button', 'Nhận tất cả phần thưởng', 'btn btn-arcade harvest-claim-btn');
    claimBtn.type = 'button';
    claimBtn.onclick = async () => {
      if (claimBtn.disabled) return;
      sfx.tap();
      const res = await runAction('claimReward', {}, 'Đã nhận trọn bộ phần thưởng thu hoạch!');
      if (res) {
        sfx.claim();
        fx.celebrate();
        const firstId = res.harvest?.rewards?.[0]?.id || events.harvest.rewardIds[0];
        fx.flyToWallet(rewardCard, getWalletEl?.(), resolveItemImage(firstId, getAssets?.()));
      }
    };
    rewardCard.append(rewardTitle, rewardList, claimBtn);

    wrap.append(header, shelfGrid, rewardCard);
    root.appendChild(wrap);

    els = { barFill, barText, shelfGrid, rewardCard, rewardList, claimBtn };
  }

  function update(state, assets, busy) {
    if (!built) build();

    const harvest = state.harvest || {
      requirements: events.harvest.requirements.map(r => ({
        ...r,
        collected: 0,
        remaining: r.required,
        matureInGarden: 0
      })),
      isComplete: false,
      claimed: state.claims?.includes('harvest-complete') || false,
      rewards: events.harvest.rewardIds.map(id => ({
        id,
        quantity: events.harvest.rewardQuantities?.[id] ?? 1
      }))
    };

    const totalRequired = harvest.requirements.reduce((sum, r) => sum + r.required, 0);
    const totalCollected = harvest.requirements.reduce((sum, r) => sum + r.collected, 0);
    const pct = totalRequired > 0 ? Math.min(100, Math.round((totalCollected / totalRequired) * 100)) : 0;

    els.barFill.style.width = `${pct}%`;
    els.barText.textContent = `${totalCollected} / ${totalRequired} cây đã đặt lên kệ (${pct}%)`;

    els.shelfGrid.replaceChildren();
    for (const req of harvest.requirements) {
      const done = req.remaining <= 0;
      const canHarvest = !done && req.matureInGarden > 0 && !busy;

      const card = el('div', undefined, `harvest-slot${done ? ' is-done' : ''}${canHarvest ? ' is-ready' : ''}`);
      const top = el('div', undefined, 'harvest-slot-top');
      top.append(
        el('span', done ? 'ĐÃ ĐỦ ✓' : `CÒN ×${req.remaining}`, 'harvest-slot-badge'),
        el('span', `${req.collected}/${req.required}`, 'harvest-slot-count')
      );

      const art = createItemArt(req.plantId, assets, { size: 'lg' });
      const name = el('div', itemDisplayName(req.plantId, assets), 'harvest-slot-name');
      const gardenInfo = el(
        'div',
        done ? 'Đã hoàn thành ô này' : `Trong vườn: ${req.matureInGarden} cây Lv.3+`,
        'harvest-slot-garden'
      );

      const btn = el(
        'button',
        done ? 'Đã đủ' : req.matureInGarden > 0 ? 'Đặt lên kệ' : 'Chưa có cây Lv.3+',
        `btn btn-sm ${canHarvest ? 'btn-arcade' : 'btn-ghost'} harvest-slot-btn`
      );
      btn.type = 'button';
      btn.disabled = !canHarvest;
      btn.onclick = () => {
        if (!canHarvest) return;
        sfx.tap();
        openConfirmHarvestModal(req, assets, card);
      };

      card.append(top, art, name, gardenInfo, btn);
      els.shelfGrid.appendChild(card);
    }

    els.rewardList.replaceChildren();
    for (const r of harvest.rewards) {
      const chip = el('div', undefined, 'harvest-reward-chip');
      chip.append(
        createItemArt(r.id, assets, { size: 'sm' }),
        el('span', itemLabel(r.id, assets, r.quantity))
      );
      els.rewardList.appendChild(chip);
    }

    els.rewardCard.classList.toggle('is-complete', harvest.isComplete && !harvest.claimed);
    els.rewardCard.classList.toggle('is-claimed', harvest.claimed);
    els.claimBtn.disabled = busy || !harvest.isComplete || harvest.claimed;
    els.claimBtn.textContent = harvest.claimed
      ? 'Đã nhận phần thưởng ✓'
      : harvest.isComplete
        ? 'Nhận tất cả phần thưởng'
        : `Hoàn thành kệ (${totalCollected}/${totalRequired}) để mở khóa`;
  }

  return { update, isAnimating: () => false };
}
