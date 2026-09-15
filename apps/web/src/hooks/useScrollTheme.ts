import { useEffect, useRef } from 'react'

/**
 * Плавная смена тёмной / светлой темы по скроллу.
 * Берём секцию, в которой лежит центр вьюпорта + гистерезис против мерцания.
 * Сама анимация цвета — через CSS transition на body / header / footer.
 */
export function useScrollTheme(enabled = true) {
  const lastTheme = useRef<'dark' | 'light' | null>(null)

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('theme-light')
      lastTheme.current = null
      return
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-theme]'))
    if (!sections.length) return

    let raf = 0
    let ticking = false

    const applyTheme = (theme: 'dark' | 'light') => {
      if (lastTheme.current === theme) return
      lastTheme.current = theme
      document.body.classList.toggle('theme-light', theme === 'light')
    }

    const update = () => {
      ticking = false
      const mid = window.innerHeight * 0.45

      let active: HTMLElement | null = null
      for (const section of sections) {
        const rect = section.getBoundingClientRect()
        // Гистерезис: секция «владеет» полосой вокруг mid
        if (rect.top <= mid + 40 && rect.bottom >= mid - 40) {
          active = section
          break
        }
      }

      if (!active) {
        // Fallback: ближайшая секция к mid
        let bestDist = Infinity
        for (const section of sections) {
          const rect = section.getBoundingClientRect()
          const center = (rect.top + rect.bottom) / 2
          const dist = Math.abs(center - mid)
          if (dist < bestDist) {
            bestDist = dist
            active = section
          }
        }
      }

      if (!active) return
      const theme = active.dataset.theme === 'light' ? 'light' : 'dark'
      applyTheme(theme)
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      document.body.classList.remove('theme-light')
      lastTheme.current = null
    }
  }, [enabled])
}
