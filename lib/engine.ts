// Brew recommendation engine — Fellow Ode 2 + Aiden
// Ported from app.js. All temperatures output in °C.
// Logic is pure/deterministic — no side effects.

import type { Lang } from './i18n'

export interface BrewInput {
  roast: 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark'
  origin: string
  varieties: string[]
  peaberry: boolean
  decaf: boolean
  processing: 'washed' | 'natural' | 'honey' | 'anaerobic'
  elevation: number
  brewSize: 'single' | 'batch'
  sliders: {
    fruit: number      // 0 = fruity, 100 = chocolatey
    body: number       // 0 = light, 100 = full
    acidity: number    // 0 = bright, 100 = smooth
    floral: number     // 0 = floral, 100 = nutty
    strength: number   // 0 = delicate, 100 = bold
  }
}

export interface BrewProfile {
  grindStep: number
  grindDisplay: string
  microns: number
  brewTempC: number
  ratio: number
  bloomRatio: number
  bloomDuration: number
  bloomTempC: number
  pulseCount: number
  pulseInterval: number
  pulseTempListC: number[]
  doseG: number
  waterMl: number
  tips: Tip[]
  explanation: Explanation[]
}

export interface Tip {
  icon: string
  text: string
}

export interface Explanation {
  param: string
  value: string
  summary: string
  reasons: string[]
}

// ── Ode 2 Grind System ─────────────────────────────────────────────────────
// Major numbers 1–11, sub-steps .0/.1/.2 → 33 positions (step index 0–32)
// microns(step) = 150 + step * 45

const GRIND_BASE_MICRONS = 150
const GRIND_MICRONS_PER_STEP = 45
const GRIND_MIN_STEP = 6   // 3.0 (~420μm) — Fellow's practical minimum
const GRIND_MAX_STEP = 32  // 11.2

export function stepToDisplay(step: number): string {
  step = Math.round(step)
  step = Math.max(GRIND_MIN_STEP, Math.min(GRIND_MAX_STEP, step))
  const major = Math.floor(step / 3) + 1
  const sub = step % 3
  return `${major}.${sub}`
}

function stepToMicrons(step: number): number {
  step = Math.max(GRIND_MIN_STEP, Math.min(GRIND_MAX_STEP, step))
  return Math.round(GRIND_BASE_MICRONS + step * GRIND_MICRONS_PER_STEP)
}

// Round to nearest 0.5°C
function fToC(f: number): number {
  return Math.round(((f - 32) * 5) / 9 * 2) / 2
}

// ── Roast profiles (temperatures in °F internally, converted on output) ────

interface RoastProfile {
  grindStepMin: number
  grindStepMax: number
  tempF: number
  tempMax: number
  ratio: number
  bloomRatio: number
  bloomDurationSingle: number
  bloomDurationBatch: number
  bloomTempF: number
  pulsesSingle: number
  pulsesBatch: number
  pulseInterval: number
  pulseTempDecline: number[]
  pulseTempDeclineBatch: number[]
}

const roastProfiles: Record<string, RoastProfile> = {
  light: {
    grindStepMin: 10, grindStepMax: 12,
    tempF: 205, tempMax: 205, ratio: 17, bloomRatio: 3,
    bloomDurationSingle: 45, bloomDurationBatch: 35, bloomTempF: 205,
    pulsesSingle: 4, pulsesBatch: 5, pulseInterval: 23,
    pulseTempDecline: [203, 200, 198, 196],
    pulseTempDeclineBatch: [205, 203, 200, 198, 196],
  },
  'medium-light': {
    grindStepMin: 11, grindStepMax: 14,
    tempF: 203, tempMax: 205, ratio: 16.5, bloomRatio: 3,
    bloomDurationSingle: 38, bloomDurationBatch: 32, bloomTempF: 203,
    pulsesSingle: 3, pulsesBatch: 4, pulseInterval: 23,
    pulseTempDecline: [201, 198, 196],
    pulseTempDeclineBatch: [203, 201, 198, 196],
  },
  medium: {
    grindStepMin: 12, grindStepMax: 15,
    tempF: 200, tempMax: 203, ratio: 16, bloomRatio: 2,
    bloomDurationSingle: 30, bloomDurationBatch: 30, bloomTempF: 200,
    pulsesSingle: 3, pulsesBatch: 3, pulseInterval: 23,
    pulseTempDecline: [198, 196, 194],
    pulseTempDeclineBatch: [200, 198, 196],
  },
  'medium-dark': {
    grindStepMin: 13, grindStepMax: 16,
    tempF: 198, tempMax: 200, ratio: 15.5, bloomRatio: 2,
    bloomDurationSingle: 30, bloomDurationBatch: 28, bloomTempF: 198,
    pulsesSingle: 3, pulsesBatch: 2, pulseInterval: 23,
    pulseTempDecline: [195, 192, 190],
    pulseTempDeclineBatch: [195, 192],
  },
  dark: {
    grindStepMin: 14, grindStepMax: 17,
    tempF: 190, tempMax: 195, ratio: 15.5, bloomRatio: 2,
    bloomDurationSingle: 30, bloomDurationBatch: 25, bloomTempF: 190,
    pulsesSingle: 3, pulsesBatch: 1, pulseInterval: 23,
    pulseTempDecline: [188, 185, 183],
    pulseTempDeclineBatch: [190],
  },
}

// ── Adjustments ────────────────────────────────────────────────────────────

interface Adjustment {
  tempDelta: number
  grindStepDelta: number
  ratioDelta: number
  bloomDelta?: number
  pulseDelta?: number
}

