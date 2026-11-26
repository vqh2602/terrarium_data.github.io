export const MONTHLY_REWARD_SPECS = {
  oxygen: {
    id: 'oxygen',
    rarity: 'common',
    rarityLabel: 'Thường',
    weight: 38,
    quantities: [250, 300, 350, 400, 450, 500, 600],
    milestoneQuantities: [750, 900, 1000, 1200]
  },
  fertilizer: {
    id: 'fertilizer',
    rarity: 'uncommon',
    rarityLabel: 'Ít gặp',
    weight: 24,
    quantities: [2, 3, 4, 5],
    milestoneQuantities: [5, 6, 8]
  },
  shovel: {
    id: 'shovel',
    rarity: 'rare',
    rarityLabel: 'Hiếm',
    weight: 16,
    quantities: [1, 2, 3],
    milestoneQuantities: [3, 4]
  },
  gemstone: {
    id: 'gemstone',
    rarity: 'epic',
    rarityLabel: 'Sử thi',
    weight: 14,
    quantities: [5, 8, 10, 12, 15],
    milestoneQuantities: [18, 20, 25]
  },
  ticket: {
    id: 'ticket',
    rarity: 'legendary',
    rarityLabel: 'Huyền thoại',
    weight: 8,
    quantities: [1, 2],
    milestoneQuantities: [2, 3]
  }
};

export const MONTHLY_MILESTONE_DAYS = new Set([7, 14, 21, 28, 30]);

export function currentVietnamMonthKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit'
  }).formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value || '2026';
  const month = parts.find(p => p.type === 'month')?.value || '01';
  return `${year}-${month}`;
}

export function createSeededRandom(seedInput) {
  let state = 2166136261;
  const text = String(seedInput || 'terrarium');
  for (let i = 0; i < text.length; i++) {
    state ^= text.charCodeAt(i);
    state = Math.imul(state, 16777619);
  }
  state >>>= 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeightedSpec(rand, specsList) {
  const totalWeight = specsList.reduce((sum, s) => sum + s.weight, 0);
  let roll = rand() * totalWeight;
  for (const spec of specsList) {
    roll -= spec.weight;
    if (roll <= 0) return spec;
  }
  return specsList[specsList.length - 1];
}

export function generateMonthlyRewards(monthKey, seedSalt = '') {
  const rand = createSeededRandom(`${monthKey}:${seedSalt}`);
  const allSpecs = Object.values(MONTHLY_REWARD_SPECS);
  const milestoneSpecs = [
    MONTHLY_REWARD_SPECS.shovel,
    MONTHLY_REWARD_SPECS.gemstone,
    MONTHLY_REWARD_SPECS.ticket,
    MONTHLY_REWARD_SPECS.oxygen
  ];

  const days = [];
  for (let day = 1; day <= 30; day++) {
    const isMilestone = MONTHLY_MILESTONE_DAYS.has(day);
    let spec;
    if (day === 30) {
      spec = rand() < 0.55 ? MONTHLY_REWARD_SPECS.ticket : MONTHLY_REWARD_SPECS.gemstone;
    } else if (isMilestone) {
      spec = pickWeightedSpec(rand, milestoneSpecs);
    } else {
      spec = pickWeightedSpec(rand, allSpecs);
    }

    const pool = isMilestone ? spec.milestoneQuantities : spec.quantities;
    const quantity = pool[Math.floor(rand() * pool.length)];

    days.push({
      day,
      rewardId: spec.id,
      quantity,
      rarity: spec.rarity
    });
  }

  // Ensure all 5 reward categories appear at least once per month.
  const requiredIds = ['oxygen', 'fertilizer', 'shovel', 'gemstone', 'ticket'];
  const present = new Set(days.map(d => d.rewardId));
  const nonMilestoneIndices = days
    .map((d, idx) => (!MONTHLY_MILESTONE_DAYS.has(d.day) ? idx : -1))
    .filter(idx => idx >= 0);

  let cursor = 0;
  for (const id of requiredIds) {
    if (!present.has(id) && cursor < nonMilestoneIndices.length) {
      const idx = nonMilestoneIndices[cursor++];
      const spec = MONTHLY_REWARD_SPECS[id];
      const quantity = spec.quantities[Math.floor(rand() * spec.quantities.length)];
      days[idx] = {
        day: days[idx].day,
        rewardId: spec.id,
        quantity,
        rarity: spec.rarity
      };
    }
  }

  return days;
}
