/* Названия, свет, виды и советы — только английский (русский в каталоге). */
const I18N_NAMES = { en: {
  "zamioculcas": "ZZ plant",
  "dracaena": "Dragon tree",
  "ficus": "Weeping fig",
  "calathea": "Calathea",
  "anthurium": "Anthurium",
  "caladium": "Caladium",
  "narcissus": "Daffodil",
  "chlorophytum-lemon": "Spider plant",
  "nephrolepis": "Boston fern",
  "adenium": "Desert rose",
  "monstera": "Monstera",
  "pothos": "Pothos",
  "aloe": "Aloe",
  "sansevieria": "Snake plant",
  "philodendron": "Philodendron",
  "begonia": "Begonia",
  "orchid": "Orchid",
  "cactus-barrel": "Golden barrel",
  "cactus-opuntia": "Prickly pear",
  "lavender": "Lavender",
  "basil": "Basil",
  "mint": "Mint",
  "rosemary": "Rosemary",
  "tulip": "Tulip",
  "violet": "African violet",
  "peperomia": "Peperomia",
  "hoya": "Hoya",
  "bromeliad": "Guzmania",
  "spathiphyllum": "Peace lily",
  "dieffenbachia": "Dieffenbachia",
  "aglaonema": "Aglaonema",
  "tradescantia": "Tradescantia",
  "maranta": "Prayer plant",
  "strelitzia": "Bird of paradise",
  "yucca": "Yucca",
  "schefflera": "Schefflera",
  "croton": "Croton",
  "fern-boston": "Sword fern",
  "ivy": "Ivy",
  "echeveria": "Echeveria",
  "jade": "Jade plant",
  "kalanchoe": "Kalanchoe",
  "pilea": "Chinese money plant",
  "rubber-plant": "Rubber plant",
  "palm-areca": "Areca palm",
  "citrus": "Citrus",
  "geranium": "Geranium",
  "spathiphyllum-mini": "Mini peace lily",
  "oxalis": "Purple shamrock",
  "asparagus-fern": "Asparagus fern",
  "other": "Other"
} };
const I18N_LIGHTS = { en: {
  "bright": [
    "Plenty of bright light",
    "The brightest spot in the home, without long midday sun. In shade the leaves shrink and fade."
  ],
  "diffused": [
    "Bright indirect light",
    "Bright indirect light by an east or west window. Midday rays scorch the leaves."
  ],
  "partial": [
    "Partial shade",
    "Soft light or partial shade. Direct sun bleaches the colour, deep shade makes it pale."
  ],
  "shade": [
    "Shade",
    "Happy deeper in the room. Direct sun is unnecessary and often harmful."
  ],
  "sun": [
    "Direct sun",
    "Needs several hours of direct sun. At the hottest midday, move it a little back from the glass."
  ]
} };
const I18N_PETS = { en: {
  "hamster": "Syrian hamster",
  "guinea-pig": "Guinea pig",
  "rabbit": "Pet rabbit",
  "cat": "House cat",
  "dog": "Dog",
  "parrot": "Budgerigar",
  "budgie": "Lovebird",
  "canary": "Canary",
  "goldfish": "Goldfish",
  "betta": "Betta",
  "turtle": "Red-eared slider",
  "chinchilla": "Chinchilla",
  "ferret": "Ferret",
  "gerbil": "Gerbil",
  "rat": "Pet rat",
  "gecko": "Leopard gecko",
  "corn-snake": "Corn snake",
  "hedgehog": "African hedgehog",
  "mouse": "House mouse",
  "degu": "Degu"
} };
const I18N_TIPS = { en: {
  "hamsterSeason": {
    "spring": [
      "🌤 Days are longer and the hamster is busier — check the wheel and add toys.",
      "🚪 While you air the room, move the cage: spring draughts cause colds.",
      "🥬 Introduce greens slowly, in small pieces."
    ],
    "summer": [
      "🌡 Heat is dangerous above 26 °C — keep the cage out of the sun and the room cool.",
      "🧊 A ceramic tile or cooled stone lets the hamster lie down and cool off.",
      "💧 In heat, water spoils faster — change it more often.",
      "🥕 Remove juicy food after 3–4 hours; it sours quickly in summer."
    ],
    "autumn": [
      "🍂 Hamsters hoard more in autumn — check stores and throw out spoiled food.",
      "🏠 Offer more paper bedding: the hamster is building a warm nest.",
      "🌡 Once heating starts, keep the cage off the radiator and watch the dry air."
    ],
    "winter": [
      "🌡 Do not let the room fall below 18 °C; near 15 °C a hamster can slip into a dangerous torpor.",
      "🚪 Keep the cage off cold windows and draughts, but not against the radiator.",
      "🏠 Give plenty of unscented tissue and paper bedding for the nest.",
      "🌾 Appetite rises a little in winter — a slightly larger portion is fine, but watch the hoard."
    ]
  },
  "hamsterAge": {
    "baby": [
      "🍼 A baby needs protein every 2–3 days: egg, low-fat cottage cheese, dried shrimp.",
      "🤲 Tame slowly: voice and hand scent first, then a treat from the palm.",
      "😴 Do not wake it by day or pick it up against its will."
    ],
    "young": [
      "🏃 Peak energy: a solid wheel at least 28 cm across is essential.",
      "🕳 Bedding 15–20 cm deep — young hamsters love to burrow.",
      "🥚 Protein 2–3 times a week supports muscle.",
      "🦷 Teeth grow for life — keep a mineral stone or fruit-wood twigs in the cage."
    ],
    "adult": [
      "⚖️ Watch weight: an adult Syrian is about 120–180 g; sudden change matters.",
      "🥜 Nuts are a treat, not the diet: too fatty for more than a couple of times a week.",
      "🧭 Keep a routine. Hamsters like cleaning, feeding and play at similar times."
    ],
    "senior": [
      "👴 After about 18 months a hamster sleeps more and runs less. That is normal.",
      "🥣 If chewing gets harder, soften dry food with a little water.",
      "🪜 Remove high levels and ladders — falls get more dangerous.",
      "⚖️ Check weight and coat weekly. Fast loss or bald patches need a vet."
    ]
  },
  "species": {
    "hamster": {
      "spring": [
        "🌤 More activity — check the wheel and toys."
      ],
      "summer": [
        "🌡 In heat, keep it cool and refresh the water more often."
      ],
      "autumn": [
        "🍂 They hoard — do not let stores spoil."
      ],
      "winter": [
        "🌡 Do not let the room with the cage drop below 18 °C."
      ]
    },
    "guinea-pig": {
      "spring": [
        "✂️ Long-haired breeds may need a trim after winter."
      ],
      "summer": [
        "🥒 Remove fresh vegetables after 2–3 hours."
      ],
      "autumn": [
        "🏠 Warm the hide and keep it out of draughts."
      ],
      "winter": [
        "🌾 Hay must always be there — it is the base of the diet all year."
      ]
    },
    "rabbit": {
      "spring": [
        "🪮 Moulting — brush more often."
      ],
      "summer": [
        "🌡 Rabbits handle heat poorly. Keep them cool."
      ],
      "autumn": [
        "🥕 Add roots to the diet gradually."
      ],
      "winter": [
        "🌾 Unlimited hay and water matter most in winter."
      ]
    },
    "cat": {
      "spring": [
        "🏃 Play more after the lazy winter."
      ],
      "summer": [
        "💧 Keep the tray and water bowls clean and cool."
      ],
      "autumn": [
        "🧹 Check the carrier and vaccines before the season."
      ],
      "winter": [
        "🛁 Brushing helps with the seasonal moult."
      ]
    },
    "dog": {
      "spring": [
        "🩺 Tick protection after winter."
      ],
      "summer": [
        "🚶 Walk early and late; avoid hot asphalt."
      ],
      "autumn": [
        "🦴 Watch weight as activity drops."
      ],
      "winter": [
        "🧣 Short-coated dogs may need a coat outside."
      ]
    },
    "parrot": {
      "spring": [
        "🪶 Moult — add protein and calcium."
      ],
      "summer": [
        "🛁 A bath or a mist helps in the heat."
      ],
      "autumn": [
        "🧸 New toys keep them busy as days shorten."
      ],
      "winter": [
        "🌡 No draughts, but daily access to light."
      ]
    },
    "budgie": {
      "spring": [
        "🪺 If you keep a pair, watch nesting."
      ],
      "summer": [
        "💧 Fresh water twice a day."
      ],
      "autumn": [
        "🧹 Disinfect perches and dishes."
      ],
      "winter": [
        "🌾 Varied food, without too many fatty seeds."
      ]
    },
    "canary": {
      "spring": [
        "🥚 In the breeding season, offer protein and greens."
      ],
      "summer": [
        "🛁 A shallow bath dish."
      ],
      "autumn": [
        "🌡 No sudden temperature swings."
      ],
      "winter": [
        "☀️ Extra light keeps song and activity going."
      ]
    },
    "goldfish": {
      "spring": [
        "🧹 After winter, a thorough clean without a sudden full water change."
      ],
      "summer": [
        "💧 Aeration and partial water changes in the heat."
      ],
      "autumn": [
        "🐟 Feed less if the tank cools."
      ],
      "winter": [
        "🌡 In cool water they are less active — feed less often."
      ]
    },
    "betta": {
      "spring": [
        "🪴 Live plants improve the water."
      ],
      "summer": [
        "🧊 Do not let the water rise above 30 °C."
      ],
      "autumn": [
        "💧 Change 20–30 % of the water once a week."
      ],
      "winter": [
        "🌡 A steady 24–28 °C — a heater is essential."
      ]
    },
    "turtle": {
      "spring": [
        "🩺 After a slow winter, check them if appetite is weak."
      ],
      "summer": [
        "☀️ Outdoor sun only while you watch."
      ],
      "autumn": [
        "🌡 Young turtles need warmth, not a winter sleep."
      ],
      "winter": [
        "💡 A UV lamp for 10–12 hours a day."
      ]
    },
    "chinchilla": {
      "spring": [
        "🌾 Hay and pellets, treats in moderation."
      ],
      "summer": [
        "❄️ Cool only: above 25 °C is dangerous."
      ],
      "autumn": [
        "🧹 Dry cleaning. Do not wash the cage wet."
      ],
      "winter": [
        "🛁 A dust bath, regularly."
      ]
    },
    "ferret": {
      "spring": [
        "🩺 Vaccines and parasite protection on the vet’s schedule."
      ],
      "summer": [
        "💧 Water and a cool place are essential."
      ],
      "autumn": [
        "🧸 New tunnels when outdoor time drops."
      ],
      "winter": [
        "🏃 Lots of movement — at least 4 hours out of the cage."
      ]
    },
    "gerbil": {
      "spring": [
        "🪵 Fresh twigs to wear the teeth down."
      ],
      "summer": [
        "🧊 Slightly cool sand — they dig burrows."
      ],
      "autumn": [
        "🧹 Do not overfill the bedding; dryness matters."
      ],
      "winter": [
        "🌾 Pellets and hay, few extra nuts."
      ]
    },
    "rat": {
      "spring": [
        "🧠 Food puzzles keep the mind busy."
      ],
      "summer": [
        "💧 Juicy fruit, in moderation."
      ],
      "autumn": [
        "🧤 Clean without strong-smelling detergents."
      ],
      "winter": [
        "👥 Keep at least a pair — rats are social."
      ]
    },
    "gecko": {
      "spring": [
        "🦗 Live food dusted with calcium."
      ],
      "summer": [
        "💧 Damp moss in a hide for shedding."
      ],
      "autumn": [
        "🪨 The hide should be warm and dry."
      ],
      "winter": [
        "🌡 A 26–32 °C gradient under the lamp."
      ]
    },
    "corn-snake": {
      "spring": [
        "🪤 Shedding — damp moss in the terrarium."
      ],
      "summer": [
        "💧 A bowl large enough to soak in."
      ],
      "autumn": [
        "🌡 Leave them alone for 24–48 hours after feeding."
      ],
      "winter": [
        "🍖 Feed by prey size, no more than once every 5–7 days for adults."
      ]
    },
    "hedgehog": {
      "spring": [
        "🛁 Bathe only when needed."
      ],
      "summer": [
        "🏃 A wheel and evening time out."
      ],
      "autumn": [
        "🐛 Protein treats, in measured amounts."
      ],
      "winter": [
        "🌡 22–26 °C, no draughts."
      ]
    },
    "mouse": {
      "spring": [
        "🪵 Nest paper without ink."
      ],
      "summer": [
        "🧊 Cool matters more than extra treats."
      ],
      "autumn": [
        "🧹 Change bedding but leave some of the nest scent."
      ],
      "winter": [
        "👥 A group of females is less stressful."
      ]
    },
    "degu": {
      "spring": [
        "🏃 Lots of running — a large wheel."
      ],
      "summer": [
        "💧 Fresh water and a dust bath."
      ],
      "autumn": [
        "👥 A group of two or more is important for their mood."
      ],
      "winter": [
        "🌾 Hay always; sugar and fruit almost never."
      ]
    }
  }
} };
