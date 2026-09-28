export const translations = {
  en: {
    nav: {
      home: "Home",
      about: "About",
      experience: "Experience",
      projects: "Work",
      contact: "Contact",
      puzzle: "Puzzle",
    },
    puzzle: {
      intro:
        "A short chess break. Find the smothered mate: a king trapped by its own pieces.",
      prompt: "White to move. Mate in 2.",
      wrong: "Not quite. Try another move.",
      forced: "Black's only move. Now finish it.",
      solved: "Checkmate. Smothered by its own pieces.",
      reset: "Reset",
      solution: "Show solution",
    },
    hero: {
      role: "Software Engineer in Barcelona",
      line: "I like coding… and chess.",
      hint: "Move the knight, or just scroll.",
      knight: "Knight. Select it to show its moves",
      cv: "Download CV",
      email: "Email me",
    },
    about: {
      title: "About",
      lead: "Computer engineer who loves technology and solving problems. Living in different countries and working in five languages has made me flexible and collaborative, and I keep looking for new challenges where I can contribute and grow.",
      skills: "Stack",
      based: "Based in",
      basedValue: "Barcelona, Spain (open to remote)",
      educationValue: "Computer Engineering, UPM Madrid",
      groups: {
        frontend: "Frontend",
        backend: "Backend & data",
        cloud: "Cloud & tools",
        ai: "AI & automation",
      },
      aiSkills: [
        "AI-assisted development",
        "Workflow automation",
        "API integration",
      ],
      languagesTitle: "Languages",
      levels: {
        native: "native",
        bilingual: "bilingual",
        advanced: "advanced",
        intermediate: "intermediate",
      },
      languages: [
        { name: "Spanish", level: "native" },
        { name: "English", level: "bilingual" },
        { name: "Portuguese", level: "advanced" },
        { name: "Armenian", level: "advanced" },
        { name: "French", level: "intermediate" },
      ],
    },
    experience: {
      title: "Experience",
      roles: [
        {
          role: "Process optimization analyst",
          company: "Frigorífico Gorina",
          period: "Apr 2026 - Aug 2026",
          summary: "Sole developer on the plant's health-certificate workflow.",
          details: [
            "Built a Python desktop app that reads health-permit PDFs and fills in the matching certificates, cutting loading and form-filling time by 95%.",
            "Built a system to approve, look up and download certificates from standard templates. The department adopted it as its standard tool.",
          ],
          stack: ["Python", "Google Cloud", "Azure Functions", "GitHub"],
        },
        {
          role: "Fullstack developer",
          company: "Globalthy",
          period: "Apr 2025 - Apr 2026",
          summary:
            "Took a web platform from scratch to production as its only fullstack developer.",
          details: [
            "Built the frontend and wired it to a MySQL database through REST APIs, with an authentication system.",
            "Deployed it on AWS with Docker, working in Agile sprints.",
          ],
          stack: ["MySQL", "REST APIs", "AWS", "Docker", "GitHub"],
        },
        {
          role: "Freelance developer",
          company: "Independent",
          period: "May 2024 - Apr 2025",
          summary: "Designed and delivered three web projects for clients.",
          details: [
            "An institutional platform for a theatre, a landing page for a consultancy and an online shop for an arts venture.",
            "Picked PostgreSQL or Firebase to fit each project, and handled design and delivery myself.",
          ],
          stack: ["PostgreSQL", "Firebase", "GitHub"],
        },
        {
          role: "Fullstack trainee",
          company: "Globant",
          period: "Feb 2024 - May 2024",
          summary: "Joined a multilingual team building an internal platform.",
          details: [
            "Worked in English, Portuguese and Spanish on a JavaScript and TypeScript app that centralised unassigned-client users and replaced a manual process.",
          ],
          stack: ["JavaScript", "TypeScript", "Agile", "GitHub"],
        },
      ],
      education: {
        title: "Education",
        items: [
          {
            degree: "Computer engineering degree",
            school: "Universidad Politécnica de Madrid (UPM)",
            period: "2019 - 2024",
          },
          {
            degree: "International Baccalaureate",
            school: "SCMS, Buenos Aires",
            period: "2018",
          },
        ],
      },
    },
    projects: {
      title: "Work",
      intro:
        "Things I've built, loaded from my GitHub each time you open the page.",
      live: "Live site",
      code: "Code",
      noRepos: "Projects coming soon.",
      noDescription: "No description yet.",
    },
    contact: {
      title: "Your move.",
      body: "Hiring for a developer role, or need a site, web app or automation built? Send me a few lines about it and I'll get back to you.",
      emailLabel: "Email",
      copied: "Email copied to clipboard",
      copy: "Copy email",
      linkedin: "LinkedIn",
      github: "GitHub",
      cv: "Download CV",
      location: "Barcelona, Spain · open to remote",
      credit: "Chess pieces: cburnett by Colin M.L. Burnett, CC BY-SA 3.0",
    },
    rail: {
      jump: "Jump to",
    },
    theme: {
      toggle: "Toggle dark mode",
    },
    footer: {
      title: "Open to new roles. Let's talk.",
    },
    language: {
      toggle: "Change language",
      english: "English",
      spanish: "Spanish",
    },
    notFound: {
      eyebrow: "½–½",
      title: "Stalemate.",
      description: "There's no legal move to this page.",
      backHome: "Back to the board",
    },
  },
  es: {
    nav: {
      home: "Inicio",
      about: "Sobre mí",
      experience: "Experiencia",
      projects: "Proyectos",
      contact: "Contacto",
      puzzle: "Problema",
    },
    puzzle: {
      intro:
        "Una pausa de ajedrez. Encuentra el mate de la coz: un rey atrapado por sus propias piezas.",
      prompt: "Juegan blancas. Mate en 2.",
      wrong: "Casi. Prueba otra jugada.",
      forced: "La única jugada de las negras. Ahora remata.",
      solved: "Jaque mate. Ahogado por sus propias piezas.",
      reset: "Reiniciar",
      solution: "Ver solución",
    },
    hero: {
      role: "Ingeniero Informático en Barcelona",
      line: "Me gusta programar… y el ajedrez.",
      hint: "Mueve el caballo o haz scroll.",
      knight: "Caballo. Selecciónalo para ver sus movimientos",
      cv: "Descargar CV",
      email: "Escríbeme",
    },
    about: {
      title: "Sobre mí",
      lead: "Ingeniero Informático apasionado por la tecnología y la resolución de problemas. Haber vivido en distintos países y trabajar en varios idiomas me ha dado una mirada flexible y colaborativa, y sigo buscando nuevos retos donde aportar y crecer.",
      skills: "Tecnologías",
      based: "Ubicación",
      basedValue: "Barcelona, España (disponible en remoto)",
      educationValue: "Ingeniería Informática, UPM Madrid",
      groups: {
        frontend: "Frontend",
        backend: "Backend y datos",
        cloud: "Nube y herramientas",
        ai: "IA y automatización",
      },
      aiSkills: [
        "Desarrollo asistido por IA",
        "Automatización de flujos",
        "Integración de APIs",
      ],
      languagesTitle: "Idiomas",
      levels: {
        native: "nativo",
        bilingual: "bilingüe",
        advanced: "avanzado",
        intermediate: "intermedio",
      },
      languages: [
        { name: "Español", level: "native" },
        { name: "Inglés", level: "bilingual" },
        { name: "Portugués", level: "advanced" },
        { name: "Armenio", level: "advanced" },
        { name: "Francés", level: "intermediate" },
      ],
    },
    experience: {
      title: "Experiencia",
      roles: [
        {
          role: "Analista de optimización de procesos",
          company: "Frigorífico Gorina",
          period: "abr 2026 - ago 2026",
          summary:
            "Único desarrollador del flujo de certificados sanitarios de la planta.",
          details: [
            "Desarrollé una app de escritorio en Python que lee los PDFs de permisos sanitarios y rellena los certificados correspondientes, reduciendo un 95% el tiempo de carga y de rellenado.",
            "Desarrollé un sistema para aprobar, buscar y descargar certificados a partir de plantillas estándar. El departamento lo adoptó como su herramienta estándar.",
          ],
          stack: ["Python", "Google Cloud", "Azure Functions", "GitHub"],
        },
        {
          role: "Desarrollador fullstack",
          company: "Globalthy",
          period: "abr 2025 - abr 2026",
          summary:
            "Llevé una plataforma web de cero a producción como su único desarrollador fullstack.",
          details: [
            "Construí el frontend y lo conecté a una base de datos MySQL mediante APIs REST, con un sistema de autenticación.",
            "La desplegué en AWS con Docker, trabajando en sprints ágiles.",
          ],
          stack: ["MySQL", "APIs REST", "AWS", "Docker", "GitHub"],
        },
        {
          role: "Desarrollador freelance",
          company: "Independiente",
          period: "may 2024 - abr 2025",
          summary: "Diseñé y entregué tres proyectos web para clientes.",
          details: [
            "Una plataforma institucional para un teatro, una landing para una consultora y una tienda online para un proyecto artístico.",
            "Elegí PostgreSQL o Firebase según cada proyecto, y me encargué del diseño y de la entrega.",
          ],
          stack: ["PostgreSQL", "Firebase", "GitHub"],
        },
        {
          role: "Fullstack trainee",
          company: "Globant",
          period: "feb 2024 - may 2024",
          summary:
            "Me uní a un equipo multilingüe que construía una plataforma interna.",
          details: [
            "Trabajé en inglés, portugués y español en una app de JavaScript y TypeScript que centralizó la gestión de usuarios de clientes sin asignar y sustituyó un proceso manual.",
          ],
          stack: ["JavaScript", "TypeScript", "Agile", "GitHub"],
        },
      ],
      education: {
        title: "Formación",
        items: [
          {
            degree: "Grado en Ingeniería Informática",
            school: "Universidad Politécnica de Madrid (UPM)",
            period: "2019 - 2024",
          },
          {
            degree: "Bachillerato Internacional",
            school: "SCMS, Buenos Aires",
            period: "2018",
          },
        ],
      },
    },
    projects: {
      title: "Proyectos",
      intro:
        "Lo que he construido, cargado desde mi GitHub cada vez que abres la página.",
      live: "Ver web",
      code: "Código",
      noRepos: "Próximamente.",
      noDescription: "Sin descripción todavía.",
    },
    contact: {
      title: "Tu jugada.",
      body: "¿Buscas un desarrollador para tu equipo, o necesitas una web, una aplicación o una automatización? Escríbeme unas líneas y te respondo.",
      emailLabel: "Email",
      copied: "Email copiado al portapapeles",
      copy: "Copiar email",
      linkedin: "LinkedIn",
      github: "GitHub",
      cv: "Descargar CV",
      location: "Barcelona · disponible en remoto",
      credit:
        "Piezas de ajedrez: cburnett, de Colin M.L. Burnett, CC BY-SA 3.0",
    },
    rail: {
      jump: "Ir a",
    },
    theme: {
      toggle: "Cambiar modo oscuro",
    },
    footer: {
      title: "Abierto a nuevos retos. Hablemos.",
    },
    language: {
      toggle: "Cambiar idioma",
      english: "Inglés",
      spanish: "Español",
    },
    notFound: {
      eyebrow: "½–½",
      title: "Tablas por ahogado.",
      description: "Ningún movimiento legal lleva a esta página.",
      backHome: "Volver al tablero",
    },
  },
} as const;

