'use strict';
const assert = require('node:assert/strict');
const Countdown = require('../assets/compte-rebours.js');
let now = 0;
const c = new Countdown(() => now);
assert.equal(c.left(), 0);
for (const duration of [0, -1, Infinity, NaN]) assert.throws(() => c.start(duration));
c.start(30000); assert.equal(c.left(), 30000);
now = 10000; assert.equal(c.left(), 20000); assert.equal(c.elapsed(), 10000);
c.pause(); now = 200000; assert.equal(c.left(), 20000);
c.pause(); c.resume(); c.resume(); now += 5000; assert.equal(c.left(), 15000);
// Aucun tick pendant trois minutes : la date limite fait foi au retour.
now += 180000; assert.equal(c.left(), 0); assert.equal(c.elapsed(), 30000);
c.stop(); c.resume(); assert.equal(c.left(), 0);
c.start(120000); now += 9000; c.stop(); now += 9000; assert.equal(c.left(), 111000);
console.log('CHRONO OK: bornes, pause, reprise, retard des intervalles, expiration et remise a zero.');
