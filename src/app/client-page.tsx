"use client";

import Image from "next/image";
import { ArrowUpRight, Check, Copy, Download, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { useLanguage } from "~/contexts/LanguageContext";
import { cn } from "~/lib/utils";
import type { Role, TranslationKeys } from "~/lib/translations";
import { ChessPiece, type PieceType } from "~/components/chess-piece";
import { KnightBoard, type BoardSection } from "~/components/knight-board";
import { ChessPuzzle } from "~/components/chess-puzzle";
import {
  EnvelopeClosedIcon,
  GitHubLogoIcon,
  GlobeIcon,
  LinkedInLogoIcon,
} from "@radix-ui/react-icons";
import type { Repo } from "./actions/getRepos";

const EASE = [0.16, 1, 0.3, 1] as const;
const EMAIL = "alexandre.arabian.j@gmail.com";
const GITHUB_URL = "https://github.com/alexandrearabian";
const LINKEDIN_URL = "https://www.linkedin.com/in/alexandre-arabian-jensezian/";

// Proper nouns stay in code; only the AI group's phrases get translated.
const SKILLS = {
  frontend: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js"],
  backend: [
    "Node.js",
    "Python",
    "Java",
    "C",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "Firebase",
    "REST APIs",
  ],
  cloud: ["AWS", "Google Cloud", "Azure", "Docker", "Git", "GitHub"],
} as const;

// Screenshots of the live sites, preferred over the sites' own share
// images and GitHub's generated card.
const SHOTS: Record<string, string> = {
  "mar-jabones": "/projects/mar-jabones.png",
  ayan: "/projects/ayan.png",
  flaminhotboi: "/projects/flaminhotboi.png",
  tadron: "/projects/tadron.png",
};

// Page order, and the piece beside each heading (and on its board square).
const SECTIONS: readonly BoardSection[] = [
  { id: "about", piece: "knight" },
  { id: "experience", piece: "bishop" },
  { id: "projects", piece: "rook" },
  { id: "contact", piece: "queen" },
  { id: "puzzle", piece: "pawn" },
];

// Letters rise out of a clipped line, one after another.
function RevealText({
  text,
  delay,
  children,
}: {
  text: string;
  delay: number;
  children?: React.ReactNode;
}) {
  return (
    <span
      className="inline-block overflow-hidden pr-[0.04em] pb-[0.1em]"
      aria-hidden
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: delay + i * 0.035 }}
        >
          {char}
        </motion.span>
      ))}
      {children}
    </span>
  );
}

// A section is a room: only one is on the page at a time, below the
// board's runway. It overlaps the runway's last screen, hidden, and shows
// the moment the growing square has filled the screen (`revealed`),
// rising in on top of it. At least a screen tall so
// the runway can always be scrolled to its end. The content remounts on
// each reveal so the rise plays every time.
function Section({
  id,
  revealed,
  footer,
  className,
  children,
}: {
  id: BoardSection["id"];
  revealed: boolean;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "bg-background relative z-10 -mt-[100svh] flex min-h-[100svh] flex-col",
        !revealed && "invisible",
      )}
    >
      <motion.div
        key={String(revealed)}
        // Starts well down the screen, so it reads as arriving.
        className={cn("shell flex-1 pt-[34svh] pb-28 md:pb-36", className)}
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        {children}
      </motion.div>
      {footer}
    </section>
  );
}

// A section heading: its piece and title in the display serif, an
// optional intro under it, and a hairline closing the header off from the
// content.
function Heading({
  piece,
  title,
  intro,
}: {
  piece: PieceType;
  title: string;
  intro?: string;
}) {
  return (
    <motion.header
      className="mb-12 md:mb-16"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
    >
      <h2 className="font-display flex items-end gap-[0.22em] text-[3.25rem] leading-[0.95] sm:text-7xl lg:text-[5.5rem]">
        <ChessPiece
          type={piece}
          className="-mb-[0.06em] size-[0.86em] shrink-0"
        />
        {title}
      </h2>
      {intro && (
        <p className="text-muted-foreground mt-6 max-w-[54ch] text-lg leading-relaxed">
          {intro}
        </p>
      )}
      <div className="bg-border mt-10 h-px md:mt-12" />
    </motion.header>
  );
}

