"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "~/contexts/LanguageContext";
import { cn } from "~/lib/utils";
import { ChessPiece } from "./chess-piece";

const STEPS = 6; // e2 → e8
const CELEBRATE = 800; // ms the new queen celebrates on e8 before flying off
const FLY = 560; // ms for the flight from e8 to the heading
const RANKS = [1, 2, 3, 4, 5, 6, 7, 8];

type Box = { x: number; y: number; w: number; h: number };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Where a piece sits inside a square: centred, sized to the square's
// short side (squares stretch on mobile).
function boxIn(square: HTMLElement): Box {
  const r = square.getBoundingClientRect();
  const s = Math.min(r.width, r.height);
  return {
    x: r.left + (r.width - s) / 2,
    y: r.top + (r.height - s) / 2,
    w: s,
    h: s,
  };
}

// The run: from the first section reaching the top of the screen to the
// last section's top reaching ~60% down the screen, i.e. its heading
// coming into view (or the bottom of the page, if it can't get that far).
function run(startId: string, finalId: string) {
  const max = document.documentElement.scrollHeight - innerHeight;
  const start = document.getElementById(startId)?.offsetTop ?? 0;
  const final = document.getElementById(finalId);
  const end = final ? Math.min(max, final.offsetTop - innerHeight * 0.62) : max;
  return { start, length: Math.max(1, end - start) };
}

