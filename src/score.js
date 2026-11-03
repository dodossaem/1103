// 악보 연출: 첫 화면 오선보 그리기, 진입 시 악보 표지 펼치기
const SVG_NS = 'http://www.w3.org/2000/svg'

const NOTE_COLORS = ['#f48fb1', '#9a84e8', '#6aa8f0', '#5cc29a', '#e8b830', '#f39a6b']

// 오선 위치: 0 = 맨 아래 줄(미), 1칸 올라갈 때마다 +1
// 도-레-미-솔 | 미-레-도-레 | 미-솔-라-도
const MELODY = [-2, -1, 0, 2, 0, -1, -2, -1, 0, 2, 3, 5]

const WIDTH = 720
const LINE_GAP = 15
const BOTTOM_LINE_Y = 85

const el = (name, attrs = {}) => {
  const node = document.createElementNS(SVG_NS, name)
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value)
  return node
}

export function drawHeroStaff(svg) {
  if (!svg) return

  svg.setAttribute('viewBox', `0 0 ${WIDTH} 120`)

  // 오선
  const lines = el('g', { class: 'staff-lines' })
  for (let i = 0; i < 5; i++) {
    const y = BOTTOM_LINE_Y - i * LINE_GAP
    lines.append(el('line', { x1: 0, y1: y, x2: WIDTH - 4, y2: y }))
  }
  svg.append(lines)

  // 높은음자리표와 박자표
  const clef = el('text', { x: 4, y: 96, class: 'staff-clef' })
  clef.textContent = '𝄞'
  const time = el('text', { x: 62, y: 52, class: 'staff-time' })
  time.textContent = '4'
  const time2 = el('text', { x: 62, y: 82, class: 'staff-time' })
  time2.textContent = '4'
  svg.append(clef, time, time2)

  // 음표
  const startX = 120
  const measureWidth = (WIDTH - startX - 10) / 3
  const noteGap = measureWidth / 4

  MELODY.forEach((step, i) => {
    const measure = Math.floor(i / 4)
    const x = startX + measure * measureWidth + (i % 4) * noteGap + noteGap / 2
    const y = BOTTOM_LINE_Y - step * (LINE_GAP / 2)
    const color = NOTE_COLORS[i % NOTE_COLORS.length]
    const note = el('g', { class: 'staff-note', style: `--i: ${i}` })

    // 덧줄 (아래 '도')
    if (step <= -2) note.append(el('line', { x1: x - 13, y1: BOTTOM_LINE_Y + LINE_GAP, x2: x + 13, y2: BOTTOM_LINE_Y + LINE_GAP, class: 'staff-ledger' }))

    // 가운데 줄보다 낮으면 기둥을 위로, 높으면 아래로
    const stemUp = step < 4
    const stemX = stemUp ? x + 7.6 : x - 7.6
    note.append(
      el('line', { x1: stemX, y1: y, x2: stemX, y2: stemUp ? y - 42 : y + 42, stroke: color, class: 'staff-stem' }),
      el('ellipse', { cx: x, cy: y, rx: 8.5, ry: 6.2, fill: color, transform: `rotate(-22 ${x} ${y})` }),
    )
    svg.append(note)
  })

  // 마디줄과 끝세로줄
  for (let m = 1; m < 3; m++) {
    const x = startX + m * measureWidth
    svg.append(el('line', { x1: x, y1: BOTTOM_LINE_Y - 4 * LINE_GAP, x2: x, y2: BOTTOM_LINE_Y, class: 'staff-bar' }))
  }
  svg.append(
    el('line', { x1: WIDTH - 12, y1: BOTTOM_LINE_Y - 4 * LINE_GAP, x2: WIDTH - 12, y2: BOTTOM_LINE_Y, class: 'staff-bar' }),
    el('rect', { x: WIDTH - 7, y: BOTTOM_LINE_Y - 4 * LINE_GAP, width: 5, height: 4 * LINE_GAP, class: 'staff-final' }),
  )
}

// 표지를 펼치고, 다 펼쳐지면 resolve
export function openScoreCover(cover, { reducedMotion = false } = {}) {
  const root = document.documentElement

  const finish = () => {
    cover?.remove()
    root.classList.remove('has-cover')
  }

  if (!cover || reducedMotion) {
    finish()
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    let opened = false
    const open = () => {
      if (opened) return
      opened = true
      cover.classList.add('is-open')
      // 표지가 넘어가는 도중에 본문이 나타나기 시작
      setTimeout(resolve, 500)
      setTimeout(finish, 1400)
    }

    cover.addEventListener('click', open, { once: true })
    setTimeout(open, 1100)
  })
}
