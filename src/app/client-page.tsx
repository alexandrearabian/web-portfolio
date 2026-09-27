"use client";

import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Download,
  Github,
  Globe,
  Linkedin,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { useLanguage } from "~/contexts/LanguageContext";
import { cn } from "~/lib/utils";
import type { Repo } from "./actions/getRepos";

const EASE = [0.16, 1, 0.3, 1] as const;
const EMAIL = "alexandre.arabian.j@gmail.com";
const PHONE = "+34 677 09 69 12";
const LINKEDIN_URL = "https://www.linkedin.com/in/alexandre-arabian-jensezian/";

// Proper nouns: identical in every locale, so they live in code, not
// translations. The "AI & automation" group's items are phrases, not
// product names, so those come from t.about.aiSkills instead.
const SKILL_ITEMS = {
  programming: ["Java", "Python", "C"],
  web: [
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "SQL",
    "Node.js",
  ],
  cloud: ["Google Cloud", "Azure", "Git"],
} as const;

type Face = "smile" | "thumbsup" | "amazed";

// Real data, not decoration: each timeline marker shows the employer's
// own initials instead of a plain dot.
function initials(company: string) {
  return company
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

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
      className="inline-block overflow-hidden pr-[0.08em] pb-[0.06em]"
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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <FadeIn className="mb-12 flex items-baseline gap-4 md:mb-16">
      <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
        {children}
      </h2>
      <span className="bg-border h-px flex-1 self-center" />
    </FadeIn>
  );
}

// Card nested in a faint tinted bezel; the one card style on the page.
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-foreground/[0.035] rounded-[1.35rem] p-1.5">
      <div className="bg-card h-full rounded-[calc(1.35rem-0.375rem)] p-4 shadow-[inset_0_1px_0_var(--highlight)] sm:p-5">
        {children}
      </div>
    </div>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-muted-foreground mb-4 font-mono text-xs tracking-[0.14em] uppercase">
      {children}
    </h3>
  );
}

