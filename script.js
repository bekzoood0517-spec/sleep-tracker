const STORAGE_KEY = 'sleep-tracker.entries.v1'
const MONTHS = {
  ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  uz: ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
}
const SAMPLE_NOTES = {
  'Тихий вечер, без экрана после одиннадцати.': "Tinch kech, soat o'n birdan keyin ekransiz.",
  'Засиделся с работой.': 'Ish bilan kech qoldim.',
  'Подъём раньше обычного.': 'Odatdagidan erta turdim.',
  'Лег вовремя, проснулся сам.': "Vaqtida yotdim, o'zim uyg'ondim.",
  'Долго не мог уснуть.': 'Uzoq uxlay olmadim.',
  'Выходной, выспался с запасом.': "Dam olish kuni, to'yib uxladim.",
  'Поздний ужин.': 'Kechki ovqat kech edi.',
  'Ранний отбой.': 'Erta yotish.',
  'Просыпался среди ночи.': "Tunda uyg'onib ketdim.",
  'Ровная ночь.': 'Tekis tun.',
}
const SAMPLE = [
  ['23:10', '07:00', 4, 'Тихий вечер, без экрана после одиннадцати.'],
  ['00:35', '07:20', 3, 'Засиделся с работой.'],
  ['23:40', '06:30', 3, 'Подъём раньше обычного.'],
  ['22:55', '07:10', 5, 'Лег вовремя, проснулся сам.'],
  ['01:05', '08:10', 2, 'Долго не мог уснуть.'],
  ['23:20', '07:40', 4, ''],
  ['23:05', '09:15', 5, 'Выходной, выспался с запасом.'],
  ['00:10', '07:05', 3, 'Поздний ужин.'],
  ['23:30', '06:50', 4, ''],
  ['22:40', '06:35', 4, 'Ранний отбой.'],
  ['00:50', '07:30', 2, 'Просыпался среди ночи.'],
  ['23:15', '07:25', 4, 'Ровная ночь.'],
]

const svgNS = 'http://www.w3.org/2000/svg'
const form = document.querySelector('#entry-form')
const dialog = document.querySelector('#entry-dialog')
const journalBody = document.querySelector('#journal-body')

let entries = []
const VIEW_ORDER = ['overview', 'duration', 'rhythm', 'journal']
let view = 'overview'
let stageReady = false
let range = 14
let editingId = null
let pendingDeleteId = null
let formErrorKey = ''
let lang = document.documentElement.lang === 'uz' ? 'uz' : 'ru'

