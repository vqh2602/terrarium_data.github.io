import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemo } from './demo.js';
test('spin retries are idempotent and no more than three turns', async () => {
 const call = createDemo(() => 0);
 const a = await call('spin', { requestId: 'a' });
 assert.equal((await call('spin', { requestId: 'a' })).spins, a.spins);
 await call('spin'); await call('spin'); await assert.rejects(call('spin'));
 const won = await call('claimReward', {eventId:'slot',rewardId:a.pending[0].id});
 assert.equal(won.wallet.length, 1);
 await assert.rejects(call('claimReward', {eventId:'slot',rewardId:a.pending[0].id}));
});
test('milestones reject unmet and duplicate claims', async () => {
 const call = createDemo();
 await assert.rejects(call('claimReward', {eventId:'oxygen',milestone:10000}));
 await assert.rejects(call('claimReward', {eventId:'level',milestone:50}));
 const s = await call('claimReward', {eventId:'level',milestone:5}); assert.equal(s.wallet.length,1);
 await assert.rejects(call('claimReward', {eventId:'level',milestone:5}));
});
test('daily is limited to once per day', async () => {
 const call = createDemo(); const s = await call('checkIn'); assert.equal(s.day,1);
 await assert.rejects(call('checkIn'));
});
test('match uses nine tiles, hides secret board, stops at first pair', async () => {
 const call = createDemo(() => .999); const s = await call('startRound');
 assert.equal(s.round.board, undefined); await assert.rejects(call('startRound'));
 await call('revealTile', {roundId:s.round.id,index:0});
 await assert.rejects(call('revealTile', {roundId:s.round.id,index:0}));
 const won = await call('revealTile', {roundId:s.round.id,index:4});
 assert.equal(won.round.ended,true); assert.equal(won.pending.length,1);
 await assert.rejects(call('revealTile',{roundId:s.round.id,index:8}));
});
test('match ends after three failed pairs', async () => {
 const call=createDemo(()=>.999); const s=await call('startRound');
 for (const index of [0,1,2,3,0,8]) await call('revealTile',{roundId:s.round.id,index});
 const end=await call('getContext'); assert.equal(end.round.ended,true); assert.equal(end.round.attempts,0); assert.equal(end.pending.length,0);
});
test('monthly generates 30 rewards covering all 5 types and supports VIP x2 check-in', async () => {
 const call = createDemo(Math.random, { monthKey: '2026-11', isVIP: true });
 const ctx = await call('getContext', { eventId: 'monthly' });
 assert.equal(ctx.monthlyRewards.length, 30);
 const types = new Set(ctx.monthlyRewards.map(r => r.rewardId));
 for (const id of ['oxygen', 'gemstone', 'ticket', 'fertilizer', 'shovel']) {
  assert.equal(types.has(id), true, `Missing ${id}`);
 }
 const firstReward = ctx.monthlyRewards[0];
 const claimed = await call('monthlyCheckIn', { eventId: 'monthly', requestId: 'm-1' });
 assert.equal(claimed.monthlyDay, 1);
 assert.equal(claimed.monthlyCheckedToday, true);
 assert.equal(claimed.wallet[0].quantity, firstReward.quantity * 2);
 assert.equal((await call('monthlyCheckIn', { eventId: 'monthly', requestId: 'm-1' })).monthlyDay, 1);
 await assert.rejects(call('monthlyCheckIn', { eventId: 'monthly', requestId: 'm-2' }));
});
test('non-VIP monthly rewards exclude gemstone, ticket, and shovel', async () => {
 const call = createDemo(Math.random, { monthKey: '2026-11', isVIP: false });
 const ctx = await call('getContext', { eventId: 'monthly' });
 assert.equal(ctx.monthlyRewards.length, 30);
 const disallowed = new Set(['gemstone', 'ticket', 'shovel']);
 for (const r of ctx.monthlyRewards) {
  assert.equal(disallowed.has(r.rewardId), false, `Unexpected non-VIP reward: ${r.rewardId}`);
 }
});
