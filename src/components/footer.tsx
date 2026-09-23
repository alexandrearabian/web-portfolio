"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
const EMAIL = "a.arabian.j@gmail.com";

const links = [
  { href: `mailto:${EMAIL}`, label: "Send email", Icon: Mail },
  {
    href: "https://github.com/alexandrearabian",
    label: "GitHub profile",
    Icon: Github,
  },
  {
    href: "https://www.linkedin.com/in/alexandre-arabian-jensezian/",
    label: "LinkedIn profile",
    Icon: Linkedin,
  },
];

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="shell">
      <div className="flex flex-col-reverse items-center justify-between gap-6 border-t py-10 sm:flex-row">
        <p className="text-muted-foreground font-mono text-xs">
          © {new Date().getFullYear()} {t.footer.copyright}
        </p>
        <ul className="flex gap-2">
          {links.map(({ href, label, Icon }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-muted-foreground hover:text-brand hover:bg-brand/10 grid size-10 place-items-center rounded-full transition-all duration-300 hover:-translate-y-0.5 active:scale-90"
              >
                <Icon className="size-[18px]" strokeWidth={1.75} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