const COPY = {
  ru: {
    pageTitle: 'Ночник — трекер сна',
    brandKicker: 'Трекер сна',
    brandTitle: 'Ночник',
    navLabel: 'Разделы',
    viewOverview: 'Обзор',
    viewDuration: 'Длительность',
    viewRhythm: 'Режим',
    viewJournal: 'Журнал',
    themeLabel: 'Тема оформления',
    themeDark: 'Тёмная',
    themeLight: 'Светлая',
    langLabel: 'Язык',
    addNight: 'Добавить ночь',
    lastNight: 'Последняя ночь',
    noEntries: 'Записей пока нет',
    avgLabel: 'Среднее за {n} {word}',
    target: 'Ориентир — 8 часов',
    quality: 'Качество',
    noScores: 'Нет оценок',
    debt: 'Недосып',
    surplus: 'Запас сна',
    recentNights: 'За последние ночи',
    spread: 'Отбой гуляет на ±{n} мин',
    durationTitle: 'Длительность',
    durationHint: 'Сколько часов длилась каждая ночь',
    days7: '7 дн',
    days14: '14 дн',
    days30: '30 дн',
    emptyChart: 'Добавьте ночи — график соберётся из журнала.',
    durationRange: 'Период графика длительности',
    durationChartAria: 'График длительности сна',
    rhythmTitle: 'Отбой и качество',
    rhythmHint: 'Насколько ровный режим и как оценивается ночь',
    rhythmRange: 'Период графика режима',
    rhythmChartAria: 'График отбоя и качества сна',
    legendBed: 'Отбой',
    legendQuality: 'Качество, 1–5',
    journalEmptyTitle: 'Журнал пуст',
    journalEmptyText: 'Добавьте первую ночь: дату, отбой, подъём и оценку.',
    journalTitle: 'Журнал',
    journalCount: '{n} {word}',
    colNight: 'Ночь',
    colBed: 'Отбой',
    colWake: 'Подъём',
    colDuration: 'Длительность',
    colQuality: 'Качество',
    colNote: 'Заметка',
    edit: 'Изменить',
    remove: 'Удалить',
    removeAsk: 'Удалить?',
    yes: 'Да',
    no: 'Нет',
    formNewKicker: 'Новая ночь',
    formEditKicker: 'Изменение',
    formNewTitle: 'Добавить сон',
    formEditTitle: 'Править запись',
    close: 'Закрыть',
    fieldDate: 'Дата ночи',
    fieldBed: 'Отбой',
    fieldWake: 'Подъём',
    qualityLegend: 'Качество',
    q1: 'Тяжело',
    q2: 'Беспокойно',
    q3: 'Нормально',
    q4: 'Хорошо',
    q5: 'Отлично',
    noteLabel: 'Заметка',
    notePlaceholder: 'Что повлияло на сон',
    cancel: 'Отмена',
    add: 'Добавить',
    save: 'Сохранить',
    errorFields: 'Укажите дату, отбой и подъём.',
    errorQuality: 'Оцените качество сна от 1 до 5.',
    errorFuture: 'Дата ночи ещё не наступила.',
    errorDuration: 'Длительность должна быть от 30 минут до 16 часов.',
    errorDuplicate: 'Запись на эту дату уже есть. Откройте её и измените.',
    hoursOnly: '{n} ч',
    hoursMinutes: '{h} ч {m} мин',
    hourTick: '{n} ч',
    bedtimeTip: 'Отбой {time}',
    qualityTip: 'Качество {n} · {label}',
    nightOne: 'ночь',
    nightFew: 'ночи',
    nightMany: 'ночей',
  },
  uz: {
    pageTitle: 'Tungi chiroq — uyqu kuzatuvchisi',
    brandKicker: 'Uyqu kuzatuvchisi',
    brandTitle: 'Tungi chiroq',
    navLabel: "Bo'limlar",
    viewOverview: 'Umumiy',
    viewDuration: 'Davomiylik',
    viewRhythm: 'Rejim',
    viewJournal: 'Kundalik',
    themeLabel: 'Mavzu',
    themeDark: 'Tun',
    themeLight: 'Kun',
    langLabel: 'Til',
    addNight: "Tun qo'shish",
    lastNight: "So'nggi tun",
    noEntries: 'Hozircha yozuv yo‘q',
    avgLabel: "O'rtacha: {n} tun",
    target: "Mo'ljal — 8 soat",
    quality: 'Sifat',
    noScores: 'Baholar yo‘q',
    debt: 'Uyqu yetishmasligi',
    surplus: 'Uyqu zaxirasi',
    recentNights: "So'nggi tunlar",
    spread: 'Yotish vaqti ±{n} daqiqa siljiydi',
    durationTitle: 'Davomiylik',
    durationHint: 'Har bir tun necha soat davom etgani',
    days7: '7 kun',
    days14: '14 kun',
    days30: '30 kun',
    emptyChart: "Tunlarni qo'shing — grafik kundalikdan tuziladi.",
    durationRange: 'Davomiylik grafigi davri',
    durationChartAria: 'Uyqu davomiyligi grafigi',
    rhythmTitle: 'Yotish va sifat',
    rhythmHint: 'Rejim qanchalik barqaror va tun qanday baholangan',
    rhythmRange: 'Rejim grafigi davri',
    rhythmChartAria: 'Yotish va sifat grafigi',
    legendBed: 'Yotish',
    legendQuality: 'Sifat, 1–5',
    journalEmptyTitle: "Kundalik bo'sh",
    journalEmptyText: "Birinchi tunni qo'shing: sana, yotish, turish va baho.",
    journalTitle: 'Kundalik',
    journalCount: '{n} ta tun',
    colNight: 'Tun',
    colBed: 'Yotish',
    colWake: 'Turish',
    colDuration: 'Davomiylik',
    colQuality: 'Sifat',
    colNote: 'Eslatma',
    edit: "O'zgartirish",
    remove: "O'chirish",
    removeAsk: "O'chirilsinmi?",
    yes: 'Ha',
    no: "Yo'q",
    formNewKicker: 'Yangi tun',
    formEditKicker: 'Tahrirlash',
    formNewTitle: "Uyqu qo'shish",
    formEditTitle: 'Yozuvni tahrirlash',
    close: 'Yopish',
    fieldDate: 'Tun sanasi',
    fieldBed: 'Yotish',
    fieldWake: 'Turish',
    qualityLegend: 'Sifat',
    q1: "Og'ir",
    q2: 'Bezovta',
    q3: "O'rtacha",
    q4: 'Yaxshi',
    q5: "A'lo",
    noteLabel: 'Eslatma',
    notePlaceholder: 'Uyquga nima ta’sir qildi',
    cancel: 'Bekor qilish',
    add: "Qo'shish",
    save: 'Saqlash',
    errorFields: 'Sana, yotish va turish vaqtini kiriting.',
    errorQuality: 'Uyqu sifatini 1 dan 5 gacha baholang.',
    errorFuture: 'Bu tun hali kelmagan.',
    errorDuration: 'Davomiylik 30 daqiqadan 16 soatgacha bo‘lishi kerak.',
    errorDuplicate: "Bu sana uchun yozuv bor. Uni ochib o'zgartiring.",
    hoursOnly: '{n} soat',
    hoursMinutes: '{h} soat {m} daq',
    hourTick: '{n} soat',
    bedtimeTip: 'Yotish {time}',
    qualityTip: 'Sifat {n} · {label}',
    nightOne: 'tun',
    nightFew: 'tun',
    nightMany: 'tun',
  },
}

