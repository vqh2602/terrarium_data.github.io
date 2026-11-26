import { events } from '../config.js';
import { el, createItemArt, itemLabel } from '../ui.js';
import { fx } from '../fx.js';
import { sfx } from '../sfx.js';

export function createSlotGame({ root, runAction, getAssets, openClaimModal }) {
  const pool = [...events.slot.rewardIds, '7'];
  const ringCopies = 6;
  let built = false;
  let spinning = false;
  let els = {};
  let reelState = [
    { offset: 0, symbol: '7', phase: 'idle', speed: 0 },
    { offset: 0, symbol: '7', phase: 'idle', speed: 0 },
    { offset: 0, symbol: '7', phase: 'idle', speed: 0 }
  ];
  let rafId = 0;

  function cellHeight() {
    const vp = els.viewports?.[0];
    return vp ? vp.clientHeight || 112 : 112;
  }

  function offsetForSymbol(sym, minOffset = 0) {
    const h = cellHeight();
    const cycle = pool.length * h;
    const idx = Math.max(0, pool.indexOf(sym));
    const base = idx * h;
    const n = Math.ceil((minOffset - base) / cycle);
    return base + Math.max(1, n) * cycle;
  }

  function build(state, assets) {
    built = true;
    root.replaceChildren();
    const wrap = el('div', undefined, 'slot-stage');

    // Top status & spin pips
    const hud = el('div', undefined, 'stage-hud');
    const pipsWrap = el('div', undefined, 'spin-pips');
    const pips = Array.from({ length: 3 }, () => el('span', undefined, 'spin-pip'));
    pips.forEach(p => pipsWrap.appendChild(p));
    const turnsText = el('span', '', 'hud-pill');
    hud.append(pipsWrap, turnsText);

    // Arcade machine cabinet
    const machine = el('div', undefined, 'slot-machine');
    const marquee = el('div', undefined, 'slot-marquee');
    const bulbs = el('div', undefined, 'marquee-bulbs');
    for (let i = 0; i < 11; i++) {
      const b = el('span', undefined, 'bulb');
      b.style.setProperty('--i', String(i));
      bulbs.appendChild(b);
    }
    const sign = el('div', 'LUCKY GARDEN 777', 'marquee-sign');
    marquee.append(bulbs, sign);

    const drumFrame = el('div', undefined, 'slot-drum-frame');
    const payline = el('div', undefined, 'slot-payline');
    payline.innerHTML = '<span class="payline-arrow left">▶</span><span class="payline-beam"></span><span class="payline-arrow right">◀</span>';

    const reelsRow = el('div', undefined, 'slot-reels');
    const viewports = [];
    const strips = [];

    for (let r = 0; r < 3; r++) {
      const vp = el('div', undefined, 'slot-reel-viewport');
      const strip = el('div', undefined, 'slot-reel-strip');
      for (let c = 0; c < ringCopies; c++) {
        for (const sym of pool) {
          const cell = el('div', undefined, 'slot-cell');
          cell.dataset.sym = sym;
          cell.appendChild(createItemArt(sym, assets, { size: 'lg' }));
          strip.appendChild(cell);
        }
      }
      vp.appendChild(strip);
      reelsRow.appendChild(vp);
      viewports.push(vp);
      strips.push(strip);
    }

    // Side mechanical lever
    const lever = el('button', undefined, 'slot-lever');
    lever.type = 'button';
    lever.setAttribute('aria-label', 'Kéo cần quay');
    lever.innerHTML = '<span class="lever-shaft"></span><span class="lever-knob"></span>';
    lever.onclick = () => triggerSpin();

    drumFrame.append(reelsRow, payline, lever);

    // Result banner inside machine
    const banner = el('div', 'Nhấn QUAY để thử vận may hôm nay!', 'slot-banner');

    // Main Spin CTA
    const spinBtn = el('button', undefined, 'btn btn-arcade slot-spin-btn');
    spinBtn.type = 'button';
    spinBtn.innerHTML = '<span class="btn-shine"></span><span class="btn-label">QUAY MAY MẮN</span>';
    spinBtn.onclick = () => triggerSpin();

    machine.append(marquee, drumFrame, banner, spinBtn);

    // Payout legend strip
    const legend = el('div', undefined, 'slot-legend');
    legend.appendChild(el('span', 'Phần thưởng khi trùng 3 ô:', 'legend-title'));
    const legendList = el('div', undefined, 'legend-items');
    for (const id of events.slot.rewardIds) {
      const chip = el('div', undefined, 'legend-chip');
      chip.append(createItemArt(id, assets, { size: 'xs' }), el('span', `3× ${itemLabel(id, assets)}`));
      legendList.appendChild(chip);
    }
    legend.appendChild(legendList);

    wrap.append(hud, machine, legend);
    root.appendChild(wrap);

    els = { wrap, pips, turnsText, machine, marquee, payline, viewports, strips, lever, banner, spinBtn };

    // Position initial symbols cleanly
    const initialSyms = state.lastSpin?.symbols || ['7', '7', '7'];
    requestAnimationFrame(() => {
      const h = cellHeight();
      const cycle = pool.length * h;
      initialSyms.forEach((sym, i) => {
        const idx = Math.max(0, pool.indexOf(sym));
        const off = cycle + idx * h;
        reelState[i].offset = off;
        reelState[i].symbol = sym;
        strips[i].style.transform = `translate3d(0, ${-off}px, 0)`;
      });
    });
  }

  function applyRestingSprites(assets) {
    if (!els.strips) return;
    for (const strip of els.strips) {
      for (const cell of strip.children) {
        const sym = cell.dataset.sym;
        cell.replaceChildren(createItemArt(sym, assets, { size: 'lg' }));
      }
    }
  }

  function update(state, assets, busy) {
    if (!built) {
      build(state, assets);
    } else {
      applyRestingSprites(assets);
    }

    const spins = state.spins ?? 0;
    els.pips.forEach((pip, i) => {
      pip.classList.toggle('is-active', i < spins);
    });
    els.turnsText.textContent = spins > 0 ? `Còn ${spins}/3 lượt` : 'Hết lượt hôm nay';

    const disabled = spinning || busy || spins <= 0;
    els.spinBtn.disabled = disabled;
    els.lever.disabled = disabled;
    els.spinBtn.querySelector('.btn-label').textContent = spinning
      ? 'ĐANG QUAY…'
      : spins > 0
        ? 'QUAY MAY MẮN'
        : 'ĐÃ HẾT LƯỢT';

    if (!spinning) {
      const h = cellHeight();
      const cycle = pool.length * h;
      const syms = state.lastSpin?.symbols || ['7', '7', '7'];
      syms.forEach((sym, i) => {
        const idx = Math.max(0, pool.indexOf(sym));
        const off = cycle + idx * h;
        reelState[i].offset = off;
        reelState[i].symbol = sym;
        els.strips[i].style.transform = `translate3d(0, ${-off}px, 0)`;
      });

      const won = Boolean(state.lastSpin?.rewardId);
      els.machine.classList.toggle('is-jackpot', won);
      if (!state.lastSpin) {
        els.banner.textContent = spins > 0 ? 'Chạm nút hoặc kéo cần để quay!' : 'Hẹn bạn quay lại vào ngày mai!';
        els.banner.className = 'slot-banner';
      } else if (won) {
        els.banner.textContent = `Trúng lớn! ${itemLabel(state.lastSpin.rewardId, assets)}`;
        els.banner.className = 'slot-banner is-win';
      } else {
        els.banner.textContent = spins > 0 ? 'Suýt trúng rồi! Thử lại lượt tiếp nhé' : 'Chưa trúng lần này. Hẹn bạn ngày mai!';
        els.banner.className = 'slot-banner is-miss';
      }
    }
  }

  async function triggerSpin() {
    if (spinning || els.spinBtn.disabled) return;
    spinning = true;
    els.spinBtn.disabled = true;
    els.lever.disabled = true;
    els.spinBtn.querySelector('.btn-label').textContent = 'ĐANG QUAY…';
    els.machine.classList.remove('is-jackpot');
    els.machine.classList.add('is-spinning');
    els.lever.classList.add('is-pulled');
    setTimeout(() => els.lever.classList.remove('is-pulled'), 380);
    els.banner.textContent = 'Các cuộn đang quay…';
    els.banner.className = 'slot-banner';

    sfx.spinStart();

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const h = cellHeight();
    const cycle = pool.length * h;
    let lastTickCell = [0, 0, 0];
    let prevTs = performance.now();

    for (let i = 0; i < 3; i++) {
      reelState[i].phase = 'spin';
      reelState[i].speed = 1650 + i * 160;
      els.viewports[i].classList.add('is-blur');
      els.viewports[i].classList.remove('is-suspense', 'is-landed');
    }

    const startTime = performance.now();

    function step(now) {
      const dt = Math.min(0.05, (now - prevTs) / 1000);
      prevTs = now;
      let anyActive = false;

      for (let i = 0; i < 3; i++) {
        const rs = reelState[i];
        if (rs.phase === 'spin') {
          anyActive = true;
          rs.offset += rs.speed * dt;
          if (rs.offset >= cycle * (ringCopies - 2)) {
            rs.offset -= cycle * 2;
          }
          const cellIndex = Math.floor(rs.offset / h);
          if (cellIndex !== lastTickCell[i]) {
            lastTickCell[i] = cellIndex;
            if (i === 0) sfx.spinTick();
          }
          els.strips[i].style.transform = `translate3d(0, ${-rs.offset}px, 0)`;
        } else if (rs.phase === 'stop') {
          anyActive = true;
          const t = Math.min(1, (now - rs.stopStart) / rs.stopDuration);
          // Smooth ease-out with slight spring settle
          const ease = 1 - Math.pow(1 - t, 3);
          const cur = rs.fromOffset + (rs.toOffset - rs.fromOffset) * ease;
          els.strips[i].style.transform = `translate3d(0, ${-cur}px, 0)`;
          if (t >= 1) {
            rs.phase = 'idle';
            rs.offset = cycle + Math.max(0, pool.indexOf(rs.symbol)) * h;
            els.strips[i].style.transform = `translate3d(0, ${-rs.offset}px, 0)`;
            els.viewports[i].classList.remove('is-blur', 'is-suspense');
            els.viewports[i].classList.add('is-landed');
            sfx.reelStop(i);
            fx.burstElement(els.viewports[i], { count: 10, spread: 4.5, colors: ['#cbfa8a', '#ffdc89'] });
            rs.onLanded?.();
          }
        }
      }

      if (anyActive) {
        rafId = requestAnimationFrame(step);
      } else {
        rafId = 0;
      }
    }

    if (!reduced) {
      rafId = requestAnimationFrame(step);
    }

    const resultState = await runAction('spin', {}, '');

    if (!resultState || !resultState.lastSpin) {
      // Action failed / rejected: stop reels cleanly
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      spinning = false;
      els.machine.classList.remove('is-spinning');
      for (let i = 0; i < 3; i++) {
        reelState[i].phase = 'idle';
        els.viewports[i].classList.remove('is-blur', 'is-suspense');
      }
      return;
    }

    const targetSyms = resultState.lastSpin.symbols;
    const isNearMiss = targetSyms[0] === targetSyms[1];

    if (reduced) {
      spinning = false;
      els.machine.classList.remove('is-spinning');
      update(resultState, getAssets(), false);
      if (resultState.lastSpin.rewardId) {
        const pending = resultState.pending.find(p => p.eventId === 'slot');
        if (pending) openClaimModal?.(pending);
      }
      return;
    }

    const elapsed = performance.now() - startTime;
    const stopDelays = [
      Math.max(80, 620 - elapsed),
      Math.max(480, 1180 - elapsed),
      isNearMiss ? Math.max(1050, 2120 - elapsed) : Math.max(860, 1680 - elapsed)
    ];

    await Promise.all(
      targetSyms.map(
        (sym, i) =>
          new Promise(resolve => {
            setTimeout(() => {
              if (i === 1 && isNearMiss) {
                els.viewports[2].classList.add('is-suspense');
                els.banner.textContent = 'Gần trúng rồi… chờ ô cuối!';
              }
              const rs = reelState[i];
              rs.symbol = sym;
              rs.fromOffset = rs.offset;
              rs.toOffset = offsetForSymbol(sym, rs.offset + h * 3);
              rs.stopStart = performance.now();
              rs.stopDuration = i === 2 && isNearMiss ? 720 : 520;
              rs.phase = 'stop';
              rs.onLanded = resolve;
            }, stopDelays[i]);
          })
      )
    );

    spinning = false;
    els.machine.classList.remove('is-spinning');
    update(resultState, getAssets(), false);

    if (resultState.lastSpin.rewardId) {
      sfx.win();
      fx.celebrate();
      fx.floatText(els.machine, 'TRÚNG LỚN 777!', 'gold');
      const pending = resultState.pending.find(p => p.eventId === 'slot');
      if (pending) {
        setTimeout(() => openClaimModal?.(pending), 420);
      }
    }
  }

  return { update, isAnimating: () => spinning };
}
