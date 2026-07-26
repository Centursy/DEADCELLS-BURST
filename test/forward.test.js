const test = require('node:test')
const assert = require('node:assert/strict')
const { h } = require('koishi')

test('QQ 合并转发将整场战斗合并为一个文本节点', () => {
  const forward = h('message', { forward: true }, [
    h('text', { content: '战斗开始\n战斗结束' }),
  ])
  assert.equal(forward.type, 'message')
  assert.equal(forward.attrs.forward, true)
  assert.equal(forward.children.length, 1)
  assert.equal(forward.children[0].type, 'text')
})
