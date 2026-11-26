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
 await assert.rejects(call('claimReward', {eventId:'oxygen',milestone:5000}));
 const s = await call('claimReward', {eventId:'oxygen',milestone:1000}); assert.equal(s.wallet.length,1);
 await assert.rejects(call('claimReward', {eventId:'oxygen',milestone:1000}));
 await assert.rejects(call('claimReward', {eventId:'level',milestone:20}));
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