function t(key, vars = {}) {
  const text = COPY[lang]?.[key] || COPY.ru[key] || key
  return text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '')
}

function qualityLabel(score) {
  return t(`q${score}`)
}

function displayNote(note) {
  if (!note) return '—'
  if (lang === 'uz' && SAMPLE_NOTES[note]) return SAMPLE_NOTES[note]
  return note
}

function clockToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesBetween(bedtime, wakeTime) {
  const start = clockToMinutes(bedtime)
  let end = clockToMinutes(wakeTime)
  if (end <= start) end += 24 * 60
  return end - start
}

function bedtimeAxisMinutes(time) {
  const minutes = clockToMinutes(time)
  return minutes < 12 * 60 ? minutes + 24 * 60 : minutes
}

function formatClock(totalMinutes) {
  const wrapped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const hours = Math.floor(wrapped / 60)
  const minutes = wrapped % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (minutes === 0) return t('hoursOnly', { n: hours })
  return t('hoursMinutes', { h: hours, m: minutes })
}

function formatHours(totalMinutes) {
  const hours = Math.round((totalMinutes / 60) * 10) / 10
  const n = Number.isInteger(hours) ? String(hours) : hours.toFixed(1)
  return t('hourTick', { n })
}

function formatShortDate(isoDate) {
  const [, month, day] = isoDate.split('-').map(Number)
  return `${day} ${MONTHS[lang][month - 1]}`
}

function formatLongDate(isoDate) {
  return new Intl.DateTimeFormat(lang === 'uz' ? 'uz-UZ' : 'ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${isoDate}T12:00:00`))
}

function todayIso() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function shiftIso(isoDate, days) {
  const date = new Date(`${isoDate}T12:00:00`)
  date.setDate(date.getDate() + days)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function sortByDate(list, direction = 'desc') {
  const copy = [...list]
  copy.sort((a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt))
  return direction === 'desc' ? copy.reverse() : copy
}

function nightsLabel(count) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return t('nightOne')
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return t('nightFew')
  return t('nightMany')
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function seedEntries() {
  const today = todayIso()
  return SAMPLE.map(([bedtime, wakeTime, quality, note], index) => {
    const date = shiftIso(today, -(SAMPLE.length - index))
    return {
      id: `night-${date}`,
      date,
      bedtime,
      wakeTime,
      quality,
      note,
      createdAt: `${date}T12:00:00.000Z`,
      updatedAt: `${date}T12:00:00.000Z`,
    }
  })
}

function readEntries() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return writeEntries(seedEntries())
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) throw new Error('bad store')
    return parsed
  } catch {
    return writeEntries(seedEntries())
  }
}

