"use client";

import Image from "next/image";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Download,
  Github,
  Linkedin,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import { useLanguage } from "~/contexts/LanguageContext";
import { cn } from "~/lib/utils";
import type { Repo } from "./actions/getRepos";

const EASE = [0.16, 1, 0.3, 1] as const;
const EMAIL = "a.arabian.j@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/alexandre-arabian-jensezian/";
const EXCLUDED_REPOS = new Set(["witr"]);
const SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "JavaScript",
  "CSS",
  "HTML",
  "Python",
  "Java",
  "C",
  "C#",
  "MySQL",
  "Git",
];

type Face = "smile" | "thumbsup" | "amazed";

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
    <span className="block overflow-hidden pb-[0.06em]" aria-hidden>
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

function SectionHeading({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}) {
  return (
    <FadeIn className="mb-12 flex items-baseline gap-4 md:mb-16">
      <span className="text-brand font-mono text-sm">{index}</span>
      <h2 className="text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
        {children}
      </h2>
      <span className="bg-border h-px flex-1 self-center" />
    </FadeIn>
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

  const projects = useMemo(
    () => [
      {
        key: "globalthy",
        name: "Globalthy",
        description: "Globalthy app – productized web experience.",
        tag: "Web App",
        href: "https://app.globalthy.com",
        github: null,
      },
      ...repos
        .filter((repo) => !repo.private && !EXCLUDED_REPOS.has(repo.name))
        .map((repo) => ({
          key: repo.id,
          name: repo.name,
          description: repo.description ?? t.projects.noDescription,
          tag: repo.language,
          href: repo.homepage ? repo.homepage : repo.html_url,
          github: repo.homepage ? repo.html_url : null,
        })),
    ],
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
      <section className="shell flex min-h-[100dvh] flex-col justify-center pt-28 pb-16">
        <motion.p
          className="text-muted-foreground mb-8 flex items-center gap-2.5 font-mono text-xs tracking-[0.14em] uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <span className="relative flex size-2">
            <span className="bg-brand absolute inset-0 rounded-full opacity-60 motion-safe:animate-ping" />
            <span className="bg-brand relative size-2 rounded-full" />
          </span>
          {t.hero.role}
        </motion.p>

        <div className="flex flex-col-reverse gap-10 md:flex-row md:items-end md:justify-between">
          <h1
            aria-label={`${t.hero.greeting} Alexandre Arabian`}
            className="text-[clamp(3.25rem,12vw,9.5rem)] leading-[0.88] font-semibold tracking-[-0.055em]"
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
            className="relative mx-auto size-28 shrink-0 sm:size-36 md:mx-0 md:mb-5"
            initial={{ opacity: 0, scale: 0.7, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: -4 }}
            whileHover={{ rotate: 0, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 140, damping: 14 }}
            aria-hidden
          >
            <div className="bg-card absolute inset-0 rounded-[32%] border shadow-[0_24px_60px_-24px_color-mix(in_oklch,var(--brand)_55%,transparent)]" />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={face}
                className="absolute inset-0 p-2"
                initial={{ opacity: 0, scale: 0.6, rotate: -14 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 14 }}
                transition={{ type: "spring", stiffness: 500, damping: 26 }}
              >
                <Image
                  src={`/${face}.png`}
                  alt=""
                  fill
                  sizes="144px"
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
              className="group bg-foreground text-background inline-flex h-12 items-center gap-3 rounded-full pr-2 pl-6 text-sm font-medium transition-all duration-300 hover:shadow-[0_12px_32px_-12px_color-mix(in_oklch,var(--brand)_70%,transparent)] active:scale-[0.97]"
            >
              {t.hero.contactButton}
              <span className="bg-background/15 grid size-8 place-items-center rounded-full transition-transform duration-500 group-hover:translate-y-0.5">
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
              className="group hover:border-foreground/40 hover:bg-foreground/[0.03] inline-flex h-12 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-all duration-300 active:scale-[0.97]"
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
      </section>

      {/* About */}
      <section id="about" className="shell py-24 md:py-32">
        <SectionHeading index="01">{t.about.title}</SectionHeading>
        <div className="grid gap-14 md:grid-cols-12">
          <FadeIn className="space-y-6 md:col-span-7">
            <p className="text-2xl leading-snug font-medium tracking-[-0.02em] sm:text-3xl">
              {t.about.paragraph1}
            </p>
            <p className="text-muted-foreground max-w-[60ch] text-lg leading-relaxed">
              {t.about.paragraph2}
            </p>
            <p className="text-muted-foreground max-w-[60ch] text-lg leading-relaxed">
              {t.about.paragraph3}
            </p>
          </FadeIn>
          <FadeIn delay={0.15} className="md:col-span-4 md:col-start-9">
            <h3 className="text-muted-foreground mb-4 font-mono text-xs tracking-[0.14em] uppercase">
              {t.about.skillsTitle}
            </h3>
            <ul className="grid grid-cols-2 gap-x-6 font-mono text-sm">
              {SKILLS.map((skill) => (
                <li
                  key={skill}
                  className="group hover:text-brand flex items-center gap-2.5 border-t py-2.5 transition-colors"
                >
                  <span className="bg-border group-hover:bg-brand size-1 rounded-full transition-colors" />
                  {skill}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="shell py-24 md:py-32">
        <SectionHeading index="02">{t.projects.title}</SectionHeading>
        <ul className="border-b">
          {projects.map((project, i) => (
            <motion.li
              key={project.key}
              className="group relative grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-4 gap-y-2 border-t py-7 md:grid-cols-[3rem_minmax(0,16rem)_1fr_auto] md:gap-x-8"
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
              <span className="text-muted-foreground group-hover:text-brand font-mono text-xs transition-colors">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="ease-out-expo truncate text-xl font-medium tracking-[-0.02em] transition-transform duration-500 group-hover:translate-x-1 sm:text-2xl">
                {/* Stretched link: the whole row is clickable */}
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
                  <span className="text-muted-foreground mr-2 hidden font-mono text-xs sm:inline">
                    {project.tag}
                  </span>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${project.name} — ${t.projects.githubButton}`}
                    className="text-muted-foreground hover:text-foreground hover:bg-foreground/5 relative z-10 grid size-9 place-items-center rounded-full transition-colors"
                  >
                    <Github className="size-4" />
                  </a>
                )}
                <span
                  aria-hidden
                  className="group-hover:bg-foreground group-hover:text-background ease-out-expo grid size-9 place-items-center rounded-full border transition-all duration-500 group-hover:rotate-45"
                >
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
        {projects.length === 1 && (
          <p className="text-muted-foreground mt-8 font-mono text-sm">
            {t.projects.noRepos}
          </p>
        )}
      </section>

      {/* Contact */}
      <section id="contact" className="shell py-24 md:py-40">
        <SectionHeading index="03">{t.contact.title}</SectionHeading>
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
            onClick={handleEmailClick}
            className="group inline-flex items-center gap-3 text-[clamp(1.5rem,7vw,4.75rem)] leading-none font-semibold tracking-[-0.04em] [overflow-wrap:anywhere]"
          >
            <span
              className={cn(
                "bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-2",
                "group-hover:text-brand ease-out-expo transition-[background-size,color] duration-700 group-hover:bg-[length:100%_2px]",
              )}
            >
              {EMAIL}
            </span>
            <ArrowUpRight className="text-brand ease-out-expo size-[0.7em] shrink-0 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </FadeIn>

        <FadeIn delay={0.2} className="mt-10">
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group hover:border-brand/50 hover:bg-brand/5 inline-flex h-12 items-center gap-3 rounded-full border px-5 text-sm font-medium transition-all duration-300 active:scale-[0.97]"
          >
            <Linkedin className="text-brand size-4" />
            {t.contact.linkedinButton}
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </FadeIn>
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
              className="bg-foreground text-background flex items-center gap-2 rounded-full py-2.5 pr-5 pl-3 text-sm font-medium shadow-lg"
            >
              <span className="bg-brand grid size-5 place-items-center rounded-full">
                <Check className="text-background size-3" strokeWidth={3} />
              </span>
              {t.contact.emailCopied}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
