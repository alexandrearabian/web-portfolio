"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useLanguage } from "~/contexts/LanguageContext";
import { ChessPiece } from "~/components/chess-piece";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <section className="shell flex min-h-[100svh] flex-col items-center justify-center pt-24 pb-16 text-center">
      {/* The king tips over, and freezes halfway: no legal move left. */}
      <motion.div
        aria-hidden
        className="mb-12 origin-[70%_100%]"
        initial={{ rotate: 0 }}
        animate={{ rotate: -38 }}
        transition={{ type: "spring", stiffness: 120, damping: 9, delay: 0.4 }}
      >
        <ChessPiece type="king" className="size-36 sm:size-44" />
      </motion.div>
      <p className="text-muted-foreground font-mono text-sm">
        {t.notFound.eyebrow}
      </p>
      <h1 className="font-display mt-3 text-6xl sm:text-8xl">
        {t.notFound.title}
      </h1>
      <p className="text-muted-foreground mt-5 max-w-[40ch] text-lg">
        {t.notFound.description}
      </p>
      <Link
        href="/"
        className="bg-foreground text-background hover:bg-accent mt-10 inline-flex h-12 items-center rounded-full px-6 text-sm font-medium transition-colors duration-300"
      >
        {t.notFound.backHome}
      </Link>
    </section>
  );
}
