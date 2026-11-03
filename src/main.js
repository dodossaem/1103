import '@fontsource-variable/noto-sans-kr'
import '@fontsource/jua'
import './style.css'
import { initNotesBackground } from './notes.js'
import { drawHeroStaff, openScoreCover } from './score.js'

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 음표 배경
initNotesBackground(document.getElementById('notes-canvas'), { reducedMotion: prefersReducedMotion })

// 첫 화면 오선보
drawHeroStaff(document.getElementById('hero-staff'))

// 헤더: 스크롤 시 배경 표시
const header = document.querySelector('.site-header')
const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 20)
updateHeader()
window.addEventListener('scroll', updateHeader, { passive: true })

// 모바일 메뉴
const navToggle = document.querySelector('.nav-toggle')
const nav = document.getElementById('site-nav')

const setNavOpen = (open) => {
  nav.classList.toggle('is-open', open)
  navToggle.setAttribute('aria-expanded', String(open))
  navToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기')
}

navToggle.addEventListener('click', () => setNavOpen(!nav.classList.contains('is-open')))
nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) setNavOpen(false)
})

// 스크롤에 따라 콘텐츠 등장
const revealItems = document.querySelectorAll('.reveal')

// 같은 묶음 안의 요소는 순서대로 조금씩 늦게 등장
document.querySelectorAll('.hero__inner, .grid').forEach((group) => {
  group.querySelectorAll(':scope > .reveal').forEach((el, i) => {
    el.style.setProperty('--delay', `${i * 0.12}s`)
  })
})

const showItem = (el) => {
  el.classList.add('is-visible')
  // 등장이 끝나면 카드의 transition을 hover용으로 전환
  el.addEventListener('transitionend', () => el.classList.add('is-shown'), { once: true })
}

const startReveal = () => {
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((el) => el.classList.add('is-visible', 'is-shown'))
    return
  }
  // 이미 화면 안에 있는 요소는 바로 보여 주고, 나머지만 스크롤을 관찰
  const inView = (el) => {
    const rect = el.getBoundingClientRect()
    return rect.top < window.innerHeight - 40 && rect.bottom > 0
  }
  const pending = [...revealItems].filter((el) => {
    if (!inView(el)) return true
    showItem(el)
    return false
  })

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        showItem(entry.target)
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
  )
  pending.forEach((el) => observer.observe(el))
}

// 악보 표지가 펼쳐진 뒤 콘텐츠 등장 시작
openScoreCover(document.getElementById('score-cover'), { reducedMotion: prefersReducedMotion }).then(startReveal)

// 버튼: 클릭 시 물결 효과
document.querySelectorAll('.btn').forEach((btn) => {
  btn.addEventListener('pointerdown', (e) => {
    if (prefersReducedMotion) return
    const rect = btn.getBoundingClientRect()
    const ripple = document.createElement('span')
    ripple.className = 'ripple'
    ripple.style.left = `${e.clientX - rect.left}px`
    ripple.style.top = `${e.clientY - rect.top}px`
    btn.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove())
  })
})

// 푸터 연도
document.getElementById('year').textContent = new Date().getFullYear()