const originAdjustments: Record<string, Adjustment> = {
  ethiopia:    { tempDelta: +1, grindStepDelta:  0, ratioDelta: +0.5 },
  kenya:       { tempDelta: +1, grindStepDelta:  0, ratioDelta: +0.5 },
  rwanda:      { tempDelta: +1, grindStepDelta:  0, ratioDelta:  0   },
  yemen:       { tempDelta:  0, grindStepDelta:  0, ratioDelta:  0   },
  colombia:    { tempDelta:  0, grindStepDelta:  0, ratioDelta:  0   },
  guatemala:   { tempDelta:  0, grindStepDelta:  0, ratioDelta:  0   },
  'costa-rica':{ tempDelta:  0, grindStepDelta:  0, ratioDelta:  0   },
  honduras:    { tempDelta:  0, grindStepDelta:  0, ratioDelta:  0   },
  panama:      { tempDelta:  0, grindStepDelta:  0, ratioDelta:  0   },
  peru:        { tempDelta:  0, grindStepDelta:  0, ratioDelta:  0   },
  mexico:      { tempDelta:  0, grindStepDelta:  0, ratioDelta:  0   },
  brazil:      { tempDelta: -1, grindStepDelta: +1, ratioDelta: -0.5 },
  indonesia:   { tempDelta: -2, grindStepDelta: +2, ratioDelta: -0.5 },
  blend:       { tempDelta:  0, grindStepDelta:  0, ratioDelta:  0   },
}

const varietyGroupDefaults: Record<string, Required<Adjustment>> = {
  'ethiopian-landrace': { grindStepDelta: -2, tempDelta: +2, ratioDelta: +0.5, bloomDelta: +5,  pulseDelta: +1 },
  bourbon:              { grindStepDelta:  0, tempDelta: +1, ratioDelta:  0,   bloomDelta:  0,  pulseDelta:  0 },
  typica:               { grindStepDelta:  0, tempDelta:  0, ratioDelta:  0,   bloomDelta:  0,  pulseDelta:  0 },
  gesha:                { grindStepDelta: -2, tempDelta: +2, ratioDelta: +1.0, bloomDelta: +10, pulseDelta: +1 },
  sl:                   { grindStepDelta: -3, tempDelta: +2, ratioDelta: +0.5, bloomDelta: +5,  pulseDelta:  0 },
  catuai:               { grindStepDelta:  0, tempDelta:  0, ratioDelta:  0,   bloomDelta:  0,  pulseDelta:  0 },
  'catimor-sarchimor':  { grindStepDelta: +1, tempDelta: -1, ratioDelta:  0,   bloomDelta:  0,  pulseDelta:  0 },
  pacamara:             { grindStepDelta: +1, tempDelta: +1, ratioDelta:  0,   bloomDelta: +5,  pulseDelta:  0 },
  'f1-modern':          { grindStepDelta:  0, tempDelta:  0, ratioDelta:  0,   bloomDelta:  0,  pulseDelta:  0 },
  'not-listed':         { grindStepDelta:  0, tempDelta:  0, ratioDelta:  0,   bloomDelta:  0,  pulseDelta:  0 },
}

const varietyToGroup: Record<string, string> = {
  'ethiopian-landrace': 'ethiopian-landrace',
  'jarc-74158': 'ethiopian-landrace', 'jarc-74110': 'ethiopian-landrace',
  'jarc-74112': 'ethiopian-landrace', kurume: 'ethiopian-landrace',
  dega: 'ethiopian-landrace', 'wush-wush': 'ethiopian-landrace',
  'red-bourbon': 'bourbon', 'yellow-bourbon': 'bourbon',
  'pink-bourbon': 'bourbon', 'orange-bourbon': 'bourbon',
  caturra: 'bourbon', 'villa-sarchi': 'bourbon', pacas: 'bourbon',
  typica: 'typica', kona: 'typica', 'blue-mountain': 'typica',
  maragogipe: 'typica', 'mundo-novo': 'typica', java: 'typica',
  gesha: 'gesha',
  sl28: 'sl', sl34: 'sl',
  'red-catuai': 'catuai', 'yellow-catuai': 'catuai',
  pacamara: 'pacamara', maracaturra: 'pacamara',
  catimor: 'catimor-sarchimor', sarchimor: 'catimor-sarchimor',
  castillo: 'catimor-sarchimor', parainema: 'catimor-sarchimor',
  'ruiru-11': 'catimor-sarchimor', obata: 'catimor-sarchimor',
  marsellesa: 'catimor-sarchimor',
  centroamericano: 'f1-modern', starmaya: 'f1-modern',
  batian: 'f1-modern', tabi: 'f1-modern',
  'not-listed': 'not-listed',
}

const varietyOverrides: Record<string, Required<Adjustment>> = {
  'pink-bourbon': { grindStepDelta: -2, tempDelta: +2, ratioDelta: +0.5, bloomDelta: +5, pulseDelta: +1 },
  maragogipe:     { grindStepDelta: +1, tempDelta: -1, ratioDelta:  0,   bloomDelta:  0, pulseDelta:  0 },
  kona:           { grindStepDelta: +1, tempDelta: -1, ratioDelta:  0,   bloomDelta:  0, pulseDelta:  0 },
  castillo:       { grindStepDelta:  0, tempDelta:  0, ratioDelta:  0,   bloomDelta:  0, pulseDelta:  0 },
  tabi:           { grindStepDelta:  0, tempDelta: +1, ratioDelta:  0,   bloomDelta:  0, pulseDelta:  0 },
  'ruiru-11':     { grindStepDelta: -1, tempDelta: +1, ratioDelta:  0,   bloomDelta:  0, pulseDelta:  0 },
  batian:         { grindStepDelta: -1, tempDelta:  0, ratioDelta:  0,   bloomDelta:  0, pulseDelta:  0 },
}

const peaberryAdjustment: Required<Adjustment> = {
  grindStepDelta: -2, tempDelta: +2, ratioDelta: 0, bloomDelta: +5, pulseDelta: +1,
}

const decafAdjustment: Required<Adjustment> = {
  grindStepDelta: +1, tempDelta: -8, ratioDelta: 0, bloomDelta: -5, pulseDelta: 0,
}

const processingAdjustments: Record<string, Required<Adjustment>> = {
  washed:    { tempDelta: +1, grindStepDelta: -1, ratioDelta: +0.5, bloomDelta: +5, pulseDelta:  0 },
  natural:   { tempDelta: -2, grindStepDelta: +1, ratioDelta: -0.5, bloomDelta: -5, pulseDelta: -1 },
  honey:     { tempDelta: -1, grindStepDelta:  0, ratioDelta:  0,   bloomDelta:  0, pulseDelta:  0 },
  anaerobic: { tempDelta: -1, grindStepDelta:  0, ratioDelta:  0,   bloomDelta: +5, pulseDelta:  0 },
}

// ── Elevation helpers ──────────────────────────────────────────────────────