function writeEntries(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  entries = next
  return next
}

function createEntry(fields) {
  const now = new Date().toISOString()
  return writeEntries([
    ...entries,
    { id: crypto.randomUUID(), ...fields, createdAt: now, updatedAt: now },
  ])
}

function updateEntry(id, fields) {
  const now = new Date().toISOString()
  return writeEntries(entries.map((entry) => (
    entry.id === id ? { ...entry, ...fields, updatedAt: now } : entry
  )))
}

function deleteEntry(id) {
  return writeEntries(entries.filter((entry) => entry.id !== id))
}

function validateEntry(input, ignoreId) {
  const date = input.date?.trim()
  const bedtime = input.bedtime?.trim()
  const wakeTime = input.wakeTime?.trim()
  const quality = Number(input.quality)
  const note = (input.note ?? '').trim()

  if (!date || !bedtime || !wakeTime) return 'errorFields'
  if (!Number.isInteger(quality) || quality < 1 || quality > 5) return 'errorQuality'
  if (date > todayIso()) return 'errorFuture'

  const duration = minutesBetween(bedtime, wakeTime)
  if (duration < 30 || duration > 16 * 60) return 'errorDuration'
  if (entries.some((entry) => entry.date === date && entry.id !== ignoreId)) {
    return 'errorDuplicate'
  }

  return { date, bedtime, wakeTime, quality, note }
}

function chartRows() {
  return sortByDate(entries, 'asc').slice(-range).map((entry) => {
    const duration = minutesBetween(entry.bedtime, entry.wakeTime)
    return {
      id: entry.id,
      label: formatShortDate(entry.date),
      hours: Math.round((duration / 60) * 10) / 10,
      duration,
      quality: entry.quality,
      bedtime: bedtimeAxisMinutes(entry.bedtime),
      bedtimeLabel: entry.bedtime,
      wakeLabel: entry.wakeTime,
    }
  })
}

function summarize() {
  const sorted = sortByDate(entries, 'asc')
  const recent = sorted.slice(-7)
  const durations = recent.map((entry) => minutesBetween(entry.bedtime, entry.wakeTime))
  const average = durations.length
    ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
    : null
  const quality = recent.length
    ? recent.reduce((sum, entry) => sum + entry.quality, 0) / recent.length
    : null
  const debt = durations.reduce((sum, value) => sum + (8 * 60 - value), 0)
  const bedtimes = recent.map((entry) => bedtimeAxisMinutes(entry.bedtime))
  const bedtimeAverage = bedtimes.length
    ? bedtimes.reduce((sum, value) => sum + value, 0) / bedtimes.length
    : null
  const spread = bedtimeAverage == null
    ? null
    : Math.round(Math.sqrt(bedtimes.reduce((sum, value) => sum + (value - bedtimeAverage) ** 2, 0) / bedtimes.length))

  return {
    last: sorted.at(-1) ?? null,
    nights: recent.length,
    average,
    quality,
    debt: recent.length ? debt : null,
    spread,
  }
}

function svg(name, attrs) {
  const node = document.createElementNS(svgNS, name)
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value))
  return node
}

function barPath(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, Math.max(height, 0))
  if (height <= 0) return ''
  return `M ${x} ${y + height} V ${y + r} Q ${x} ${y} ${x + r} ${y} H ${x + width - r} Q ${x + width} ${y} ${x + width} ${y + r} V ${y + height} Z`
}

function labelStep(count) {
  if (count > 20) return 3
  if (count > 10) return 2
  return 1
}

