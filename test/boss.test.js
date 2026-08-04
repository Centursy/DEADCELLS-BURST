const test = require('node:test')
const assert = require('node:assert/strict')

const { createPlayer } = require('../lib/core/progression')
const { bossMutationName, calculateBossReward, createDailyBossRecord, getOrCreateDailyBoss, randomTraitChoices, simulateBossRaid, parseBossChoiceState } = require('../lib/core/boss')
const { beijingDate } = require('../lib/core/exploration-dispatch')

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

test('每日 Boss 会生成五种变异之一，贪婪会使奖励翻倍', () => {
  const record = createDailyBossRecord('2026-07-29', queuedRandom([0, 0, 0, 0]))
  assert.equal(record.mutation, 'berserk')
  assert.equal(bossMutationName(record.mutation), '狂暴')
  const player = createPlayer('a', 'A')
  assert.equal(calculateBossReward(player, 100, 1, 'greed'), 2000)
})

test('旧的每日 Boss 记录缺少变异时会补写且不修改主键', async () => {
  const date = beijingDate()
  const legacy = { date, mapName: '黑色大桥', bossName: '大桥守卫', difficulty: 'normal', maxHp: 18000, currentHp: 18000, attackMultiplier: 1, rewardMultiplier: 1, completed: false, killerId: null, killerName: null, rankings: '[]' }
  const patches = []
  const ctx = { database: {
    get: async () => [legacy],
    set: async (...args) => patches.push(args),
  } }
  const result = await getOrCreateDailyBoss(ctx, () => 0)
  assert.equal(result.mutation, 'berserk')
  assert.deepEqual(patches[0], ['deadcells_daily_bosses', { date }, { mutation: 'berserk' }])
})

test('狂暴每两回合攻击，平庸每回合攻击且伤害减半', () => {
  const player = createPlayer('a', 'A')
  const berserk = simulateBossRaid(player, boss({ mutation: 'berserk' }), { ...config, maxBattleTurns: 4 }, () => 0.99)
  const mediocre = simulateBossRaid(player, boss({ mutation: 'mediocre' }), { ...config, maxBattleTurns: 1 }, () => 0.99)
  assert.equal(berserk.events.filter((event) => event.startsWith('Boss 发动攻击')).length, 2)
  assert.equal(mediocre.events.filter((event) => event.startsWith('Boss 发动攻击')).length, 1)
  assert.equal(mediocre.playerHp, 35)
})

test('冰冻变异可以冻结玩家，耐力可以免疫', () => {
  const player = createPlayer('a', 'A')
  player.bossCellLevel = 5
  const frozen = simulateBossRaid(player, boss({ mutation: 'frozen' }), { ...config, maxBattleTurns: 4 }, () => 0)
  assert.match(frozen.events.join('\n'), /Boss 使玩家冰冻一回合/)
  assert.match(frozen.events.join('\n'), /玩家被冰冻，无法行动/)

  const immunePlayer = createPlayer('b', 'B')
  immunePlayer.amuletTraits = JSON.stringify(['endurance'])
  const immune = simulateBossRaid(immunePlayer, boss({ mutation: 'frozen' }), { ...config, maxBattleTurns: 3 }, () => 0)
  assert.match(immune.events.join('\n'), /耐力.*免疫了 Boss 的冰冻/)
})

test('出血变异沿用三回合流血且不会致死', () => {
  const player = createPlayer('a', 'A')
  const result = simulateBossRaid(player, boss({ mutation: 'bleeding', attackMultiplier: 0.1 }), { ...config, maxBattleTurns: 6 }, () => 0.99)
  assert.ok(result.playerHp >= 1)
  assert.equal(result.events.filter((event) => event === '玩家进入流血状态！').length, 2)
  assert.equal(result.events.filter((event) => event.startsWith('玩家受到流血伤害')).length, 3)
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