function getElevationGrindDelta(masl: number): number {
  if (masl >= 1800) return -2
  if (masl >= 1400) return -1
  if (masl >= 1000) return 0
  return +1
}

function getElevationTempDelta(masl: number): number {
  if (masl >= 1800) return +1
  if (masl < 1000)  return -1
  return 0
}

function getElevationPulseDelta(masl: number): number {
  return masl >= 1800 ? +1 : 0
}

function isDenseVarietyProfile(varieties: string[]): boolean {
  const denseGroups = ['sl', 'gesha', 'ethiopian-landrace']
  return varieties.some(v => denseGroups.includes(varietyToGroup[v] ?? 'not-listed'))
}

// ── Variety adjustment (averaged across selected varieties) ────────────────

function getSingleVarietyAdjustment(key: string): Required<Adjustment> {
  if (varietyOverrides[key]) return varietyOverrides[key]
  const group = varietyToGroup[key] ?? 'not-listed'
  return varietyGroupDefaults[group] ?? varietyGroupDefaults['not-listed']
}

function getVarietyAdjustment(varieties: string[]): Required<Adjustment> {
  if (!varieties.length) return { grindStepDelta: 0, tempDelta: 0, ratioDelta: 0, bloomDelta: 0, pulseDelta: 0 }
  const totals = { grindStepDelta: 0, tempDelta: 0, ratioDelta: 0, bloomDelta: 0, pulseDelta: 0 }
  for (const v of varieties) {
    const adj = getSingleVarietyAdjustment(v)
    totals.grindStepDelta += adj.grindStepDelta
    totals.tempDelta      += adj.tempDelta
    totals.ratioDelta     += adj.ratioDelta
    totals.bloomDelta     += adj.bloomDelta
    totals.pulseDelta     += adj.pulseDelta
  }
  const n = varieties.length
  return {
    grindStepDelta: Math.round(totals.grindStepDelta / n),
    tempDelta:      Math.round(totals.tempDelta / n),
    ratioDelta:     Math.round((totals.ratioDelta / n) * 2) / 2,
    bloomDelta:     Math.round(totals.bloomDelta / n),
    pulseDelta:     Math.round(totals.pulseDelta / n),
  }
}

// ── Tip & explanation data ─────────────────────────────────────────────────

const originDescriptions: Record<Lang, Record<string, string>> = {
  en: {
    ethiopia:    'Ethiopian beans are known for floral and citrus notes. Washed Ethiopian coffees tend to be tea-like; naturals are berry-forward.',
    kenya:       'Kenyan coffees typically have bright, wine-like acidity with berry and blackcurrant notes. High density beans that benefit from higher extraction.',
    rwanda:      'Rwandan coffees often feature bright acidity with red fruit and floral sweetness.',
    yemen:       'Yemeni beans are complex with wine, chocolate, and dried fruit characteristics. Often naturally processed.',
    colombia:    'Colombian coffees are versatile with caramel sweetness, medium body, and balanced fruitiness.',
    brazil:      "Brazilian beans lean chocolatey and nutty with lower acidity. They're very forgiving across a wide range of brew parameters.",
    guatemala:   'Guatemalan coffees offer chocolate, spice, and stone fruit notes with a rich body.',
    'costa-rica':'Costa Rican beans are clean and balanced with honey sweetness and citrus brightness.',
    honduras:    'Honduran coffees feature caramel, tropical fruit, and chocolate notes with a smooth body.',
    panama:      'Panamanian coffees (especially Gesha) are prized for jasmine, bergamot, and stone fruit elegance.',
    peru:        'Peruvian beans are typically mild with nutty, chocolatey flavors and medium body.',
    mexico:      'Mexican coffees tend toward chocolate, toffee, and mild fruit with approachable acidity.',
    indonesia:   'Indonesian (Sumatra) beans are earthy, herbal, and full-bodied. Often darker-roasted; pair well with lower temperatures.',
    blend:       'Blends are designed for balance. These starting parameters work as a solid baseline for most blends.',
  },
  cs: {
    ethiopia:    'Etiopská káva je známá květinovými a citrusovými tóny. Washed verze připomíná čaj; natural je bobulovitě ovocná.',
    kenya:       'Keňská káva má výraznou, vínovitou aciditu s ostružinami a černým rybízem. Hustá zrna, která těží z důkladnější extrakce.',
    rwanda:      'Rwandská káva se vyznačuje svěží aciditou, červeným ovocem a květinovou sladkostí.',
    yemen:       'Jemenská zrna jsou komplexní — víno, čokoláda, sušené ovoce. Zpravidla natural zpracování.',
    colombia:    'Kolumbijská káva je všestranná — karamelová sladkost, střední tělo, vyvážená ovocnost.',
    brazil:      'Brazilská zrna mají čokoládový a oříškový charakter s nižší aciditou. Velmi tolerantní vůči různým nastavením.',
    guatemala:   'Guatemalská káva nabízí čokoládu, koření a peckovité ovoce s plným tělem.',
    'costa-rica':'Kostarická zrna jsou čistá a vyvážená — medová sladkost a citrusová svěžest.',
    honduras:    'Honduraská káva má karamelové, tropicko-ovocné a čokoládové tóny s hladkým tělem.',
    panama:      'Panamská káva (zejm. Gesha) je proslulá jasmínem, bergamotem a elegancí peckovitého ovoce.',
    peru:        'Peruánská zrna jsou jemná — oříšky, čokoláda, střední tělo.',
    mexico:      'Mexická káva tíhne k čokoládě, toffee a mírnému ovoci s přívětivou aciditou.',
    indonesia:   'Indonéská (Sumatra) zrna jsou zemitá, bylinná a plnotělá. Často tmavěji pražená; dobře se párují s nižšími teplotami.',
    blend:       'Blendám je vlastní rovnováha. Tato výchozí nastavení fungují jako solidní základ pro většinu blendů.',
  },
}