/*
  Reading progress as a pawn's run along the e-file: across the top on
  mobile (under the navbar), down the right edge on desktop. It steps a
  square per sixth of the way from the first section to the last, with the square ahead
  filling as you approach it, and promotes once that section reaches the
  middle of the screen. Frame-by-frame work writes to the DOM directly;
  React only re-renders when the pawn lands on a new square. Hidden while
  the board covers the page.
*/
export function PawnRail({
  hidden,
  startId,
  finalId,
}: {
  hidden: boolean;
  startId: string;
  finalId: string;
}) {
  const { t } = useLanguage();
  const railRef = useRef<HTMLElement>(null);
  const pieceRef = useRef<HTMLDivElement>(null);
  const squareRefs = useRef<(HTMLElement | null)[]>([]);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [rank, setRank] = useState(2);
  const [percent, setPercent] = useState(0);
  const promoted = rank === 8;

  useEffect(() => {
    const piece = pieceRef.current;
    const rail = railRef.current;
    if (!piece || !rail) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let current: Box | null = null;
    let landed = false;
    let flight: { from: Box; at: number } | null = null;
    let promotedAt = 0;
    let timer = 0;
    let raf = 0;
    let shownRank = 2;
    let shownPercent = 0;

    const frame = () => {
      raf = 0;
      const { start, length } = run(startId, finalId);
      const read = Math.min(1, Math.max(0, (scrollY - start) / length));
      const steps =
        read >= 1 ? STEPS : Math.min(STEPS - 1, Math.floor(read * STEPS));
      const onRank = 2 + steps;

      const railRect = rail.getBoundingClientRect();
      const vertical = railRect.height > railRect.width;
      const loading = steps >= STEPS ? 0 : read * STEPS - steps;
      fillRefs.current.forEach((fill, i) => {
        if (!fill) return;
        const amount = i + 1 === onRank + 1 ? loading : 0;
        // Tailwind's scale-* utilities use the `scale` property, so write
        // that (a `transform` would multiply with it and stay at zero).
        fill.style.scale = vertical ? `1 ${amount}` : `${amount} 1`;
      });

      const square = squareRefs.current[onRank - 1];
      if (!square) return;
      // The queen beside the last heading *is* this queen: that heading
      // leaves an empty slot for it. On promotion the queen celebrates on
      // e8, then makes one timed flight (a short arc, eased) into the
      // slot. There the heading's own queen takes over and plays the
      // landing, so nothing has to chase the heading as it scrolls.
      const seat = document.querySelector<SVGElement>(`#${finalId} h2 svg`);
      const now = performance.now();
      if (onRank !== 8) {
        if (landed && seat) {
          // Demoted again: leave the slot, starting from where it was.
          const r = seat.getBoundingClientRect();
          current = { x: r.left, y: r.top, w: r.width, h: r.height };
          seat.style.visibility = "";
        }
        promotedAt = 0;
        flight = null;
        landed = false;
      } else if (!promotedAt) {
        promotedAt = now;
        timer = window.setTimeout(schedule, CELEBRATE);
      }

      let settled = true;
      if (landed) {
        // The heading's queen is showing; this one stays hidden.
      } else if (seat && promotedAt && now - promotedAt >= CELEBRATE) {
        flight ??= { from: current ?? boxIn(square), at: now };
        const p = reduce.matches ? 1 : Math.min(1, (now - flight.at) / FLY);
        const e = p < 0.5 ? 4 * p * p * p : 1 - (-2 * p + 2) ** 3 / 2;
        const r = seat.getBoundingClientRect();
        current = {
          x: lerp(flight.from.x, r.left, e),
          y: lerp(flight.from.y, r.top, e) - Math.sin(Math.PI * p) * 80,
          w: lerp(flight.from.w, r.width, e),
          h: lerp(flight.from.h, r.height, e),
        };
        settled = p >= 1;
        if (settled) {
          landed = true;
          seat.style.visibility = "visible";
          if (!reduce.matches)
            seat.animate(
              [
                { transform: "translateY(-10%) scale(1.06, 0.94)" },
                { transform: "translateY(2%) scale(1.04, 0.95)", offset: 0.4 },
                { transform: "translateY(-2%) scale(0.99, 1.02)", offset: 0.7 },
                { transform: "none" },
              ],
              { duration: 420, easing: "ease-out" },
            );
        }
      } else {
        const target = boxIn(square);
        if (!current || reduce.matches) {
          current = target;
        } else {
          // Glide to the new square instead of teleporting.
          current = {
            x: lerp(current.x, target.x, 0.2),
            y: lerp(current.y, target.y, 0.2),
            w: lerp(current.w, target.w, 0.2),
            h: lerp(current.h, target.h, 0.2),
          };
          settled =
            Math.abs(current.x - target.x) < 0.3 &&
            Math.abs(current.y - target.y) < 0.3 &&
            Math.abs(current.w - target.w) < 0.3;
          if (settled) current = target;
        }
      }

      if (current) {
        piece.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
        piece.style.width = `${current.w}px`;
        piece.style.height = `${current.h}px`;
      }
      piece.style.opacity = landed ? "0" : "1";

      if (onRank !== shownRank) setRank((shownRank = onRank));
      const pct = Math.round(read * 100);
      if (pct !== shownPercent) setPercent((shownPercent = pct));
      if (!settled) raf = requestAnimationFrame(frame);
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    schedule();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    // Page height changes (language switch, expanded rows, late images)
    // move every square's threshold, so re-measure.
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      ro.disconnect();
      clearTimeout(timer);
      document
        .querySelector<SVGElement>(`#${finalId} h2 svg`)
        ?.style.removeProperty("visibility");
    };
  }, [startId, finalId]);

  const jump = (toRank: number) => {
    const { start, length } = run(startId, finalId);
    scrollTo({
      top: start + ((toRank - 2) / STEPS) * length,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <div
      className={cn(
        "transition-opacity duration-500",
        hidden && "invisible opacity-0",
      )}
    >
      <nav
        ref={railRef}
        aria-label={t.rail.label}
        className="border-board-rim fixed inset-x-0 top-14 z-40 flex h-6 border-b-2 lg:inset-x-auto lg:top-1/2 lg:right-3 lg:h-auto lg:w-8 lg:-translate-y-1/2 lg:flex-col lg:border-2"
      >
        <div
          role="progressbar"
          aria-label={t.rail.label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="sr-only"
        />
        {RANKS.map((r) => {
          // On the e-file, odd ranks are dark squares.
          const cls = cn(
            "relative flex-1 overflow-hidden transition-[background-color,box-shadow] duration-500 lg:size-7 lg:flex-none",
            r % 2 === 1 ? "bg-[var(--rail-dark)]" : "bg-[var(--rail-light)]",
            r === 8 &&
              promoted &&
              "bg-brass shadow-[0_0_0_2px_var(--brass),0_0_22px_2px_var(--brass)]",
          );
          const fill = (
            <span
              ref={(el) => {
                fillRefs.current[r - 1] = el;
              }}
              aria-hidden
              className="bg-brass/20 absolute inset-0 origin-left scale-0 lg:origin-top"
            />
          );
          return r === 1 ? (
            <div
              key={r}
              ref={(el) => {
                squareRefs.current[0] = el;
              }}
              className={cls}
            />
          ) : (
            <button
              key={r}
              ref={(el) => {
                squareRefs.current[r - 1] = el;
              }}
              type="button"
              onClick={() => jump(r)}
              aria-label={`${t.rail.jump} e${r}`}
              aria-current={r === rank ? "step" : undefined}
              className={cn(cls, "hover:brightness-95")}
            >
              {fill}
            </button>
          );
        })}
      </nav>

      {/* A black piece, as in the cburnett set. */}
      <div
        ref={pieceRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-40 text-[var(--piece-black)] opacity-0 will-change-transform [--piece-detail:#ececec]"
      >
        <ChessPiece
          key={promoted ? "queen" : "pawn"}
          type={promoted ? "queen" : "pawn"}
          className={cn("relative size-full", promoted && "animate-jiggle")}
        />
      </div>
    </div>
  );
}
