import type { Context } from 'koishi'
import { Config, usage } from './config'
import { registerCommands } from './commands'
import { registerExplorationDispatcher } from './core/exploration-dispatch'

export const name = 'deadcells-burst'
export { Config, usage }

export const inject = {
  required: ['database'],
  optional: ['puppeteer'],
}

export function apply(ctx: Context, config: Config) {
  ctx.model.extend('deadcells_players', {
    userId: 'string',
    username: 'string',
    cells: 'unsigned',
    bossCellLevel: 'unsigned',
    weaponId: 'string',
    shieldId: { type: 'string', nullable: true },
    item1Id: { type: 'string', nullable: true },
    item2Id: { type: 'string', nullable: true },
    amuletId: 'string',
    amuletTraits: 'string',
    battleCount: 'unsigned',
    winCount: 'unsigned',
    lastExploreAt: 'unsigned',
    lastBattleAt: 'unsigned',
    exploreState: { type: 'string', nullable: true },
    dailyExploreDate: 'string',
    dailyExploreCount: 'unsigned',
    lastBossRaidAt: 'unsigned',
    bossChoiceState: { type: 'string', nullable: true },
  }, {
    primary: ['userId'],
  })

  ctx.model.extend('deadcells_daily_bosses', {
    date: 'string',
    mapName: 'string',
    bossName: 'string',
    difficulty: 'string',
    maxHp: 'unsigned',
    currentHp: 'unsigned',
    attackMultiplier: 'float',
    rewardMultiplier: 'unsigned',
    completed: 'boolean',
    killerId: { type: 'string', nullable: true },
    killerName: { type: 'string', nullable: true },
    rankings: 'text',
  }, {
    primary: ['date'],
  })

  registerCommands(ctx, config)
  registerExplorationDispatcher(ctx, config)

  ctx.i18n.define('zh-CN', {
    commands: {
      [config.commandCharacter]: { description: '创建爆裂塞尔丝角色或查询当前状态' },
      [config.commandExplore]: { description: '探索地图并获取细胞' },
      [config.commandUpgrade]: { description: '消耗当前库存细胞提升细胞等级' },
      [config.commandDuel]: { description: '与另一名已创建角色的玩家进行自动回合制战斗' },
      [config.commandAlchemy]: { description: '消耗细胞炼化护符，可追加1-5次批量生成候选' },
      [config.commandForge]: { description: '每次生成三个不重复装备，可追加1-5次批量生成候选' },
      [config.commandBoss || 'boss讨伐']: { description: '参加今日全服共享 Boss 讨伐' },
    },
  })
}
