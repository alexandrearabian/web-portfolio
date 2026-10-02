"use client";

import Image from "next/image";
import { ArrowUpRight, Check, Copy, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "~/contexts/LanguageContext";
import { cn } from "~/lib/utils";
import type { Role, TranslationKeys } from "~/lib/translations";
import { ChessPiece, type PieceType } from "~/components/chess-piece";
import { KnightBoard, type BoardSection } from "~/components/knight-board";
import dynamic from "next/dynamic";
import {
  EnvelopeClosedIcon,
  GitHubLogoIcon,
  GlobeIcon,
  LinkedInLogoIcon,
} from "@radix-ui/react-icons";
import type { Repo } from "./actions/getRepos";

// The puzzle's code is only fetched when its section opens: most visits
// never do, and it shouldn't weigh on the first load. Meanwhile, an empty
// board-sized square.
const ChessPuzzle = dynamic(
  () => import("~/components/chess-puzzle").then((m) => m.ChessPuzzle),
  {
    ssr: false,
    loading: () => (
      <div className="bg-square-light/40 aspect-square w-full max-w-[34rem]" />
    ),
  },
);

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
  solara: "/projects/solara.jpg",
};

// Page order, and the piece beside each heading (and on its board square).
const SECTIONS: readonly BoardSection[] = [
  { id: "about", piece: "knight" },
  { id: "experience", piece: "bishop" },
  { id: "projects", piece: "rook" },
  { id: "contact", piece: "queen" },
  { id: "puzzle", piece: "pawn" },
];

// Letters rise out of a clipped line, one after another. A CSS animation
// (animate-rise), so it plays on first paint, before any JavaScript.
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
        <span
          key={i}
          className="animate-rise inline-block"
          style={{ animationDelay: `${delay + i * 0.03}s` }}
        >
          {char}
        </span>
      ))}
      {children}
    </span>
  );
}