const varietyDescriptions: Record<Lang, Record<string, string>> = {
  en: {
    'ethiopian-landrace': 'Ethiopian heirloom/landrace varieties (including JARC selections like 74158) are among the densest specialty beans. Their high density calls for a finer grind and hotter water to fully extract floral and fruit complexity.',
    bourbon:              'Bourbon family varieties are sweet, complex, and balanced. Moderately dense and versatile across roast levels.',
    typica:               'Typica family varieties produce clean, sweet, elegant cups. Standard brewing parameters work well.',
    gesha:                'Gesha is the most prized specialty variety. Its delicate jasmine, bergamot, and stone fruit notes require careful extraction: grind finer, brew hotter, use a wider ratio (1:17–18), and extend the bloom.',
    sl:                   'SL28 and SL34 are among the densest beans in specialty coffee. Their intense blackcurrant, winey acidity, and juicy body demand significantly finer grinding and higher temperatures.',
    catuai:               'Catuai is a reliable workhorse variety. Standard brewing parameters work well.',
    'catimor-sarchimor':  'Disease-resistant hybrids with Robusta heritage. Brew slightly coarser and cooler to avoid extracting harsh notes. Castillo and Tabi are exceptions with better cup quality.',
    pacamara:             'Pacamara has exceptionally large beans. Slightly coarser grind due to bean size, but raise temp and extend bloom for full extraction.',
    'f1-modern':          'Modern F1 hybrids combine disease resistance with improving cup quality. Standard parameters are a good starting point.',
  },
  cs: {
    'ethiopian-landrace': 'Etiopské landrace odrůdy (včetně JARC selekcí jako 74158) patří k nejhustším specialty zrnům. Jejich hustota vyžaduje jemnější mletí a vyšší teplotu pro plnou extrakci květinové a ovocné komplexity.',
    bourbon:              'Odrůdy rodiny Bourbon jsou sladké, komplexní a vyvážené. Středně hustá zrna vhodná pro různé stupně pražení.',
    typica:               'Odrůdy rodiny Typica dávají čistý, sladký a elegantní šálek. Standardní parametry fungují dobře.',
    gesha:                'Gesha je nejcennější specialty odrůda. Její jemné tóny jasmínu, bergamotu a peckovitého ovoce vyžadují pečlivou extrakci: jemnější mletí, vyšší teplota, širší poměr (1:17–18) a delší bloom.',
    sl:                   'SL28 a SL34 jsou jedny z nejhustších zrn ve specialty kávě. Jejich intenzivní rybíz, vínovitá acidita a šťavnaté tělo vyžadují výrazně jemnější mletí a vyšší teploty.',
    catuai:               'Catuai je spolehlivá a nenáročná odrůda. Standardní parametry fungují dobře.',
    'catimor-sarchimor':  'Hybridy odolné vůči chorobám s dědictvím Robusty. Melte hrubě a chlazze pro vyhnutí se hořkým tónům. Castillo a Tabi jsou výjimky s lepší kvalitou v šálku.',
    pacamara:             'Pacamara má výjimečně velká zrna. Melte mírně hrubě kvůli velikosti, ale zvyšte teplotu a prodlužte bloom pro plnou extrakci.',
    'f1-modern':          'Moderní F1 hybridy kombinují odolnost vůči chorobám se zlepšující se kvalitou v šálku. Standardní parametry jsou dobrým výchozím bodem.',
  },
}

const processingDescriptions: Record<Lang, Record<string, string>> = {
  en: {
    washed:    'Washed processing gives a clean, bright cup that highlights origin character. Higher temps and finer grind help extract clarity.',
    natural:   'Natural processing yields fruity, wine-like sweetness with a heavier body. Pull back on temperature to avoid harsh fermented notes.',
    honey:     'Honey process balances the sweetness of naturals with the clarity of washed. A moderate approach works well.',
    anaerobic: 'Anaerobic fermentation creates intense, unique flavors. These beans can be polarizing — dial carefully and avoid over-extraction.',
  },
  cs: {
    washed:    'Washed zpracování dává čistý a svěží šálek, který zdůrazňuje charakter původu. Vyšší teplota a jemnější mletí pomáhají extrahovat čistotu.',
    natural:   'Natural zpracování přináší ovocnou, vínovitou sladkost s plnějším tělem. Snižte teplotu, abyste se vyhnuli kvasným tónům.',
    honey:     'Honey process vyvažuje sladkost naturalu s čistotou washedu. Umírněný přístup funguje dobře.',
    anaerobic: 'Anaerobní fermentace vytváří intenzivní a unikátní chutě. Tato zrna mohou být polarizující — dolaďujte opatrně a vyhněte se přeextrakci.',
  },
}

// ── Main engine ────────────────────────────────────────────────────────────

