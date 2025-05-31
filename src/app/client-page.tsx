"use client";

import Link from "next/link";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { useState } from "react";
import { useLanguage } from "~/contexts/LanguageContext";
import type { Repo } from "./actions/getRepos";

export default function HomePage({ repos }: { repos: Repo[] }) {
  const { t, language } = useLanguage();
  const [focusThumbs, setFocusThumbs] = useState(false);
  const [focusAmazed, setFocusAmazed] = useState(false);

  // Split the name into letters for animation
  const nameText = "Alexandre Arabian";
  const letters = nameText.split("");

  return (
    <div className="bg-background relative mt-16 min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#8841fc2e_2px,transparent_2px),linear-gradient(to_bottom,#8841fc2e_2px,transparent_2px)] bg-[size:24px_24px]"></div>
      <div className="from-background via-background/20 to-background pointer-events-none fixed inset-0 bg-gradient-to-b"></div>

      {/* Hero Section */}
      <motion.section
        className="relative container mx-auto px-4 py-16 sm:px-6 md:px-8 md:py-20"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="bg-background/70 relative m-auto mb-6 flex h-[120px] w-[120px] items-center justify-center rounded-full border border-purple-600 sm:mb-8 sm:h-[140px] sm:w-[140px]"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {focusThumbs && (
              <motion.div
                key="thumbs"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
                transition={{ duration: 0.1, ease: "easeInOut" }}
              >
                <Image
                  src="/thumbsup.png"
                  alt="Thumbs up"
                  width={140}
                  height={140}
                  className="h-[120px] w-[120px] sm:h-[140px] sm:w-[140px]"
                />
              </motion.div>
            )}
            {focusAmazed && (
              <motion.div
                key="amazed"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotate: -10 }}
                transition={{ duration: 0.1, ease: "easeInOut" }}
              >
                <Image
                  src="/amazed.png"
                  alt="Amazed"
                  width={140}
                  height={140}
                  className="h-[120px] w-[120px] sm:h-[140px] sm:w-[140px]"
                />
              </motion.div>
            )}
            {!focusThumbs && !focusAmazed && (
              <motion.div
                key="smile"
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1, ease: "easeInOut" }}
              >
                <Image
                  src="/smile.png"
                  alt="Smile"
                  width={140}
                  height={140}
                  className="h-[120px] w-[120px] sm:h-[140px] sm:w-[140px]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        <div className="flex flex-col items-center justify-center space-y-8 text-center sm:space-y-12">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h1 className="text-foreground font-space bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-5xl leading-none font-bold tracking-tight sm:text-6xl sm:leading-normal md:text-7xl">
              <span className="block sm:inline">{t.hero.greeting}</span>
              <span className="hidden sm:inline">&nbsp;</span>
              <br className="block sm:hidden" />
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                <span className="-mt-6 block sm:mt-0 sm:inline">
                  {"Alexandre".split("").map((letter, index) => (
                    <motion.span
                      key={index}
                      className="inline-block"
                      initial={{
                        opacity: 0,
                        x: -50,
                        y: -20,
                        rotateZ: -15,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        y: 0,
                        rotateZ: 0,
                        textShadow: [
                          "0 0 0px rgba(139, 92, 246, 0)",
                          "0 0 20px rgba(139, 92, 246, 0.5)",
                          "0 0 30px rgba(139, 92, 246, 0.3)",
                        ],
                      }}
                      transition={{
                        duration: 0.8,
                        delay: index * 0.03,
                        ease: [0.175, 0.885, 0.32, 1.275],
                        textShadow: {
                          duration: 1.5,
                          delay: index * 0.03 + 0.5,
                        },
                      }}
                      style={{
                        opacity: 1, // Fallback to ensure visibility
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
                <span className="hidden sm:inline">&nbsp;</span>
                <br className="block sm:hidden" />
                <span className="-mt-8 block sm:mt-0 sm:inline">
                  {"Arabian".split("").map((letter, index) => (
                    <motion.span
                      key={index + 9}
                      className="inline-block"
                      initial={{
                        opacity: 0,
                        x: -50,
                        y: -20,
                        rotateZ: -15,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        y: 0,
                        rotateZ: 0,
                        textShadow: [
                          "0 0 0px rgba(139, 92, 246, 0)",
                          "0 0 20px rgba(139, 92, 246, 0.5)",
                          "0 0 30px rgba(139, 92, 246, 0.3)",
                        ],
                      }}
                      transition={{
                        duration: 0.8,
                        delay: (index + 9) * 0.03,
                        ease: [0.175, 0.885, 0.32, 1.275],
                        textShadow: {
                          duration: 1.5,
                          delay: (index + 9) * 0.03 + 0.5,
                        },
                      }}
                      style={{
                        opacity: 1, // Fallback to ensure visibility
                      }}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </span>
              </span>
            </h1>
            <p className="text-muted-foreground font-inter mx-auto max-w-2xl text-lg leading-relaxed sm:text-xl">
              {t.hero.description}
            </p>
          </motion.div>
          <motion.div
            className="flex flex-col gap-4 sm:flex-row sm:gap-6"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href="#contact"
                className="font-space block rounded-full bg-purple-600 px-6 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-purple-500 sm:px-8 sm:py-4"
                onMouseEnter={() => setFocusThumbs(true)}
                onMouseLeave={() => setFocusThumbs(false)}
                onFocus={() => setFocusThumbs(true)}
                onBlur={() => setFocusThumbs(false)}
              >
                {t.hero.contactButton}
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <a
                href={language === "es" ? "/spanish-cv.pdf" : "/english-cv.pdf"}
                download={
                  language === "es"
                    ? "Alexandre_Arabian_CV_ES.pdf"
                    : "Alexandre_Arabian_CV_EN.pdf"
                }
                className="font-space block rounded-full border border-purple-600 bg-purple-600/10 px-6 py-3 text-center text-base font-semibold transition-colors hover:bg-purple-600/20 sm:px-8 sm:py-4"
              >
                {t.hero.downloadCvButton}
              </a>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href="#projects"
                className="font-space block rounded-full border border-purple-600 px-6 py-3 text-center text-base font-semibold transition-colors hover:bg-purple-600/10 sm:px-8 sm:py-4"
                onMouseEnter={() => setFocusAmazed(true)}
                onMouseLeave={() => setFocusAmazed(false)}
                onFocus={() => setFocusAmazed(true)}
                onBlur={() => setFocusAmazed(false)}
              >
                {t.hero.viewWorkButton}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* About Section */}
      <motion.section
        id="about"
        className="relative container mx-auto px-4 py-16 sm:px-6 md:px-8 md:py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="mx-auto max-w-4xl">
          <motion.h2
            className="font-space mb-12 text-center text-2xl font-bold sm:text-3xl"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t.about.title}
          </motion.h2>
          <div className="grid gap-12 md:grid-cols-2">
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-muted-foreground font-inter text-base leading-relaxed sm:text-lg">
                {t.about.paragraph1}
              </p>
              <p className="text-muted-foreground font-inter text-base leading-relaxed sm:text-lg">
                {t.about.paragraph2}
              </p>
              <p className="text-muted-foreground font-inter text-base leading-relaxed sm:text-lg">
                {t.about.paragraph3}
              </p>
            </motion.div>
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="font-space text-lg font-semibold sm:text-xl">
                {t.about.skillsTitle}
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {[
                  "React",
                  "Next.js",
                  "TypeScript",
                  "Tailwind CSS",
                  "Node.js",
                  "Javascript",
                  "CSS",
                  "HTML",
                  "Python",
                  "Java",
                  "C",
                  "C#",
                  "MySQL",
                  "Git",
                ].map((skill, index) => (
                  <motion.span
                    key={skill}
                    className="rounded-full bg-purple-600/10 px-3 py-1.5 font-mono text-xs text-purple-600 sm:px-4 sm:py-2 sm:text-sm"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.3,
                      delay: 0.6 + index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Projects Section */}
      <motion.section
        id="projects"
        className="relative container mx-auto px-4 py-16 sm:px-6 md:px-8 md:py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className="font-space mb-12 text-center text-2xl font-bold sm:text-3xl"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t.projects.title}
        </motion.h2>
        {repos.length === 0 ? (
          <motion.div
            className="text-muted-foreground text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="font-inter">{t.projects.noRepos}</p>
          </motion.div>
        ) : (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {repos.slice(0, 6).map((repo: Repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                whileHover={{
                  y: -4,
                  transition: { duration: 0.3, ease: "easeOut" },
                }}
              >
                <Card className="group bg-background relative flex h-full flex-col overflow-hidden rounded-lg border shadow-lg transition-colors hover:border-purple-500">
                  <CardHeader className="pb-3">
                    <h3 className="font-space truncate text-base font-semibold sm:text-lg">
                      {repo.name}
                    </h3>
                    <CardDescription className="font-inter line-clamp-3 text-xs sm:text-sm">
                      {repo.description || t.projects.noDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 pb-3">
                    {repo.language && (
                      <span className="inline-block rounded-full bg-purple-600/10 px-2.5 py-1 font-mono text-xs text-purple-600 sm:px-3">
                        {repo.language}
                      </span>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2 pt-3 sm:flex-row sm:gap-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto"
                    >
                      <Link
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-space flex w-full items-center justify-center gap-2 rounded-full border border-purple-600 px-3 py-2 text-xs font-semibold transition-colors hover:bg-purple-600/10 sm:w-auto sm:px-4 sm:text-sm"
                      >
                        <Github className="h-3 w-3 sm:h-4 sm:w-4" />
                        {t.projects.githubButton}
                      </Link>
                    </motion.div>
                    {repo.homepage && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full sm:w-auto"
                      >
                        <Link
                          href={repo.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-space flex w-full items-center justify-center rounded-full bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-purple-500 sm:w-auto sm:px-4 sm:text-sm"
                        >
                          {t.projects.viewProjectButton}
                        </Link>
                      </motion.div>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Contact Section */}
      <motion.section
        id="contact"
        className="relative container mx-auto px-4 py-16 sm:px-6 md:px-8 md:py-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            className="font-space mb-6 text-2xl font-bold sm:mb-8 sm:text-3xl"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {t.contact.title}
          </motion.h2>
          <motion.p
            className="text-muted-foreground font-inter mb-10 text-base leading-relaxed sm:mb-12 sm:text-xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t.contact.description}
          </motion.p>
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href="mailto:a.arabian.j@example.com"
                className="font-space rounded-full bg-purple-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-purple-500 sm:px-8 sm:py-4 sm:text-lg"
              >
                {t.contact.emailButton}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
