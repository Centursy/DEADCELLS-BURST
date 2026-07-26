import { Schema } from 'koishi'
import type { GameConfig } from './types'

export interface Config extends GameConfig {
  commandCharacter: string
  commandExplore: string
  commandUpgrade: string
  commandDuel: string
  commandAlchemy: string
  commandForge: string
  commandBoss: string
}

export const Config: Schema<Config> = Schema.object({
  commandCharacter: Schema.string().default('deadcells').description('创建角色和查询状态的指令'),
  commandExplore: Schema.string().default('修炼').description('探索地图获得细胞的指令'),
  commandUpgrade: Schema.string().default('boss细胞').description('提升细胞等级的指令'),
  commandDuel: Schema.string().default('对战').description('发起玩家对战的指令'),
  commandAlchemy: Schema.string().default('护符炼化').description('消耗细胞炼化护符，可追加1-5次批量生成候选'),
  commandForge: Schema.string().default('锻造装备').description('消耗细胞从每组三个装备中选择一个，可追加1-5次批量生成'),
  commandBoss: Schema.string().default('boss讨伐').description('参加今日全服共享 Boss 讨伐'),
  exploreCooldownSeconds: Schema.number().min(0).default(30).description('修炼冷却时间（秒）'),
  battleCooldownSeconds: Schema.number().min(0).default(60).description('对战冷却时间（秒）'),
  upgradeConfirmTimeout: Schema.number().min(1).default(30).description('升级确认等待时间（秒）'),
  equipmentConfirmTimeout: Schema.number().min(1).default(30).description('装备替换确认等待时间（秒）'),
  equipmentDropRate: Schema.number().min(0).max(100).default(42).description('胜利后装备掉落概率（%）'),
  cellTransferRate: Schema.number().min(0).max(100).default(20).description('胜者从战败者获得细胞的比例（%）'),
  nutcrackerStunRate: Schema.number().min(0).max(100).default(30).description('胡桃夹子命中后的眩晕概率（%）'),
  skillRate: Schema.number().min(0).max(100).default(30).description('刺客匕首和武士刀技能触发概率（%）'),
  maxBattleTurns: Schema.number().min(1).max(1000).default(100).description('单场战斗最大回合数'),
  forwardBattleLog: Schema.boolean().default(true).description('兼容旧配置；图片模式下战斗日志会直接渲染到结果图中'),
  enableImages: Schema.boolean().default(true).description('开启后使用 Puppeteer 渲染角色状态和战斗结果图片；未安装时自动回退文字'),
  alchemyCost: Schema.number().min(0).default(3000).description('护符炼化消耗细胞'),
  forgeCost: Schema.number().min(0).default(1000).description('装备锻造消耗细胞'),
  itemUseRate: Schema.number().min(0).max(100).default(42).description('每次行动自动使用道具的概率（%）'),
  exploreDurationSeconds: Schema.number().min(1).default(600).description('派遣探索每张地图的推进时间（秒）'),
  dailyExploreLimit: Schema.number().min(1).default(3).description('每日探索结算次数上限'),
  bossRaidCooldownSeconds: Schema.number().min(0).default(600).description('Boss讨伐冷却时间（秒）'),
})

export const usage = `
<h2>DEADCELLS BURST / 爆裂塞尔丝</h2>
<p>一个拥有探索、细胞成长和自动回合制玩家对战的小游戏。</p>
<ul>
  <li><code>deadcells</code>：创建角色或查询状态</li>
  <li><code>修炼</code>：探索地图并获取细胞</li>
  <li><code>boss细胞</code>：消耗当前细胞升级</li>
  <li><code>对战 @用户</code>：与另一名玩家进行自动战斗</li>
  <li><code>护符炼化 [次数]</code>：消耗细胞生成护符候选，次数上限为 5</li>
  <li><code>锻造装备 [次数]</code>：每次生成三个不重复装备，次数上限为 5</li>
  <li><code>boss讨伐</code>：参加今日全服共享 Boss 讨伐</li>
</ul>
`
