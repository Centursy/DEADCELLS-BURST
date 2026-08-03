const test = require('node:test')
const assert = require('node:assert/strict')

const { explore } = require('../lib/core/exploration')
const { createPlayer, getPlayerStats } = require('../lib/core/progression')
const { simulateBattle } = require('../lib/core/battle')

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
  enableImages: false,
  itemUseRate: 42,
}

function queuedRandom(values, fallback = 0.99) {
  let index = 0
  return () => values[index++] ?? fallback
}

function eventText(result) {
  return result.events.map((event) => event.text).join('\n')
}

test('探索奖励是已到达地图奖励累计后乘细胞等级倍率', () => {
  const player = createPlayer('a', 'A')
  player.bossCellLevel = 1
  let index = 0
  const rolls = [0.1, 0.9, 0.99]
  const result = explore(player, () => rolls[index++] ?? 0.99)
  assert.deepEqual(result.reached, ['被囚者的牢房', '猛毒下水道'])
  assert.equal(result.baseCells, 30)
  assert.equal(result.multiplier, 2)
  assert.equal(result.cellsGained, 60)
})

test('5 细胞等级探索倍率为 5', () => {
  const player = createPlayer('a', 'A')
  player.bossCellLevel = 5
  const result = explore(player, () => 0.99)
  assert.equal(result.multiplier, 5)
  assert.equal(result.cellsGained, 150)
})

test('探索出口均等选择且进入下一张地图的概率为80%', () => {
  const player = createPlayer('a', 'A')
  const rolls = [0, 0.5, 0.79, 0, 0.8]
  const result = explore(player, () => rolls.shift() ?? 0.99)
  assert.deepEqual(result.reached, ['被囚者的牢房', '猛毒下水道', '壁垒'])
})

test('区域 Boss 只有击败并成功进入下一张地图才算通过', () => {
  const player = createPlayer('a', 'A')
  const rolls = [0, 0, 0, 0, 0, 0, 0, 0.99]
  const result = explore(player, () => rolls.shift() ?? 0.99)
  assert.deepEqual(result.reached, ['被囚者的牢房', '有罪者的大道', '壁垒', '黑色大桥'])
  assert.deepEqual(result.bosses, [{ mapName: '黑色大桥', bossName: '大桥守卫', won: false, reward: 0 }])
  assert.equal(result.bossReward, 0)
})

test('区域 Boss 通过后进入下一张地图可获得100基础细胞', () => {
  const player = createPlayer('a', 'A')
  const rolls = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0.99]
  const result = explore(player, () => rolls.shift() ?? 0.99)
  assert.equal(result.reached.at(-1), '雾萦港湾')
  assert.deepEqual(result.bosses[0], { mapName: '黑色大桥', bossName: '大桥守卫', won: true, reward: 100 })
  assert.equal(result.bossReward, 100)
})

test('收藏家通关获得500基础细胞并生成终局结果', () => {
  const player = createPlayer('a', 'A')
  const result = explore(player, () => 0)
  assert.equal(result.completed, true)
  assert.equal(result.finalBossMap, '观星台')
  assert.equal(result.finalBossName, '收藏家')
  assert.equal(result.bosses.at(-1).reward, 500)
})

test('多个贪婪词条按乘法累计', () => {
  const player = createPlayer('a', 'A')
  player.amuletTraits = JSON.stringify(['greed-1', 'greed-2'])
  const result = explore(player, () => 0.99)
  assert.equal(result.cellsGained, 180)
})

test('对战转移细胞也按多个贪婪词条连乘', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  first.weaponId = 'cursed-sword'
  first.amuletTraits = JSON.stringify(['greed-1', 'greed-2'])
  second.cells = 10
  const result = simulateBattle(first, second, config, () => 0)
  assert.equal(result.winnerId, 'a')
  assert.equal(result.cellTransfer, 12)
})

test('荆棘反伤导致双方同时死亡时主动攻击者获胜', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  first.weaponId = 'cursed-sword'
  second.weaponId = 'cursed-sword'
  second.amuletTraits = JSON.stringify(['thorns-3'])
  const result = simulateBattle(first, second, config, () => 0)
  assert.equal(result.winnerId, 'a')
  assert.match(eventText(result), /荆棘.*反弹/)
})

test('诅咒之刃将最大生命值变为 1', () => {
  const player = createPlayer('a', 'A')
  player.weaponId = 'cursed-sword'
  const stats = getPlayerStats(player)
  assert.equal(stats.maxHp, 1)
  assert.equal(stats.attack, 60)
})