function drawDuration(rows) {
  const plot = document.querySelector('#duration-chart')
  const empty = document.querySelector('#duration-empty')
  plot.replaceChildren()
  empty.hidden = rows.length > 0
  plot.hidden = rows.length === 0
  if (!rows.length) return

  const width = 640
  const height = 280
  const pad = { l: 46, r: 12, t: 16, b: 32 }
  const top = Math.max(3, Math.ceil((Math.max(...rows.map((row) => row.hours)) + 0.4) / 3) * 3)
  const innerW = width - pad.l - pad.r
  const innerH = height - pad.t - pad.b
  const slot = innerW / rows.length
  const yOf = (value) => pad.t + innerH - (value / top) * innerH

  for (let tick = 0; tick <= top; tick += 3) {
    const y = yOf(tick)
    plot.append(
      svg('line', { x1: pad.l, x2: width - pad.r, y1: y, y2: y, stroke: 'var(--grid)' }),
      svg('text', { x: pad.l - 8, y: y + 4, 'text-anchor': 'end' }),
    )
    plot.lastChild.textContent = t('hourTick', { n: tick })
  }

  const step = labelStep(rows.length)
  rows.forEach((row, index) => {
    const barW = Math.min(36, slot * 0.62)
    const x = pad.l + slot * index + (slot - barW) / 2
    const y = yOf(row.hours)
    const path = svg('path', {
      d: barPath(x, y, barW, pad.t + innerH - y, 8),
      fill: 'var(--amber)',
      'data-index': index,
    })
    plot.append(path)
    if (index % step === 0 || index === rows.length - 1) {
      const label = svg('text', {
        x: pad.l + slot * index + slot / 2,
        y: height - 8,
        'text-anchor': 'middle',
      })
      label.textContent = row.label
      plot.append(label)
    }
  })
}

function drawRhythm(rows) {
  const plot = document.querySelector('#rhythm-chart')
  const empty = document.querySelector('#rhythm-empty')
  plot.replaceChildren()
  empty.hidden = rows.length > 0
  plot.hidden = rows.length === 0
  if (!rows.length) return

  const width = 640
  const height = 280
  const pad = { l: 52, r: 16, t: 16, b: 32 }
  const innerW = width - pad.l - pad.r
  const innerH = height - pad.t - pad.b
  const min = Math.min(...rows.map((row) => row.bedtime)) - 30
  const max = Math.max(...rows.map((row) => row.bedtime)) + 30
  const yOf = (value) => pad.t + innerH - ((value - min) / (max - min || 1)) * innerH
  const yQuality = (value) => pad.t + innerH - ((value - 1) / 4) * innerH
  const xOf = (index) => pad.l + (rows.length === 1 ? innerW / 2 : (innerW * index) / (rows.length - 1))

  const firstTick = Math.ceil(min / 60) * 60
  for (let tick = firstTick; tick <= max; tick += 60) {
    const y = yOf(tick)
    plot.append(svg('line', { x1: pad.l, x2: width - pad.r, y1: y, y2: y, stroke: 'var(--grid)' }))
    const label = svg('text', { x: pad.l - 8, y: y + 4, 'text-anchor': 'end' })
    label.textContent = formatClock(tick)
    plot.append(label)
  }

  const bedtime = rows.map((row, index) => `${xOf(index)},${yOf(row.bedtime)}`).join(' ')
  const quality = rows.map((row, index) => `${xOf(index)},${yQuality(row.quality)}`).join(' ')
  plot.append(
    svg('polyline', { points: bedtime, fill: 'none', stroke: 'var(--teal)', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }),
    svg('polyline', { points: quality, fill: 'none', stroke: 'var(--rose)', 'stroke-width': 2, 'stroke-dasharray': '4 4' }),
  )

  const step = labelStep(rows.length)
  rows.forEach((row, index) => {
    plot.append(
      svg('circle', { cx: xOf(index), cy: yOf(row.bedtime), r: 3.5, fill: 'var(--teal)', 'data-index': index }),
      svg('circle', { cx: xOf(index), cy: yQuality(row.quality), r: 3, fill: 'var(--rose)', 'data-index': index }),
    )
    if (index % step === 0 || index === rows.length - 1) {
      const label = svg('text', { x: xOf(index), y: height - 8, 'text-anchor': 'middle' })
      label.textContent = row.label
      plot.append(label)
    }
  })
}

