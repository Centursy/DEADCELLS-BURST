import { maps, bossComment, type MapDefinition } from '../data/maps'
import { getAmuletCellMultiplier, getLevelConfig } from './progression'
import type { DeadcellsPlayer, Random } from '../types'

export type ExplorationStrategy = 'cells' | 'depth'

export interface ExplorationDispatchState {
  strategy: ExplorationStrategy
  reached: string[]
  rewards: number[]
  bosses: ExplorationBossResult[]
  currentMap: string
  nextAt: number
  startedAt: number
  channelId?: string
  guildId?: string
}

export interface ExplorationBossResult {
  mapName: string
  bossName: string
  won: boolean
  reward: number
}

export interface ExplorationResult {
  reached: string[]
  rewards: number[]
  baseCells: number
  bossReward: number
  multiplier: number
  cellsGained: number
  bossAttempted: boolean
  bossWon: boolean
  bossName?: string
  finalBossName?: string
  finalBossMap?: string
  completed: boolean
  bosses: ExplorationBossResult[]
  comment: string
}

const BOSS_RATE = 0.6
const DISPATCH_MAP_REWARD_MULTIPLIER = 20

function nextMap(current: MapDefinition, random: Random): MapDefinition | undefined {
  if (!current.next.length || random() >= current.arrivalRate) return undefined
  const name = current.next[Math.min(current.next.length - 1, Math.floor(random() * current.next.length))]
  return maps.find((map) => map.name === name)
}

function nextDispatchMap(current: MapDefinition, strategy: ExplorationStrategy, random: Random): MapDefinition | undefined {
  const arrivalRate = strategy === 'depth' ? Math.min(0.9, current.arrivalRate + 0.1) : current.arrivalRate
  if (!current.next.length || random() >= arrivalRate) return undefined
  const name = current.next[Math.min(current.next.length - 1, Math.floor(random() * current.next.length))]
  return maps.find((map) => map.name === name)
}

export function parseExplorationState(value: string | null | undefined): ExplorationDispatchState | undefined {
  if (!value) return undefined
  try {
    const state = JSON.parse(value) as ExplorationDispatchState
    if (!state || !Array.isArray(state.reached) || !Array.isArray(state.rewards) || !Array.isArray(state.bosses)) return undefined
    return state
  } catch {
    return undefined
  }
}

export function serializeExplorationState(state: ExplorationDispatchState): string {
  return JSON.stringify(state)
}

export function createExplorationState(
  strategy: ExplorationStrategy,
  now: number,
  durationSeconds: number,
  channelId?: string,
  guildId?: string,
): ExplorationDispatchState {
  return {
    strategy,
    reached: [maps[0].name],
    rewards: [maps[0].reward],
    bosses: [],
    currentMap: maps[0].name,
    nextAt: now + durationSeconds * 1000,
    startedAt: now,
    channelId,
    guildId,
  }
}

export function advanceExplorationState(
  player: DeadcellsPlayer,
  state: ExplorationDispatchState,
  random: Random,
  now: number,
  durationSeconds: number,
): { state: ExplorationDispatchState; finished: boolean; result?: ExplorationResult } {
  const current = maps.find((map) => map.name === state.currentMap) || maps[0]
  const nextState: ExplorationDispatchState = {
    ...state,
    reached: [...state.reached],
    rewards: [...state.rewards],
    bosses: state.bosses.map((boss) => ({ ...boss })),
  }

  const fail = (comment = current.comment) => ({
    state: nextState,
    finished: true,
    result: dispatchExplorationResult(player, nextState, comment),
  })

  if (current.boss) {
    const defeated = random() < BOSS_RATE
    if (!defeated) {
      nextState.bosses.push({ mapName: current.name, bossName: current.boss, won: false, reward: 0 })
      return fail()
    }
    const following = nextDispatchMap(current, state.strategy, random)
    if (!following && current.next.length) {
      nextState.bosses.push({ mapName: current.name, bossName: current.boss, won: false, reward: 0 })
      return fail()
    }
    nextState.bosses.push({ mapName: current.name, bossName: current.boss, won: true, reward: current.bossReward || 0 })
    if (!following) return {
      state: nextState,
      finished: true,
      result: dispatchExplorationResult(player, nextState, bossComment, current.name, current.boss),
    }
    nextState.currentMap = following.name
    nextState.reached.push(following.name)
    nextState.rewards.push(following.reward)
    nextState.nextAt = now + durationSeconds * 1000
    return { state: nextState, finished: false }
  }

  const following = nextDispatchMap(current, state.strategy, random)
  if (!following) return fail()
  nextState.currentMap = following.name
  nextState.reached.push(following.name)
  nextState.rewards.push(following.reward)
  nextState.nextAt = now + durationSeconds * 1000
  return { state: nextState, finished: false }
}