export function generateProfile(input: BrewInput, lang: Lang = 'en'): BrewProfile {
  const base = roastProfiles[input.roast]
  const origin = originAdjustments[input.origin] ?? originAdjustments.blend
  const process = processingAdjustments[input.processing] ?? processingAdjustments.washed
  const varietyAdj = getVarietyAdjustment(input.varieties)
  const isBatch = input.brewSize === 'batch'
  const dense = isDenseVarietyProfile(input.varieties)

  const fruitInfluence    = (input.sliders.fruit    - 50) / 100
  const bodyInfluence     = (input.sliders.body     - 50) / 100
  const acidityInfluence  = (input.sliders.acidity  - 50) / 100
  const floralInfluence   = (input.sliders.floral   - 50) / 100
  const strengthInfluence = (input.sliders.strength - 50) / 100

  // Grind
  let grindStep = (base.grindStepMin + base.grindStepMax) / 2
  if (isBatch)          grindStep += 6
  grindStep += origin.grindStepDelta
  grindStep += process.grindStepDelta
  grindStep += varietyAdj.grindStepDelta
  if (input.peaberry)   grindStep += peaberryAdjustment.grindStepDelta
  if (input.decaf)      grindStep += decafAdjustment.grindStepDelta
  if (!dense)           grindStep += getElevationGrindDelta(input.elevation)
  grindStep += fruitInfluence * 1
  grindStep += floralInfluence * 1
  grindStep = Math.round(grindStep)
  grindStep = Math.max(GRIND_MIN_STEP, Math.min(GRIND_MAX_STEP, grindStep))

  // Temperature (computed in °F, converted at the end)
  let tempF = base.tempF
  tempF += origin.tempDelta
  tempF += process.tempDelta
  tempF += varietyAdj.tempDelta
  if (input.peaberry) tempF += peaberryAdjustment.tempDelta
  if (input.decaf)    tempF += decafAdjustment.tempDelta
  tempF += getElevationTempDelta(input.elevation)
  tempF -= fruitInfluence   * 3
  tempF -= acidityInfluence * 4
  tempF -= floralInfluence  * 2
  tempF = Math.round(tempF)
  tempF = Math.max(185, Math.min(base.tempMax, tempF))

  // Ratio
  let ratio = base.ratio
  ratio += origin.ratioDelta
  ratio += process.ratioDelta
  ratio += varietyAdj.ratioDelta ?? 0
  ratio -= bodyInfluence     * 1
  ratio -= strengthInfluence * 1
  ratio = Math.round(ratio * 2) / 2
  ratio = Math.max(14, Math.min(18, ratio))

  // Bloom
  const bloomRatio = base.bloomRatio
  let bloomDuration = isBatch ? base.bloomDurationBatch : base.bloomDurationSingle
  bloomDuration += process.bloomDelta ?? 0
  bloomDuration += varietyAdj.bloomDelta ?? 0
  if (input.peaberry) bloomDuration += peaberryAdjustment.bloomDelta
  if (input.decaf)    bloomDuration += decafAdjustment.bloomDelta
  bloomDuration = Math.max(20, Math.min(60, bloomDuration))

  // Pulses
  let pulseCount = isBatch ? base.pulsesBatch : base.pulsesSingle
  pulseCount += varietyAdj.pulseDelta ?? 0
  pulseCount += process.pulseDelta ?? 0
  if (input.peaberry) pulseCount += peaberryAdjustment.pulseDelta
  if (!dense)         pulseCount += getElevationPulseDelta(input.elevation)
  pulseCount = Math.max(1, Math.min(6, pulseCount))

  let pulseTempListF = isBatch
    ? [...(base.pulseTempDeclineBatch ?? base.pulseTempDecline)]
    : [...base.pulseTempDecline]

  const tempShift = tempF - base.tempF
  pulseTempListF = pulseTempListF.map(t => Math.max(183, Math.min(207, Math.round(t + tempShift))))
  while (pulseTempListF.length < pulseCount) {
    const last = pulseTempListF[pulseTempListF.length - 1] ?? tempF
    pulseTempListF.push(Math.max(183, last - 2))
  }
  pulseTempListF = pulseTempListF.slice(0, pulseCount)

  // Dose
  const doseG  = isBatch ? 55 : 22
  const waterMl = Math.round(doseG * ratio)

  const profile: BrewProfile = {
    grindStep,
    grindDisplay:   stepToDisplay(grindStep),
    microns:        stepToMicrons(grindStep),
    brewTempC:      fToC(tempF),
    ratio,
    bloomRatio,
    bloomDuration,
    bloomTempC:     fToC(tempF),
    pulseCount,
    pulseInterval:  base.pulseInterval,
    pulseTempListC: pulseTempListF.map(fToC),
    doseG,
    waterMl,
    tips:           [],
    explanation:    [],
  }

  profile.tips        = buildTips(input, tempF, grindStep, ratio, lang)
  profile.explanation = buildExplanation(input, profile, tempF, pulseTempListF, lang)
  return profile
}

// ── Tips builder ───────────────────────────────────────────────────────────

export function buildTips(
  input: BrewInput,
  _tempF: number,
  _grindStep: number,
  _ratio: number,
  lang: Lang = 'en',
): Tip[] {
  const tips: Tip[] = []
  const isCz = lang === 'cs'

  const originDesc = originDescriptions[lang][input.origin]
  if (originDesc) tips.push({ icon: '🌍', text: originDesc })

  if (input.varieties.length > 0) {
    const groups = [...new Set(input.varieties.map(v => varietyToGroup[v] ?? 'not-listed'))]
    for (const group of groups) {
      const vd = varietyDescriptions[lang][group]
      if (vd) tips.push({ icon: '🪴', text: vd })
    }
  }

  if (input.peaberry)
    tips.push({ icon: '🌰', text: isCz
      ? 'Peaberry zrna jsou hustší než běžná, protože v třešni se vyvine jen jedno semeno místo dvou. To vyžaduje jemnější mletí a vyšší teploty, spolu s delším bloomem pro odplynění husté struktury.'
      : 'Peaberry beans are denser than regular beans because only one seed develops inside the cherry instead of two. This requires finer grinding and higher temperatures for proper extraction, with a longer bloom to allow the dense bean structure to degas.' })

  if (input.decaf)
    tips.push({ icon: '☕', text: isCz
      ? 'Bezkofeinová zrna jsou porézní díky procesu dekofeinizace, což je činí rychleji extrahovatelná. Použijte chladnější vodu a hrubší mletí, abyste se vyhnuli přeextrakci a hořkosti. Kratší bloom, protože bezkofeiny odplyňují rychleji.'
      : 'Decaf beans are more porous due to the decaffeination process, which makes them extract faster. Use cooler water and a coarser grind to avoid over-extraction and bitterness. Shorter bloom time since decaf degasses more quickly.' })

  const procDesc = processingDescriptions[lang][input.processing]
  if (procDesc) tips.push({ icon: '⚖️', text: procDesc })

  if (input.elevation >= 1800)
    tips.push({ icon: '⛰️', text: isCz
      ? `Pěstováno ve ${input.elevation} m n. m. (velmi vysoká nadmořská výška). Tato zrna jsou výjimečně hustá, proto je mletí nastaveno jemněji a teplota výše pro zajištění plné extrakce.`
      : `Grown at ${input.elevation} MASL (very high altitude). These beans are exceptionally dense, so the grind has been set finer and temperature higher to ensure full extraction.` })
  else if (input.elevation < 1000)
    tips.push({ icon: '⛰️', text: isCz
      ? `Pěstováno v ${input.elevation} m n. m. (nižší nadmořská výška). Méně hustá zrna se extrahují snáze, proto je mletí nastaveno hrubě a teplota mírně nižší.`
      : `Grown at ${input.elevation} MASL (lower altitude). Less dense beans extract more easily, so the grind has been set coarser and temperature slightly lower.` })

  if (input.roast === 'light' || input.roast === 'medium-light')
    tips.push({ icon: '🌡️', text: isCz
      ? 'Světlé pražení je husté a potřebuje více tepla a jemnější mletí pro správnou extrakci. Pokud šálek chutná kysele nebo prázdně, zkuste namelet o 1 stupeň jemněji na Ode 2 (např. 4.2 → 4.1).'
      : 'Light roasts are dense and need more heat and finer grinds to extract properly. If the cup tastes sour or thin, try grinding 1 sub-step finer on the Ode 2 (e.g. 4.2 → 4.1).' })
  else if (input.roast === 'dark' || input.roast === 'medium-dark')
    tips.push({ icon: '🔥', text: isCz
      ? 'Tmavé pražení se extrahuje snadno. Vzorec horký bloom + chladnější pulsy pomáhá vyhnout se hořkosti. Pokud je šálek příliš hořký, jděte o 1 stupeň hrubě (např. 5.2 → 6.0).'
      : 'Darker roasts extract easily. The hot bloom + cooler brew pulse pattern helps avoid bitterness. If too bitter, go 1 sub-step coarser (e.g. 5.2 → 6.0).' })

  if (input.brewSize === 'batch')
    tips.push({ icon: '☕', text: isCz
      ? 'Batch přeav na Aidenu používá plochý košík s filtrem Melitta 8–12 šálků. Hrubší mletí kompenzuje delší kontaktní dobu s větším ložem kávy.'
      : 'Batch brewing on the Aiden uses the flat-bottom basket with a Melitta 8–12 cup filter. The coarser grind compensates for longer contact time with a larger bed of coffee.' })
  else
    tips.push({ icon: '☕', text: isCz
      ? 'Single serve na Aidenu používá kuželový košík s filtrem Melitta #2. Přístup s více pulsy napodobuje pour-over s klesající teplotou pro větší komplexitu.'
      : 'Single-serve brewing on the Aiden uses the cone basket with a Melitta #2 filter. The multi-pulse approach mimics a pour-over with declining temperature for complexity.' })

  tips.push({ icon: '🔄', text: isCz
    ? 'Toto jsou výchozí body. Ochutnej první překap a uprav: kysele/prázdně → melte o 1 stupeň jemněji nebo zvyš teplotu o 1°C; hořce/drsně → melte o 1 stupeň hrubě nebo sniž teplotu o 1°C. Měň vždy jen jednu proměnnou.'
    : 'These are starting points. Taste your first brew and adjust: sour/thin → grind 1 sub-step finer or raise temp by 1°C; bitter/harsh → grind 1 sub-step coarser or lower temp by 1°C. Change one variable at a time.' })

  return tips
}