// A section is a room: only one is on the page at a time, below the
// board's runway. It overlaps the runway's last screen, hidden, and shows
// the moment the growing square has filled the screen (`revealed`),
// rising in on top of it. Leaving mirrors the square: the board clips the
// section to the shrinking square (knight-board.tsx), so the page folds
// back into its square on the board. At least a screen tall so the runway
// can always be scrolled to its end.
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
  // In: the section appears at once (its background matches the square
  // that just filled the screen) and the content rises. Out: it stays as
  // it is while the board folds it into the square, then hides, and the
  // content resets so the rise plays again next time. No remount either
  // way: rebuilding it mid-scroll made phones stutter.
  const fold = 0.8; // s, longer than the board's way home
  return (
    <motion.section
      id={id}
      className="bg-background relative z-10 -mt-[100svh] flex min-h-[100svh] flex-col"
      initial={{ opacity: 0, visibility: "hidden" }}
      animate={
        revealed
          ? { opacity: 1, visibility: "visible" }
          : { opacity: 0, transitionEnd: { visibility: "hidden" } }
      }
      transition={revealed ? { duration: 0 } : { duration: 0.01, delay: fold }}
    >
      <motion.div
        // Starts just under the navbar, like any page.
        className={cn("shell flex-1 pt-24 pb-28 md:pt-32 md:pb-36", className)}
        initial={{ opacity: 0, y: 24 }}
        animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
        transition={
          revealed
            ? { duration: 0.5, ease: EASE }
            : { duration: 0, delay: fold }
        }
      >
        {children}
      </motion.div>
      {footer}
      {/* A screen of page colour above the section. Invisible in use (it
          matches the full-screen square it sits over), but leaving a
          section shrinks the screen exactly as it was, and that can
          include this space above the section's top. */}
      <div
        aria-hidden
        className="bg-background pointer-events-none absolute inset-x-0 bottom-full h-[100svh]"
      />
      {/* Leaving, the page turns into its square's dark wood as it shrinks
          (knight-board.tsx fades this in). Covers that space too. */}
      <div
        data-fold-tint
        aria-hidden
        className="bg-square-dark pointer-events-none absolute inset-x-0 -top-[100svh] bottom-0 z-20 opacity-0"
      />
    </motion.section>
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
      transition={{ duration: 0.5, ease: EASE }}
    >
      {/* Baseline-aligned: the piece's foot sits 12% above its box's
          bottom, so pulling the box down by that much (-0.1em at 0.86em)
          stands the piece on the title's baseline. */}
      <h2 className="font-display flex items-baseline gap-[0.18em] text-[3.25rem] leading-[0.95] sm:text-7xl lg:text-[5.5rem]">
        <ChessPiece
          type={piece}
          className="-mb-[0.1em] size-[0.86em] shrink-0"
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

// One line of an index set in big type: the word large on the left, the
// detail small on the right, hairlines between lines. Hovering a line
// lays the light-wood band across the whole page behind it (light wood in
// either theme, so the text on it is always dark).
function BigRow({
  word,
  children,
}: {
  word: string;
  children: React.ReactNode;
}) {
  return (
    <motion.li
      // The list's heading tops the first line; no double hairline.
      className="group border-border relative border-t transition-colors duration-300 first:border-t-0 hover:border-transparent hover:text-[#2b1d12] hover:[--muted-foreground:#5c4430] [&:hover+li]:border-transparent"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div
        aria-hidden
        className="bg-square-light absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] sm:items-center sm:gap-10 md:py-6">
        <p className="font-display text-[clamp(2.75rem,7vw,5.75rem)] leading-[0.9] transition-transform duration-300 group-hover:translate-x-2">
          {word}
        </p>
        {/* Heavier on phones: stacked under a smaller big word, the
            regular weight read too faint next to it. */}
        <div className="leading-relaxed font-medium sm:font-normal">
          {children}
        </div>
      </div>
    </motion.li>
  );
}

// One role, as a big-type line: the company large, with numeral, dates and
// role; summary, details and tech beside it. Everything is shown;
// recruiters shouldn't have to open anything.
function RoleRow({ item, move }: { item: Role; move: number }) {
  return (
    <motion.li
      className="border-border grid gap-6 border-t py-10 first:border-t-0 first:pt-0 md:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-14"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div>
        <div className="flex items-baseline gap-4">
          <Numeral n={move} className="text-2xl" />
          <span className="text-muted-foreground text-sm tabular-nums">
            {item.period}
          </span>
        </div>
        <h3 className="font-display mt-3 text-[clamp(2.5rem,6vw,4.75rem)] leading-[0.9]">
          {item.company}
        </h3>
        <p className="mt-3 text-lg font-medium">{item.role}</p>
      </div>
      <div className="max-w-[62ch] lg:pt-9">
        <p className="text-lg leading-relaxed">{item.summary}</p>
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

// Project images start transparent and fade in once loaded, instead of
// popping in as they arrive (see `data-[loaded]` on each).
const markLoaded = (e: React.SyntheticEvent<HTMLImageElement>) =>
  e.currentTarget.setAttribute("data-loaded", "");

// Phone thumbnails. A CSS opacity transition never plays there: the
// decoded frame is the first paint, so the picture pops in. An animation
// always starts from its `from` keyframe.
function MobileShot({ src }: { src: string }) {
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // A cached file can finish before `onLoad` is attached.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth > 0) setShown(true);
  }, []);
  return (
    <div className="bg-border relative mt-4 aspect-[1.91/1] overflow-hidden rounded-md md:hidden">
      <Image
        ref={ref}
        src={src}
        alt=""
        fill
        unoptimized={!src.startsWith("/")}
        sizes="100vw"
        onLoad={() => setShown(true)}
        className={cn("object-cover", shown ? "animate-fade-up" : "opacity-0")}
      />
    </div>
  );
}

type Project = {
  key: number;
  name: string;
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
  const [armed, setArmed] = useState(false);
  const shown = projects[active]!;
  const link = (p: Project) => p.site ?? p.github;

  // Paint the hidden state once before whileInView. On a phone the rows
  // are already in view on mount, and Motion then skips the tween.
  useEffect(() => {
    const id = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-16">
      <ol>
        {projects.map((project, i) => (
          <motion.li
            key={project.key}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            className="group border-border relative grid grid-cols-[auto_1fr] gap-x-5 border-b py-8 first:pt-0 sm:gap-x-8"
            initial={{ opacity: 0, y: 16 }}
            whileInView={armed ? { opacity: 1, y: 0 } : undefined}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.6, ease: EASE }}
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
              <MobileShot src={project.image} />
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

      {/* The preview is a link to the site it shows. Hidden from assistive
          tech and the tab order: each row already links to the same place. */}
      <aside aria-hidden className="hidden md:block">
        <a
          href={link(shown)}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          className="group bg-card border-border sticky top-28 block overflow-hidden rounded-md border shadow-[0_30px_60px_-30px_var(--shadow)] transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_36px_64px_-28px_var(--shadow)]"
        >
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
                onLoad={markLoaded}
                className={cn(
                  "object-cover opacity-0 transition-opacity duration-500",
                  i === active && "data-[loaded]:opacity-100",
                )}
              />
            ))}
          </div>
          <div className="flex items-end justify-between gap-4 p-5">
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                {new URL(link(shown)).hostname.replace(/^www\./, "")}
              </p>
              <p className="font-display group-hover:text-accent mt-1 text-2xl transition-colors">
                {shown.name}
              </p>
            </div>
            <ArrowUpRight className="size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </a>
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
  const handleEmailClick = useCallback(() => {
    void navigator.clipboard?.writeText(EMAIL).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2500);
    });
  }, []);

  // The degree, for About's first line (Education's first item).
  const degree = t.experience.education.items[0]!;

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
        tags: repo.topics.length
          ? repo.topics.slice(0, 4)
          : repo.language
            ? [repo.language]
            : [],
        // Already a full URL or null (see normalizeSite in getRepos).
        site: repo.homepage ?? null,
        github: repo.html_url,
        image:
          SHOTS[repo.name] ??
          repo.preview ??
          `https://opengraph.githubassets.com/1/${repo.owner.login}/${repo.name}`,
      })),
    [repos],
  );

  // LinkedIn, GitHub and the CV as quiet icon links: the footer's links,
  // and Contact's.
  const socials = (
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
  );

  const rooms: Record<BoardSection["id"], React.ReactNode> = {
    // Photo, pitch and degree side by side; then the stack and languages
    // as indexes in big type, one line per group and per language.
    about: (
      <>
        <Heading piece="knight" title={t.about.title} />
        <div className="grid gap-10 md:grid-cols-12 md:items-center md:gap-12">
          <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-md md:col-span-4 md:max-w-none">
            <Image
              src="/about/alex.png"
              alt={t.about.photo}
              fill
              // Not `priority`: About is hidden behind the board on first
              // load, and the photo shouldn't compete with scripts and fonts.
              sizes="(min-width: 768px) 30vw, 24rem"
              className="object-cover object-[50%_30%]"
            />
          </div>
          <div className="md:col-span-8">
            {/* pre-line: the intro's "\n" is a line break. From md the size
                follows the screen so its first sentence stays on one line. */}
            <p className="font-display text-[1.85rem] leading-[1.2] whitespace-pre-line sm:text-[2.35rem] md:text-[clamp(1.6rem,3.3vw,2.5rem)]">
              {t.about.lead}
            </p>
            <div className="border-border mt-10 border-t pt-5">
              <p className="text-muted-foreground text-sm">
                {t.experience.education.title}
              </p>
              <p className="mt-2 text-lg font-medium">{t.about.degree}</p>
              {/* The dates on their own line on phones. */}
              <p className="text-muted-foreground mt-0.5">
                {degree.school}
                <span className="hidden md:inline">, </span>
                <span className="block tabular-nums md:inline">
                  {degree.period}
                </span>
              </p>
            </div>
          </div>
        </div>

        <h3 className="font-display mt-24 text-3xl italic">{t.about.skills}</h3>
        <ul className="border-border mt-6 border-y">
          {skillGroups.map((group) => (
            <BigRow key={group.key} word={group.label}>
              <p className="text-muted-foreground sm:text-right">
                {group.items.join(", ")}
              </p>
            </BigRow>
          ))}
        </ul>

        <h3 className="font-display mt-24 text-3xl italic">
          {t.about.languagesTitle}
        </h3>
        <ul className="border-border mt-6 border-y">
          {t.about.languages.map((item) => (
            <BigRow key={item.name} word={item.name}>
              <p className="text-muted-foreground sm:text-right">
                {t.about.levels[item.level]}
              </p>
            </BigRow>
          ))}
        </ul>
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
        {/* Desktop: the pitch on the left; the address (the one big thing
            to take away) and the footer's links on the right. Stacked on
            mobile. */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="max-w-[42ch] text-xl leading-relaxed">
              {t.contact.body}
            </p>
            <p className="text-muted-foreground mt-8">{t.contact.location}</p>
          </div>

          <div className="lg:col-span-7">
            <p className="text-muted-foreground text-sm">
              {t.contact.emailLabel}
            </p>
            <div className="mt-2 flex items-center gap-4">
              <a
                href={`mailto:${EMAIL}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleEmailClick}
                className="font-display hover:text-accent min-w-0 truncate text-[clamp(1.6rem,5vw,3rem)] leading-tight underline decoration-current/20 decoration-1 underline-offset-[0.2em] transition-colors hover:decoration-current lg:text-[2.6rem]"
              >
                {EMAIL}
              </a>
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
            </div>
            <div className="border-border mt-8 border-t pt-6">{socials}</div>
          </div>
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
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleEmailClick}
            className="hover:text-accent mt-3 inline-flex items-center gap-2 text-lg underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current"
          >
            <EnvelopeClosedIcon className="size-4 shrink-0" />
            {EMAIL}
          </a>
        </div>
        {socials}
      </div>
      <div className="shell text-muted-foreground border-border flex flex-col gap-1 border-t py-5 text-xs sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Alexandre Arabian</p>
        <p>{t.contact.credit}</p>
      </div>
    </footer>
  );

  // The board is built once per language: crossing into a section (which
  // changes onBoard/active here) mid-scroll mustn't re-render it.
  const board = useMemo(
    () => (
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
              <RevealText text="Alex" delay={0.05}>
                <span
                  className="text-brass animate-rise inline-block"
                  style={{ animationDelay: "0.2s" }}
                >
                  .
                </span>
              </RevealText>
            </h1>
            <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <p className="mt-2 text-lg font-medium sm:text-xl">
                {t.hero.role}
              </p>
              <p className="text-muted-foreground mt-1 sm:text-lg">
                {t.hero.line}
              </p>
            </div>
          </>
        }
        actions={
          <div
            className="animate-fade-up flex items-center justify-center gap-5 text-sm font-medium md:justify-start"
            style={{ animationDelay: "0.35s" }}
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
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleEmailClick}
              className="hover:text-accent inline-flex items-center gap-1 underline decoration-current/30 underline-offset-4 transition-colors hover:decoration-current"
            >
              {t.hero.email}
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        }
      />
    ),
    [t, cvHref, cvName, handleEmailClick],
  );

  return (
    <>
      {board}

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
