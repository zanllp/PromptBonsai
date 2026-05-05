export type DiffOp = 'equal' | 'add' | 'remove'

export interface DiffSegment {
  op: DiffOp
  text: string
}

export function charDiff(a: string, b: string): DiffSegment[] {
  const n = a.length
  const m = b.length

  if (n === 0) return b ? [{ op: 'add' as DiffOp, text: b }] : [];
  if (m === 0) return a ? [{ op: 'remove' as DiffOp, text: a }] : [];

  const dp: number[][] = Array.from({ length: n + 1 }, (_, i) =>
    Array.from({ length: m + 1 }, (_, j) => (i === 0 || j === 0 ? 0 : -1))
  )
  dp[0][0] = 0
  for (let i = 1; i <= n; i++) dp[i][0] = 0
  for (let j = 1; j <= m; j++) dp[0][j] = 0
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const ops: { op: DiffOp; char: string }[] = []
  let i = n
  let j = m
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ op: 'equal', char: a[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ op: 'add', char: b[j - 1] })
      j--
    } else {
      ops.push({ op: 'remove', char: a[i - 1] })
      i--
    }
  }
  ops.reverse()

  const segments: DiffSegment[] = []
  for (const op of ops) {
    const last = segments[segments.length - 1]
    if (last && last.op === op.op) {
      last.text += op.char
    } else {
      segments.push({ op: op.op, text: op.char })
    }
  }

  return mergeSmallSegments(segments)
}

function mergeSmallSegments(segments: DiffSegment[], threshold = 6): DiffSegment[] {
  if (segments.length <= 3) return segments

  const result: DiffSegment[] = []
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (seg.op === 'equal') {
      result.push(seg)
      continue
    }

    const prevEqual = result.length > 0 && result[result.length - 1].op === 'equal' ? result[result.length - 1] : null
    const nextEqual = i + 1 < segments.length && segments[i + 1].op === 'equal' ? segments[i + 1] : null

    const surrounding =
      (prevEqual ? prevEqual.text.length : 0) + (nextEqual ? nextEqual.text.length : 0)

    if (seg.text.length <= threshold && surrounding > 0) {
      if (prevEqual) {
        prevEqual.text = prevEqual.text + seg.text + (nextEqual ? nextEqual.text.slice(0, 0) : '')
      }
      if (nextEqual && !prevEqual) {
        nextEqual.text = seg.text + nextEqual.text
      }
      if (prevEqual && nextEqual) {
        prevEqual.text += nextEqual.text
        i++
      }
    } else {
      result.push(seg)
    }
  }

  return result
}

export function diffHtml(segments: DiffSegment[], side: 'left' | 'right'): string {
  return segments
    .map((seg) => {
      if (seg.op === 'equal') return escapeHtml(seg.text)
      if (seg.op === 'remove' && side === 'left') return `<span class="diff-remove">${escapeHtml(seg.text)}</span>`
      if (seg.op === 'add' && side === 'right') return `<span class="diff-add">${escapeHtml(seg.text)}</span>`
      if (seg.op === 'remove' && side === 'right') return ''
      if (seg.op === 'add' && side === 'left') return ''
      return escapeHtml(seg.text)
    })
    .join('')
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