export type Language = keyof typeof translations;

type LangLevel = "native" | "bilingual" | "advanced" | "intermediate";

export type Role = {
  role: string;
  company: string;
  period: string;
  summary: string;
  details: readonly string[];
  stack: readonly string[];
};

type TranslationStructure = {
  nav: {
    home: string;
    about: string;
    experience: string;
    projects: string;
    contact: string;
    puzzle: string;
  };
  puzzle: {
    intro: string;
    prompt: string;
    wrong: string;
    forced: string;
    solved: string;
    reset: string;
    solution: string;
  };
  hero: {
    role: string;
    line: string;
    hint: string;
    knight: string;
    cv: string;
    email: string;
  };
  about: {
    title: string;
    lead: string;
    skills: string;
    based: string;
    basedValue: string;
    educationValue: string;
    groups: { frontend: string; backend: string; cloud: string; ai: string };
    aiSkills: readonly string[];
    languagesTitle: string;
    levels: Record<LangLevel, string>;
    languages: readonly { name: string; level: LangLevel }[];
  };
  experience: {
    title: string;
    roles: readonly Role[];
    education: {
      title: string;
      items: readonly { degree: string; school: string; period: string }[];
    };
  };
  projects: {
    title: string;
    intro: string;
    live: string;
    code: string;
    noRepos: string;
    noDescription: string;
  };
  contact: {
    title: string;
    body: string;
    emailLabel: string;
    copied: string;
    copy: string;
    linkedin: string;
    github: string;
    cv: string;
    location: string;
    credit: string;
  };
  rail: { jump: string };
  theme: { toggle: string };
  footer: { title: string };
  language: { toggle: string; english: string; spanish: string };
  notFound: {
    eyebrow: string;
    title: string;
    description: string;
    backHome: string;
  };
};

export type TranslationKeys = TranslationStructure;
