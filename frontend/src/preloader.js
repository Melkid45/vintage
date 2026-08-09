import { gsap } from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(MotionPathPlugin)

const PRELOADER_STORAGE_KEY = 'vintage-preloader-played'

export function initPreloader(lenis) {
  const preloader = document.querySelector('[data-preloader]')

  if (!preloader) {
    return
  }

  const root = document.documentElement

  if (root.classList.contains('preloader-skip')) {
    preloader.remove()
    return
  }

  const words = Array.from(preloader.querySelectorAll('[data-preloader-word]'))
  const circle = preloader.querySelector('[data-preloader-circle]')
  const circleOrigin = preloader.querySelector('[data-preloader-circle-origin]')

  if (words.length !== 2 || !circle || !circleOrigin) {
    preloader.remove()
    return
  }

  try {
    sessionStorage.setItem(PRELOADER_STORAGE_KEY, '1')
  } catch {
    // The animation can still run when storage is unavailable.
  }

  root.classList.add('is-preloading')
  lenis?.stop()

  const finishPreloader = () => {
    root.classList.remove('is-preloading')
    preloader.remove()

    requestAnimationFrame(() => {
      lenis?.resize()
      lenis?.start()
    })
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.to(preloader, {
      autoAlpha: 0,
      duration: 0.25,
      onComplete: finishPreloader,
    })
    return
  }

  gsap.set(preloader, { clipPath: 'inset(0% 0% 0% 0%)' })
  gsap.set(words, { autoAlpha: 0, y: 56 })
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
  const originRect = circleOrigin.getBoundingClientRect()
  const startRadius = originRect.width / 2
  const circleState = {
    x: originRect.left + originRect.width / 2,
    y: originRect.bottom - startRadius,
    radius: startRadius,
  }
  const destination = {
    x: viewport.width / 2,
    y: viewport.height / 2,
  }
  const coverRadius = Math.hypot(viewport.width / 2, viewport.height / 2) * 1.06
  const arcHeight = Math.min(72, Math.max(32, viewport.height * 0.075))
  const distanceX = destination.x - circleState.x
  const flightPath = [
    `M ${circleState.x} ${circleState.y}`,
    `C ${circleState.x + distanceX * 0.32} ${circleState.y - arcHeight}`,
    `${destination.x - distanceX * 0.22} ${destination.y - arcHeight * 0.42}`,
    `${destination.x} ${destination.y}`,
  ].join(' ')
  const renderCircle = () => {
    circle.style.clipPath = `circle(${circleState.radius}px at ${circleState.x}px ${circleState.y}px)`
  }

  renderCircle()
  gsap.set(circle, { autoAlpha: 0 })

  const timeline = gsap.timeline({
    onComplete: finishPreloader,
  })

  timeline
    .to(words[0], {
      autoAlpha: 1,
      y: 0,
      duration: 0.72,
      ease: 'power3.out',
    })
    .to(words[1], {
      autoAlpha: 1,
      y: 0,
      duration: 0.72,
      ease: 'power3.out',
    }, '-=0.46')
    .to(circle, {
      autoAlpha: 1,
      duration: 0.38,
      ease: 'power2.out',
    }, '+=0.12')
    .add('circle-flight', '+=0.18')
    .to(circleState, {
      motionPath: {
        path: flightPath,
      },
      duration: 1.7,
      ease: 'sine.inOut',
      onUpdate: renderCircle,
    }, 'circle-flight')
    .to(circleState, {
      radius: coverRadius,
      duration: 1.7,
      ease: 'power4.in',
      onUpdate: renderCircle,
    }, 'circle-flight')
    .to(preloader, {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 1.05,
      ease: 'power4.inOut',
    }, 'circle-flight+=1.72')
}