function placeTip(frame, tip, event, html) {
  const bounds = frame.getBoundingClientRect()
  tip.innerHTML = html
  tip.hidden = false
  const left = Math.min(event.clientX - bounds.left + 12, bounds.width - tip.offsetWidth - 8)
  const top = Math.max(8, event.clientY - bounds.top - tip.offsetHeight - 10)
  tip.style.left = `${Math.max(8, left)}px`
  tip.style.top = `${top}px`
}

function renderStats() {
  const stats = summarize()
  const lastDuration = stats.last ? minutesBetween(stats.last.bedtime, stats.last.wakeTime) : null
  document.querySelector('#stat-last').textContent = lastDuration == null ? '—' : formatDuration(lastDuration)
  document.querySelector('#stat-last-meta').textContent = stats.last
    ? `${formatLongDate(stats.last.date)} · ${stats.last.bedtime}–${stats.last.wakeTime}`
    : t('noEntries')
  const nights = stats.nights || 7
  document.querySelector('#stat-avg-label').textContent = t('avgLabel', { n: nights, word: nightsLabel(nights) })
  document.querySelector('#stat-avg').textContent = stats.average == null ? '—' : formatHours(stats.average)
  document.querySelector('#stat-quality').textContent = stats.quality == null ? '—' : stats.quality.toFixed(1)
  document.querySelector('#stat-quality-meta').textContent = stats.quality == null
    ? t('noScores')
    : qualityLabel(Math.round(stats.quality))
  document.querySelector('#stat-debt-label').textContent = stats.debt != null && stats.debt < 0 ? t('surplus') : t('debt')
  document.querySelector('#stat-debt').textContent = stats.debt == null ? '—' : formatHours(Math.abs(stats.debt))
  document.querySelector('#stat-debt-meta').textContent = stats.spread == null
    ? t('recentNights')
    : t('spread', { n: stats.spread })
}

function renderJournal() {
  const rows = sortByDate(entries, 'desc')
  const empty = document.querySelector('#journal-empty')
  const filled = document.querySelector('#journal-filled')
  empty.hidden = rows.length > 0
  filled.hidden = rows.length === 0
  document.querySelector('#journal-count').textContent = t('journalCount', { n: rows.length, word: nightsLabel(rows.length) })
  journalBody.innerHTML = rows.map((entry) => {
    const actions = pendingDeleteId === entry.id
      ? `<div class="confirm"><span>${escapeHtml(t('removeAsk'))}</span><button type="button" class="button danger" data-action="confirm-delete">${escapeHtml(t('yes'))}</button><button type="button" class="button ghost" data-action="cancel-delete">${escapeHtml(t('no'))}</button></div>`
      : `<button type="button" class="button ghost" data-action="edit">${escapeHtml(t('edit'))}</button><button type="button" class="button ghost" data-action="ask-delete">${escapeHtml(t('remove'))}</button>`
    return `<tr data-id="${escapeHtml(entry.id)}">
      <td data-label="${escapeHtml(t('colNight'))}">${escapeHtml(formatLongDate(entry.date))}</td>
      <td data-label="${escapeHtml(t('colBed'))}">${escapeHtml(entry.bedtime)}</td>
      <td data-label="${escapeHtml(t('colWake'))}">${escapeHtml(entry.wakeTime)}</td>
      <td data-label="${escapeHtml(t('colDuration'))}">${escapeHtml(formatDuration(minutesBetween(entry.bedtime, entry.wakeTime)))}</td>
      <td data-label="${escapeHtml(t('colQuality'))}"><span class="quality-pill" data-score="${entry.quality}">${entry.quality} · ${escapeHtml(qualityLabel(entry.quality))}</span></td>
      <td data-label="${escapeHtml(t('colNote'))}" class="note-cell">${escapeHtml(displayNote(entry.note))}</td>
      <td class="row-actions">${actions}</td>
    </tr>`
  }).join('')
}

