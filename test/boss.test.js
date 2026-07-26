const test = require('node:test')
const assert = require('node:assert/strict')

const { createPlayer } = require('../lib/core/progression')
const { calculateBossReward, randomTraitChoices, simulateBossRaid, parseBossChoiceState } = require('../lib/core/boss')

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
