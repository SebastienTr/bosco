export type Lang =
  | "en"
  | "fr"
  | "es"
  | "pt"
  | "it"
  | "de"
  | "nl"
  | "da"
  | "sv"
  | "no"
  | "ru"
  | "el"
  | "ja"
  | "ga"
  | "br";

export const langLabels: Record<Lang, { flag: string; label: string }> = {
  en: { flag: "🇬🇧", label: "English" },
  fr: { flag: "🇫🇷", label: "Français" },
  es: { flag: "🇪🇸", label: "Español" },
  pt: { flag: "🇵🇹", label: "Português" },
  it: { flag: "🇮🇹", label: "Italiano" },
  de: { flag: "🇩🇪", label: "Deutsch" },
  nl: { flag: "🇳🇱", label: "Nederlands" },
  da: { flag: "🇩🇰", label: "Dansk" },
  sv: { flag: "🇸🇪", label: "Svenska" },
  no: { flag: "🇳🇴", label: "Norsk" },
  ru: { flag: "🇷🇺", label: "Русский" },
  el: { flag: "🇬🇷", label: "Ελληνικά" },
  ja: { flag: "🇯🇵", label: "日本語" },
  ga: { flag: "🇮🇪", label: "Gaeilge" },
  br: { flag: "🏴", label: "Brezhoneg" },
};

export const defaultLang: Lang = "en";

interface LandingMessagesBase {
  nav: { signIn: string };
  hero: { title: string; subtitle: string; cta: string };
  howItWorks: {
    title: string;
    steps: {
      export: { title: string; description: string; learnHow: string };
      import: { title: string; description: string };
      share: { title: string; description: string };
    };
  };
  features: {
    track: { title: string; description: string };
    stopovers: { title: string; description: string };
    share: { title: string; description: string };
  };
  showcase: { title: string; stats: string; cta: string; caption: string };
  appBadges: { appStore: string; googlePlay: string; comingSoon: string };
  footer: { tagline: string; privacy: string; terms: string };
}

interface LandingMessages extends LandingMessagesBase {
  alerts: { accountDeleted: string };
}

