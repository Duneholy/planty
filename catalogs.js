// Справочники для API и клиента (id иллюстраций, виды питомцев, эмодзи)

const PLANT_ART_IDS = [
  'zamioculcas', 'dracaena', 'ficus', 'calathea', 'anthurium', 'caladium', 'narcissus',
  'chlorophytum-lemon', 'nephrolepis', 'adenium',
  'monstera', 'pothos', 'aloe', 'sansevieria', 'philodendron', 'begonia', 'orchid',
  'cactus-barrel', 'cactus-opuntia', 'lavender', 'basil', 'mint', 'rosemary', 'tulip',
  'violet', 'peperomia', 'hoya', 'bromeliad', 'spathiphyllum', 'dieffenbachia',
  'aglaonema', 'tradescantia', 'maranta', 'strelitzia', 'yucca', 'schefflera', 'croton',
  'fern-boston', 'ivy', 'echeveria', 'jade', 'kalanchoe', 'pilea', 'rubber-plant',
  'palm-areca', 'citrus', 'geranium', 'spathiphyllum-mini', 'oxalis', 'asparagus-fern',
  'other'
];

const PLANT_META = {
  zamioculcas: ['Замиокулькас', 'Zamioculcas zamiifolia'],
  dracaena: ['Драцена', 'Dracaena marginata'],
  ficus: ['Фикус', 'Ficus benjamina'],
  calathea: ['Калатея', 'Calathea roseopicta'],
  anthurium: ['Антуриум', 'Anthurium'],
  caladium: ['Каладиум', 'Caladium'],
  narcissus: ['Нарцисс', 'Narcissus'],
  'chlorophytum-lemon': ['Хлорофитум', 'Chlorophytum comosum'],
  nephrolepis: ['Нефролепис', 'Nephrolepis exaltata'],
  adenium: ['Адениум', 'Adenium obesum'],
  monstera: ['Монстера', 'Monstera deliciosa'],
  pothos: ['Эпипремнум', 'Epipremnum aureum'],
  aloe: ['Алоэ', 'Aloe vera'],
  sansevieria: ['Сансевиерия', 'Dracaena trifasciata'],
  philodendron: ['Филодендрон', 'Philodendron'],
  begonia: ['Бегония', 'Begonia'],
  orchid: ['Орхидея', 'Phalaenopsis'],
  'cactus-barrel': ['Эхинокактус', 'Echinocactus grusonii'],
  'cactus-opuntia': ['Опунция', 'Opuntia'],
  lavender: ['Лаванда', 'Lavandula'],
  basil: ['Базилик', 'Ocimum basilicum'],
  mint: ['Мята', 'Mentha'],
  rosemary: ['Розмарин', 'Salvia rosmarinus'],
  tulip: ['Тюльпан', 'Tulipa'],
  violet: ['Фиалка', 'Saintpaulia'],
  peperomia: ['Пеперомия', 'Peperomia'],
  hoya: ['Хойя', 'Hoya carnosa'],
  bromeliad: ['Гузмания', 'Guzmania'],
  spathiphyllum: ['Спатифиллум', 'Spathiphyllum'],
  dieffenbachia: ['Диффенбахия', 'Dieffenbachia'],
  aglaonema: ['Аглаонема', 'Aglaonema'],
  tradescantia: ['Традесканция', 'Tradescantia'],
  maranta: ['Маранта', 'Maranta leuconeura'],
  strelitzia: ['Стрелиция', 'Strelitzia reginae'],
  yucca: ['Юкка', 'Yucca'],
  schefflera: ['Шеффлера', 'Schefflera'],
  croton: ['Кротон', 'Codiaeum variegatum'],
  'fern-boston': ['Папоротник', 'Nephrolepis exaltata'],
  ivy: ['Плющ', 'Hedera helix'],
  echeveria: ['Эхеверия', 'Echeveria'],
  jade: ['Толстянка', 'Crassula ovata'],
  kalanchoe: ['Каланхоэ', 'Kalanchoe blossfeldiana'],
  pilea: ['Пилея', 'Pilea peperomioides'],
  'rubber-plant': ['Каучуконос', 'Ficus elastica'],
  'palm-areca': ['Арека', 'Dypsis lutescens'],
  citrus: ['Цитрус', 'Citrus'],
  geranium: ['Герань', 'Pelargonium'],
  'spathiphyllum-mini': ['Спатифиллум', 'Spathiphyllum'],
  oxalis: ['Кислица', 'Oxalis triangularis'],
  'asparagus-fern': ['Аспарагус', 'Asparagus setaceus'],
  other: ['Другое', '']
};

