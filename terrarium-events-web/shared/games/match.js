import { el, createItemArt, itemDisplayName, itemLabel, svgIcon } from '../ui.js';
import { fx } from '../fx.js';
import { sfx } from '../sfx.js';

export function createMatchGame({ root, runAction, getAssets, openClaimModal }) {
  let built = false;
  let animating = false;
  let prevRoundId = null;
  let els = {};

  function build() {
    built = true;
    root.replaceChildren();
    const wrap = el('div', undefined, 'match-stage');

    const hud = el('div', undefined, 'stage-hud');
    const pipsWrap = el('div', undefined, 'attempt-pips');
    const pips = Array.from({ length: 3 }, () => {
      const p = el('span', '🍀', 'attempt-pip');
      pipsWrap.appendChild(p);
      return p;
    });
    const statusPill = el('span', '', 'hud-pill');
    hud.append(pipsWrap, statusPill);

    const tray = el('div', undefined, 'match-tray');
    const board = el('div', undefined, 'match-board');
    const cards = [];

    for (let i = 0; i < 9; i++) {
      const card = el('button', undefined, 'leaf-card');
      card.type = 'button';
      card.style.setProperty('--idx', String(i));
      const inner = el('span', undefined, 'leaf-card-inner');
      const front = el('span', undefined, 'leaf-card-front');
      front.appendChild(svgIcon('card-leaf'));

      const back = el('span', undefined, 'leaf-card-back');
      inner.append(front, back);
      card.appendChild(inner);
      card.onclick = () => onTileTap(i);
      board.appendChild(card);
      cards.push({ card, back });
    }

    const startOverlay = el('div', undefined, 'match-start-overlay');
    const startCard = el('div', undefined, 'match-start-card');
    startCard.append(
      el('div', '9 ô lá bí ẩn · Tìm 1 cặp giống nhau', 'match-start-sub'),
    );
    const startBtn = el('button', undefined, 'btn btn-arcade');
    startBtn.type = 'button';
    startBtn.innerHTML = '<span class="btn-shine"></span><span class="btn-label">BẮT ĐẦU LẬT LÁ</span>';
    startBtn.onclick = () => onStartRound();
    startCard.appendChild(startBtn);
    startOverlay.appendChild(startCard);

    tray.append(board, startOverlay);

    const hint = el('div', '', 'match-hint');
    wrap.append(hud, tray, hint);
    root.appendChild(wrap);

    els = { wrap, pips, statusPill, tray, board, cards, startOverlay, startBtn, hint };
  }

  async function onStartRound() {
    if (animating || els.startBtn.disabled) return;
    animating = true;
    sfx.tap();
    const res = await runAction('startRound', {}, '');
    animating = false;
    if (res?.round) {
      els.cards.forEach(({ card }, idx) => {
        card.classList.remove('is-dealing');
        void card.offsetWidth;
        card.style.setProperty('--deal-delay', `${idx * 40}ms`);
        card.classList.add('is-dealing');
      });
      fx.burstElement(els.board, { count: 18, spread: 6, colors: ['#cbfa8a', '#7ef2c8'] });
    }
  }

  async function onTileTap(index) {
    if (animating) return;
    const cardObj = els.cards[index];
    if (!cardObj || cardObj.card.disabled) return;
    const roundId = prevRoundId;
    if (!roundId) return;

    animating = true;
    sfx.flip();
    const res = await runAction('revealTile', { index, roundId }, '');
    animating = false;
    if (!res?.round) return;

    const r = res.round;
    const revealedItem = r.revealed[index];
    fx.burstElement(cardObj.card, {
      count: revealedItem === null ? 8 : 14,
      spread: 4.5,
      colors: revealedItem === null ? ['#a7b89c', '#d9e8d3'] : ['#cbfa8a', '#ffdc89']
    });

    if (r.open.length === 2) {
      const [aIdx, bIdx] = r.open;
      const a = r.revealed[aIdx];
      const b = r.revealed[bIdx];
      if (a && a === b && r.ended) {
        sfx.match();
        fx.burstElement(els.cards[aIdx].card, { count: 22, spread: 7 });
        fx.burstElement(els.cards[bIdx].card, { count: 22, spread: 7 });
        fx.celebrate();
        fx.floatText(els.cards[bIdx].card, 'KHỚP CẶP!', 'gold');
        const pending = res.pending.find(p => p.eventId === 'match');
        if (pending) {
          setTimeout(() => openClaimModal?.(pending), 480);
        }
      } else {
        sfx.mismatch();
        [aIdx, bIdx].forEach(idx => {
          const c = els.cards[idx].card;
          c.classList.remove('is-mismatch');
          void c.offsetWidth;
          c.classList.add('is-mismatch');
        });
      }
    }
  }

  function update(state, assets, busy) {
    if (!built) build();

    const r = state.round;
    const isNewRound = (r?.id || null) !== prevRoundId;
    prevRoundId = r?.id || null;
    const attempts = r ? r.attempts : state.matchAvailable ? 3 : 0;

    els.pips.forEach((p, i) => {
      p.classList.toggle('is-active', i < attempts);
    });

    if (!r) {
      els.startOverlay.classList.toggle('is-hidden', false);
      els.startBtn.disabled = busy || !state.matchAvailable;
      els.startBtn.querySelector('.btn-label').textContent = state.matchAvailable
        ? 'BẮT ĐẦU LẬT LÁ'
        : 'ĐÃ HẾT LƯỢT HÔM NAY';
      els.statusPill.textContent = state.matchAvailable ? '3 cặp thử · 1 lượt/ngày' : 'Hẹn bạn ngày mai';
      els.hint.textContent = state.matchAvailable
        ? 'Nhấn Bắt đầu để trải 9 thẻ lá bí ẩn.'
        : 'Bạn đã hoàn thành lượt chơi hôm nay.';
    } else {
      els.startOverlay.classList.add('is-hidden');
      if (r.ended) {
        const won = r.open.length === 2 && r.revealed[r.open[0]] && r.revealed[r.open[0]] === r.revealed[r.open[1]];
        els.statusPill.textContent = won ? 'Tìm thấy cặp quà!' : 'Hết lượt thử';
        els.hint.textContent = won
          ? `Tuyệt vời! Bạn đã ghép được cặp ${itemLabel(r.revealed[r.open[0]], assets)}.`
          : 'Đã dùng hết 3 lần thử cặp. Hẹn bạn ngày mai nhé!';
      } else if (r.open.length === 1) {
        els.statusPill.textContent = `Còn ${r.attempts} cặp thử`;
        els.hint.textContent = 'Chọn thêm 1 lá khác để ghép cặp giống nhau!';
      } else if (r.open.length === 2) {
        els.statusPill.textContent = `Còn ${r.attempts} cặp thử`;
        els.hint.textContent = 'Chưa khớp! Chọn 1 lá mới để thử cặp tiếp theo.';
      } else {
        els.statusPill.textContent = `Còn ${r.attempts} cặp thử`;
        els.hint.textContent = 'Chạm vào 1 lá bất kỳ để lật mở.';
      }
    }

    const openSet = new Set(r?.open || []);
    const isWinPair = Boolean(
      r?.ended &&
      r.open.length === 2 &&
      r.revealed[r.open[0]] &&
      r.revealed[r.open[0]] === r.revealed[r.open[1]]
    );

    els.cards.forEach(({ card, back }, i) => {
      const open = openSet.has(i);
      const val = r?.revealed?.[i];
      card.classList.toggle('is-open', open);
      card.classList.toggle('is-matched', open && isWinPair);
      if (!open) card.classList.remove('is-mismatch');

      card.disabled = busy || !r || r.ended || open;
      card.setAttribute(
        'aria-label',
        open ? `Ô ${i + 1}: ${val ? itemLabel(val, assets) : 'lá trống'}` : `Lật ô ${i + 1}`
      );

      if (open) {
        const key = val === null ? '__null__' : String(val);
        if (back.dataset.rendered !== key) {
          back.dataset.rendered = key;
          back.replaceChildren(
            createItemArt(val, assets, { size: 'md' }),
            el('span', val === null ? 'Lá trống' : itemDisplayName(val, assets), 'tile-caption')
          );
        }
      } else if (back.dataset.rendered && (isNewRound || !r)) {
        delete back.dataset.rendered;
        back.replaceChildren();
      }
    });
  }

  return { update, isAnimating: () => animating };
}
