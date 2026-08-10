import Splide from '@splidejs/splide'
import '@splidejs/splide/css/core'
import { ArrowDown, ArrowDownRight, createIcons, Handbag, Heart, Play, User, Plus, ArrowRight, ArrowLeft, X, Search, ChevronDown } from 'lucide'
import { initContactsMap } from '@/contact-map.js'
import { initPreloader } from '@/preloader.js'
import Lenis from 'lenis'

createIcons({
  icons: {
    User,
    Handbag,
    ArrowDownRight,
    ArrowDown,
    Heart,
    Play,
    Plus,
    ArrowRight,
    ArrowLeft,
    X,
    Search,
    ChevronDown
  },
})

initContactsMap()

let lenis = new Lenis({
  lerp: 0.1,
  autoRaf: true
})

initPreloader(lenis)

const heroElement = document.querySelector('.hero__splide')

if (heroElement) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const heroSplide = new Splide(heroElement, {
    type: 'loop',
    direction: 'ttb',
    height: '100%',
    rewind: true,
    perPage: 1,
    perMove: 1,
    autoplay: prefersReducedMotion ? false : true,
    interval: 5000,
    speed: prefersReducedMotion ? 0 : 900,
    arrows: true,
    pagination: false,
    pauseOnHover: true,
    pauseOnFocus: true,
    resetProgress: false,
    drag: false,
  })

  heroSplide.on('mounted', () => {
    requestAnimationFrame(() => {
      heroElement.classList.add('is-ready')
    })
  })

  heroSplide.on('move', () => {
    heroElement.classList.add('is-moving')
  })

  heroSplide.on('moved', () => {
    heroElement.classList.remove('is-moving')
  })

  heroSplide.mount()
}


const faqItems = document.querySelectorAll('.faq__item')
const faqPanels = document.querySelectorAll('.faq__item-bot')

faqPanels.forEach((panel) => {
  panel.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'max-height') {
      return
    }

    requestAnimationFrame(() => lenis.resize())
  })
})

faqItems.forEach(el => {
  el.addEventListener('click', function () {
    let botEl = el.querySelector('.faq__item-bot');
    let heightEl = botEl.scrollHeight
    faqItems.forEach(item => {
      item.querySelector('.faq__item-bot').style.maxHeight = `${0}px`;
      item.classList.remove('current')
    })
    el.classList.add('current');
    botEl.style.maxHeight = `${heightEl}px`;
  })
})

const policyNav = document.querySelectorAll('.policy__navigation-item')
const policyFrame = document.querySelectorAll('.policy__item')

policyNav.forEach((el, index) => {
  el.addEventListener('click', function () {
    if (el.classList.contains('current')) {
      return
    }

    policyNav.forEach((nav) => { nav.classList.remove('current') })
    el.classList.add('current')
    policyFrame.forEach((frame, number) => {
      if (number === index) {
        frame.classList.add('current')
      } else {
        frame.classList.remove('current')
      }
    })
  })
})


const locationSplide = document.querySelector('.locaion__array')

if (locationSplide) {
  new Splide(locationSplide, {
    perMove: 1,
    perPage: 1,
    type: 'loop',
    padding: 128,
    gap: 0,
    pagination: false,
  }).mount()
}


let profileButton = document.querySelector('.header__action-profile')
let modalForm = document.querySelector('.auth')
let modalClose = document.querySelector('.auth--close')
profileButton.addEventListener('click', function (e) {
  modalForm.classList.add('open')
  lenis.stop()
})
modalClose.addEventListener('click', function (e) {
  modalForm.classList.remove('open')
  lenis.start()
})

let titlesModal = document.querySelectorAll('.auth__body-title h2')
let forms = document.querySelectorAll('.form')
titlesModal.forEach((el,index) => {
  el.addEventListener('click', function(e) {
    titlesModal.forEach((item) => {item.classList.remove('current')})
    el.classList.add('current');
    forms.forEach((form, i) => {
      if (index == i) {
        form.classList.add('current')
      }else{
        form.classList.remove('current')
      }
    })
  })
})