export function dispatchExplorationResult(
  player: DeadcellsPlayer,
  state: ExplorationDispatchState,
  comment: string,
  finalBossMap?: string,
  finalBossName?: string,
): ExplorationResult {
  const baseCells = state.rewards.reduce((sum, reward) => sum + reward, 0) * DISPATCH_MAP_REWARD_MULTIPLIER
  const bossReward = state.bosses.reduce((sum, boss) => sum + boss.reward, 0)
  const strategyMultiplier = state.strategy === 'cells' ? 1.5 : 1
  const multiplier = getLevelConfig(player.bossCellLevel).multiplier
  const greedMultiplier = getAmuletCellMultiplier(player)
  const cellsGained = Math.round((baseCells + bossReward) * strategyMultiplier * multiplier * greedMultiplier)
  const lastBoss = state.bosses[state.bosses.length - 1]
  const completed = Boolean(finalBossMap)
  return {
    reached: state.reached,
    rewards: state.rewards,
    baseCells,
    bossReward,
    multiplier,
    cellsGained,
    bossAttempted: state.bosses.length > 0,
    bossWon: lastBoss?.won || false,
    bossName: lastBoss?.bossName,
    finalBossName,
    finalBossMap,
    completed,
    bosses: state.bosses,
    comment,
  }
}

export function explore(player: DeadcellsPlayer, random: Random): ExplorationResult {
  const reached = [maps[0].name]
  const rewards = [maps[0].reward]
  const bosses: ExplorationBossResult[] = []
  let current = maps[0]
  let bossAttempted = false
  let bossWon = false
  let bossReward = 0
  let finalBossName: string | undefined
  let finalBossMap: string | undefined
  let completed = false

  while (true) {
    if (current.boss) {
      bossAttempted = true
      const defeated = random() < BOSS_RATE
      const reward = current.bossReward || 0

      if (!defeated) {
        bosses.push({ mapName: current.name, bossName: current.boss, won: false, reward: 0 })
        bossWon = false
        break
      }

      const following = nextMap(current, random)
      if (!following && current.next.length) {
        // Regional bosses require the next map to be reached before they count as cleared.
        bosses.push({ mapName: current.name, bossName: current.boss, won: false, reward: 0 })
        bossWon = false
        break
      }

      bosses.push({ mapName: current.name, bossName: current.boss, won: true, reward })
      bossWon = true
      bossReward += reward

      if (!following) {
        completed = true
        finalBossName = current.boss
        finalBossMap = current.name
        break
      }

      current = following
      reached.push(current.name)
      rewards.push(current.reward)
      continue
    }

    const following = nextMap(current, random)
    if (!following) break
    current = following
    reached.push(current.name)
    rewards.push(current.reward)
  }

  const baseCells = rewards.reduce((sum, reward) => sum + reward, 0)
  const multiplier = getLevelConfig(player.bossCellLevel).multiplier
  const greedMultiplier = getAmuletCellMultiplier(player)
  const cellsGained = Math.round((baseCells + bossReward) * multiplier * greedMultiplier)
  const lastBoss = bosses[bosses.length - 1]

  return {
    reached,
    rewards,
    baseCells,
    bossReward,
    multiplier,
    cellsGained,
    bossAttempted,
    bossWon,
    bossName: lastBoss?.bossName,
    finalBossName,
    finalBossMap,
    completed,
    bosses,
    comment: completed ? bossComment : current.comment,
  }
}