test('细胞等级的战斗增益按每级累加', () => {
  const player = createPlayer('a', 'A')
  player.bossCellLevel = 1
  let stats = getPlayerStats(player)
  assert.equal(stats.maxHp, 60)
  assert.equal(stats.critChance, 5)
  assert.equal(stats.attack, 18)

  player.bossCellLevel = 2
  stats = getPlayerStats(player)
  assert.equal(stats.maxHp, 70)
  assert.equal(stats.critChance, 10)
  assert.equal(stats.attack, 21)
})

test('对战胜者获得战败者当前细胞的 20% 并向上取整', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  first.weaponId = 'cursed-sword'
  second.cells = 11
  const result = simulateBattle(first, second, config, () => 0)
  assert.equal(result.winnerId, 'a')
  assert.equal(result.cellTransfer, 3)
  assert.equal(result.attacker.cells, 1003)
  assert.equal(result.defender.cells, 8)
})

test('战斗状态日志始终按双方初始顺序显示', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  const result = simulateBattle(first, second, { ...config, maxBattleTurns: 4 }, () => 0.99)
  const states = result.events.map((event) => event.text).filter((text) => text.startsWith('【状态】'))
  assert.ok(states.length > 1)
  for (const state of states) assert.match(state, /^【状态】A HP:\d+\/\d+ \| B HP:\d+\/\d+$/)
})

test('非盾牌副手独立占用回合并冷却3回合', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  first.shieldId = 'ice-bow'
  const result = simulateBattle(first, second, { ...config, maxBattleTurns: 5 }, () => 0)
  const offhandEvents = result.events.filter((event) => event.text.includes('使用副手【冰之弓】'))
  assert.equal(offhandEvents.length, 1)
  const firstUse = result.events.findIndex((event) => event.text.includes('使用副手【冰之弓】'))
  const firstAttack = result.events.findIndex((event, index) => index > firstUse && event.text.includes('发动第1段攻击'))
  assert.ok(firstAttack > firstUse)
  assert.equal(result.attacker.offhandCooldown, 1)
})

test('尖刺盾反弹原攻击的最终伤害且不重复套用倍率', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  second.shieldId = 'spiked-shield'
  second.item1Id = 'heavy-turret'
  const result = simulateBattle(first, second, { ...config, maxBattleTurns: 2, itemUseRate: 100 }, queuedRandom([0.99, 0, 0, 0, 0]))
  const text = eventText(result)
  assert.match(text, /尖刺盾反弹本次最终伤害！/)
  assert.match(text, /A 受到 15 点伤害！/)
})

test('钉入矛只在被格挡时穿透并造成暴击', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  first.weaponId = 'impaling-spear'
  second.shieldId = 'old-wooden-shield'
  const result = simulateBattle(first, second, { ...config, maxBattleTurns: 1 }, () => 0)
  assert.match(eventText(result), /钉入矛穿透格挡并造成暴击！/)
  assert.match(eventText(result), /B 受到 36 点伤害！/)
})

test('斯巴达草鞋后手触发提前攻击并跳过本回合普通攻击', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  second.weaponId = 'spartan-sandals'
  const result = simulateBattle(first, second, { ...config, maxBattleTurns: 2 }, () => 0)
  const text = eventText(result)
  assert.match(text, /使用斯巴达草鞋提前攻击！/)
  assert.doesNotMatch(text, /B 发动第1段攻击！/)
  assert.match(text, /A 被斯巴达草鞋眩晕一回合！/)
})

test('先发制人只强化首次造成的伤害', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  first.amuletTraits = JSON.stringify(['first-strike'])
  const result = simulateBattle(first, second, { ...config, maxBattleTurns: 1 }, () => 0)
  assert.match(eventText(result), /B 受到 23 点伤害！/)
})

test('宣战呼应只强化下一次暴击', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  first.weaponId = 'rusty-knife'
  first.amuletTraits = JSON.stringify(['insight-3'])
  second.weaponId = 'explosive-crossbow'
  second.amuletTraits = JSON.stringify(['war-cry'])
  const result = simulateBattle(first, second, { ...config, maxBattleTurns: 4 }, queuedRandom([0, 0, 0.99]))
  assert.match(eventText(result), /B 受到 30 点伤害！/)
  assert.match(eventText(result), /A 受到 40 点伤害！/)
  assert.match(eventText(result), /A 受到 20 点伤害！/)
})

