const YANDEX_MAPS_SCRIPT_ID = 'yandex-maps-api'

function loadYandexMaps(apiKey) {
  if (window.ymaps) {
    return Promise.resolve(window.ymaps)
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById(YANDEX_MAPS_SCRIPT_ID)

    if (existingScript) {
      existingScript.addEventListener('load', () => window.ymaps.ready(() => resolve(window.ymaps)), { once: true })
      existingScript.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = YANDEX_MAPS_SCRIPT_ID
    script.async = true
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`
    script.addEventListener('load', () => window.ymaps.ready(() => resolve(window.ymaps)), { once: true })
    script.addEventListener('error', reject, { once: true })
    document.head.append(script)
  })
}

function setupAdaptiveActions(items) {
  const updateOffset = (item) => {
    const action = item.querySelector('.address__item-action')
    const link = item.querySelector('.address__item-link')

    if (!action || !link) {
      return
    }

    const gap = Number.parseFloat(getComputedStyle(action).columnGap) || 0
    action.style.setProperty('--action-offset', `${link.getBoundingClientRect().width + gap}px`)
  }

  items.forEach((item) => updateOffset(item))

  if (!('ResizeObserver' in window)) {
    window.addEventListener('resize', () => items.forEach((item) => updateOffset(item)))
    return
  }

  const resizeObserver = new ResizeObserver(() => {
    items.forEach((item) => updateOffset(item))
  })

  items.forEach((item) => {
    const link = item.querySelector('.address__item-link')

    if (link) {
      resizeObserver.observe(link)
    }
  })
}

export async function initContactsMap() {
  const mapElement = document.querySelector('[data-contact-map]')

  if (!mapElement) {
    return
  }

  const statusElement = document.querySelector('[data-contact-map-status]')
  const items = Array.from(document.querySelectorAll('[data-map-point]'))
  const locations = items.map((item, index) => ({
    coordinates: item.dataset.coordinates.split(',').map(Number),
    index,
    title: item.dataset.mapTitle,
  }))
  const placemarks = []
  let activeIndex = -1
  let map = null

  setupAdaptiveActions(items)

  const activateLocation = (index, moveMap = true) => {
    activeIndex = index

    items.forEach((item, itemIndex) => {
      const isActive = itemIndex === index
      item.classList.toggle('is-active', isActive)
      item.setAttribute('aria-pressed', String(isActive))
    })

    placemarks.forEach((placemark, markerIndex) => {
      placemark.options.set(
        'preset',
        markerIndex === index ? 'islands#redIcon' : 'islands#blackIcon',
      )
    })

    if (moveMap && map) {
      const [longitude, latitude] = locations[index].coordinates

      map.setCenter([latitude, longitude], 16, {
        duration: 700,
        timingFunction: 'ease-in-out',
        checkZoomRange: true,
      })
    }
  }

  items.forEach((item, index) => {
    item.addEventListener('click', () => activateLocation(index))
  })

  const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY?.trim()

  if (!apiKey) {
    return
  }

  try {
    const ymaps = await loadYandexMaps(apiKey)

    map = new ymaps.Map(mapElement, {
      center: [59.947, 30.329],
      zoom: 12,
      controls: ['zoomControl'],
      behaviors: ['drag', 'dblClickZoom', 'multiTouch'],
    })

    locations.forEach((location) => {
      const [longitude, latitude] = location.coordinates
      const placemark = new ymaps.Placemark(
        [latitude, longitude],
        {
          hintContent: location.title,
          iconContent: String(location.index + 1).padStart(2, '0'),
        },
        {
          preset: location.index === activeIndex ? 'islands#redIcon' : 'islands#blackIcon',
        },
      )

      placemark.events.add('click', () => activateLocation(location.index))
      placemarks.push(placemark)
      map.geoObjects.add(placemark)
    })

    statusElement?.setAttribute('hidden', '')
  } catch (error) {
    if (statusElement) {
      statusElement.textContent = 'Не удалось загрузить Яндекс Карты. Проверьте API-ключ и ограничения домена.'
    }

    console.error('Yandex Maps initialization failed:', error)
  }
}