const profile = document.querySelector('.profile')

if (profile) {
  const navigationItems = Array.from(profile.querySelectorAll('.profile__navigation .navigation__item'))
  const panels = Array.from(profile.querySelectorAll('.profile__body > .profile__frame'))
  const tabs = navigationItems.slice(0, panels.length)
  const favoritePanel = profile.querySelector('.profile__body-favorite')
  const favoriteOnlyElements = Array.from(profile.querySelectorAll('[data-profile-favorite-only]'))

  const activateProfilePanel = (activeIndex) => {
    tabs.forEach((tab, index) => {
      const isActive = index === activeIndex
      tab.classList.toggle('current', isActive)
      tab.setAttribute('aria-selected', String(isActive))
    })

    panels.forEach((panel, index) => {
      const isActive = index === activeIndex
      panel.classList.toggle('current', isActive)
      panel.hidden = !isActive
    })

    const isFavoriteActive = panels[activeIndex] === favoritePanel
    favoriteOnlyElements.forEach((element) => {
      element.hidden = !isFavoriteActive
    })
  }

  const initialTabIndex = Math.max(0, tabs.findIndex((tab) => tab.classList.contains('current')))
  activateProfilePanel(initialTabIndex)

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateProfilePanel(index))
  })

  const addressForm = profile.querySelector('.address__main-form')

  if (addressForm) {
    const requiredFields = ['city', 'address', 'pvz']
      .map((name) => addressForm.elements.namedItem(name))
      .filter(Boolean)
    const pvzInput = addressForm.elements.namedItem('pvz')
    const pvzField = pvzInput.closest('.form__input')
    const pvzWrapper = pvzField.querySelector('.form__input-wrapper')
    const pvzWrapperText = pvzWrapper.querySelector('span')
    const pvzOptions = Array.from(pvzField.querySelectorAll('[data-pvz-option]'))

    const setFieldError = (field, hasError) => {
      const fieldContainer = field.closest('.form__input')
      fieldContainer?.classList.toggle('is-error', hasError)
      field.setAttribute('aria-invalid', String(hasError))

      if (field === pvzInput) {
        pvzWrapper.setAttribute('aria-invalid', String(hasError))
      }
    }

    const validateField = (field) => {
      const isValid = field.value.trim().length > 0
      setFieldError(field, !isValid)
      return isValid
    }

    const setPvzOpen = (isOpen) => {
      pvzField.classList.toggle('is-open', isOpen)
      pvzWrapper.setAttribute('aria-expanded', String(isOpen))
    }

    const selectPvz = (option) => {
      const value = option.textContent.trim()
      pvzInput.value = value
      pvzWrapperText.textContent = value
      setFieldError(pvzInput, false)
      setPvzOpen(false)
    }

    requiredFields.forEach((field) => {
      if (field.type !== 'hidden') {
        field.addEventListener('input', () => {
          if (field.value.trim()) {
            setFieldError(field, false)
          }
        })
      }
    })

    pvzWrapper.addEventListener('click', () => {
      setPvzOpen(!pvzField.classList.contains('is-open'))
    })

    pvzWrapper.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setPvzOpen(!pvzField.classList.contains('is-open'))
      }
    })

    pvzOptions.forEach((option) => {
      option.addEventListener('click', () => selectPvz(option))
      option.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          selectPvz(option)
        }
      })
    })

    document.addEventListener('click', (event) => {
      if (!pvzField.contains(event.target)) {
        setPvzOpen(false)
      }
    })

    addressForm.addEventListener('submit', (event) => {
      event.preventDefault()
      const validationResults = requiredFields.map((field) => validateField(field))
      const firstInvalidField = requiredFields.find((field, index) => !validationResults[index])

      if (firstInvalidField) {
        const focusTarget = firstInvalidField === pvzInput ? pvzWrapper : firstInvalidField
        focusTarget.focus()
      }
    })
  }
}
