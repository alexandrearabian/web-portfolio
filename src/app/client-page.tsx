"use client";

import Image from "next/image";
import { ArrowUpRight, Check, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { useLanguage } from "~/contexts/LanguageContext";
import { cn } from "~/lib/utils";
import type { Role, TranslationKeys } from "~/lib/translations";
import { ChessPiece, type PieceType } from "~/components/chess-piece";
import { PawnRail } from "~/components/pawn-rail";
import { KnightBoard, type BoardSection } from "~/components/knight-board";
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

// Page order, the piece beside each heading (and on its board square),
// and the square colour each section sits on.
const SECTIONS: readonly BoardSection[] = [
  { id: "about", piece: "knight", tone: "dark" },
  { id: "experience", piece: "bishop", tone: "dark" },
  { id: "projects", piece: "rook", tone: "light" },
  { id: "contact", piece: "queen", tone: "light" },
];
const tone = (id: BoardSection["id"]) =>
  SECTIONS.find((s) => s.id === id)!.tone;

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

// Each section is a full-width band in its square's colour; the content
// rises from below as one block when it scrolls in.
//
// The first section is different: it overlaps the board's last screen of
// runway, hidden, and shows the moment the growing square has filled the
// screen (`revealed`), rising in on top of it. Its content remounts on
// each reveal so the rise (and the heading's drop) play every time.
function Section({
  id,
  className,
  revealed,
  seam = false,
  children,
}: {
  id: BoardSection["id"];
  className?: string;
  revealed?: boolean;
  // A hairline at the top, for a section that follows one of its colour.
  seam?: boolean;
  children: React.ReactNode;
}) {
  const first = revealed !== undefined;
  const rise = { opacity: 1, y: 0 };
  return (
    <section
      id={id}
      data-tone={tone(id)}
      className={cn(
        `tone-${tone(id)}`,
        first && "relative z-10 -mt-[100svh]",
        revealed === false && "invisible",
      )}
    >
      {seam && (
        <div className="shell">
          <div className="border-border border-t" />
        </div>
      )}
      <motion.div
        key={String(revealed)}
        className={cn(
          "shell pb-28 md:pb-36",
          // The first section starts well down the screen, so it reads as
          // arriving rather than scrolling straight past.
          first ? "pt-[34svh]" : "pt-28 md:pt-36",
          className,
        )}
        initial={{ opacity: 0, y: 48 }}
        {...(first
          ? { animate: rise }
          : { whileInView: rise, viewport: { once: true, amount: 0.1 } })}
        transition={{ duration: 0.9, ease: EASE }}
      >
        {children}
      </motion.div>
    </section>
  );
}

// A section heading: its piece and title in the display serif, an
// optional intro under it, and a hairline closing the header off from the
// content. `slot` keeps the piece's place but leaves it empty: the last
// section's queen is the pawn rail's, which promotes and flies in
// (pawn-rail.tsx).
function Heading({
  piece,
  title,
  intro,
  slot = false,
}: {
  piece: PieceType;
  title: string;
  intro?: string;
  slot?: boolean;
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
          className={cn(
            "-mb-[0.06em] size-[0.86em] shrink-0",
            slot && "invisible",
          )}
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
                  unoptimized
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
                    className="hover:text-accent inline-flex items-center gap-1 underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current"
                  >
                    {labels.live}
                    <ArrowUpRight className="size-4" />
                  </a>
                )}
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent inline-flex items-center gap-1 underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current"
                >
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
                unoptimized
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
          repo.preview ??
          `https://opengraph.githubassets.com/1/${repo.owner.login}/${repo.name}`,
      })),
    [repos, t],
  );

  return (
    <>
      <PawnRail hidden={onBoard} startId="about" finalId="contact" />

      <KnightBoard
        sections={SECTIONS}
        onBoardChange={setOnBoard}
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

      {/* The pitch in the display serif; key facts in three columns under
          it; then the stack, set like a menu card. */}
      <Section id="about" revealed={!onBoard}>
        <Heading piece="knight" title={t.about.title} />
        <p className="font-display max-w-[30ch] text-[2rem] leading-[1.18] sm:text-[2.6rem] lg:text-5xl">
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
          <dl className="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-14">
            {skillGroups.map((group) => (
              <div key={group.key} className="border-border border-t pt-5">
                <dt className="text-sm font-medium">{group.label}</dt>
                <dd>
                  <ul className="text-muted-foreground mt-3 space-y-1.5">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <Section id="experience" seam>
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
      </Section>

      <Section id="projects">
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
      </Section>

      <Section id="contact" seam className="pb-16 md:pb-20">
        <Heading piece="queen" title={t.contact.title} slot />
        <p className="max-w-[46ch] text-xl leading-relaxed">{t.contact.body}</p>

        {/* A contact sheet: each way to reach me, as one full row. */}
        <ul className="mt-14 grid gap-x-14 md:grid-cols-2">
          {[
            {
              label: t.contact.emailLabel,
              value: EMAIL,
              href: `mailto:${EMAIL}`,
              onClick: handleEmailClick,
            },
            {
              label: t.contact.linkedin,
              value: "in/alexandre-arabian-jensezian",
              href: LINKEDIN_URL,
            },
            {
              label: t.contact.github,
              value: "github.com/alexandrearabian",
              href: GITHUB_URL,
            },
            {
              label: "CV",
              value: t.contact.cv,
              href: cvHref,
              download: cvName,
            },
          ].map((link) => (
            <li key={link.label} className="border-border border-b">
              <a
                href={link.href}
                target={link.download ? undefined : "_blank"}
                rel="noopener noreferrer"
                download={link.download}
                onClick={link.onClick}
                className="group flex items-end justify-between gap-6 py-7"
              >
                <span className="min-w-0">
                  <span className="text-muted-foreground block text-sm">
                    {link.label}
                  </span>
                  <span className="font-display group-hover:text-accent mt-2 block truncate text-2xl transition-colors sm:text-3xl">
                    {link.value}
                  </span>
                </span>
                {link.download ? (
                  <Download className="size-5 shrink-0 transition-transform duration-300 group-hover:translate-y-0.5" />
                ) : (
                  <ArrowUpRight className="size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                )}
              </a>
            </li>
          ))}
        </ul>
        <div className="border-border text-muted-foreground mt-24 flex flex-col gap-2 border-t pt-6 text-sm sm:flex-row sm:justify-between">
          <p>{t.contact.location}</p>
          <p className="text-xs sm:text-sm">{t.contact.credit}</p>
        </div>
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
