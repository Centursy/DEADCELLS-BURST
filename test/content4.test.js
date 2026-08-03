const test = require('node:test')
const assert = require('node:assert/strict')

const { generateMysteryShopItems, getOrCreateMysteryShop } = require('../lib/core/shop.js')
const { randomTraitChoices } = require('../lib/core/boss.js')
const { weeklyKey } = require('../lib/core/weekly.js')
const { simulateDeathmatch } = require('../lib/core/deathmatch.js')
const { createPlayer } = require('../lib/core/progression.js')

test('神秘商店生成九个独立商品，护符词条不重复', () => {
  const items = generateMysteryShopItems(Math.random)
  assert.equal(items.length, 9)
  assert.deepEqual(items.map((item) => item.slot), [1, 2, 3, 4, 5, 6, 7, 8, 9])
  const amuletTraits = items.filter((item) => item.kind === 'amulet').flatMap((item) => item.traits || [])
  assert.equal(new Set(amuletTraits).size, amuletTraits.length)
  for (const item of items.filter((entry) => entry.kind === 'weapon')) {
    assert.equal(item.weaponQuality, 'colorless')
    assert.equal(item.traits, undefined)
  }
})

test('神秘商店刷新不会尝试修改主键', async () => {
  const writes = []
  const context = {
    database: {
      get: async () => [{ id: 1, refreshKey: 'stale', items: '[]', purchased: '[]' }],
      set: async (_table, _query, patch) => writes.push(patch),
    },
  }
  const record = await getOrCreateMysteryShop(context, 10800, () => 0.1)
  assert.equal(record.id, 1)
  assert.equal(writes.length, 1)
  assert.equal(Object.hasOwn(writes[0], 'id'), false)
})

test('死斗词条奖励排除当前护符和无色武器词条', () => {
  const choices = randomTraitChoices(() => 0, 10, ['attack-1', 'insight-1'])
  assert.equal(choices.length, 10)
  assert.equal(choices.includes('attack-1'), false)
  assert.equal(choices.includes('insight-1'), false)
  assert.equal(new Set(choices).size, 10)
})

test('群周榜按东八区周一切换', () => {
  assert.equal(weeklyKey(Date.parse('2026-07-27T00:00:00+08:00')), '2026-07-27')
  assert.equal(weeklyKey(Date.parse('2026-08-02T23:59:59+08:00')), '2026-07-27')
  assert.equal(weeklyKey(Date.parse('2026-08-03T00:00:00+08:00')), '2026-08-03')
})

test('死斗模拟返回 Boss 阶段和参与者结算数据', () => {
  const first = { ...createPlayer('1', '甲'), cells: 5000 }
  const second = { ...createPlayer('2', '乙'), cells: 5000, weaponId: 'cursed-sword' }
  const config = {
    skillRate: 30,
    itemUseRate: 42,
    maxBattleTurns: 100,
  }
  const result = simulateDeathmatch([first, second], config, () => 0.1)
  assert.ok(result.bossHp >= 300 && result.bossHp <= 700)
  assert.equal(result.participants.length, 2)
  assert.ok(result.events.length > 0)
})