const landingMessagesBase: Record<Lang, LandingMessagesBase> = {
  en: {
    nav: { signIn: "Sign In" },
    hero: {
      title: "Your sailing story, traced on the map",
      subtitle:
        "Bosco preserves the exact track — every tack, every course change, every mile sailed. The squiggly line beating upwind tells a story that pins on a map never will.",
      cta: "Get Started",
    },
    howItWorks: {
      title: "Import in under 2 minutes",
      steps: {
        export: {
          title: "Export",
          description:
            "Export your GPS track from Navionics or any navigation app.",
          learnHow: "Learn how",
        },
        import: {
          title: "Import",
          description:
            "Drop the file or share it directly to Bosco. Stopovers are detected automatically.",
        },
        share: {
          title: "Share",
          description:
            "Your voyage is live. Send the link — anyone can explore the animated route.",
        },
      },
    },
    features: {
      track: {
        title: "Every Tack, Every Mile",
        description:
          "See your precise sailing path, not just waypoints. Every close-hauled beat and downwind run is preserved.",
      },
      stopovers: {
        title: "Automatic Stopovers",
        description:
          "Ports and anchorages are detected and named automatically from your track data.",
      },
      share: {
        title: "Share Your Voyage",
        description:
          "Beautiful public pages with animated route playback. Share with family, friends, and crew.",
      },
    },
    showcase: {
      title: "A Real Voyage",
      stats: "1,689 nm · 45 ports · 7 countries",
      cta: "Explore this voyage",
      caption: "Göteborg to Nice — a Mediterranean sailing adventure.",
    },
    appBadges: {
      appStore: "Download on the App Store",
      googlePlay: "Get it on Google Play",
      comingSoon: "Apps coming soon",
    },
    footer: {
      tagline: "Made for sailors.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
    },
  },

  fr: {
    nav: { signIn: "Se connecter" },
    hero: {
      title: "Votre histoire de navigation, tracée sur la carte",
      subtitle:
        "Bosco conserve la trace exacte — chaque virement, chaque changement de cap, chaque mille parcouru. La ligne sinueuse du près serré raconte une histoire que des points sur une carte ne raconteront jamais.",
      cta: "Commencer",
    },
    howItWorks: {
      title: "Import en moins de 2 minutes",
      steps: {
        export: {
          title: "Exporter",
          description:
            "Exportez votre trace GPS depuis Navionics ou toute application de navigation.",
          learnHow: "Comment faire",
        },
        import: {
          title: "Importer",
          description:
            "Déposez le fichier ou partagez-le directement vers Bosco. Les escales sont détectées automatiquement.",
        },
        share: {
          title: "Partager",
          description:
            "Votre voyage est en ligne. Envoyez le lien — tout le monde peut explorer la route animée.",
        },
      },
    },
    features: {
      track: {
        title: "Chaque Virement, Chaque Mille",
        description:
          "Visualisez votre parcours de navigation précis, pas seulement des waypoints. Chaque bord de près et chaque allure portante sont préservés.",
      },
      stopovers: {
        title: "Escales Automatiques",
        description:
          "Les ports et mouillages sont détectés et nommés automatiquement à partir de vos données de trace.",
      },
      share: {
        title: "Partagez Votre Voyage",
        description:
          "De belles pages publiques avec lecture animée de l'itinéraire. Partagez avec famille, amis et équipage.",
      },
    },
    showcase: {
      title: "Un Vrai Voyage",
      stats: "1 689 nm · 45 ports · 7 pays",
      cta: "Explorer ce voyage",
      caption: "Göteborg à Nice — une aventure méditerranéenne à la voile.",
    },
    appBadges: {
      appStore: "Télécharger sur l'App Store",
      googlePlay: "Disponible sur Google Play",
      comingSoon: "Apps bientôt disponibles",
    },
    footer: {
      tagline: "Fait pour les marins.",
      privacy: "Politique de confidentialite",
      terms: "Conditions d'utilisation",
    },
  },

  es: {
    nav: { signIn: "Iniciar sesión" },
    hero: {
      title: "Tu historia de navegación, trazada en el mapa",
      subtitle:
        "Bosco conserva la traza exacta — cada virada, cada cambio de rumbo, cada milla navegada. La línea sinuosa de ceñida cuenta una historia que los puntos en un mapa nunca contarán.",
      cta: "Comenzar",
    },
    howItWorks: {
      title: "Importa en menos de 2 minutos",
      steps: {
        export: {
          title: "Exportar",
          description:
            "Exporta tu traza GPS desde Navionics o cualquier app de navegación.",
          learnHow: "Cómo hacerlo",
        },
        import: {
          title: "Importar",
          description:
            "Arrastra el archivo o compártelo directamente con Bosco. Las escalas se detectan automáticamente.",
        },
        share: {
          title: "Compartir",
          description:
            "Tu viaje está en línea. Envía el enlace — cualquiera puede explorar la ruta animada.",
        },
      },
    },
    features: {
      track: {
        title: "Cada Virada, Cada Milla",
        description:
          "Visualiza tu ruta de navegación precisa, no solo waypoints. Cada ceñida y cada empopada se conservan.",
      },
      stopovers: {
        title: "Escalas Automáticas",
        description:
          "Los puertos y fondeaderos se detectan y nombran automáticamente a partir de tus datos de traza.",
      },
      share: {
        title: "Comparte Tu Viaje",
        description:
          "Hermosas páginas públicas con reproducción animada de la ruta. Comparte con familia, amigos y tripulación.",
      },
    },
    showcase: {
      title: "Un Viaje Real",
      stats: "1.689 mn · 45 puertos · 7 países",
      cta: "Explorar este viaje",
      caption: "Gotemburgo a Niza — una aventura mediterránea a vela.",
    },
    appBadges: {
      appStore: "Descargar en el App Store",
      googlePlay: "Disponible en Google Play",
      comingSoon: "Apps próximamente",
    },
    footer: {
      tagline: "Hecho para navegantes.",
      privacy: "Politica de privacidad",
      terms: "Terminos de servicio",
    },
  },

  pt: {
    nav: { signIn: "Entrar" },
    hero: {
      title: "A sua história de navegação, traçada no mapa",
      subtitle:
        "O Bosco preserva o trajeto exato — cada bordo, cada mudança de rumo, cada milha navegada. A linha sinuosa da bolina conta uma história que pontos num mapa nunca contarão.",
      cta: "Começar",
    },
    howItWorks: {
      title: "Importe em menos de 2 minutos",
      steps: {
        export: {
          title: "Exportar",
          description:
            "Exporte o seu trajeto GPS do Navionics ou de qualquer aplicação de navegação.",
          learnHow: "Saiba como",
        },
        import: {
          title: "Importar",
          description:
            "Arraste o ficheiro ou partilhe-o diretamente com o Bosco. As escalas são detetadas automaticamente.",
        },
        share: {
          title: "Partilhar",
          description:
            "A sua viagem está online. Envie o link — qualquer pessoa pode explorar a rota animada.",
        },
      },
    },
    features: {
      track: {
        title: "Cada Bordo, Cada Milha",
        description:
          "Veja o seu percurso de navegação preciso, não apenas waypoints. Cada bolina e cada popa são preservadas.",
      },
      stopovers: {
        title: "Escalas Automáticas",
        description:
          "Portos e fundeadouros são detetados e nomeados automaticamente a partir dos dados do seu trajeto.",
      },
      share: {
        title: "Partilhe a Sua Viagem",
        description:
          "Belas páginas públicas com reprodução animada da rota. Partilhe com família, amigos e tripulação.",
      },
    },
    showcase: {
      title: "Uma Viagem Real",
      stats: "1.689 mn · 45 portos · 7 países",
      cta: "Explorar esta viagem",
      caption: "Gotemburgo a Nice — uma aventura mediterrânica à vela.",
    },
    appBadges: {
      appStore: "Transferir na App Store",
      googlePlay: "Disponível no Google Play",
      comingSoon: "Apps em breve",
    },
    footer: {
      tagline: "Feito para velejadores.",
      privacy: "Politica de privacidade",
      terms: "Termos de servico",
    },
  },

  it: {
    nav: { signIn: "Accedi" },
    hero: {
      title: "La tua storia di navigazione, tracciata sulla mappa",
      subtitle:
        "Bosco conserva la traccia esatta — ogni virata, ogni cambio di rotta, ogni miglio navigato. La linea sinuosa della bolina racconta una storia che i punti sulla mappa non racconteranno mai.",
      cta: "Inizia",
    },
    howItWorks: {
      title: "Importa in meno di 2 minuti",
      steps: {
        export: {
          title: "Esporta",
          description:
            "Esporta la tua traccia GPS da Navionics o qualsiasi app di navigazione.",
          learnHow: "Scopri come",
        },
        import: {
          title: "Importa",
          description:
            "Trascina il file o condividilo direttamente con Bosco. Le soste vengono rilevate automaticamente.",
        },
        share: {
          title: "Condividi",
          description:
            "Il tuo viaggio è online. Invia il link — chiunque può esplorare la rotta animata.",
        },
      },
    },
    features: {
      track: {
        title: "Ogni Virata, Ogni Miglio",
        description:
          "Visualizza il tuo percorso di navigazione preciso, non solo waypoint. Ogni bolina e ogni poppa sono preservate.",
      },
      stopovers: {
        title: "Soste Automatiche",
        description:
          "Porti e ancoraggi vengono rilevati e nominati automaticamente dai dati della tua traccia.",
      },
      share: {
        title: "Condividi il Tuo Viaggio",
        description:
          "Belle pagine pubbliche con riproduzione animata del percorso. Condividi con famiglia, amici ed equipaggio.",
      },
    },
    showcase: {
      title: "Un Viaggio Reale",
      stats: "1.689 mn · 45 porti · 7 paesi",
      cta: "Esplora questo viaggio",
      caption: "Göteborg a Nizza — un'avventura mediterranea a vela.",
    },
    appBadges: {
      appStore: "Scarica dall'App Store",
      googlePlay: "Disponibile su Google Play",
      comingSoon: "App in arrivo",
    },
    footer: {
      tagline: "Fatto per i velisti.",
      privacy: "Informativa sulla privacy",
      terms: "Termini di servizio",
    },
  },

  de: {
    nav: { signIn: "Anmelden" },
    hero: {
      title: "Deine Segelgeschichte, auf der Karte gezeichnet",
      subtitle:
        "Bosco bewahrt den exakten Track — jede Wende, jeden Kurswechsel, jede gesegelte Meile. Die verschlungene Linie beim Kreuzen erzählt eine Geschichte, die Punkte auf einer Karte niemals erzählen werden.",
      cta: "Loslegen",
    },
    howItWorks: {
      title: "Import in unter 2 Minuten",
      steps: {
        export: {
          title: "Exportieren",
          description:
            "Exportiere deinen GPS-Track aus Navionics oder einer anderen Navigations-App.",
          learnHow: "So geht's",
        },
        import: {
          title: "Importieren",
          description:
            "Ziehe die Datei hinein oder teile sie direkt mit Bosco. Zwischenstopps werden automatisch erkannt.",
        },
        share: {
          title: "Teilen",
          description:
            "Deine Reise ist online. Sende den Link — jeder kann die animierte Route erkunden.",
        },
      },
    },
    features: {
      track: {
        title: "Jede Wende, Jede Meile",
        description:
          "Sieh deinen präzisen Segelkurs, nicht nur Wegpunkte. Jeder Kreuzschlag und jede Vorwindfahrt wird bewahrt.",
      },
      stopovers: {
        title: "Automatische Zwischenstopps",
        description:
          "Häfen und Ankerplätze werden automatisch aus deinen Trackdaten erkannt und benannt.",
      },
      share: {
        title: "Teile Deine Reise",
        description:
          "Schöne öffentliche Seiten mit animierter Routenwiedergabe. Teile mit Familie, Freunden und Crew.",
      },
    },
    showcase: {
      title: "Eine Echte Reise",
      stats: "1.689 sm · 45 Häfen · 7 Länder",
      cta: "Diese Reise entdecken",
      caption: "Göteborg nach Nizza — ein mediterranes Segelabenteuer.",
    },
    appBadges: {
      appStore: "Laden im App Store",
      googlePlay: "Jetzt bei Google Play",
      comingSoon: "Apps demnächst verfügbar",
    },
    footer: {
      tagline: "Gemacht für Segler.",
      privacy: "Datenschutzerklarung",
      terms: "Nutzungsbedingungen",
    },
  },

  nl: {
    nav: { signIn: "Inloggen" },
    hero: {
      title: "Jouw zeilverhaal, getekend op de kaart",
      subtitle:
        "Bosco bewaart het exacte spoor — elke overstag, elke koerswijziging, elke gevaren mijl. De kronkelende lijn van het kruisen vertelt een verhaal dat punten op een kaart nooit zullen vertellen.",
      cta: "Aan de slag",
    },
    howItWorks: {
      title: "Importeer in minder dan 2 minuten",
      steps: {
        export: {
          title: "Exporteer",
          description:
            "Exporteer je GPS-track vanuit Navionics of een andere navigatie-app.",
          learnHow: "Zo werkt het",
        },
        import: {
          title: "Importeer",
          description:
            "Sleep het bestand of deel het direct met Bosco. Tussenstops worden automatisch gedetecteerd.",
        },
        share: {
          title: "Deel",
          description:
            "Je reis is online. Stuur de link — iedereen kan de geanimeerde route verkennen.",
        },
      },
    },
    features: {
      track: {
        title: "Elke Overstag, Elke Mijl",
        description:
          "Bekijk je precieze zeilroute, niet alleen waypoints. Elke kruisrak en elke voordewindse rak wordt bewaard.",
      },
      stopovers: {
        title: "Automatische Tussenstops",
        description:
          "Havens en ankerplaatsen worden automatisch gedetecteerd en benoemd vanuit je trackgegevens.",
      },
      share: {
        title: "Deel Je Reis",
        description:
          "Mooie openbare pagina's met geanimeerde route-weergave. Deel met familie, vrienden en bemanning.",
      },
    },
    showcase: {
      title: "Een Echte Reis",
      stats: "1.689 nm · 45 havens · 7 landen",
      cta: "Ontdek deze reis",
      caption: "Göteborg naar Nice — een mediterraan zeilavontuur.",
    },
    appBadges: {
      appStore: "Download in de App Store",
      googlePlay: "Ontdek het op Google Play",
      comingSoon: "Apps binnenkort beschikbaar",
    },
    footer: {
      tagline: "Gemaakt voor zeilers.",
      privacy: "Privacybeleid",
      terms: "Gebruiksvoorwaarden",
    },
  },

  da: {
    nav: { signIn: "Log ind" },
    hero: {
      title: "Din sejlhistorie, tegnet på kortet",
      subtitle:
        "Bosco bevarer det nøjagtige spor — hver stagvending, hver kursændring, hver sejlet sømil. Den bugtede linje fra krydsning fortæller en historie, som punkter på et kort aldrig vil.",
      cta: "Kom i gang",
    },
    howItWorks: {
      title: "Importér på under 2 minutter",
      steps: {
        export: {
          title: "Eksportér",
          description:
            "Eksportér dit GPS-spor fra Navionics eller en anden navigationsapp.",
          learnHow: "Se hvordan",
        },
        import: {
          title: "Importér",
          description:
            "Træk filen eller del den direkte med Bosco. Havneophold registreres automatisk.",
        },
        share: {
          title: "Del",
          description:
            "Din rejse er live. Send linket — alle kan udforske den animerede rute.",
        },
      },
    },
    features: {
      track: {
        title: "Hvert Slag, Hver Sømil",
        description:
          "Se din præcise sejlrute, ikke bare waypoints. Hvert kryds og hver undenvindssejlads bevares.",
      },
      stopovers: {
        title: "Automatiske Havneophold",
        description:
          "Havne og ankerpladser registreres og navngives automatisk fra dine spordata.",
      },
      share: {
        title: "Del Din Rejse",
        description:
          "Smukke offentlige sider med animeret ruteafspilning. Del med familie, venner og besætning.",
      },
    },
    showcase: {
      title: "En Rigtig Rejse",
      stats: "1.689 nm · 45 havne · 7 lande",
      cta: "Udforsk denne rejse",
      caption: "Göteborg til Nice — et middelhavs sejleventyr.",
    },
    appBadges: {
      appStore: "Hent i App Store",
      googlePlay: "Hent den på Google Play",
      comingSoon: "Apps kommer snart",
    },
    footer: {
      tagline: "Lavet til sejlere.",
      privacy: "Privatlivspolitik",
      terms: "Vilkår for brug",
    },
  },

  sv: {
    nav: { signIn: "Logga in" },
    hero: {
      title: "Din seglingshistoria, ritad på kartan",
      subtitle:
        "Bosco bevarar det exakta spåret — varje slag, varje kursändring, varje seglad sjömil. Den slingrande linjen från kryssning berättar en historia som punkter på en karta aldrig kan.",
      cta: "Kom igång",
    },
    howItWorks: {
      title: "Importera på under 2 minuter",
      steps: {
        export: {
          title: "Exportera",
          description:
            "Exportera ditt GPS-spår från Navionics eller valfri navigationsapp.",
          learnHow: "Se hur",
        },
        import: {
          title: "Importera",
          description:
            "Dra in filen eller dela den direkt till Bosco. Hamnuppehåll upptäcks automatiskt.",
        },
        share: {
          title: "Dela",
          description:
            "Din resa är live. Skicka länken — vem som helst kan utforska den animerade rutten.",
        },
      },
    },
    features: {
      track: {
        title: "Varje Slag, Varje Sjömil",
        description:
          "Se din exakta seglingsrutt, inte bara waypoints. Varje kryssning och undanvindssegling bevaras.",
      },
      stopovers: {
        title: "Automatiska Hamnuppehåll",
        description:
          "Hamnar och ankringsplatser upptäcks och namnges automatiskt från dina spårdata.",
      },
      share: {
        title: "Dela Din Resa",
        description:
          "Vackra publika sidor med animerad ruttuppspelning. Dela med familj, vänner och besättning.",
      },
    },
    showcase: {
      title: "En Riktig Resa",
      stats: "1 689 nm · 45 hamnar · 7 länder",
      cta: "Utforska denna resa",
      caption: "Göteborg till Nice — ett medelhavsseglingsäventyr.",
    },
    appBadges: {
      appStore: "Ladda ned från App Store",
      googlePlay: "Hämta den på Google Play",
      comingSoon: "Appar kommer snart",
    },
    footer: {
      tagline: "Gjort för seglare.",
      privacy: "Integritetspolicy",
      terms: "Anvandarvillkor",
    },
  },

  no: {
    nav: { signIn: "Logg inn" },
    hero: {
      title: "Din seilhistorie, tegnet på kartet",
      subtitle:
        "Bosco bevarer det nøyaktige sporet — hvert bautslag, hver kursendring, hver seilt nautisk mil. Den svingete linjen fra kryssing forteller en historie som punkter på et kart aldri vil.",
      cta: "Kom i gang",
    },
    howItWorks: {
      title: "Importér på under 2 minutter",
      steps: {
        export: {
          title: "Eksportér",
          description:
            "Eksportér GPS-sporet ditt fra Navionics eller en annen navigasjonsapp.",
          learnHow: "Se hvordan",
        },
        import: {
          title: "Importér",
          description:
            "Dra inn filen eller del den direkte med Bosco. Anløp oppdages automatisk.",
        },
        share: {
          title: "Del",
          description:
            "Reisen din er live. Send lenken — alle kan utforske den animerte ruten.",
        },
      },
    },
    features: {
      track: {
        title: "Hvert Slag, Hver Nautisk Mil",
        description:
          "Se din nøyaktige seilrute, ikke bare waypoints. Hvert kryss og hver unnavindsseiling bevares.",
      },
      stopovers: {
        title: "Automatiske Anløp",
        description:
          "Havner og ankringsplasser oppdages og navngis automatisk fra sporedataene dine.",
      },
      share: {
        title: "Del Reisen Din",
        description:
          "Vakre offentlige sider med animert ruteavspilling. Del med familie, venner og mannskap.",
      },
    },
    showcase: {
      title: "En Ekte Reise",
      stats: "1 689 nm · 45 havner · 7 land",
      cta: "Utforsk denne reisen",
      caption: "Göteborg til Nice — et middelhavs seilingseventyr.",
    },
    appBadges: {
      appStore: "Last ned fra App Store",
      googlePlay: "Tilgjengelig på Google Play",
      comingSoon: "Apper kommer snart",
    },
    footer: {
      tagline: "Laget for seilere.",
      privacy: "Personvernerklaring",
      terms: "Vilkår for bruk",
    },
  },

  ru: {
    nav: { signIn: "Войти" },
    hero: {
      title: "Ваша история плавания, прочерченная на карте",
      subtitle:
        "Bosco сохраняет точный трек — каждый галс, каждое изменение курса, каждую пройденную милю. Извилистая линия лавировки рассказывает историю, которую точки на карте никогда не расскажут.",
      cta: "Начать",
    },
    howItWorks: {
      title: "Импорт менее чем за 2 минуты",
      steps: {
        export: {
          title: "Экспорт",
          description:
            "Экспортируйте GPS-трек из Navionics или любого навигационного приложения.",
          learnHow: "Узнать как",
        },
        import: {
          title: "Импорт",
          description:
            "Перетащите файл или поделитесь им напрямую с Bosco. Остановки определяются автоматически.",
        },
        share: {
          title: "Поделиться",
          description:
            "Ваше путешествие онлайн. Отправьте ссылку — любой может исследовать анимированный маршрут.",
        },
      },
    },
    features: {
      track: {
        title: "Каждый Галс, Каждая Миля",
        description:
          "Смотрите точный маршрут плавания, а не просто путевые точки. Каждая лавировка и каждый фордевинд сохранены.",
      },
      stopovers: {
        title: "Автоматические Остановки",
        description:
          "Порты и якорные стоянки определяются и именуются автоматически по данным трека.",
      },
      share: {
        title: "Поделитесь Путешествием",
        description:
          "Красивые публичные страницы с анимированным воспроизведением маршрута. Делитесь с семьёй, друзьями и экипажем.",
      },
    },
    showcase: {
      title: "Реальное Путешествие",
      stats: "1 689 мм · 45 портов · 7 стран",
      cta: "Исследовать путешествие",
      caption: "Гётеборг — Ницца: средиземноморское парусное приключение.",
    },
    appBadges: {
      appStore: "Загрузить в App Store",
      googlePlay: "Доступно в Google Play",
      comingSoon: "Приложения скоро",
    },
    footer: {
      tagline: "Создано для яхтсменов.",
      privacy: "Политика конфиденциальности",
      terms: "Условия использования",
    },
  },

  el: {
    nav: { signIn: "Σύνδεση" },
    hero: {
      title: "Η ιστορία σου στη θάλασσα, χαραγμένη στον χάρτη",
      subtitle:
        "Το Bosco διατηρεί το ακριβές ίχνος — κάθε τακ, κάθε αλλαγή πορείας, κάθε μίλι που αρμενίστηκε. Η ελικοειδής γραμμή της ορτσάρας λέει μια ιστορία που οι πινέζες σε έναν χάρτη δεν θα πουν ποτέ.",
      cta: "Ξεκινήστε",
    },
    howItWorks: {
      title: "Εισαγωγή σε λιγότερο από 2 λεπτά",
      steps: {
        export: {
          title: "Εξαγωγή",
          description:
            "Εξάγετε το GPS ίχνος σας από το Navionics ή οποιαδήποτε εφαρμογή πλοήγησης.",
          learnHow: "Μάθετε πώς",
        },
        import: {
          title: "Εισαγωγή",
          description:
            "Σύρετε το αρχείο ή μοιραστείτε το απευθείας στο Bosco. Οι στάσεις εντοπίζονται αυτόματα.",
        },
        share: {
          title: "Κοινοποίηση",
          description:
            "Το ταξίδι σας είναι online. Στείλτε τον σύνδεσμο — οποιοσδήποτε μπορεί να εξερευνήσει τη ζωντανή διαδρομή.",
        },
      },
    },
    features: {
      track: {
        title: "Κάθε Τακ, Κάθε Μίλι",
        description:
          "Δείτε την ακριβή διαδρομή ιστιοπλοΐας σας, όχι μόνο σημεία. Κάθε ορτσάρισμα και κάθε πρίμα διατηρούνται.",
      },
      stopovers: {
        title: "Αυτόματες Στάσεις",
        description:
          "Λιμάνια και αγκυροβόλια εντοπίζονται και ονομάζονται αυτόματα από τα δεδομένα ίχνους σας.",
      },
      share: {
        title: "Μοιραστείτε το Ταξίδι σας",
        description:
          "Όμορφες δημόσιες σελίδες με κινούμενη αναπαραγωγή διαδρομής. Μοιραστείτε με οικογένεια, φίλους και πλήρωμα.",
      },
    },
    showcase: {
      title: "Ένα Αληθινό Ταξίδι",
      stats: "1.689 νμ · 45 λιμάνια · 7 χώρες",
      cta: "Εξερευνήστε αυτό το ταξίδι",
      caption: "Γκέτεμποργκ στη Νίκαια — μια μεσογειακή ιστιοπλοϊκή περιπέτεια.",
    },
    appBadges: {
      appStore: "Λήψη στο App Store",
      googlePlay: "Διαθέσιμο στο Google Play",
      comingSoon: "Εφαρμογές σύντομα",
    },
    footer: {
      tagline: "Φτιαγμένο για ναυτικούς.",
      privacy: "Πολιτική απορρήτου",
      terms: "Όροι χρήσης",
    },
  },

  ja: {
    nav: { signIn: "ログイン" },
    hero: {
      title: "あなたのセーリングストーリーを、地図に刻む",
      subtitle:
        "Boscoは正確な航跡を保存します — すべてのタック、すべての変針、すべての航海マイル。風上に向かうジグザグの線は、地図上のピンでは決して語れない物語を伝えます。",
      cta: "始める",
    },
    howItWorks: {
      title: "2分以内でインポート",
      steps: {
        export: {
          title: "エクスポート",
          description:
            "Navionicsまたは任意のナビゲーションアプリからGPSトラックをエクスポートします。",
          learnHow: "方法を見る",
        },
        import: {
          title: "インポート",
          description:
            "ファイルをドロップするか、Boscoに直接共有します。寄港地は自動的に検出されます。",
        },
        share: {
          title: "シェア",
          description:
            "航海はオンラインに。リンクを送信すれば、誰でもアニメーションルートを探索できます。",
        },
      },
    },
    features: {
      track: {
        title: "すべてのタック、すべてのマイル",
        description:
          "ウェイポイントだけでなく、正確なセーリングルートをご覧ください。すべてのクローズホールドとダウンウィンドが保存されます。",
      },
      stopovers: {
        title: "自動寄港地検出",
        description:
          "港やアンカレッジがトラックデータから自動的に検出・命名されます。",
      },
      share: {
        title: "航海をシェア",
        description:
          "アニメーションルート再生付きの美しい公開ページ。家族、友人、クルーとシェアしましょう。",
      },
    },
    showcase: {
      title: "本物の航海",
      stats: "1,689 nm · 45 港 · 7 カ国",
      cta: "この航海を探索",
      caption: "ヨーテボリからニースへ — 地中海のセーリングアドベンチャー。",
    },
    appBadges: {
      appStore: "App Storeからダウンロード",
      googlePlay: "Google Playで入手",
      comingSoon: "アプリ近日公開",
    },
    footer: {
      tagline: "セーラーのために。",
      privacy: "プライバシーポリシー",
      terms: "利用規約",
    },
  },

  ga: {
    nav: { signIn: "Logáil isteach" },
    hero: {
      title: "Do scéal seoltóireachta, marcáilte ar an léarscáil",
      subtitle:
        "Coinníonn Bosco an rian cruinn — gach taca, gach athrú cúrsa, gach míle a sheol tú. Insíonn an líne cham ag gabháil in aghaidh na gaoithe scéal nach n-inseoidh poncanna ar léarscáil go deo.",
      cta: "Tosú",
    },
    howItWorks: {
      title: "Iompórtáil faoi bhun 2 nóiméad",
      steps: {
        export: {
          title: "Easpórtáil",
          description:
            "Easpórtáil do rian GPS ó Navionics nó aon aip loingseoireachta.",
          learnHow: "Foghlaim conas",
        },
        import: {
          title: "Iompórtáil",
          description:
            "Tarraing an comhad nó roinn go díreach le Bosco é. Aithnítear na stopanna go huathoibríoch.",
        },
        share: {
          title: "Roinn",
          description:
            "Tá d'aistear beo. Seol an nasc — is féidir le duine ar bith an bealach beoite a fhiosrú.",
        },
      },
    },
    features: {
      track: {
        title: "Gach Taca, Gach Míle",
        description:
          "Féach ar do bhealach seoltóireachta cruinn, ní hamháin pointí bealaigh. Caomhnaítear gach taca agus gach rith le gaoth.",
      },
      stopovers: {
        title: "Stopanna Uathoibríocha",
        description:
          "Aithnítear calafoirt agus ancaireachtaí go huathoibríoch ó do shonraí riain.",
      },
      share: {
        title: "Roinn D'Aistear",
        description:
          "Leathanaigh phoiblí áille le hathsheinm beoite bealaigh. Roinn le teaghlach, cairde agus criú.",
      },
    },
    showcase: {
      title: "Aistear Fíor",
      stats: "1,689 nm · 45 calafort · 7 dtír",
      cta: "Fiosraigh an t-aistear seo",
      caption: "Göteborg go Nice — eachtra seoltóireachta sa Mheánmhuir.",
    },
    appBadges: {
      appStore: "Íoslódáil ón App Store",
      googlePlay: "Faigh ar Google Play",
      comingSoon: "Aipeanna ag teacht go luath",
    },
    footer: {
      tagline: "Déanta do mhairnéalaigh.",
      privacy: "Polasaí príobháideachais",
      terms: "Téarmaí seirbhíse",
    },
  },

  br: {
    nav: { signIn: "Kevreañ" },
    hero: {
      title: "Da istor merdeiñ, linennet war ar gartenn",
      subtitle:
        "Bosco a mirout ar roudenn resis — pep viraj, pep cheñch hentoù, pep miltir merdeet. Al linenn dlevet o vont a-enep an avel a gont un istor na lâro pinegoù war ur gartenn biken.",
      cta: "Kregiñ",
    },
    howItWorks: {
      title: "Enporzhiañ e nebeutoc'h eget 2 vunutenn",
      steps: {
        export: {
          title: "Ezporzhiañ",
          description:
            "Ezporzhiit ho roudenn GPS diwar Navionics pe ne vern pe arload merdeiñ.",
          learnHow: "Deskiñ penaos",
        },
        import: {
          title: "Enporzhiañ",
          description:
            "Lakait ar restr pe rannit anezhi war-eeun gant Bosco. An arsavoù a vez kavet ent emgefreek.",
        },
        share: {
          title: "Rannañ",
          description:
            "Hoc'h añveaj a zo enlinenn. Kasit al liamm — an holl a c'hell sellet ouzh ar roudenn bev.",
        },
      },
    },
    features: {
      track: {
        title: "Pep Viraj, Pep Miltir",
        description:
          "Gwelet ho roudenn merdeiñ resis, ket pinegoù hepken. Pep bordez hag pep redadeg dindan avel a zo miret.",
      },
      stopovers: {
        title: "Arsavoù Emgefreek",
        description:
          "Porzhioù ha lerc'hioù eor a vez kavet ha anvet ent emgefreek diwar roadennoù ho roudenn.",
      },
      share: {
        title: "Rannit Hoc'h Añveaj",
        description:
          "Pajennoù foran kaer gant adlenn bev ar roudenn. Rannit gant ho familh, mignoned ha skipailh.",
      },
    },
    showcase: {
      title: "Ur Veaj Gwir",
      stats: "1 689 nm · 45 porzh · 7 bro",
      cta: "Furchal ar veaj-mañ",
      caption: "Göteborg da Nice — un taol-trumm merdeiñ er Mor Kreiz.",
    },
    appBadges: {
      appStore: "Pellgargañ war an App Store",
      googlePlay: "Kaout war Google Play",
      comingSoon: "Arloadoù a zeu a-benn nebeut",
    },
    footer: {
      tagline: "Graet evit ar vartoloded.",
      privacy: "Politikerezh prevezded",
      terms: "Termenoù implij",
    },
  },
};