const LIGHT_OPTIONS = [
  { id: 'bright', short: 'Много яркого света', full: 'Самое светлое место в доме, без долгого полуденного солнца. В тени листья мельчают и бледнеют.' },
  { id: 'diffused', short: 'Яркий рассеянный', full: 'Яркий рассеянный свет у восточного или западного окна. Прямые полуденные лучи оставляют ожоги.' },
  { id: 'partial', short: 'Полутень', full: 'Мягкий свет или полутень. Прямое солнце выцветает окраску, глубокая тень делает её бледной.' },
  { id: 'shade', short: 'Тень', full: 'Спокойно растёт в глубине комнаты. Прямое солнце не нужно и часто вредно.' },
  { id: 'sun', short: 'Прямое солнце', full: 'Нужно несколько часов прямого солнца. В самый жаркий полдень лучше слегка отодвинуть от стекла.' }
];

const PLANT_ACCENTS = [
  '#3BA55D', '#F5A503', '#FF5C39', '#A96FD6', '#3E8EDE', '#F0567E', '#F2C230', '#9BC53D',
  '#1E9E6E', '#D6478C', '#2E9E52', '#57C878', '#7FB531', '#4FA3E0', '#E2795B', '#8E5DB5'
];

const EMOJI_PICKER = [
  '💧', '🌾', '🥚', '🥕', '🥜', '🍎', '🍌', '🥬', '🧀', '🍖', '🐟', '🦴', '🪴', '✂️', '🛁',
  '🧹', '🪟', '🏃', '💊', '🩺', '🎾', '🧸', '🪶', '🌻', '🍓', '🫐', '🥦', '🌽', '🍞', '🥛',
  '🫖', '❤️', '⭐', '🔔', '📅', '✅', '🎯', '🧤', '🪣', '🧴', '💤', '🌙', '☀️', '🌈', '🔥',
  '❄️', '🐾', '🐹', '🐱', '🐶', '🐰', '🦜', '🐠', '🐢', '🌿', '🍀', '🌸', '🌺', '🍃', '🪷',
  '🎀', '🏠', '🚪', '🔑', '📦', '🧺', '🪜', '🧯', '⚖️', '📝', '🎵', '🎁', '🍪', '🥨', '🧁',
  '🍯', '🫒', '🥒', '🍅', '🫑', '🌶️', '🧊', '🏖️', '🧣', '🧦', '👀', '👂', '🦷', '🫁', '💚',
  '💛', '🧡', '💜', '🩵', '🩷', '🤎', '🖤', '🤍', '✨', '🫶', '🙌', '👍', '🤲'
];