function markActiveControls() {
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.view === view)
  })
  document.querySelectorAll('[data-range]').forEach((button) => {
    button.classList.toggle('is-active', Number(button.dataset.range) === range)
  })
}

function syncStageHeight() {
  const stage = document.querySelector('.stage')
  const active = document.querySelector(`[data-panel="${view}"]`)
  if (!stage || !active) return
  if (!stageReady) {
    stage.style.transition = 'none'
    stage.style.height = `${active.offsetHeight}px`
    void stage.offsetWidth
    stage.style.transition = ''
    stageReady = true
    return
  }
  stage.style.height = `${active.offsetHeight}px`
}

function renderViews() {
  document.querySelectorAll('[data-panel]').forEach((panel) => {
    panel.classList.toggle('is-active', panel.dataset.panel === view)
  })
  markActiveControls()
  syncStageHeight()
}

function showView(next) {
  if (next === view) return
  const forward = VIEW_ORDER.indexOf(next) > VIEW_ORDER.indexOf(view)
  document.querySelectorAll('[data-panel]').forEach((panel) => {
    panel.classList.remove('is-preparing', 'enter-up', 'enter-down', 'leave-up', 'leave-down')
    if (panel.dataset.panel === view) {
      panel.classList.remove('is-active')
      panel.classList.add(forward ? 'leave-up' : 'leave-down')
    }
    if (panel.dataset.panel === next) {
      panel.classList.add('is-preparing', forward ? 'enter-up' : 'enter-down')
    }
  })
  const incoming = document.querySelector(`[data-panel="${next}"]`)
  void incoming.offsetWidth
  incoming.classList.remove('is-preparing')
  incoming.classList.add('is-active')
  view = next
  markActiveControls()
  requestAnimationFrame(syncStageHeight)
}

function render() {
  const rows = chartRows()
  renderStats()
  drawDuration(rows)
  drawRhythm(rows)
  renderJournal()
  renderViews()
}

function paintQuality(value) {
  document.querySelectorAll('#quality-picker label').forEach((label) => {
    label.classList.toggle('is-selected', label.querySelector('input').value === String(value))
  })
}

function showError(key) {
  formErrorKey = key || ''
  const error = document.querySelector('#form-error')
  error.textContent = formErrorKey ? t(formErrorKey) : ''
  error.hidden = !formErrorKey
}

function paintFormChrome() {
  const editing = Boolean(editingId)
  document.querySelector('#form-kicker').textContent = t(editing ? 'formEditKicker' : 'formNewKicker')
  document.querySelector('#form-title').textContent = t(editing ? 'formEditTitle' : 'formNewTitle')
  document.querySelector('#save-form').textContent = t(editing ? 'save' : 'add')
}

function openForm(entry) {
  editingId = entry?.id ?? null
  form.date.value = entry?.date ?? todayIso()
  form.date.max = todayIso()
  form.bedtime.value = entry?.bedtime ?? '23:30'
  form.wakeTime.value = entry?.wakeTime ?? '07:00'
  form.note.value = entry?.note ?? ''
  form.quality.value = String(entry?.quality ?? 4)
  paintQuality(form.quality.value)
  paintFormChrome()
  showError('')
  dialog.showModal()
}

function closeForm() {
  editingId = null
  dialog.close()
}

function bindChart(frameId, tipId, mode) {
  const frame = document.querySelector(frameId)
  const tip = document.querySelector(tipId)
  frame.addEventListener('mousemove', (event) => {
    const mark = event.target.closest?.('[data-index]')
    if (!mark) {
      tip.hidden = true
      return
    }
    const row = chartRows()[Number(mark.dataset.index)]
    if (!row) return
    const html = mode === 'duration'
      ? `<strong>${escapeHtml(row.label)}</strong><span>${escapeHtml(formatDuration(row.duration))}</span><span>${escapeHtml(row.bedtimeLabel)} – ${escapeHtml(row.wakeLabel)}</span>`
      : `<strong>${escapeHtml(row.label)}</strong><span>${escapeHtml(t('bedtimeTip', { time: row.bedtimeLabel }))}</span><span>${escapeHtml(t('qualityTip', { n: row.quality, label: qualityLabel(row.quality) }))}</span>`
    placeTip(frame, tip, event, html)
  })
  frame.addEventListener('mouseleave', () => {
    tip.hidden = true
  })
}

