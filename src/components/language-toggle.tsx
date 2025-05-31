"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "~/contexts/LanguageContext";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button variant="outline" size="icon">
            <Languages className="h-[1.2rem] w-[1.2rem] transition-all" />
            <span className="sr-only">{t.language.toggle}</span>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage("en")}
          className={
            language === "en" ? "bg-purple-600/10 text-purple-600" : ""
          }
        >
          🇺🇸 {t.language.english}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage("es")}
          className={
            language === "es" ? "bg-purple-600/10 text-purple-600" : ""
          }
        >
          🇪🇸 {t.language.spanish}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
