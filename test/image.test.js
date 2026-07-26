const test = require('node:test')
const assert = require('node:assert/strict')

const { renderPlayerCard, renderBattleCard, renderEquipmentDropCard, renderExploreCard, renderAmuletCard, renderForgeCard, renderBossRaidCard, renderBossTraitChoiceCard } = require('../lib/output/image')
const { createPlayer } = require('../lib/core/progression')
const { simulateBattle } = require('../lib/core/battle')
const { explore } = require('../lib/core/exploration')

const config = {
  exploreCooldownSeconds: 30,
  battleCooldownSeconds: 60,
  upgradeConfirmTimeout: 30,
  equipmentConfirmTimeout: 30,
  equipmentDropRate: 42,
  cellTransferRate: 20,
  nutcrackerStunRate: 30,
  skillRate: 30,
  maxBattleTurns: 100,
  forwardBattleLog: true,
  enableImages: true,
}

function mockContext() {
  let html = ''
  const page = {
    setViewport: async () => {},
    setContent: async (content) => { html = content },
    $: async () => ({ screenshot: async () => Buffer.from('png') }),
    close: async () => {},
  }
  return {
    context: { puppeteer: { page: async () => page }, logger: { warn: () => {} } },
    getHtml: () => html,
  }
}

test('个人卡片包含本地素材和头像占位', async () => {
  const player = createPlayer('user-a', 'A')
  player.item1Id = 'powerful-grenade'
  player.item2Id = 'health-flask'
  player.amuletId = 'amulet-1'
  player.amuletTraits = JSON.stringify(['attack-1', 'endurance'])
  const mock = mockContext()
  const result = await renderPlayerCard(mock.context, player)
  assert.equal(result.type, 'img')
  assert.match(mock.getHtml(), /avatar-fallback/)
  assert.match(mock.getHtml(), /data:image\/(?:webp|png)/)
  assert.match(mock.getHtml(), /powerful-grenade|强力手雷/)
  assert.match(mock.getHtml(), /endurance|耐力/)
})