document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => showView(button.dataset.view))
})

window.addEventListener('resize', syncStageHeight)

document.querySelectorAll('[data-range]').forEach((button) => {
  button.addEventListener('click', () => {
    range = Number(button.dataset.range)
    render()
  })
})

function applyTheme(theme) {
  const next = theme === 'light' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  localStorage.setItem('sleep-tracker.theme', next)
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', next === 'light' ? '#f3eee6' : '#101416')
  document.querySelectorAll('[data-theme-choice]').forEach((button) => {
    const selected = button.dataset.themeChoice === next
    button.classList.toggle('is-active', selected)
    button.setAttribute('aria-pressed', selected ? 'true' : 'false')
  })
}

document.querySelectorAll('[data-theme-choice]').forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.themeChoice === document.documentElement.dataset.theme) return
    applyTheme(button.dataset.themeChoice)
    render()
  })
})

applyTheme(document.documentElement.dataset.theme || 'dark')

function applyLanguage(next) {
  lang = next === 'uz' ? 'uz' : 'ru'
  localStorage.setItem('sleep-tracker.lang', lang)
  document.documentElement.lang = lang
  document.title = t('pageTitle')
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = t(node.dataset.i18n)
  })
  document.querySelectorAll('[data-i18n-aria]').forEach((node) => {
    node.setAttribute('aria-label', t(node.dataset.i18nAria))
  })
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    node.setAttribute('placeholder', t(node.dataset.i18nPlaceholder))
  })
  document.querySelectorAll('[data-lang-choice]').forEach((button) => {
    const selected = button.dataset.langChoice === lang
    button.classList.toggle('is-active', selected)
    button.setAttribute('aria-pressed', selected ? 'true' : 'false')
  })
  if (formErrorKey) showError(formErrorKey)
  if (dialog.open) paintFormChrome()
}

document.querySelectorAll('[data-lang-choice]').forEach((button) => {
  button.addEventListener('click', () => {
    if (button.dataset.langChoice === lang) return
    applyLanguage(button.dataset.langChoice)
    render()
  })
})

applyLanguage(lang)

document.querySelector('#add-night').addEventListener('click', () => openForm(null))
document.querySelector('#close-form').addEventListener('click', closeForm)
document.querySelector('#cancel-form').addEventListener('click', closeForm)
dialog.addEventListener('cancel', (event) => {
  event.preventDefault()
  closeForm()
})
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) closeForm()
})

form.quality.forEach?.((input) => input.addEventListener('change', () => paintQuality(form.quality.value)))
document.querySelectorAll('#quality-picker input').forEach((input) => {
  input.addEventListener('change', () => paintQuality(input.value))
})

form.addEventListener('submit', (event) => {
  event.preventDefault()
  const result = validateEntry({
    date: form.date.value,
    bedtime: form.bedtime.value,
    wakeTime: form.wakeTime.value,
    quality: form.quality.value,
    note: form.note.value,
  }, editingId)
  if (typeof result === 'string') {
    showError(result)
    return
  }
  if (editingId) updateEntry(editingId, result)
  else createEntry(result)
  closeForm()
  render()
})

journalBody.addEventListener('click', (event) => {
  const button = event.target.closest('button')
  const row = event.target.closest('tr')
  if (!button || !row) return
  const id = row.dataset.id
  if (button.dataset.action === 'edit') openForm(entries.find((entry) => entry.id === id))
  if (button.dataset.action === 'ask-delete') {
    pendingDeleteId = id
    renderJournal()
  }
  if (button.dataset.action === 'cancel-delete') {
    pendingDeleteId = null
    renderJournal()
  }
  if (button.dataset.action === 'confirm-delete') {
    deleteEntry(id)
    pendingDeleteId = null
    render()
  }
})

bindChart('#duration-frame', '#duration-tip', 'duration')
bindChart('#rhythm-frame', '#rhythm-tip', 'rhythm')

entries = readEntries()
render()
