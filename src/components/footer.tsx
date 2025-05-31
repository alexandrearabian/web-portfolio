"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <motion.footer
      className="bg-background/95 relative z-50 border-t backdrop-blur-sm"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto px-4 py-12 sm:px-6 md:px-8">
        <motion.div
          className="flex flex-col items-center space-y-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Social Links */}
          <div className="flex justify-center space-x-6 sm:space-x-8">
            <motion.div
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href="mailto:a.arabian.j@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 transition-colors duration-200 hover:text-purple-600"
                aria-label="Send email"
              >
                <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href="https://github.com/alexandrearabian"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 transition-colors duration-200 hover:text-purple-600"
                aria-label="GitHub profile"
              >
                <Github className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href="https://www.linkedin.com/in/alexandre-arabian-jensezian/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 transition-colors duration-200 hover:text-purple-600"
                aria-label="LinkedIn profile"
              >
                <Linkedin className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
            </motion.div>
            {/*
            <motion.div
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                href="https://twitter.com/alxarabian"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/70 transition-colors duration-200 hover:text-purple-600"
                aria-label="Twitter profile"
              >
                <Twitter className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
            </motion.div> */}
          </div>

          {/* Copyright */}
          <motion.p
            className="text-muted-foreground font-inter text-xs sm:text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            © 2024 {t.footer.copyright} All rights reserved.
          </motion.p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