test('战斗卡片包含双方头像区域、胜者皇冠和完整日志', async () => {
  const first = createPlayer('user-a', 'A')
  const second = createPlayer('user-b', 'B')
  const battle = simulateBattle(first, second, config, () => 0)
  const mock = mockContext()
  const result = await renderBattleCard(mock.context, first, second, battle)
  assert.equal(result.type, 'img')
  assert.equal((mock.getHtml().match(/<div class="fighter-profile"/g) || []).length, 2)
  assert.match(mock.getHtml(), /class="crown"/)
  assert.match(mock.getHtml(), /COMBAT LOG \/\/ FULL RECORD/)
  assert.match(mock.getHtml(), /class="round-state"/)
  assert.match(mock.getHtml(), /class="hp-fill/)
})

test('战斗图片会把反向状态日志重新排列为固定顺序', async () => {
  const first = createPlayer('user-a', 'A')
  const second = createPlayer('user-b', 'B')
  const battle = simulateBattle(first, second, config, () => 0)
  battle.events = battle.events.map((event) => {
    const swapped = event.text.replace(/^【状态】A HP:(\d+)\/(\d+) \| B HP:(\d+)\/(\d+)$/, '【状态】B HP:$3/$4 | A HP:$1/$2')
    return { ...event, text: swapped }
  })
  const mock = mockContext()
  await renderBattleCard(mock.context, first, second, battle)
  assert.match(mock.getHtml(), /<div class="round-state"><div class="hp-state"><span>A<\/span>[\s\S]*<div class="hp-state"><span>B<\/span>/)
})

test('炼化和锻造卡片包含新装备信息', async () => {
  const player = createPlayer('user-a', 'A')
  const mock = mockContext()
  const amulet = await renderAmuletCard(mock.context, player, { id: 'amulet-2', traits: ['insight-2'] })
  assert.equal(amulet.type, 'img')
  assert.match(mock.getHtml(), /AMULET<span> REFORGED/)
  assert.match(mock.getHtml(), /看破2/)

  const forge = await renderForgeCard(mock.context, player, [
    { id: 'powerful-grenade', name: '强力手雷', type: 'item', description: '造成攻击力150%的伤害' },
    { id: 'ice-bow', name: '冰之弓', type: 'offhand', description: '造成10伤害，冰冻对手一回合' },
    { id: 'great-sword', name: '大剑', type: 'weapon', description: '攻击力+8' },
  ])
  assert.equal(forge.type, 'img')
  assert.match(mock.getHtml(), /FORGE<span> EQUIPMENT/)
  assert.match(mock.getHtml(), /冰之弓/)
})

test('批量锻造卡片展示全部装备选项并标记分组', async () => {
  const player = createPlayer('user-a', 'A')
  const choices = [
    'rusty-knife', 'great-sword', 'nutcracker',
    'ice-bow', 'powerful-grenade', 'health-flask',
    'cursed-sword', 'katana', 'spiked-shield',
  ].map((id) => require('../lib/data/equipment').getEquipment(id))
  const mock = mockContext()
  const result = await renderForgeCard(mock.context, player, choices, 3, 3000)
  assert.equal(result.type, 'img')
  assert.equal((mock.getHtml().match(/class="choice-card"/g) || []).length, 9)
  assert.match(mock.getHtml(), /GROUP 3/)
  assert.match(mock.getHtml(), /-3000 CELLS/)
})

test('批量护符炼化卡片展示全部候选', async () => {
  const player = createPlayer('user-a', 'A')
  const mock = mockContext()
  const result = await require('../lib/output/image').renderAmuletChoicesCard(mock.context, player, [
    { id: 'amulet-1', traits: ['attack-1'] },
    { id: 'amulet-2', traits: ['insight-2'] },
    { id: 'amulet-3', traits: ['cold-forging'] },
  ], 9000)
  assert.equal(result.type, 'img')
  assert.equal((mock.getHtml().match(/class="amulet-choice-card"/g) || []).length, 3)
  assert.match(mock.getHtml(), /-9000 CELLS/)
})

test('装备掉落使用独立奖励卡片', async () => {
  const winner = createPlayer('user-a', 'A')
  const mock = mockContext()
  const result = await renderEquipmentDropCard(mock.context, winner, {
    id: 'great-sword',
    name: '大剑',
    type: 'weapon',
    description: '攻击力+8',
  }, false)
  assert.equal(result.type, 'img')
  assert.match(mock.getHtml(), /EQUIPMENT<span> ACQUIRED/)
  assert.match(mock.getHtml(), /大剑/)
})

test('修炼卡片只展示实际地图路线和实际遭遇的 Boss', async () => {
  const player = createPlayer('user-a', 'A')
  const rolls = [...Array(23).fill(0), 0.99]
  const exploration = explore(player, () => rolls.shift() ?? 0.9)
  const mock = mockContext()
  const result = await renderExploreCard(mock.context, { ...player, cells: exploration.cellsGained }, exploration)
  assert.equal(result.type, 'img')
  assert.equal((mock.getHtml().match(/class="route-node /g) || []).length, exploration.reached.length)
  assert.match(mock.getHtml(), /大桥守卫/)
  assert.match(mock.getHtml(), /时间守护者/)
  assert.match(mock.getHtml(), /国王之手/)
  assert.match(mock.getHtml(), /MAP ROUTE 11 MAPS/)
  assert.doesNotMatch(mock.getHtml(), /class="route-node locked"/)
})

test('成功讨伐收藏家使用红色通关庆祝卡', async () => {
  const player = createPlayer('user-a', 'A')
  const exploration = explore(player, () => 0)
  const mock = mockContext()
  const result = await renderExploreCard(mock.context, { ...player, cells: exploration.cellsGained }, exploration)
  assert.equal(result.type, 'img')
  assert.match(mock.getHtml(), /completion-card/)
  assert.match(mock.getHtml(), /观星台 \/\/ FINAL ENCOUNTER/)
  assert.match(mock.getHtml(), /final-red/)
  assert.match(mock.getHtml(), /收藏家/)
  assert.match(mock.getHtml(), /成功通关！/)
  assert.match(mock.getHtml(), /FINAL BOSS REWARD<\/div><div class="clear-reward-value">\+500/)
  assert.match(mock.getHtml(), /clear-boss-image/)
})

test('成功讨伐女王使用对应地图和 Boss 素材', async () => {
  const player = createPlayer('user-a', 'A')
  const rolls = [0, 0.9, 0, 0.4, 0, 0, 0, 0, 0.9, 0, 0, 0.9, 0, 0, 0, 0.9, 0, 0, 0, 0, 0, 0]
  const exploration = explore(player, () => rolls.shift() ?? 0.99)
  const mock = mockContext()
  const result = await renderExploreCard(mock.context, { ...player, cells: exploration.cellsGained }, exploration)
  assert.equal(result.type, 'img')
  assert.match(mock.getHtml(), /塔顶 \/\/ FINAL ENCOUNTER/)
  assert.match(mock.getHtml(), /女王/)
  assert.match(mock.getHtml(), /final-red/)
})

test('每日 Boss 卡片包含背景、血条、Boss 立绘和排行榜', async () => {
  const player = createPlayer('user-a', 'A')
  const boss = {
    date: '2026-07-25', mapName: '黑色大桥', bossName: '大桥守卫', difficulty: 'veteran',
    maxHp: 25000, currentHp: 18000, attackMultiplier: 1.5, rewardMultiplier: 2,
    completed: false, killerId: null, killerName: null, rankings: '[]',
  }
  const mock = mockContext()
  const result = await renderBossRaidCard(mock.context, player, boss, {
    damage: 120, turns: 6, playerHp: 40, killed: false,
    events: ['Boss 正在蓄力……'],
  }, [{ userId: 'user-a', username: 'A', damage: 120 }])
  assert.equal(result.type, 'img')
  assert.match(mock.getHtml(), /SHARED DAILY TARGET/)
  assert.match(mock.getHtml(), /boss-raid-background/)
  assert.match(mock.getHtml(), /boss-raid-image/)
  assert.match(mock.getHtml(), /boss-hp-fill/)
  assert.match(mock.getHtml(), /DAMAGE RANKING/)

  const choice = await renderBossTraitChoiceCard(mock.context, player, boss, ['storm-controller', 'thorns-1', 'elf-blessing-1', 'super-crit-1', 'cold-forging'], 5000)
  assert.equal(choice.type, 'img')
  assert.match(mock.getHtml(), /TRAIT<span> SELECTION/)
})
