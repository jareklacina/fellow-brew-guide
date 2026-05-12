export type Lang = 'en' | 'cs'

export const t = {
  en: {
    // Header
    appName: 'Brew Guide',
    appSubtitle: 'Fellow Aiden + Ode 2',

    // Hero
    heroSubtitle: 'Fellow Aiden + Ode 2 Brew Calculator',
    heroTitle: 'Get Your Perfect Brew Settings',
    heroDesc: "Enter your coffee's details and get personalised grind, temperature, ratio, bloom, and pulse settings — calibrated for your specific beans.",

    // Form
    yourCoffee: 'Your Coffee',
    roastLevel: 'Roast Level',
    origin: 'Origin',
    variety: 'Variety',
    varietyHint: '(optional, multi-select)',
    peaberry: 'Peaberry',
    peaberryHint: 'Denser, needs finer grind',
    decaf: 'Decaf',
    decafHint: 'SWP — more porous',
    processing: 'Processing',
    elevation: 'Elevation',
    brewSize: 'Brew Size',
    singleServe: 'Single (22g)',
    batchBrew: 'Batch (55g)',
    tastePrefs: 'Taste Preferences',
    generateBtn: '☕ Generate Brew Profile',

    // Sliders
    fruity: 'Fruity', chocolatey: 'Chocolatey',
    lightBody: 'Light body', fullBody: 'Full body',
    bright: 'Bright', smooth: 'Smooth',
    floral: 'Floral', nutty: 'Nutty',
    delicate: 'Delicate', bold: 'Bold',

    // Roasts
    light: 'Light', medLight: 'Med-Light', medium: 'Medium',
    medDark: 'Med-Dark', dark: 'Dark',

    // Processing
    washed: 'Washed', natural: 'Natural', honey: 'Honey', anaerobic: 'Anaerobic',

    // Variety groups
    vgEthiopianLandrace: 'Ethiopian Landrace',
    vgBourbon: 'Bourbon Family',
    vgTypica: 'Typica Family',
    vgGeshaSL: 'Gesha / SL',
    vgCatuai: 'Catuai / Pacamara',
    vgCatimor: 'Catimor / Sarchimor',
    vgF1: 'F1 / Modern Hybrids',
    vgOther: 'Other',
    notListed: 'Not Listed / Unknown',

    // Result
    yourBrewProfile: 'Your Brew Profile',
    ode2Grind: '⚙️ Fellow Ode 2 — Grind',
    grindSetting: 'Grind Setting',
    grindSubLabel: 'Ode 2 Gen 2 (1.0–11.2)',
    particleSize: 'Particle Size',
    coffeeDose: 'Coffee Dose',
    aidenSettings: '☕ Fellow Aiden — Brew Settings',
    brewTemp: 'Brew Temp',
    ratio: 'Ratio',
    bloomTemp: 'Bloom Temp',
    pulses: 'Pulses',
    every: 'every',
    seconds: 's',
    pulseTempProfile: 'Pulse Temperature Profile',
    bloom: 'Bloom',
    pulse: 'Pulse',
    tips: 'Tips',
    whySettings: 'Why These Settings',
    saveProfile: 'Save Profile',
    reset: 'Reset',

    // Save modal
    saveTitle: 'Save Brew Profile',
    saveDesc: 'Give this profile a name so you can find it later.',
    savePlaceholder: 'e.g. Ethiopia Yirgacheffe — Light',
    cancel: 'Cancel',
    save: 'Save',

    // Saved profiles
    savedProfiles: 'Saved Profiles',

    // Dial-in guide
    dialInTitle: 'Dial-In Guide',
    sourTitle: 'Tastes Sour or Thin',
    sourDiag: 'Under-extraction',
    sourFix1: 'Grind 1 sub-step finer on the Ode 2 (e.g. 5.0 → 4.2)',
    sourFix2: 'Raise brew temperature by 1°C',
    sourFix3: 'Extend bloom by 5 seconds',
    sourFix4: 'Slow down: add 1 extra pulse',
    bitterTitle: 'Tastes Bitter or Harsh',
    bitterDiag: 'Over-extraction',
    bitterFix1: 'Grind 1 sub-step coarser (e.g. 4.2 → 5.0)',
    bitterFix2: 'Lower brew temperature by 1°C',
    bitterFix3: 'Shorten bloom by 5 seconds',
    bitterFix4: 'Reduce pulses by 1',
    weakTitle: 'Tastes Weak or Watery',
    weakDiag: 'Under-strength',
    weakFix1: 'Use a tighter ratio (e.g. 1:16 → 1:15.5)',
    weakFix2: 'Increase dose by 1–2g',
    weakFix3: 'Keep temperature and grind the same',
    strongTitle: 'Tastes Too Strong',
    strongDiag: 'Over-strength',
    strongFix1: 'Use a wider ratio (e.g. 1:16 → 1:16.5)',
    strongFix2: 'Reduce dose by 1–2g',
    strongFix3: 'Adjust grind only if flavour balance is off',

    // Footer
    footerDisclaimer: 'Brew parameters based on community research for Fellow Aiden + Ode 2 Gen 2. Not affiliated with Fellow Products.',
    footerInspired: 'Inspired by',
    footerTagline: 'All values are starting points — dial in to your taste.',

    // Placeholder
    placeholderText: 'Fill in your coffee details and click',
    placeholderBtn: 'Generate Brew Profile',
    placeholderTo: 'to get started.',

    // Buy me a coffee
    buyMeCoffee: 'If you like it, you can buy me a coffee.',

    // Toast
    saved: 'saved!',
  },

  cs: {
    // Header
    appName: 'Brew Guide',
    appSubtitle: 'Fellow Aiden + Ode 2',

    // Hero
    heroSubtitle: 'Kalkulačka pro Fellow Aiden + Ode 2',
    heroTitle: 'Najdi si ideální nastavení svého batche',
    heroDesc: 'Zadej parametry své kávy a získej doporučení pro grind, teplotu, poměr, bloom a pulse — kalibrované přímo pro tvoje zrno.',

    // Form
    yourCoffee: 'Tvoje káva',
    roastLevel: 'Stupeň pražení',
    origin: 'Původ',
    variety: 'Odrůda',
    varietyHint: '(volitelné, lze vybrat více)',
    peaberry: 'Peaberry',
    peaberryHint: 'Hustší zrno, jemnější mletí',
    decaf: 'Bezkofein',
    decafHint: 'SWP — pórovitější struktura',
    processing: 'Zpracování',
    elevation: 'Nadmořská výška',
    brewSize: 'Velikost dávky',
    singleServe: 'Single (22g)',
    batchBrew: 'Batch (55g)',
    tastePrefs: 'Chuťové preference',
    generateBtn: '☕ Vygenerovat brew profil',

    // Sliders
    fruity: 'Ovocné', chocolatey: 'Čokoládové',
    lightBody: 'Lehké tělo', fullBody: 'Plné tělo',
    bright: 'Svěží', smooth: 'Hladké',
    floral: 'Květinové', nutty: 'Oříškové',
    delicate: 'Jemné', bold: 'Výrazné',

    // Roasts
    light: 'Světlé', medLight: 'Středně světlé', medium: 'Střední',
    medDark: 'Středně tmavé', dark: 'Tmavé',

    // Processing
    washed: 'Washed', natural: 'Natural', honey: 'Honey', anaerobic: 'Anaerobní',

    // Variety groups
    vgEthiopianLandrace: 'Etiopské landrace',
    vgBourbon: 'Rodina Bourbon',
    vgTypica: 'Rodina Typica',
    vgGeshaSL: 'Gesha / SL',
    vgCatuai: 'Catuai / Pacamara',
    vgCatimor: 'Catimor / Sarchimor',
    vgF1: 'F1 / Moderní hybridy',
    vgOther: 'Ostatní',
    notListed: 'Neuvedeno / Neznámé',

    // Result
    yourBrewProfile: 'Tvůj brew profil',
    ode2Grind: '⚙️ Fellow Ode 2 — Mletí',
    grindSetting: 'Nastavení mlýnku',
    grindSubLabel: 'Ode 2 Gen 2 (1.0–11.2)',
    particleSize: 'Velikost částic',
    coffeeDose: 'Dávka kávy',
    aidenSettings: '☕ Fellow Aiden — Nastavení',
    brewTemp: 'Teplota vody',
    ratio: 'Poměr',
    bloomTemp: 'Teplota bloom',
    pulses: 'Pulsy',
    every: 'každých',
    seconds: 's',
    pulseTempProfile: 'Teplotní profil pulsů',
    bloom: 'Bloom',
    pulse: 'Pulse',
    tips: 'Tipy',
    whySettings: 'Proč tato nastavení',
    saveProfile: 'Uložit profil',
    reset: 'Resetovat',

    // Save modal
    saveTitle: 'Uložit brew profil',
    saveDesc: 'Pojmenuj profil, abys ho snadno našel/našla.',
    savePlaceholder: 'např. Etiopie Yirgacheffe — Světlé',
    cancel: 'Zrušit',
    save: 'Uložit',

    // Saved profiles
    savedProfiles: 'Uložené profily',

    // Dial-in guide
    dialInTitle: 'Průvodce dolaďováním',
    sourTitle: 'Chutná kysele nebo prázdně',
    sourDiag: 'Nedostatečná extrakce',
    sourFix1: 'Namelte o 1 stupeň jemněji na Ode 2 (např. 5.0 → 4.2)',
    sourFix2: 'Zvyšte teplotu o 1°C',
    sourFix3: 'Prodlužte bloom o 5 sekund',
    sourFix4: 'Přidejte 1 extra pulse',
    bitterTitle: 'Chutná hořce nebo drsně',
    bitterDiag: 'Přeextrahování',
    bitterFix1: 'Namelte o 1 stupeň hrubě (např. 4.2 → 5.0)',
    bitterFix2: 'Snižte teplotu o 1°C',
    bitterFix3: 'Zkraťte bloom o 5 sekund',
    bitterFix4: 'Uberte 1 pulse',
    weakTitle: 'Chutná slabě nebo vodnatě',
    weakDiag: 'Slabá koncentrace',
    weakFix1: 'Použijte těsnější poměr (např. 1:16 → 1:15,5)',
    weakFix2: 'Přidejte 1–2g kávy',
    weakFix3: 'Teplotu a mletí neměňte',
    strongTitle: 'Chutná příliš silně',
    strongDiag: 'Vysoká koncentrace',
    strongFix1: 'Použijte širší poměr (např. 1:16 → 1:16,5)',
    strongFix2: 'Uberte 1–2g kávy',
    strongFix3: 'Mletí měňte jen pokud je chuťová nerovnováha',

    // Footer
    footerDisclaimer: 'Parametry vychází z komunitního výzkumu pro Fellow Aiden + Ode 2 Gen 2. Nejsme přidruženi ke společnosti Fellow Products.',
    footerInspired: 'Inspirováno',
    footerTagline: 'Všechna nastavení jsou výchozí bod — dolaď podle chuti.',

    // Placeholder
    placeholderText: 'Vyplň parametry kávy a klikni na',
    placeholderBtn: 'Vygenerovat brew profil',
    placeholderTo: 'pro začátek.',

    // Buy me a coffee
    buyMeCoffee: 'Jestli se ti apka líbí, můžeš mi koupit kafe.',

    // Toast
    saved: 'uloženo!',
  },
} as const satisfies Record<Lang, Record<string, string>>

export type Translations = typeof t.en
