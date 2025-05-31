export const translations = {
  en: {
    nav: {
      about: "About",
      projects: "Projects",
      contact: "Contact",
    },
    hero: {
      greeting: "Hi, I'm",
      description:
        "A passionate software engineer and web developer crafting beautiful, functional, and user-friendly digital experiences.",
      contactButton: "Contact Me",
      viewWorkButton: "View My Work",
    },
    about: {
      title: "About Me",
      paragraph1:
        "I'm a software engineer with a passion for creating elegant solutions to complex problems.",
      paragraph2:
        "With expertise in modern web technologies and a keen eye for design, I build applications that are both beautiful and functional.",
      paragraph3:
        "When I'm not coding, you can find me drawing, playing chess, coding and... oh.",
      skillsTitle: "Skills",
    },
    projects: {
      title: "Projects",
      noRepos:
        "No starred repositories found. Star some repositories on GitHub to showcase them here!",
      githubButton: "Github",
      viewProjectButton: "View Project →",
      noDescription: "No description available",
    },
    contact: {
      title: "Get In Touch",
      description:
        "I'm always open to discussing new projects, creative ideas, or opportunities to bring your vision to life. Feel free to reach out!",
      emailButton: "Send me an email",
    },
    footer: {
      copyright: "Alexandre Arabian.",
    },
    language: {
      toggle: "Change language",
      english: "English",
      spanish: "Spanish",
    },
  },
  es: {
    nav: {
      about: "Acerca de",
      projects: "Proyectos",
      contact: "Contacto",
    },
    hero: {
      greeting: "Hola, soy",
      description:
        "Un ingeniero de software apasionado y desarrollador web que crea experiencias digitales hermosas, funcionales y fáciles de usar.",
      contactButton: "Contáctame",
      viewWorkButton: "Ver Mi Trabajo",
    },
    about: {
      title: "Acerca de Mí",
      paragraph1:
        "Soy un ingeniero de software con pasión por crear soluciones elegantes a problemas complejos.",
      paragraph2:
        "Con experiencia en tecnologías web modernas y un buen ojo para el diseño, construyo aplicaciones que son tanto hermosas como funcionales.",
      paragraph3:
        "Cuando no estoy programando, puedes encontrarme dibujando, jugando ajedrez, programando y... oh.",
      skillsTitle: "Habilidades",
    },
    projects: {
      title: "Proyectos",
      noRepos:
        "No se encontraron repositorios marcados como favoritos. ¡Marca algunos repositorios en GitHub para mostrarlos aquí!",
      githubButton: "Github",
      viewProjectButton: "Ver Proyecto →",
      noDescription: "Sin descripción disponible",
    },
    contact: {
      title: "Ponte en Contacto",
      description:
        "Siempre estoy abierto a discutir nuevos proyectos, ideas creativas u oportunidades para dar vida a tu visión. ¡No dudes en contactarme!",
      emailButton: "Envíame un email",
    },
    footer: {
      copyright: "Alexandre Arabian.",
    },
    language: {
      toggle: "Cambiar idioma",
      english: "Inglés",
      spanish: "Español",
    },
  },
} as const;

export type Language = keyof typeof translations;

type TranslationStructure = {
  nav: {
    about: string;
    projects: string;
    contact: string;
  };
  hero: {
    greeting: string;
    description: string;
    contactButton: string;
    viewWorkButton: string;
  };
  about: {
    title: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    skillsTitle: string;
  };
  projects: {
    title: string;
    noRepos: string;
    githubButton: string;
    viewProjectButton: string;
    noDescription: string;
  };
  contact: {
    title: string;
    description: string;
    emailButton: string;
  };
  footer: {
    copyright: string;
  };
  language: {
    toggle: string;
    english: string;
    spanish: string;
  };
};

export type TranslationKeys = TranslationStructure;
