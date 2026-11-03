// 흰 배경 위로 천천히 떠오르는 파스텔 음표
// 음표·쉼표·변화표·음자리표를 섞고, 거리감(깊이)에 따라 크기·속도·투명도를 달리함
const SYMBOLS = [
  { char: '♪', weight: 5 },
  { char: '♫', weight: 4 },
  { char: '♬', weight: 4 },
  { char: '♩', weight: 4 },
  { char: '𝄞', weight: 2 },
  { char: '𝄢', weight: 1 },
  { char: '♭', weight: 2 },
  { char: '♯', weight: 2 },
  { char: '♮', weight: 1 },
  { char: '𝄽', weight: 1 },
  { char: '𝄐', weight: 1 },
]

// 파스텔 색조
const COLORS = [
  '244, 143, 177', // 핑크
  '92, 194, 154', // 민트
  '106, 168, 240', // 하늘
  '154, 132, 232', // 라벤더
  '232, 184, 48', // 버터
  '243, 154, 107', // 피치
]

const FONT = '"Segoe UI Symbol", "Noto Music", "Apple Symbols", "Noto Sans Symbols 2", serif'

const totalWeight = SYMBOLS.reduce((sum, s) => sum + s.weight, 0)
const pickSymbol = () => {
  let r = Math.random() * totalWeight
  for (const s of SYMBOLS) {
    r -= s.weight
    if (r <= 0) return s.char
  }
  return SYMBOLS[0].char
}

const pick = (list) => list[Math.floor(Math.random() * list.length)]
const between = (min, max) => min + Math.random() * (max - min)

export function initNotesBackground(canvas, { reducedMotion = false } = {}) {
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  let width = 0
  let height = 0
  let notes = []
  let pointer = { x: -9999, y: -9999 }

  // depth: 0(멀리) ~ 1(가까이). 멀리 있는 음표가 더 많도록 분포
  const createNote = (randomY = true, depth = Math.random() ** 1.6) => {
    const size = 14 + depth * 26
    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : height + size,
      size,
      depth,
      symbol: pickSymbol(),
      color: pick(COLORS),
      alpha: 0.18 + depth * 0.3,
      speed: 0.15 + depth * 0.55,
      drift: between(-0.15, 0.15),
      sway: between(10, 30),
      swaySpeed: between(0.0004, 0.0011),
      phase: Math.random() * Math.PI * 2,
      rotation: between(-0.4, 0.4),
      spin: between(-0.004, 0.004),
      offsetX: 0,
    }
  }

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    // 모바일 주소창이 접히며 높이만 바뀔 때는 음표를 새로 만들지 않음
    const widthChanged = window.innerWidth !== width
    width = window.innerWidth
    height = window.innerHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // 화면 크기에 비례한 음표 개수
    const count = Math.round(Math.min(36, Math.max(14, (width * height) / 40000)))
    if (widthChanged) {
      // 멀리 있는 음표부터 그려서 가까운 음표가 위에 오도록 정렬
      notes = Array.from({ length: count }, () => createNote(true)).sort((a, b) => a.depth - b.depth)
    }
    if (reducedMotion) notes.forEach(drawNote)
  }

  const drawNote = (note) => {
    ctx.save()
    ctx.translate(note.x + note.offsetX, note.y)
    ctx.rotate(note.rotation)
    ctx.font = `${note.size}px ${FONT}`
    ctx.fillStyle = `rgba(${note.color}, ${note.alpha})`
    ctx.fillText(note.symbol, 0, 0)
    ctx.restore()
  }

  const tick = (time) => {
    ctx.clearRect(0, 0, width, height)

    for (const note of notes) {
      note.y -= note.speed
      note.x += note.drift
      note.rotation += note.spin
      note.offsetX = Math.sin(time * note.swaySpeed + note.phase) * note.sway

      // 마우스 근처의 음표는 살짝 비켜감 (가까운 음표일수록 크게)
      const dx = note.x - pointer.x
      const dy = note.y - pointer.y
      const dist = Math.hypot(dx, dy)
      if (dist < 130) {
        const force = ((130 - dist) / 130) * (0.6 + note.depth * 1.6)
        note.x += (dx / (dist || 1)) * force
        note.y += (dy / (dist || 1)) * force
      }

      const outOfView = note.y < -note.size * 2 || note.x < -note.size * 2 || note.x > width + note.size * 2
      if (outOfView) Object.assign(note, createNote(false, note.depth))
      drawNote(note)
    }

    requestAnimationFrame(tick)
  }

  resize()
  window.addEventListener('resize', resize)

  if (reducedMotion) return

  window.addEventListener('pointermove', (e) => {
    pointer = { x: e.clientX, y: e.clientY }
  }, { passive: true })

  requestAnimationFrame(tick)
}
