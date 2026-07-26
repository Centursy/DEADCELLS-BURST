import type { Context } from 'koishi'
import type { Config } from '../config'
import { registerCharacterCommand } from './character'
import { registerExploreCommand } from './explore'
import { registerUpgradeCommand } from './upgrade'
import { registerDuelCommand } from './duel'
import { registerAlchemyCommand } from './alchemy'
import { registerForgeCommand } from './forge'
import { registerBossCommand } from './boss'

export function registerCommands(ctx: Context, config: Config) {
  const busy = new Set<string>()
  registerCharacterCommand(ctx, config)
  registerExploreCommand(ctx, config, busy)
  registerUpgradeCommand(ctx, config, busy)
  registerDuelCommand(ctx, config, busy)
  registerAlchemyCommand(ctx, config, busy)
  registerForgeCommand(ctx, config, busy)
  registerBossCommand(ctx, config, busy)
}
