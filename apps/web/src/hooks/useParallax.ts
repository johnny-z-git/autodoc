import { useEffect, useRef } from 'react'

interface ParallaxLayer {
  speed: number
  el: HTMLElement
}

/**
 * Параллакс слоёв в hero: фон едет медленнее скролла, текст — чуть быстрее вверх.
 * Смещение считается относительно секции, пока она во вьюпорте.
 */
export function useParallax(rootRef: React.RefObject<HTMLElement | null>) {
  const layersRef = useRef<ParallaxLayer[]>([])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const collect = () => {
      layersRef.current = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]')).map(
        (el) => ({
          el,
          speed: Number(el.dataset.parallax ?? '0.3') || 0.3,
        }),
      )
    }

    collect()

    let raf = 0
    let ticking = false

    const update = () => {
      ticking = false
      const rect = root.getBoundingClientRect()
      const vh = window.innerHeight

      // Вне экрана — не трогаем
      if (rect.bottom < 0 || rect.top > vh) return

      // Прогресс прокрутки секции: 0 в начале, растёт при уходе hero вверх
      const progress = -rect.top

      for (const layer of layersRef.current) {
        const y = progress * layer.speed
        layer.el.style.transform = `translate3d(0, ${y}px, 0)`
      }
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      raf = requestAnimationFrame(update)
    }

    const onResize = () => {
      collect()
      onScroll()
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      for (const layer of layersRef.current) {
        layer.el.style.transform = ''
      }
    }
  }, [rootRef])
}