const accountDeletedAlerts: Record<Lang, string> = {
  en: "Your account and Bosco data have been permanently deleted.",
  fr: "Votre compte et vos donnees Bosco ont ete supprimes definitivement.",
  es: "Tu cuenta y tus datos de Bosco se han eliminado de forma permanente.",
  pt: "A sua conta e os seus dados do Bosco foram eliminados permanentemente.",
  it: "Il tuo account e i dati Bosco sono stati eliminati definitivamente.",
  de: "Dein Konto und deine Bosco-Daten wurden dauerhaft geloescht.",
  nl: "Je account en Bosco-gegevens zijn permanent verwijderd.",
  da: "Din konto og dine Bosco-data er blevet slettet permanent.",
  sv: "Ditt konto och dina Bosco-data har raderats permanent.",
  no: "Kontoen din og Bosco-dataene dine er slettet permanent.",
  ru: "Ваш аккаунт и данные Bosco были удалены навсегда.",
  el: "Ο λογαριασμός σας και τα δεδομένα Bosco διαγράφηκαν οριστικά.",
  ja: "アカウントとBoscoのデータは完全に削除されました。",
  ga: "Scriosadh do chuntas agus do shonrai Bosco go buan.",
  br: "Dilamet eo bet da gont hag ar roadennoù Bosco da vat.",
};

export const landingMessages: Record<Lang, LandingMessages> = Object.fromEntries(
  Object.entries(landingMessagesBase).map(([lang, messages]) => [
    lang,
    {
      ...messages,
      alerts: {
        accountDeleted: accountDeletedAlerts[lang as Lang],
      },
    },
  ]),
) as Record<Lang, LandingMessages>;