test('电鞭按10%四倍、20%两倍的总伤害概率结算', () => {
  const fourfoldFirst = createPlayer('a', 'A')
  const fourfoldSecond = createPlayer('b', 'B')
  fourfoldFirst.weaponId = 'electric-whip'
  const fourfold = simulateBattle(fourfoldFirst, fourfoldSecond, { ...config, maxBattleTurns: 1 }, () => 0)
  assert.equal(eventText(fourfold).match(/B 受到 10 点伤害！/g)?.length, 4)

  const doubleFirst = createPlayer('c', 'C')
  const doubleSecond = createPlayer('d', 'D')
  doubleFirst.weaponId = 'electric-whip'
  const doubled = simulateBattle(doubleFirst, doubleSecond, { ...config, maxBattleTurns: 1 }, queuedRandom([0, 0, 0.2]))
  assert.equal(eventText(doubled).match(/D 受到 10 点伤害！/g)?.length, 2)
})

test('前线盾的伤害提升持续三个持有者回合后恢复', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  first.weaponId = 'twin-daggers'
  second.weaponId = 'twin-daggers'
  second.shieldId = 'frontline-shield'
  const result = simulateBattle(
    first,
    second,
    { ...config, maxBattleTurns: 8 },
    queuedRandom([0, 0.99, 0]),
  )
  const text = eventText(result)
  assert.equal(text.match(/A 受到 8 点伤害！/g)?.length, 6)
  assert.equal(text.match(/A 受到 5 点伤害！/g)?.length, 1)
})

test('吸血道具按实际造成的伤害回复', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  first.item1Id = 'vampirism-item'
  second.shieldId = 'force-shield'
  const result = simulateBattle(
    first,
    second,
    { ...config, maxBattleTurns: 2, itemUseRate: 100 },
    queuedRandom([0.99, 0.0, 0.0, 0.0]),
  )
  assert.match(eventText(result), /A 通过【吸血（道具）】回复 11 点生命！/)
})

test('护符吸血按实际伤害结算，不按减伤前面板伤害结算', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  first.shieldId = 'force-shield'
  second.amuletTraits = JSON.stringify(['amulet-vampirism'])
  const result = simulateBattle(first, second, { ...config, maxBattleTurns: 2 }, queuedRandom([0, 0.99, 0.99]))
  assert.match(eventText(result), /B 通过【吸血（词条）】回复 5 点生命！/)
  assert.doesNotMatch(eventText(result), /B 通过【吸血（词条）】回复 8 点生命！/)
})

test('寒气练成每个持有者回合的首次伤害都能翻倍', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  first.amuletTraits = JSON.stringify(['cold-forging'])
  const result = simulateBattle(first, second, { ...config, maxBattleTurns: 4 }, () => 0)
  assert.equal(eventText(result).match(/寒气练成/g)?.length, 2)
})

test('位移只强化下一次主武器攻击，不会强化道具或持续伤害', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  first.item1Id = 'displacement'
  first.item2Id = 'powerful-grenade'
  const result = simulateBattle(first, second, { ...config, maxBattleTurns: 3, itemUseRate: 100 }, () => 0)
  assert.match(eventText(result), /B 受到 23 点伤害！/)
  assert.doesNotMatch(eventText(result), /B 受到 45 点伤害！/)
})

test('夜歌和死里逃生可以按顺序各自抵挡一次致命伤害', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  first.bossCellLevel = 5
  second.item1Id = 'serenade'
  second.amuletTraits = JSON.stringify(['last-stand'])
  const result = simulateBattle(first, second, { ...config, maxBattleTurns: 10, itemUseRate: 100 }, () => 0)
  const text = eventText(result)
  assert.match(text, /B 的夜歌抵挡了致命伤害，保留1点生命！/)
  assert.match(text, /B 的【死里逃生】触发，保留1点生命！/)
  assert.equal(result.winnerId, 'a')
})

test('时光之末只重开一次并恢复到开局状态', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  second.amuletTraits = JSON.stringify(['end-of-time'])
  const result = simulateBattle(first, second, { ...config, maxBattleTurns: 20 }, () => 0)
  const text = eventText(result)
  assert.equal(text.match(/时光之末】触发/g)?.length, 1)
  assert.equal(result.winnerId, 'a')
})

test('细胞保险箱阻止战败者损失细胞', () => {
  const first = createPlayer('a', 'A')
  const second = createPlayer('b', 'B')
  first.weaponId = 'cursed-sword'
  second.cells = 11
  second.amuletTraits = JSON.stringify(['cell-safe'])
  const result = simulateBattle(first, second, { ...config, maxBattleTurns: 1 }, () => 0)
  assert.equal(result.cellTransfer, 0)
  assert.equal(result.defender.cells, 11)
})
