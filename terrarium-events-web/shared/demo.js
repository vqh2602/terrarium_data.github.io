// Chỉ mô phỏng để duyệt kịch bản. Không dùng để xác thực hoặc cấp quà thật.
import { events, catalog } from './config.js';
import { currentVietnamMonthKey, generateMonthlyRewards, reconcileMonthlyRewards } from './monthlyRewards.js';
export function createDemo(random = Math.random, options = {}) {
  const monthKey = options.monthKey || currentVietnamMonthKey();
  const s = {
    oxygenCollected: 2400,
    level: 12,
    spins: 3,
    matchAvailable: true,
    rounds: 0,
    round: null,
    claims: [],
    day: 0,
    checkedToday: false,
    isVIP: Boolean(options.isVIP),
    monthlyMonthKey: monthKey,
    monthlyDay: 0,
    monthlyCheckedToday: false,
    monthlyRewards: generateMonthlyRewards(monthKey, options.seedSalt || 'demo', Boolean(options.isVIP)),
    harvestProgress: {},
    demoGardenMature: { plant10: 2, plant2: 2, plant5: 1 },
    pending: [],
    wallet: []
  };
  const receipts = new Map();
  const buildHarvestState = () => {
    const reqs = events.harvest.requirements.map(req => {
      const collected = Math.min(req.required, s.harvestProgress[req.plantId] || 0);
      return {
        plantId: req.plantId,
        required: req.required,
        collected,
        remaining: Math.max(0, req.required - collected),
        matureInGarden: s.demoGardenMature[req.plantId] || 0
      };
    });
    return {
      requirements: reqs,
      maturePlants: { ...s.demoGardenMature },
      isComplete: reqs.every(r => r.collected >= r.required),
      claimed: s.claims.includes('harvest-complete'),
      rewards: events.harvest.rewardIds.map(id => ({
        id,
        quantity: events.harvest.rewardQuantities?.[id] ?? 1
      }))
    };
  };
  const snapshot = () => {
    const snap = structuredClone(s);
    snap.harvest = buildHarvestState();
    return snap;
  };
  const nowLabel = () => {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const grant = (id, key, quantityOverride) => {
    if (s.claims.includes(key)) throw Error('Quà đã nhận.');
    s.claims.push(key);
    const entry = { id, ...catalog[id], claimedAt: nowLabel() };
    if (quantityOverride !== undefined) entry.quantity = quantityOverride;
    s.wallet.push(entry);
  };
  return async function call(action, payload = {}) {
    if (payload.requestId && receipts.has(payload.requestId)) return structuredClone(receipts.get(payload.requestId));
    const event = events[payload.eventId];
    switch (action) {
      case 'getContext': break;
      case 'resolveAssets': return Object.fromEntries(payload.itemIds.map(id => [id, { ...catalog[id], image: null }]));
      case 'spin': {
        if (!s.spins) throw Error('Bạn đã dùng hết lượt hôm nay.');
        s.spins--;
        const ids = events.slot.rewardIds;
        const symbols = Array.from({ length: 3 }, () => ids[Math.floor(random() * ids.length)]);
        const rewardId = symbols.every(x => x === symbols[0]) ? symbols[0] : null;
        if (rewardId) s.pending.push({ id: `spin-${s.spins}`, rewardId, eventId: 'slot' });
        s.lastSpin = { symbols, rewardId }; break;
      }
      case 'startRound': {
        if (!s.matchAvailable) throw Error('Bạn đã dùng lượt chơi hôm nay.');
        s.matchAvailable = false;
        const board = [...events.match.rewardIds, ...events.match.rewardIds, null];
        for (let i = board.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [board[i], board[j]] = [board[j], board[i]]; }
        s.round = { id: `round-${++s.rounds}`, board, open: [], revealed: {}, attempts: 3, ended: false }; break;
      }
      case 'revealTile': {
        const r = s.round, i = payload.index;
        if (!r || r.ended || r.id !== payload.roundId || !Number.isInteger(i) || i < 0 || i > 8 || r.open.includes(i)) throw Error('Ô hoặc lượt chơi không hợp lệ.');
        if (r.open.length === 2) { r.open = []; r.revealed = {}; }
        r.open.push(i); r.revealed[i] = r.board[i];
        if (r.open.length === 2) {
          r.attempts--;
          const a = r.board[r.open[0]], b = r.board[r.open[1]];
          if (a && a === b) { r.ended = true; s.pending.push({ id: r.id, rewardId: a, eventId: 'match' }); }
          if (!r.attempts) r.ended = true;
        } break;
      }
      case 'claimReward': {
        if (!event) throw Error('Sự kiện không hợp lệ.');
        if (payload.eventId === 'harvest') {
          if (s.claims.includes('harvest-complete')) throw Error('Quà đã nhận.');
          const h = buildHarvestState();
          if (!h.isComplete) throw Error('Bạn chưa hoàn thiện đủ kệ vật phẩm.');
          s.claims.push('harvest-complete');
          const claimedAt = nowLabel();
          for (const r of h.rewards) {
            s.wallet.push({ id: r.id, ...catalog[r.id], quantity: r.quantity, claimedAt });
          }
          break;
        }
        if (event.milestones) {
          const i = event.milestones.indexOf(payload.milestone), progress = payload.eventId === 'oxygen' ? s.oxygenCollected : s.level;
          if (i < 0 || progress < payload.milestone) throw Error('Chưa đạt mốc.');
          const rewardId = event.rewardIds[i];
          grant(rewardId, `${payload.eventId}-${payload.milestone}`, event.rewardQuantities?.[rewardId]);
        } else {
          const reward = s.pending.find(x => x.id === payload.rewardId && x.eventId === payload.eventId);
          if (!reward) throw Error('Không tìm thấy quà.');
          grant(reward.rewardId, `${payload.eventId}-${reward.id}`, event.rewardQuantities?.[reward.rewardId]);
          s.pending = s.pending.filter(x => x !== reward);
        } break;
      }
      case 'checkIn': {
        if (s.checkedToday || s.day >= 7) throw Error('Bạn đã điểm danh hôm nay hoặc hoàn thành chuỗi.');
        const rewardId = events.daily.rewardIds[s.day];
        grant(rewardId, `daily-${s.day}`, events.daily.rewardQuantities?.[rewardId]); s.day++; s.checkedToday = true; break;
      }
      case 'monthlyCheckIn': {
        if (s.monthlyCheckedToday || s.monthlyDay >= 30) throw Error('Bạn đã điểm danh hôm nay hoặc hoàn thành đủ 30 ngày tháng này.');
        const reward = s.monthlyRewards[s.monthlyDay];
        if (!reward) throw Error('Không tìm thấy phần thưởng ngày này.');
        const qty = reward.quantity * (s.isVIP ? 2 : 1);
        grant(reward.rewardId, `monthly-${s.monthlyMonthKey}-${s.monthlyDay}`, qty);
        s.monthlyDay++;
        s.monthlyCheckedToday = true;
        break;
      }
      case 'toggleDemoVIP': {
        s.isVIP = !s.isVIP;
        const fresh = generateMonthlyRewards(s.monthlyMonthKey, options.seedSalt || 'demo', s.isVIP);
        s.monthlyRewards = s.monthlyRewards.map((item, idx) => (idx < s.monthlyDay ? item : fresh[idx]));
        break;
      }
      case 'harvestPlant': {
        const plantId = payload.plantId;
        const req = events.harvest.requirements.find(r => r.plantId === plantId);
        if (!req) throw Error('Cây không nằm trong danh sách thu hoạch.');
        const collected = s.harvestProgress[plantId] || 0;
        if (collected >= req.required) throw Error('Kệ vật phẩm cho cây này đã đủ số lượng.');
        const mature = s.demoGardenMature[plantId] || 0;
        if (mature <= 0) throw Error('Bạn chưa có cây trưởng thành phù hợp trong khu vườn.');
        s.demoGardenMature[plantId] = mature - 1;
        s.harvestProgress[plantId] = collected + 1;
        break;
      }
      default: throw Error('Lệnh chưa hỗ trợ.');
    }
    const result = snapshot();
    // Không gửi bảng bí mật cho UI: native/backend thật cũng phải làm như vậy.
    if (result.round) delete result.round.board;
    if (payload.requestId) receipts.set(payload.requestId, structuredClone(result));
    return result;
  };
}