// ── Explanation builder ────────────────────────────────────────────────────
// Uses internal °F values for the narrative (matches source data), displays °C to user.

export function buildExplanation(
  input: BrewInput,
  profile: BrewProfile,
  brewTempF: number,
  pulseTempListF: number[],
  lang: Lang = 'en',
): Explanation[] {
  const explanations: Explanation[] = []
  const base       = roastProfiles[input.roast]
  const procAdj    = processingAdjustments[input.processing] ?? processingAdjustments.washed
  const varietyAdj = getVarietyAdjustment(input.varieties)
  const isBatch    = input.brewSize === 'batch'
  const isCz       = lang === 'cs'

  const roastLabels: Record<Lang, Record<string, string>> = {
    en: { light: 'light roast', 'medium-light': 'medium-light roast', medium: 'medium roast', 'medium-dark': 'medium-dark roast', dark: 'dark roast' },
    cs: { light: 'světlé pražení', 'medium-light': 'světlo-střední pražení', medium: 'střední pražení', 'medium-dark': 'středně tmavé pražení', dark: 'tmavé pražení' },
  }
  const roastLabel   = roastLabels[lang][input.roast] ?? input.roast
  const processLabel = input.processing.charAt(0).toUpperCase() + input.processing.slice(1)
  const varietyLabel = input.varieties.join(', ')
  const hasVarieties = input.varieties.length > 0

  // Grind
  const grindReasons: string[] = []
  const baseGrindMid = (base.grindStepMin + base.grindStepMax) / 2
  grindReasons.push(isCz
    ? `Výchozí hodnota pro ${roastLabel} je kolem ${stepToDisplay(Math.round(baseGrindMid))}`
    : `The baseline for ${roastLabel} is around ${stepToDisplay(Math.round(baseGrindMid))}`)
  if (isBatch)
    grindReasons.push(isCz
      ? 'Batch přeav přidává +6 kroků (hrubší) pro kompenzaci většího lože kávy a delšího kontaktního času'
      : 'Batch brewing adds +6 steps (coarser) to compensate for the larger coffee bed and longer contact time')
  if (varietyAdj.grindStepDelta !== 0 && hasVarieties) {
    const dirEn = varietyAdj.grindStepDelta < 0 ? 'finer' : 'coarser'
    const dirCs = varietyAdj.grindStepDelta < 0 ? 'jemněji' : 'hrubě'
    const whyEn = varietyAdj.grindStepDelta < 0 ? 'which is dense and needs more surface area for extraction' : 'which extracts more easily'
    const whyCs = varietyAdj.grindStepDelta < 0 ? 'protože je hustá a potřebuje větší povrch pro extrakci' : 'protože se extrahuje snáze'
    const steps = Math.abs(varietyAdj.grindStepDelta)
    grindReasons.push(isCz
      ? `${varietyLabel} jde o ${steps} ${steps > 1 ? 'kroky' : 'krok'} ${dirCs}, ${whyCs}`
      : `${varietyLabel} goes ${steps} step${steps > 1 ? 's' : ''} ${dirEn}, ${whyEn}`)
  }
  if (input.peaberry) grindReasons.push(isCz
    ? `Peaberry zrna jsou hustší, proto o ${Math.abs(peaberryAdjustment.grindStepDelta)} kroky jemněji pro zvýšení extrakce`
    : `Peaberry beans are denser, so ${Math.abs(peaberryAdjustment.grindStepDelta)} steps finer to increase extraction`)
  if (input.decaf) grindReasons.push(isCz
    ? `Bezkofeinová zrna jsou porézní, proto o ${Math.abs(decafAdjustment.grindStepDelta)} krok hrubě pro zpomalení extrakce`
    : `Decaf beans are more porous, so ${Math.abs(decafAdjustment.grindStepDelta)} step coarser to slow extraction`)
  const elevDelta = getElevationGrindDelta(input.elevation)
  if (elevDelta !== 0) {
    const dirEn = elevDelta < 0 ? 'finer' : 'coarser'
    const dirCs = elevDelta < 0 ? 'jemněji' : 'hrubě'
    const denseEn = elevDelta < 0 ? 'denser' : 'less dense'
    const denseCs = elevDelta < 0 ? 'hustší' : 'méně hustá'
    const steps = Math.abs(elevDelta)
    grindReasons.push(isCz
      ? `Zrna pěstovaná v ${input.elevation} m n. m. jsou ${denseCs}, proto o ${steps} ${steps > 1 ? 'kroky' : 'krok'} ${dirCs}`
      : `Beans grown at ${input.elevation} MASL are ${denseEn}, so ${steps} step${steps > 1 ? 's' : ''} ${dirEn}`)
  }
  if (procAdj.grindStepDelta !== 0) {
    const dirEn = procAdj.grindStepDelta < 0 ? 'finer' : 'coarser'
    const dirCs = procAdj.grindStepDelta < 0 ? 'jemněji' : 'hrubě'
    const whyEn = procAdj.grindStepDelta < 0 ? 'to extract the clean, bright flavors' : 'since the sugars from the fruit make it extract more easily'
    const whyCs = procAdj.grindStepDelta < 0 ? 'pro extrakci čistých a svěžích chutí' : 'protože cukry z ovoce usnadňují extrakci'
    grindReasons.push(isCz
      ? `Zpracování ${processLabel} jde o ${Math.abs(procAdj.grindStepDelta)} krok ${dirCs} ${whyCs}`
      : `${processLabel} processing goes ${Math.abs(procAdj.grindStepDelta)} step ${dirEn} ${whyEn}`)
  }
  explanations.push({
    param: isCz ? 'Nastavení mlýnku' : 'Grind Setting',
    value: profile.grindDisplay,
    summary: isCz
      ? `Nastaveno na ${profile.grindDisplay} (~${profile.microns}μm) pro optimální extrakci.`
      : `Set to ${profile.grindDisplay} (~${profile.microns}μm) for optimal extraction.`,
    reasons: grindReasons,
  })

  // Temperature
  const tempReasons: string[] = []
  tempReasons.push(isCz
    ? `${roastLabel.charAt(0).toUpperCase() + roastLabel.slice(1)} má výchozí teplotu přípravy ${fToC(base.tempF)}°C`
    : `${roastLabel.charAt(0).toUpperCase() + roastLabel.slice(1)} has a baseline brew temperature of ${fToC(base.tempF)}°C`)
  if (varietyAdj.tempDelta !== 0 && hasVarieties) {
    const dirEn = varietyAdj.tempDelta > 0 ? 'higher' : 'lower'
    const dirCs = varietyAdj.tempDelta > 0 ? 'vyšší' : 'nižší'
    const whyEn = varietyAdj.tempDelta > 0 ? 'because dense beans need more heat to fully extract' : 'to avoid over-extracting'
    const whyCs = varietyAdj.tempDelta > 0 ? 'protože hustá zrna potřebují více tepla pro plnou extrakci' : 'aby se předešlo přeextrakci'
    const diff = Math.abs(Math.round(varietyAdj.tempDelta * 5 / 9))
    tempReasons.push(isCz
      ? `${varietyLabel} potřebuje o ${diff}°C ${dirCs} ${whyCs}`
      : `${varietyLabel} needs ${diff}°C ${dirEn} ${whyEn}`)
  }
  if (input.peaberry) tempReasons.push(isCz
    ? 'Peaberry zrna potřebují vyšší teplotu kvůli zvýšené hustotě'
    : 'Peaberry beans need higher temperature due to their increased density')
  if (input.decaf) tempReasons.push(isCz
    ? 'Bezkofeinová zrna potřebují nižší teplotu, aby se předešlo hořkosti z přeextrakce'
    : 'Decaf beans need lower temperature to avoid bitterness from over-extraction')
  if (procAdj.tempDelta !== 0) {
    const dirEn = procAdj.tempDelta > 0 ? 'higher' : 'lower'
    const dirCs = procAdj.tempDelta > 0 ? 'vyšší' : 'nižší'
    const whyEn = procAdj.tempDelta > 0 ? 'to extract clarity and brightness' : 'to avoid harsh or fermented notes'
    const whyCs = procAdj.tempDelta > 0 ? 'pro extrakci čistosti a svěžesti' : 'aby se předešlo drsným nebo kvasným tónům'
    tempReasons.push(isCz
      ? `Zpracování ${processLabel} profituje z ${dirCs} teploty ${whyCs}`
      : `${processLabel} processing benefits from a ${dirEn} temperature ${whyEn}`)
  }
  explanations.push({
    param: isCz ? 'Teplota vody' : 'Brew Temperature',
    value: `${profile.brewTempC}°C`,
    summary: isCz
      ? `Nastaveno na ${profile.brewTempC}°C pro vyváženou extrakci bez hořkosti.`
      : `Set to ${profile.brewTempC}°C for balanced extraction without bitterness.`,
    reasons: tempReasons,
  })

  // Ratio
  const ratioReasons: string[] = []
  ratioReasons.push(isCz
    ? `Poměr 1:${base.ratio} je standardní pro ${roastLabel}`
    : `A 1:${base.ratio} ratio is standard for ${roastLabel}`)
  if (varietyAdj.ratioDelta && varietyAdj.ratioDelta !== 0 && hasVarieties) {
    const dirEn = varietyAdj.ratioDelta > 0 ? 'wider' : 'tighter'
    const dirCs = varietyAdj.ratioDelta > 0 ? 'širší' : 'těsnější'
    const whyEn = varietyAdj.ratioDelta > 0 ? 'to preserve delicate flavors without over-concentration' : 'for more body'
    const whyCs = varietyAdj.ratioDelta > 0 ? 'pro zachování jemných chutí bez překoncentrování' : 'pro plnější tělo'
    ratioReasons.push(isCz
      ? `${varietyLabel} těží z ${dirCs}ho poměru ${whyCs}`
      : `${varietyLabel} benefits from a ${dirEn} ratio ${whyEn}`)
  }
  if (procAdj.ratioDelta !== 0)
    ratioReasons.push(isCz
      ? `Zpracování ${processLabel} funguje dobře s ${procAdj.ratioDelta > 0 ? 'širším (více vody)' : 'těsnějším (méně vody)'} poměrem`
      : `${processLabel} processing works well with a ${procAdj.ratioDelta > 0 ? 'wider (more water)' : 'tighter (less water)'} ratio`)
  explanations.push({
    param: isCz ? 'Poměr káva:voda' : 'Coffee-to-Water Ratio',
    value: `1:${profile.ratio.toFixed(1)}`,
    summary: isCz
      ? `Použijte ${profile.doseG}g kávy na ${profile.waterMl}ml vody.`
      : `Using ${profile.doseG}g of coffee to ${profile.waterMl}ml of water.`,
    reasons: ratioReasons,
  })

  // Bloom
  const bloomReasons: string[] = []
  bloomReasons.push(isCz
    ? `Poměr bloom 1:${profile.bloomRatio} (${profile.doseG * profile.bloomRatio}g vody na ${profile.doseG}g kávy) nasytí lože pro odplynění`
    : `A 1:${profile.bloomRatio} bloom ratio (${profile.doseG * profile.bloomRatio}g water for ${profile.doseG}g coffee) saturates the grounds for degassing`)
  bloomReasons.push(isCz
    ? `${profile.bloomDuration} sekund umožní CO₂ uniknout ze zrn ${roastLabel}`
    : `${profile.bloomDuration} seconds allows CO₂ to escape from the ${roastLabel} beans`)
  if (varietyAdj.bloomDelta && hasVarieties) {
    const dirEn = varietyAdj.bloomDelta > 0 ? 'longer' : 'shorter'
    const dirCs = varietyAdj.bloomDelta > 0 ? 'delší' : 'kratší'
    const whyEn = varietyAdj.bloomDelta > 0 ? 'because dense beans need more time to degas' : 'since they degas quickly'
    const whyCs = varietyAdj.bloomDelta > 0 ? 'protože hustá zrna potřebují více času na odplynění' : 'protože rychle odplyňují'
    bloomReasons.push(isCz
      ? `${varietyLabel} dostává ${dirCs} bloom ${whyCs}`
      : `${varietyLabel} gets a ${dirEn} bloom ${whyEn}`)
  }
  if (input.peaberry) bloomReasons.push(isCz
    ? `Peaberry zrna dostávají o ${peaberryAdjustment.bloomDelta}s delší bloom pro odplynění husté struktury`
    : `Peaberry beans get ${peaberryAdjustment.bloomDelta}s longer bloom to allow the dense structure to degas`)
  if (input.decaf) bloomReasons.push(isCz
    ? `Bezkofeinová zrna dostávají o ${Math.abs(decafAdjustment.bloomDelta)}s kratší bloom, protože odplyňují rychleji`
    : `Decaf beans get ${Math.abs(decafAdjustment.bloomDelta)}s shorter bloom since they degas faster`)
  const darkRoastNote = input.roast === 'dark' || input.roast === 'medium-dark'
  bloomReasons.push(isCz
    ? `Teplota bloom je ${profile.bloomTempC}°C${darkRoastNote ? ' (horký bloom pomáhá rozvinout sladkost před chladnějšími pulsy)' : ''}`
    : `Bloom temperature is ${profile.bloomTempC}°C${darkRoastNote ? ' (hot bloom helps develop sweetness before the cooler brew pulses)' : ''}`)
  explanations.push({
    param: 'Bloom',
    value: `1:${profile.bloomRatio} · ${profile.bloomDuration}s · ${profile.bloomTempC}°C`,
    summary: isCz
      ? 'Připraví lože kávy uvolněním zachyceného CO₂ pro rovnoměrnou extrakci.'
      : 'Prepares the coffee bed by releasing trapped CO₂ for even extraction.',
    reasons: bloomReasons,
  })

  // Pulses
  const pulseReasons: string[] = []
  pulseReasons.push(isCz
    ? `${profile.pulseCount} ${profile.pulseCount > 1 ? 'pulsy' : 'pulse'} ${isBatch ? 'pro batch brew (méně, větší dávky vody)' : 'napodobuje pour-over techniku pro single serve'}`
    : `${profile.pulseCount} pulse${profile.pulseCount > 1 ? 's' : ''} ${isBatch ? 'for batch brewing (fewer, larger pours)' : 'mimics a pour-over technique for single-serve'}`)
  pulseReasons.push(isCz
    ? `${profile.pulseInterval} sekund mezi pulsy nechá vodu projít ložem kávy`
    : `${profile.pulseInterval} seconds between pulses allows the water to draw through the coffee bed`)
  if (pulseTempListF.length > 1) {
    const drop = pulseTempListF[0] - pulseTempListF[pulseTempListF.length - 1]
    const dropC = Math.round(drop * 5 / 9)
    pulseReasons.push(isCz
      ? `Teploty klesají z ${profile.pulseTempListC[0]}°C na ${profile.pulseTempListC[profile.pulseTempListC.length - 1]}°C (pokles o ${dropC}°C)`
      : `Temperatures decline from ${profile.pulseTempListC[0]}°C to ${profile.pulseTempListC[profile.pulseTempListC.length - 1]}°C (${dropC}°C drop)`)
    pulseReasons.push(isCz
      ? 'Klesající profil extrahuje svěžejší sloučeniny brzy (vyšší teploty) a zabraňuje přeextrahování hořkých sloučenin později (nižší teploty)'
      : 'This declining profile extracts brighter compounds early (higher temps) and avoids over-extracting bitter compounds later (lower temps)')
  }
  if (input.roast === 'dark' || input.roast === 'medium-dark')
    pulseReasons.push(isCz
      ? 'U tmavšího pražení jsou chladnější pulsy zvláště důležité pro prevenci hořkosti'
      : 'For darker roasts, the cooler brew pulses are especially important to prevent bitterness')
  explanations.push({
    param: isCz ? 'Profil pulsů' : 'Pulse Profile',
    value: isCz ? `${profile.pulseCount} pulsy, každých ${profile.pulseInterval}s` : `${profile.pulseCount} pulses, ${profile.pulseInterval}s apart`,
    summary: isCz
      ? 'Postupné přidávání vody pro kontrolovanou a rovnoměrnou extrakci.'
      : 'Staged water delivery for controlled, even extraction.',
    reasons: pulseReasons,
  })

  return explanations
}
