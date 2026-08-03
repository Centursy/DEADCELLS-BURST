const test = require('node:test')
const assert = require('node:assert/strict')

const { rollAmulet, activeTraitIds } = require('../lib/data/amulets')
const { createEquipmentReward, getEquipment, weaponQualityEffectText } = require('../lib/data/equipment')
const { createPlayer, getPlayerStats } = require('../lib/core/progression')
const { simulateBattle } = require('../lib/core/battle')
const { simulateBossRaid } = require('../lib/core/boss')
const { renderEquipmentDropCard, renderForgeCard } = require('../lib/output/image')

const config = {
  maxBattleTurns: 4,
  skillRate: 30,
  itemUseRate: 0,
  cellTransferRate: 20,
}

function queuedRandom(values, fallback = 0.99) {
  let index = 0
  return () => values[index++] ?? fallback
}

function boss() {
  return {
    date: '2026-07-28', mapName: '黑色大桥', bossName: '大桥守卫', difficulty: 'normal',
    maxHp: 5000, currentHp: 5000, attackMultiplier: 1, rewardMultiplier: 1,
    completed: false, killerId: null, killerName: null, rankings: '[]',
  }
}

function mockContext() {
  let html = ''
  const page = {
    setViewport: async () => {},
    setContent: async (content) => { html = content },
    $: async () => ({ screenshot: async () => Buffer.from('png') }),
    close: async () => {},
  }
  return { context: { puppeteer: { page: async () => page }, logger: { warn: () => {} } }, getHtml: () => html }
}

test('护符炼化最多能产生三个不重复词条', () => {
  const generated = rollAmulet(queuedRandom([0.99, 0, 0, 0, 0.1, 0, 0.2, 0, 0]))
  assert.equal(generated.traits.length, 3)
  assert.equal(new Set(generated.traits).size, 3)
})

test('金色武器固定增加攻击和暴击，无色武器带入额外词条', () => {
  const weapon = getEquipment('great-sword')
  const gold = createEquipmentReward(weapon, () => 0.8)
  assert.equal(gold.weaponQuality, 'gold')
  const player = createPlayer('a', 'A')
  player.weaponId = gold.id
  player.weaponQuality = gold.weaponQuality
  player.weaponTrait = gold.weaponTrait
  assert.equal(getPlayerStats(player).attack, 23)
  assert.equal(getPlayerStats(player).critChance, 5)
  assert.equal(weaponQualityEffectText(gold.weaponQuality), '金色加成：攻击力+5，暴击率+5%')

  const colorless = createEquipmentReward(getEquipment('rusty-knife'), queuedRandom([0.99, 0]), ['attack-1'])
  assert.equal(colorless.weaponQuality, 'colorless')
  assert.notEqual(colorless.weaponTrait, 'attack-1')
  player.weaponId = colorless.id
  player.weaponQuality = 'colorless'
  player.weaponTrait = 'attack-1'
  assert.ok(activeTraitIds(player).includes('attack-1'))
  assert.equal(getPlayerStats(player).attack, 20)
})

test('奥利哈刚护盾与黄金律法在 PvP 战斗中实际生效', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  first.amuletTraits = JSON.stringify(['orichalcum', 'golden-order'])
  const result = simulateBattle(first, second, config, () => 0)
  const events = result.events.map((event) => event.text).join('\n')
  assert.match(events, /奥利哈刚.*获得/)
  assert.match(events, /黄金律法.*回复/)
  assert.match(events, /奥利哈刚.*吸收/)
})

test('巨人杀手令 Boss 讨伐武器攻击必定暴击', () => {
  const player = createPlayer('a', 'A')
  player.amuletTraits = JSON.stringify(['giant-slayer'])
  const result = simulateBossRaid(player, boss(), { ...config, maxBattleTurns: 1 }, () => 0.99)
  assert.match(result.events.join('\n'), /暴击伤害/)
})

test('品质卡片同时输出文字标记和对应边框类名', async () => {
  const player = createPlayer('a', 'A')
  const mock = mockContext()
  await renderEquipmentDropCard(mock.context, player, {
    ...getEquipment('great-sword'), weaponQuality: 'colorless', weaponTrait: 'golden-order',
  }, false)
  assert.match(mock.getHtml(), /weapon-colorless/)
  assert.match(mock.getHtml(), /无色词条：黄金律法/)
  await renderForgeCard(mock.context, player, [{ ...getEquipment('rusty-knife'), weaponQuality: 'gold' }])
  assert.match(mock.getHtml(), /weapon-gold/)
  assert.match(mock.getHtml(), /金色 WEAPON/)
  assert.match(mock.getHtml(), /金色加成：攻击力[+]5，暴击率[+]5%/)
  assert.match(mock.getHtml(), /border: 4px solid #d9b45b/)
})