export default function HomePage({ repos }: { repos: Repo[] }) {
  const { t, language } = useLanguage();
  const [face, setFace] = useState<Face>("smile");
  const [emailCopied, setEmailCopied] = useState(false);

  // Copy the address for pasting elsewhere, in addition to letting the
  // mailto: link open the user's mail app as normal.
  const handleEmailClick = () => {
    void navigator.clipboard?.writeText(EMAIL).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2500);
    });
  };

  const skillGroups = [
    {
      key: "programming",
      label: t.about.skillGroups.programming,
      items: SKILL_ITEMS.programming,
    },
    { key: "web", label: t.about.skillGroups.web, items: SKILL_ITEMS.web },
    {
      key: "cloud",
      label: t.about.skillGroups.cloud,
      items: SKILL_ITEMS.cloud,
    },
    { key: "ai", label: t.about.skillGroups.ai, items: t.about.aiSkills },
  ];

  const projects = useMemo(
    () =>
      repos.map((repo) => ({
        key: repo.id,
        // "mar-jabones" -> "Mar Jabones"
        name: repo.name
          .replace(/[-_]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        description: repo.description ?? t.projects.noDescription,
        tag: repo.language,
        // GitHub returns "" for an unset homepage, hence || not ??.
        site: repo.homepage || null,
        href: repo.homepage || repo.html_url,
        github: repo.html_url,
      })),
    [repos, t],
  );

  const faceOn = (next: Face) => ({
    onMouseEnter: () => setFace(next),
    onMouseLeave: () => setFace("smile"),
    onFocus: () => setFace(next),
    onBlur: () => setFace("smile"),
  });

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden pt-24 pb-16">
        {/* Depth: a soft indigo bloom behind the avatar, and a giant
            ghost monogram behind the name. Both are pure CSS/type, not
            decorative SVG, and both sit behind the content via -z-10. */}
        <div
          aria-hidden
          className="bg-brand/25 motion-safe:animate-drift pointer-events-none absolute top-1/2 right-0 -z-10 size-[36rem] translate-x-1/3 -translate-y-1/2 rounded-full blur-[130px]"
        />
        <span
          aria-hidden
          className="text-foreground/[0.035] pointer-events-none absolute -top-[6vw] -right-[4vw] -z-10 text-[46vw] leading-none font-bold tracking-tighter select-none sm:text-[32rem]"
        >
          AA
        </span>

        <div className="shell relative">
          <motion.p
            className="text-muted-foreground mb-8 font-mono text-xs tracking-[0.14em] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            {t.hero.role}
          </motion.p>

          <div className="flex flex-col-reverse gap-10 md:flex-row md:items-end md:justify-between">
            <h1
              aria-label={`${t.hero.greeting} Alexandre Arabian`}
              className="text-[clamp(3.25rem,11vw,8.5rem)] leading-[0.88] font-semibold tracking-[-0.055em]"
            >
              <motion.span
                aria-hidden
                className="text-muted-foreground mb-4 block text-[max(1.125rem,0.26em)] leading-none font-normal tracking-[-0.02em]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
              >
                {t.hero.greeting}
              </motion.span>
              <RevealText text="Alexandre" delay={0.35} />
              <RevealText text="Arabian" delay={0.6}>
                <motion.span
                  className="text-brand inline-block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, ease: EASE, delay: 0.9 }}
                >
                  .
                </motion.span>
              </RevealText>
            </h1>

            <motion.div
              className="relative mx-auto size-32 shrink-0 sm:size-44 md:mx-0 md:mb-5 md:size-52"
              initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: -4 }}
              whileHover={{ rotate: 0, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 140, damping: 14 }}
              aria-hidden
            >
              <div className="bg-foreground/[0.04] ring-foreground/8 absolute inset-0 rounded-[32%] p-2 shadow-[0_32px_70px_-26px_color-mix(in_oklch,var(--brand)_55%,transparent)] ring-1">
                <div className="bg-card size-full rounded-[26%] shadow-[inset_0_1px_0_var(--highlight)]" />
              </div>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={face}
                  className="absolute inset-0 p-2.5"
                  initial={{ opacity: 0, scale: 0.6, rotate: -14 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.6, rotate: 14 }}
                  transition={{ type: "spring", stiffness: 500, damping: 26 }}
                >
                  <Image
                    src={`/${face}.png`}
                    alt=""
                    fill
                    sizes="208px"
                    priority={face === "smile"}
                    className="object-contain"
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12 md:items-end">
            <FadeIn delay={0.9} className="md:col-span-6">
              <p className="text-muted-foreground max-w-[46ch] text-lg leading-relaxed sm:text-xl">
                {t.hero.description}
              </p>
            </FadeIn>

            <FadeIn
              delay={1.05}
              className="flex flex-wrap items-center gap-3 md:col-span-6 md:justify-end"
            >
              <a
                href="#contact"
                {...faceOn("thumbsup")}
                className="group bg-brand text-brand-foreground inline-flex h-12 items-center gap-3 rounded-full pr-2 pl-6 text-sm font-medium transition-all duration-300 hover:shadow-[0_14px_36px_-14px_color-mix(in_oklch,var(--brand)_65%,transparent)] active:scale-[0.97]"
              >
                {t.hero.contactButton}
                <span className="bg-brand-foreground/15 grid size-8 place-items-center rounded-full transition-transform duration-500 group-hover:translate-y-0.5">
                  <ArrowDown className="size-4" />
                </span>
              </a>
              <a
                href={language === "es" ? "/spanish-cv.pdf" : "/english-cv.pdf"}
                download={
                  language === "es"
                    ? "Alexandre_Arabian_CV_ES.pdf"
                    : "Alexandre_Arabian_CV_EN.pdf"
                }
                className="group bg-card/80 hover:border-foreground/25 inline-flex h-12 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-all duration-300 active:scale-[0.97]"
              >
                <Download className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                {t.hero.downloadCvButton}
              </a>
              <a
                href="#projects"
                {...faceOn("amazed")}
                className="text-muted-foreground hover:text-foreground px-3 text-sm font-medium underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current"
              >
                {t.hero.viewWorkButton}
              </a>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* About — cool silver, not a blue field */}
      <section id="about" className="bg-surface border-border/80 border-y">
        <div className="shell py-24 md:py-32">
          <SectionHeading>{t.about.title}</SectionHeading>
          <div className="grid gap-10 lg:grid-cols-12">
            <FadeIn className="space-y-6 lg:col-span-8">
              <p className="text-2xl leading-snug font-medium tracking-[-0.02em] sm:text-3xl">
                {t.about.paragraph1}
              </p>
              <p className="text-muted-foreground max-w-[60ch] text-lg leading-relaxed">
                {t.about.paragraph2}
              </p>
            </FadeIn>
          </div>

          <FadeIn
            delay={0.15}
            className="mt-16 grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-5"
          >
            {skillGroups.map((group) => (
              <Frame key={group.key}>
                <GroupLabel>{group.label}</GroupLabel>
                <ul className="space-y-2.5 font-mono text-sm">
                  {group.items.map((skill) => (
                    <li
                      key={skill}
                      className="group hover:text-brand flex items-center gap-2.5 transition-colors"
                    >
                      <span className="bg-border group-hover:bg-brand size-1 shrink-0 rounded-full transition-colors" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </Frame>
            ))}

            <Frame>
              <GroupLabel>{t.languagesSpoken.title}</GroupLabel>
              <ul className="space-y-2.5 text-sm">
                {t.languagesSpoken.items.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-baseline justify-between gap-3"
                  >
                    <span>{item.name}</span>
                    <span className="text-muted-foreground font-mono text-xs">
                      {t.languagesSpoken.levels[item.level]}
                    </span>
                  </li>
                ))}
              </ul>
            </Frame>
          </FadeIn>
        </div>
      </section>

      {/* Experience — the one deliberate dark beat in the page, so
          scrolling reads light / silver / dark / silver / indigo / light
          instead of staying flat. Overriding the theme tokens here (via
          inline custom properties) means every bg-surface/text-muted-foreground/
          border utility already in this subtree just repaints correctly,
          no per-element color classes needed. */}
      <section
        id="experience"
        style={
          {
            "--background": "oklch(0.16 0.032 278)",
            "--surface": "oklch(1 0 0 / 5%)",
            "--border": "oklch(1 0 0 / 12%)",
            "--muted-foreground": "oklch(0.7 0.02 278)",
            "--foreground": "oklch(0.97 0.006 278)",
            "--card": "oklch(0.2 0.035 278)",
            "--highlight": "oklch(1 0 0 / 0.07)",
          } as React.CSSProperties
        }
        className="bg-background border-y text-white"
      >
        <div className="shell py-24 md:py-32">
          <SectionHeading>{t.experience.title}</SectionHeading>
          <ol className="relative space-y-12 pl-12 sm:pl-14">
            <span
              aria-hidden
              className="from-brand absolute inset-y-0 left-0 w-px bg-gradient-to-b via-white/15 to-transparent"
            />
            {t.experience.roles.map((item, i) => (
              <motion.li
                key={item.company + item.period}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.7,
                  ease: EASE,
                  delay: Math.min(i, 4) * 0.08,
                }}
              >
                <span className="bg-brand text-brand-foreground absolute -top-0.5 -left-[3.25rem] grid size-8 place-items-center rounded-full font-mono text-[11px] font-semibold ring-4 ring-[oklch(0.16_0.032_278)] sm:-left-[3.75rem]">
                  {initials(item.company)}
                </span>
                <div className="flex flex-col gap-x-4 gap-y-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <h3 className="text-lg font-semibold tracking-[-0.01em] sm:text-xl">
                    {item.role}
                  </h3>
                  <span className="text-muted-foreground shrink-0 font-mono text-xs">
                    {item.period}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-[oklch(0.78_0.13_278)]">
                  {item.company}
                </p>
                <p className="text-muted-foreground mt-3 max-w-[62ch] text-sm leading-relaxed sm:text-base">
                  {item.description}
                </p>
              </motion.li>
            ))}
          </ol>

          <FadeIn delay={0.1} className="mt-16 border-t pt-12">
            <h3 className="mb-6 text-sm font-semibold">
              {t.experience.education.title}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {t.experience.education.items.map((item) => (
                <Frame key={item.school}>
                  <p className="font-medium">{item.degree}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {item.school}
                  </p>
                  <p className="text-muted-foreground mt-2 font-mono text-xs">
                    {item.period}
                  </p>
                </Frame>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Projects — same silver as About, so the page alternates paper / silver */}
      <section id="projects" className="bg-surface border-border/80 border-y">
        <div className="shell py-24 md:py-32">
          <SectionHeading>{t.projects.title}</SectionHeading>
          <ul className="border-b">
            {projects.map((project, i) => (
              <motion.li
                key={project.key}
                className="group hover:bg-background/70 relative grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-4 gap-y-2 border-t px-2 py-7 transition-colors duration-500 md:grid-cols-[3rem_minmax(0,16rem)_1fr_auto] md:gap-x-8 md:px-3"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.7,
                  ease: EASE,
                  delay: Math.min(i, 6) * 0.05,
                }}
              >
                <span
                  aria-hidden
                  className="bg-brand ease-out-expo absolute inset-x-0 -top-px h-px origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
                />
                <span
                  aria-hidden
                  className="border-border bg-card text-muted-foreground group-hover:border-brand/40 group-hover:text-brand grid size-8 shrink-0 place-items-center rounded-full border font-mono text-[11px] transition-colors md:size-9"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="ease-out-expo truncate text-xl font-medium tracking-[-0.02em] transition-transform duration-500 group-hover:translate-x-1 sm:text-2xl">
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="after:absolute after:inset-0"
                  >
                    {project.name}
                  </a>
                </h3>
                <p className="text-muted-foreground col-start-2 line-clamp-2 max-w-[56ch] text-sm leading-relaxed sm:text-base md:col-start-3 md:row-start-1">
                  {project.description}
                </p>
                <div className="col-start-3 row-start-1 flex items-center gap-2 self-center md:col-start-4">
                  {project.tag && (
                    <span className="border-brand/20 bg-brand/8 text-brand mr-1 hidden items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] sm:inline-flex">
                      <span className="bg-brand size-1 rounded-full" />
                      {project.tag}
                    </span>
                  )}
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.name} - ${t.projects.githubButton}`}
                    title={t.projects.githubButton}
                    className="text-muted-foreground hover:text-brand hover:bg-brand/10 relative z-10 grid size-9 place-items-center rounded-full transition-colors"
                  >
                    <Github className="size-4" />
                  </a>
                  {project.site && (
                    <a
                      href={project.site}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${project.name} - ${t.projects.viewProjectButton}`}
                      title={t.projects.viewProjectButton}
                      className="group-hover:bg-brand group-hover:text-brand-foreground hover:bg-brand hover:text-brand-foreground relative z-10 grid size-9 place-items-center rounded-full border transition-colors duration-500"
                    >
                      <Globe className="size-4" />
                    </a>
                  )}
                </div>
              </motion.li>
            ))}
          </ul>
          {projects.length === 0 && (
            <p className="text-muted-foreground mt-8 font-mono text-sm">
              {t.projects.noRepos}
            </p>
          )}
        </div>
      </section>

      {/* Spotlight — the page's one real color fill, a beat of rest
          before the closing pitch, not another card or list. */}
      <section className="bg-brand">
        <FadeIn className="shell py-20 text-center md:py-28">
          <p className="text-brand-foreground text-2xl leading-snug font-semibold tracking-[-0.02em] sm:text-4xl">
            {t.spotlight.line}
          </p>
        </FadeIn>
      </section>

      {/* Contact — paper again; the address is the color */}
      <section id="contact">
        <div className="shell py-24 md:py-40">
          <SectionHeading>{t.contact.title}</SectionHeading>
          <FadeIn>
            <p className="text-muted-foreground max-w-[52ch] text-lg leading-relaxed sm:text-xl">
              {t.contact.description}
            </p>
          </FadeIn>
          <FadeIn delay={0.1} className="mt-12">
            <p className="text-muted-foreground mb-3 font-mono text-xs tracking-[0.14em] uppercase">
              {t.contact.emailButton}
            </p>
            <a
              href={`mailto:${EMAIL}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleEmailClick}
              className="group inline-flex items-center gap-3 text-[clamp(1.35rem,5.2vw,3.5rem)] leading-none font-semibold tracking-[-0.03em] [overflow-wrap:anywhere]"
            >
              <span
                className={cn(
                  "bg-[linear-gradient(var(--brand),var(--brand))] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-2",
                  "group-hover:text-brand ease-out-expo transition-[background-size,color] duration-700 group-hover:bg-[length:100%_2px]",
                )}
              >
                {EMAIL.split("@")[0]}
                <wbr />@{EMAIL.split("@")[1]}
              </span>
              <ArrowUpRight className="text-brand ease-out-expo size-[0.7em] shrink-0 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </FadeIn>

          <FadeIn
            delay={0.2}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card hover:border-foreground/25 inline-flex h-12 items-center gap-3 rounded-full border px-5 text-sm font-medium transition-all duration-300 active:scale-[0.97]"
            >
              <Linkedin className="text-brand size-4" />
              {t.contact.linkedinButton}
              <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </FadeIn>

          <FadeIn delay={0.28} className="text-muted-foreground mt-8 text-sm">
            {t.contact.location} ·{" "}
            <a
              href={`tel:${PHONE.replace(/\s/g, "")}`}
              className="hover:text-brand underline underline-offset-4"
            >
              {PHONE}
            </a>
          </FadeIn>
        </div>
      </section>

      {/* Toast: confirms the address was copied to the clipboard */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4"
      >
        <AnimatePresence>
          {emailCopied && (
            <motion.p
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="bg-foreground text-background flex items-center gap-2 rounded-full py-2.5 pr-5 pl-3 text-sm font-medium shadow-[0_12px_40px_-16px_color-mix(in_oklch,var(--foreground)_45%,transparent)]"
            >
              <span className="bg-brand grid size-5 place-items-center rounded-full">
                <Check
                  className="text-brand-foreground size-3"
                  strokeWidth={3}
                />
              </span>
              {t.contact.emailCopied}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