// The page's one numbering style: italic serif figures in the accent.
function Numeral({ n, className }: { n: number; className?: string }) {
  return (
    <span
      className={cn(
        "font-display text-accent text-3xl italic tabular-nums",
        className,
      )}
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

// Tech named in plain text, small and quiet: easier to scan than pills.
function Tech({ items }: { items: readonly string[] }) {
  return (
    <p className="text-muted-foreground text-sm leading-relaxed">
      {items.join(", ")}
    </p>
  );
}

// One role: numeral, company and dates on the left; the role on the right.
// Everything is shown; recruiters shouldn't have to open anything.
function RoleRow({ item, move }: { item: Role; move: number }) {
  return (
    <motion.li
      className="border-border grid gap-5 border-t py-12 first:border-t-0 first:pt-0 md:grid-cols-[14rem_1fr] md:gap-14"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div className="flex items-baseline gap-5 md:block">
        <Numeral n={move} />
        <div className="md:mt-4">
          <p className="font-medium">{item.company}</p>
          <p className="text-muted-foreground mt-1 text-sm tabular-nums">
            {item.period}
          </p>
        </div>
      </div>
      <div className="max-w-[62ch]">
        <h3 className="font-display text-3xl leading-[1.1] sm:text-4xl">
          {item.role}
        </h3>
        <p className="mt-4 text-lg leading-relaxed">{item.summary}</p>
        <ul className="text-muted-foreground mt-5 space-y-3 leading-relaxed">
          {item.details.map((line) => (
            <li
              key={line}
              className="before:bg-accent relative pl-6 before:absolute before:top-[0.8em] before:left-0 before:h-px before:w-3"
            >
              {line}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Tech items={item.stack} />
        </div>
      </div>
    </motion.li>
  );
}

type Project = {
  key: number;
  name: string;
  description: string;
  tags: string[];
  site: string | null;
  github: string;
  image: string;
};

// A list of projects. On desktop, the one you hover shows on the right as
// a link preview, the card a messaging app draws for a shared URL. On
// mobile each row carries a small thumbnail instead.
function ProjectList({
  projects,
  labels,
}: {
  projects: Project[];
  labels: TranslationKeys["projects"];
}) {
  const [active, setActive] = useState(0);
  const shown = projects[active]!;
  const link = (p: Project) => p.site ?? p.github;

  return (
    <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-16">
      <ol>
        {projects.map((project, i) => (
          <motion.li
            key={project.key}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className="group border-border relative grid grid-cols-[auto_1fr] gap-x-5 border-b py-8 first:pt-0 sm:gap-x-8"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <Numeral n={i + 1} className="pt-0.5" />
            <div className="min-w-0">
              <h3 className="font-display text-3xl leading-[1.1] sm:text-4xl">
                <a
                  href={link(project)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "group-hover:text-accent transition-colors after:absolute after:inset-0",
                    i === active && "md:text-accent",
                  )}
                >
                  {project.name}
                </a>
              </h3>
              {/* Mobile has no hover preview: a thumbnail instead. */}
              <div className="relative mt-4 aspect-[1.91/1] overflow-hidden rounded-md md:hidden">
                <Image
                  src={project.image}
                  alt=""
                  fill
                  // Our own screenshots go through the optimiser; remote
                  // share images are shown as they are.
                  unoptimized={!project.image.startsWith("/")}
                  sizes="(min-width: 768px) 27rem, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 max-w-[58ch] leading-relaxed">
                {project.description}
              </p>
              {project.tags.length > 0 && (
                <div className="mt-3">
                  <Tech items={project.tags} />
                </div>
              )}
              <div className="relative z-10 mt-5 flex gap-6 text-sm font-medium">
                {project.site && (
                  <a
                    href={project.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent inline-flex items-center gap-1.5 underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current"
                  >
                    <GlobeIcon className="size-4" />
                    {labels.live}
                    <ArrowUpRight className="size-4" />
                  </a>
                )}
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent inline-flex items-center gap-1.5 underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current"
                >
                  <GitHubLogoIcon className="size-4" />
                  {labels.code}
                  <ArrowUpRight className="size-4" />
                </a>
              </div>
            </div>
          </motion.li>
        ))}
      </ol>

      <aside aria-hidden className="hidden md:block">
        <div className="bg-card border-border sticky top-28 overflow-hidden rounded-md border shadow-[0_30px_60px_-30px_var(--shadow)]">
          {/* Every image is stacked and preloaded; hovering crossfades. */}
          <div className="bg-border relative aspect-[1.91/1]">
            {projects.map((project, i) => (
              <Image
                key={project.key}
                src={project.image}
                alt=""
                fill
                // Our own screenshots go through the optimiser; remote
                // share images are shown as they are.
                unoptimized={!project.image.startsWith("/")}
                sizes="(min-width: 768px) 27rem, 100vw"
                className={cn(
                  "object-cover transition-opacity duration-500",
                  i === active ? "opacity-100" : "opacity-0",
                )}
              />
            ))}
          </div>
          <div className="p-5">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              {new URL(link(shown)).hostname.replace(/^www\./, "")}
            </p>
            <p className="font-display mt-1 text-2xl">{shown.name}</p>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
              {shown.description}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function HomePage({ repos }: { repos: Repo[] }) {
  const { t, language } = useLanguage();
  const [emailCopied, setEmailCopied] = useState(false);
  const [onBoard, setOnBoard] = useState(true);
  const [active, setActive] = useState(0);
  const cvHref = language === "es" ? "/spanish-cv.pdf" : "/english-cv.pdf";
  const cvName =
    language === "es"
      ? "Alexandre_Arabian_CV_ES.pdf"
      : "Alexandre_Arabian_CV_EN.pdf";

  // Copy the address for pasting elsewhere, in addition to letting the
  // mailto: link open the visitor's mail app as normal.
  const handleEmailClick = () => {
    void navigator.clipboard?.writeText(EMAIL).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2500);
    });
  };

  const skillGroups = [
    { key: "frontend", label: t.about.groups.frontend, items: SKILLS.frontend },
    { key: "backend", label: t.about.groups.backend, items: SKILLS.backend },
    { key: "cloud", label: t.about.groups.cloud, items: SKILLS.cloud },
    { key: "ai", label: t.about.groups.ai, items: t.about.aiSkills },
  ];

  const projects: Project[] = useMemo(
    () =>
      repos.map((repo) => ({
        key: repo.id,
        // "mar-jabones" -> "Mar Jabones"
        name: repo.name
          .replace(/[-_]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        description: repo.description ?? t.projects.noDescription,
        tags: repo.topics.length
          ? repo.topics.slice(0, 4)
          : repo.language
            ? [repo.language]
            : [],
        // GitHub returns "" for an unset homepage, hence || not ??.
        site: repo.homepage || null,
        github: repo.html_url,
        image:
          SHOTS[repo.name] ??
          repo.preview ??
          `https://opengraph.githubassets.com/1/${repo.owner.login}/${repo.name}`,
      })),
    [repos, t],
  );

  const rooms: Record<BoardSection["id"], React.ReactNode> = {
    // The pitch in the display serif; key facts in three columns under
    // it; then the stack, set like a menu card.
    about: (
      <>
        <Heading piece="knight" title={t.about.title} />
        <p className="font-display max-w-[32ch] text-[1.85rem] leading-[1.2] sm:text-[2.35rem] lg:text-[2.75rem]">
          {t.about.lead}
        </p>

        <dl className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-14">
          {[
            { label: t.about.based, value: t.about.basedValue },
            {
              label: t.experience.education.title,
              value: t.about.educationValue,
            },
          ].map((fact) => (
            <div key={fact.label} className="border-border border-t pt-5">
              <dt className="text-muted-foreground text-sm">{fact.label}</dt>
              <dd className="font-display mt-2 text-2xl leading-snug">
                {fact.value}
              </dd>
            </div>
          ))}
          <div className="border-border border-t pt-5 sm:col-span-2 lg:col-span-1">
            <dt className="text-muted-foreground text-sm">
              {t.about.languagesTitle}
            </dt>
            <dd>
              <ul className="mt-2 space-y-1.5">
                {t.about.languages.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <span className="font-display text-2xl">{item.name}</span>
                    <span className="text-muted-foreground text-sm">
                      {t.about.levels[item.level]}
                    </span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>

        <div className="mt-20">
          <h3 className="font-display text-3xl italic">{t.about.skills}</h3>
          {/* Two columns even on a phone: four short lists read better
              side by side than as one long column. */}
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-14">
            {skillGroups.map((group) => (
              <div key={group.key} className="border-border border-t pt-5">
                <dt className="text-sm font-medium">{group.label}</dt>
                <dd>
                  <ul className="text-muted-foreground mt-3 space-y-1 text-[15px] sm:space-y-1.5 sm:text-base">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </>
    ),
    experience: (
      <>
        <Heading piece="bishop" title={t.experience.title} />
        <ol>
          {t.experience.roles.map((item, i) => (
            <RoleRow
              key={item.company + item.period}
              item={item}
              move={i + 1}
            />
          ))}
        </ol>

        <div className="border-border mt-12 grid gap-8 border-t pt-12 md:grid-cols-[14rem_1fr] md:gap-14">
          <h3 className="font-display text-3xl italic">
            {t.experience.education.title}
          </h3>
          <ul className="grid gap-10 sm:grid-cols-2">
            {t.experience.education.items.map((item) => (
              <li key={item.school}>
                <p className="font-display text-2xl leading-snug">
                  {item.degree}
                </p>
                <p className="mt-2">{item.school}</p>
                <p className="text-muted-foreground mt-1 text-sm tabular-nums">
                  {item.period}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </>
    ),
    projects: (
      <>
        <Heading
          piece="rook"
          title={t.projects.title}
          intro={t.projects.intro}
        />
        {projects.length > 0 ? (
          <ProjectList projects={projects} labels={t.projects} />
        ) : (
          <p className="text-muted-foreground text-lg">{t.projects.noRepos}</p>
        )}
      </>
    ),
    contact: (
      <>
        <Heading piece="queen" title={t.contact.title} />
        {/* The pitch and the two things a recruiter wants (write, or take
            the CV) on the left; every channel on a card on the right. */}
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <p className="max-w-[42ch] text-xl leading-relaxed">
              {t.contact.body}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={`mailto:${EMAIL}`}
                onClick={handleEmailClick}
                className="bg-foreground text-background hover:bg-accent inline-flex h-12 items-center gap-2.5 rounded-full px-6 text-sm font-medium transition-colors active:scale-[0.98]"
              >
                <Mail className="size-4" />
                {t.hero.email}
              </a>
              <a
                href={cvHref}
                download={cvName}
                className="border-foreground/20 hover:border-foreground inline-flex h-12 items-center gap-2.5 rounded-full border px-6 text-sm font-medium transition-colors active:scale-[0.98]"
              >
                <Download className="size-4" />
                {t.contact.cv}
              </a>
            </div>
            <p className="text-muted-foreground mt-8">{t.contact.location}</p>
          </div>

          <ul className="bg-card border-border divide-border divide-y self-start rounded-md border lg:col-span-6">
            <li className="flex items-center gap-4 px-5 py-5 sm:px-7">
              <span className="border-border bg-background grid size-10 shrink-0 place-items-center rounded-full border">
                <EnvelopeClosedIcon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-sm">
                  {t.contact.emailLabel}
                </p>
                <a
                  href={`mailto:${EMAIL}`}
                  onClick={handleEmailClick}
                  className="font-display hover:text-accent mt-1 block truncate text-xl transition-colors sm:text-2xl"
                >
                  {EMAIL}
                </a>
              </div>
              <button
                type="button"
                onClick={handleEmailClick}
                aria-label={t.contact.copy}
                title={t.contact.copy}
                className="text-muted-foreground hover:text-foreground border-border grid size-10 shrink-0 place-items-center rounded-full border transition-colors"
              >
                {emailCopied ? (
                  <Check className="text-accent size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
              </button>
            </li>
            {[
              {
                label: t.contact.linkedin,
                value: "in/alexandre-arabian-jensezian",
                href: LINKEDIN_URL,
                Icon: LinkedInLogoIcon,
              },
              {
                label: t.contact.github,
                value: "github.com/alexandrearabian",
                href: GITHUB_URL,
                Icon: GitHubLogoIcon,
              },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 px-5 py-5 sm:px-7"
                >
                  <span className="border-border bg-background grid size-10 shrink-0 place-items-center rounded-full border">
                    <link.Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-muted-foreground block text-sm">
                      {link.label}
                    </span>
                    <span className="font-display group-hover:text-accent mt-1 block truncate text-xl transition-colors sm:text-2xl">
                      {link.value}
                    </span>
                  </span>
                  <ArrowUpRight className="size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <p className="border-border text-muted-foreground mt-24 border-t pt-6 text-xs">
          {t.contact.credit}
        </p>
      </>
    ),
    puzzle: (
      <>
        <Heading piece="pawn" title={t.nav.puzzle} intro={t.puzzle.intro} />
        <ChessPuzzle />
      </>
    ),
  };
  const room = SECTIONS[active]!.id;

  // Ends every room but Contact: a way to reach me wherever you are.
  const footer = (
    <footer className="border-border border-t">
      <div className="shell flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between md:py-14">
        <div>
          <p className="font-display text-3xl leading-tight sm:text-4xl">
            {t.footer.title}
          </p>
          <a
            href={`mailto:${EMAIL}`}
            onClick={handleEmailClick}
            className="hover:text-accent mt-3 inline-flex items-center gap-2 text-lg underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current"
          >
            <EnvelopeClosedIcon className="size-4 shrink-0" />
            {EMAIL}
          </a>
        </div>
        <ul className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium">
          {[
            {
              href: LINKEDIN_URL,
              label: t.contact.linkedin,
              Icon: LinkedInLogoIcon,
            },
            { href: GITHUB_URL, label: t.contact.github, Icon: GitHubLogoIcon },
          ].map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent inline-flex items-center gap-1.5 transition-colors"
              >
                <link.Icon className="size-4" />
                {link.label}
                <ArrowUpRight className="size-4" />
              </a>
            </li>
          ))}
          <li>
            <a
              href={cvHref}
              download={cvName}
              className="hover:text-accent inline-flex items-center gap-1.5 transition-colors"
            >
              <Download className="size-4" />
              {t.contact.cv}
            </a>
          </li>
        </ul>
      </div>
      <div className="shell text-muted-foreground border-border flex flex-col gap-1 border-t py-5 text-xs sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Alexandre Arabian</p>
        <p>{t.contact.credit}</p>
      </div>
    </footer>
  );

  return (
    <>
      <KnightBoard
        sections={SECTIONS}
        onBoardChange={setOnBoard}
        onActiveChange={setActive}
        intro={
          <>
            <h1
              aria-label="Alex"
              className="font-display text-[clamp(3.5rem,11svh,7rem)] leading-[0.9]"
            >
              <RevealText text="Alex" delay={0.1}>
                <motion.span
                  className="text-brass inline-block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, ease: EASE, delay: 0.3 }}
                >
                  .
                </motion.span>
              </RevealText>
            </h1>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
            >
              <p className="mt-2 text-lg font-medium sm:text-xl">
                {t.hero.role}
              </p>
              <p className="text-muted-foreground mt-1 sm:text-lg">
                {t.hero.line}
              </p>
            </motion.div>
          </>
        }
        actions={
          <motion.div
            className="flex items-center justify-center gap-5 text-sm font-medium md:justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <a
              href={cvHref}
              download={cvName}
              className="hover:text-accent inline-flex items-center gap-1.5 underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current"
            >
              <Download className="size-4" />
              {t.hero.cv}
            </a>
            <a
              href={`mailto:${EMAIL}`}
              onClick={handleEmailClick}
              className="hover:text-accent inline-flex items-center gap-1 underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current"
            >
              {t.hero.email}
              <ArrowUpRight className="size-4" />
            </a>
          </motion.div>
        }
      />

      <Section
        key={room}
        id={room}
        revealed={!onBoard}
        // Contact is itself the contact sheet; every other room ends with
        // the footer.
        footer={room !== "contact" && footer}
        className={room === "contact" ? "pb-16 md:pb-20" : undefined}
      >
        {rooms[room]}
      </Section>
      {/* Toast: confirms the address was copied to the clipboard */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4"
      >
        <AnimatePresence>
          {emailCopied && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="bg-foreground text-background flex items-center gap-2 rounded-full py-2.5 pr-5 pl-4 text-sm font-medium"
            >
              <Check className="text-brass size-4" strokeWidth={2.5} />
              {t.contact.copied}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
