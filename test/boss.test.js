const test = require('node:test')
const assert = require('node:assert/strict')

const { createPlayer } = require('../lib/core/progression')
const { calculateBossReward, createDailyBossRecord, randomTraitChoices, simulateBossRaid, parseBossChoiceState } = require('../lib/core/boss')

const config = {
  maxBattleTurns: 20,
  skillRate: 30,
  itemUseRate: 0,
}

function boss(overrides = {}) {
  return {
    date: '2026-07-25',
    mapName: '黑色大桥',
    bossName: '大桥守卫',
    difficulty: 'normal',
    maxHp: 2000,
    currentHp: 2000,
    attackMultiplier: 1,
    rewardMultiplier: 1,
    completed: false,
    killerId: null,
    killerName: null,
    rankings: '[]',
    ...overrides,
  }
}

function queuedRandom(values, fallback = 0.99) {
  let index = 0
  return () => values[index++] ?? fallback
}

test('Boss 讨伐奖励按实际削减血量、难度、细胞等级和贪婪连乘', () => {
  const player = createPlayer('a', 'A')
  player.bossCellLevel = 2
  player.amuletTraits = JSON.stringify(['greed-1', 'greed-2'])
  assert.equal(calculateBossReward(player, 100, 3), 54000)
})

test('Boss 最后一击伤害不会按超额伤害结算', () => {
  const player = createPlayer('a', 'A')
  player.weaponId = 'cursed-sword'
  const result = simulateBossRaid(player, boss({ currentHp: 1 }), config, () => 0.99)
  assert.equal(result.killed, true)
  assert.equal(result.damage, 1)
})

test('Boss 讨伐不触发直死魔眼', () => {
  const player = createPlayer('a', 'A')
  player.amuletTraits = JSON.stringify(['instant-death'])
  const result = simulateBossRaid(player, boss({ currentHp: 100 }), config, () => 0)
  assert.equal(result.damage > 0, true)
  assert.doesNotMatch(result.events.join('\n'), /即死/)
})

test('每日 Boss 不会与前一天重复，剩余 Boss 仍从可选池中抽取', () => {
  const record = createDailyBossRecord('2026-07-29', () => 0.99, '灯塔')
  assert.notEqual(record.mapName, '灯塔')
})

test('Boss 三档生命按原范围的 1.5 倍生成', () => {
  assert.equal(createDailyBossRecord('2026-07-29', queuedRandom([0, 0, 0])).maxHp, 18000)
  assert.equal(createDailyBossRecord('2026-07-29', queuedRandom([0, 0.34, 0])).maxHp, 69000)
  assert.equal(createDailyBossRecord('2026-07-29', queuedRandom([0, 0.67, 0])).maxHp, 105000)
})

test('寒气练成在 Boss 讨伐中每回合都能触发一次', () => {
  const player = createPlayer('a', 'A')
  player.amuletTraits = JSON.stringify(['cold-forging'])
  const result = simulateBossRaid(player, boss(), { ...config, maxBattleTurns: 2 }, () => 0.99)
  assert.equal(result.damage, 60)
  assert.equal(result.events.filter((event) => event.includes('寒气练成')).length, 2)
})

test('Boss 战道具每场只能使用一次', () => {
  const player = createPlayer('a', 'A')
  player.item1Id = 'powerful-grenade'
  const result = simulateBossRaid(player, boss(), { ...config, maxBattleTurns: 3, itemUseRate: 100 }, () => 0.99)
  assert.equal(result.damage, 53)
})

test('Boss 词条选项来自全池且互不重复', () => {
  const choices = randomTraitChoices(() => 0.1)
  assert.equal(choices.length, 5)
  assert.equal(new Set(choices).size, 5)
})

test('Boss 词条选择状态可以持久化解析', () => {
  const state = parseBossChoiceState(JSON.stringify({ date: '2026-07-25', choices: ['attack-1'], rewardCells: 100, expiresAt: Date.now() + 1000 }))
  assert.deepEqual(state.choices, ['attack-1'])
  assert.equal(state.rewardCells, 100)
})
