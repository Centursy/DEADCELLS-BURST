import { h, type Session } from 'koishi'
import type { BattleResult } from '../types'

export async function sendBattleForward(session: Session, result: BattleResult): Promise<boolean> {
  const content = h('text', {
    content: result.events.map((event) => event.text).join('\n'),
  })

  try {
    await session.send(h('message', { forward: true }, [content]))
    return true
  } catch {
    return false
  }
}