const PET_SPECIES = [
  {
    kind: 'hamster',
    species: 'Сирийский хомяк',
    latin: 'Mesocricetus auratus',
    accent: '#C98A4B',
    seasonTips: {
      зима: ['🌡 Не допускайте похолодания ниже 18 °C в комнате с клеткой.'],
      лето: ['🌡 В жару обеспечьте прохладу и свежую воду чаще обычного.'],
      весна: ['🌤 Больше активности — проверьте колесо и игрушки.'],
      осень: ['🍂 Готовят запасы — следите, чтобы кладовые не портились.']
    }
  },
  {
    kind: 'guinea-pig',
    species: 'Морская свинка',
    latin: 'Cavia porcellus',
    accent: '#E8A65D',
    seasonTips: {
      зима: ['🌾 Сено должно быть всегда — основа рациона круглый год.'],
      лето: ['🥒 Свежие овощи убирайте из клетки через 2–3 часа.'],
      весна: ['✂️ Стрижка длинношёрстных пород после зимы.'],
      осень: ['🏠 Утеплите домик, уберите от сквозняков.']
    }
  },
  {
    kind: 'rabbit',
    species: 'Декоративный кролик',
    latin: 'Oryctolagus cuniculus',
    accent: '#F5C4A8',
    seasonTips: {
      зима: ['🌾 Сено и вода без ограничений — главное зимой.'],
      лето: ['🌡 Кролики плохо переносят жару — держите в прохладе.'],
      весна: ['🪮 Линька — чаще вычёсывайте.'],
      осень: ['🥕 Постепенно добавляйте корнеплоды в рацион.']
    }
  },
  {
    kind: 'cat',
    species: 'Домашняя кошка',
    latin: 'Felis catus',
    accent: '#7B8FA1',
    seasonTips: {
      зима: ['🛁 Расчёсывание помогает при сезонной линьке.'],
      лето: ['💧 Лоток и миски с водой — чистые и прохладные.'],
      весна: ['🏃 Игры и активность после зимней лени.'],
      осень: ['🧹 Проверьте переноску и вакцинацию перед сезоном.']
    }
  },
  {
    kind: 'dog',
    species: 'Собака',
    latin: 'Canis familiaris',
    accent: '#B07D4E',
    seasonTips: {
      зима: ['🧣 Короткошёрстным породам может понадобиться защита на прогулке.'],
      лето: ['🚶 Гуляйте утром и вечером, избегайте жаркого асфальта.'],
      весна: ['🩺 Обработка от клещей после зимы.'],
      осень: ['🦴 Следите за весом при снижении активности.']
    }
  },
  {
    kind: 'parrot',
    species: 'Волнистый попугай',
    latin: 'Melopsittacus undulatus',
    accent: '#4FA3E0',
    seasonTips: {
      зима: ['🌡 Без сквозняков, но с ежедневным доступом к свету.'],
      лето: ['🛁 Купание или опрыскивание в жару.'],
      весна: ['🪶 Линька — добавьте белок и кальций.'],
      осень: ['🧸 Новые игрушки поддержат активность в короткий день.']
    }
  },
  {
    kind: 'budgie',
    species: 'Королёк (карликовый попугай)',
    latin: 'Agapornis',
    accent: '#57C878',
    seasonTips: {
      зима: ['🌾 Разнообразный корм без жирных семян в избытке.'],
      лето: ['💧 Свежая вода дважды в день.'],
      весна: ['🪺 Следите за гнездованием, если держите пару.'],
      осень: ['🧹 Дезинфекция жёрдочек и кормушек.']
    }
  },
  {
    kind: 'canary',
    species: 'Канарейка',
    latin: 'Serinus canaria',
    accent: '#F5D547',
    seasonTips: {
      зима: ['☀️ Досветка продлевает пение и активность.'],
      лето: ['🛁 Мелкий поддон для купания.'],
      весна: ['🥚 В период размножения — белок и зелень.'],
      осень: ['🌡 Без резких перепадов температуры.']
    }
  },
  {
    kind: 'goldfish',
    species: 'Золотая рыбка',
    latin: 'Carassius auratus',
    accent: '#F2A230',
    seasonTips: {
      зима: ['🌡 В прохладной воде рыбки менее активны — кормите реже.'],
      лето: ['💧 Аэрация и частичная подмена воды в жару.'],
      весна: ['🧹 После зимы — генеральная чистка без резкой смены воды.'],
      осень: ['🐟 Снизьте порцию, если температура в аквариуме падает.']
    }
  },
  {
    kind: 'betta',
    species: 'Рыбка петушок',
    latin: 'Betta splendens',
    accent: '#E8496A',
    seasonTips: {
      зима: ['🌡 Стабильные 24–28 °C — обогреватель обязателен.'],
      лето: ['🧊 Контролируйте, чтобы вода не перегревалась выше 30 °C.'],
      весна: ['🪴 Живые растения улучшают качество воды.'],
      осень: ['💧 Подмена 20–30 % воды раз в неделю.']
    }
  },
  {
    kind: 'turtle',
    species: 'Красноухая черепаха',
    latin: 'Trachemys scripta',
    accent: '#3E8E4F',
    seasonTips: {
      зима: ['💡 УФ-лампа 10–12 ч в сутки.'],
      лето: ['☀️ Выпуск на солнце только под присмотром.'],
      весна: ['🩺 После зимовки — осмотр, если аппетит слабый.'],
      осень: ['🌡 Для молодняка — поддерживайте тепло без «зимовки».']
    }
  },
  {
    kind: 'chinchilla',
    species: 'Шиншилла',
    latin: 'Chinchilla lanigera',
    accent: '#9AA3AD',
    seasonTips: {
      зима: ['🛁 Ванночка с песком для купания — регулярно.'],
      лето: ['❄️ Только прохлада: выше 25 °C опасно для шиншиллы.'],
      весна: ['🌾 Сено и гранулы без лакомств в избытке.'],
      осень: ['🧹 Сухая уборка, без влажной «мытьи» клетки.']
    }
  },
  {
    kind: 'ferret',
    species: 'Хорёк',
    latin: 'Mustela furo',
    accent: '#8A5A32',
    seasonTips: {
      зима: ['🏃 Много движения — минимум 4 ч вне клетки.'],
      лето: ['💧 Доступ к воде и прохладе обязателен.'],
      весна: ['🩺 Вакцинация и противошишковая защита по графику ветврача.'],
      осень: ['🧸 Новые туннели — снижение активности на улице.']
    }
  },
  {
    kind: 'gerbil',
    species: 'Песчанка',
    latin: 'Meriones unguiculatus',
    accent: '#D4A574',
    seasonTips: {
      зима: ['🌾 Гранулы и сено, без лишних орешков.'],
      лето: ['🧊 Песок в клетке слегка прохладный — они копают норы.'],
      весна: ['🪵 Свежие веточки для стачивания зубов.'],
      осень: ['🧹 Не переполняйте подстилку — сухость важна.']
    }
  },
  {
    kind: 'rat',
    species: 'Декоративная крыса',
    latin: 'Rattus norvegicus',
    accent: '#7A6A62',
    seasonTips: {
      зима: ['👥 Держите минимум пару — крысы социальны.'],
      лето: ['💧 Фрукты с высокой влагой — умеренно.'],
      весна: ['🧠 Головоломки с кормом для ума.'],
      осень: ['🧤 Уборка без резких запахов моющих средств.']
    }
  },
  {
    kind: 'gecko',
    species: 'Леопардовый геккон',
    latin: 'Eublepharis macularius',
    accent: '#F0C14B',
    seasonTips: {
      зима: ['🌡 Градиент 26–32 °C под лампой.'],
      лето: ['💧 Влажный мох в укрытии для линьки.'],
      весна: ['🦗 Корм живым кормом с кальцием.'],
      осень: ['🪨 Укрытие должно быть тёплым и сухим.']
    }
  },
  {
    kind: 'corn-snake',
    species: 'Кукурузная змея',
    latin: 'Pantherophis guttatus',
    accent: '#C97B4A',
    seasonTips: {
      зима: ['🍖 Кормление по размеру добычи, не чаще 1 раза в 5–7 дней у взрослых.'],
      лето: ['💧 Поилка достаточная для купания.'],
      весна: ['🪤 Линька — влажный мох в террариуме.'],
      осень: ['🌡 После кормления не тревожьте 24–48 ч.']
    }
  },
  {
    kind: 'hedgehog',
    species: 'Африканский еж',
    latin: 'Atelerix albiventris',
    accent: '#B8A99A',
    seasonTips: {
      зима: ['🌡 22–26 °C, без сквозняков.'],
      лето: ['🏃 Колесо и прогулки в шаре вечером.'],
      весна: ['🛁 Купание только при необходимости.'],
      осень: ['🐛 Белковые лакомства — дозированно.']
    }
  },
  {
    kind: 'mouse',
    species: 'Мышь домашняя',
    latin: 'Mus musculus',
    accent: '#B0B0B0',
    seasonTips: {
      зима: ['👥 Группа из самок — меньше стресса.'],
      лето: ['🧊 Прохлада важнее избытка лакомств.'],
      весна: ['🪵 Материал для гнезда — бумага без чернил.'],
      осень: ['🧹 Меняйте подстилку, но оставляйте запах укрытия.']
    }
  },
  {
    kind: 'degu',
    species: 'Дегу',
    latin: 'Octodon degus',
    accent: '#A67C52',
    seasonTips: {
      зима: ['🌾 Сено всегда, сахар и фрукты — почти никогда.'],
      лето: ['💧 Свежее вода и песок для купания.'],
      весна: ['🏃 Много бега — колесо большого диаметра.'],
      осень: ['👥 Стая из 2+ особей — обязательна для психики.']
    }
  }
];

module.exports = { PLANT_ART_IDS, PLANT_ACCENTS, PLANT_META, LIGHT_OPTIONS, EMOJI_PICKER, PET_SPECIES };