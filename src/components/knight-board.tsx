"use client";

import { animate } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { cn } from "~/lib/utils";
import { ChessPiece, type PieceType } from "./chess-piece";

export type BoardSection = {
  id: "about" | "experience" | "projects" | "contact";
  piece: PieceType;
  // Which square colour the section sits on. Every section square on the
  // board is dark (a knight from the centre always lands on the other
  // colour), so the square turns light while it grows for "light" ones.
  tone: "dark" | "light";
};

type Spot = { col: number; row: number };
type Point = readonly [number, number];

const CENTRE: Spot = { col: 2, row: 2 };
// A pinwheel of knight moves from the centre, one per side of the board:
// top, right, bottom, left.
const SPOTS: Spot[] = [
  { col: 1, row: 0 },
  { col: 4, row: 1 },
  { col: 3, row: 4 },
  { col: 0, row: 3 },
];
const TILT = 50; // how far the board leans back
// Undoes the board's rotation, so a child stands up facing the viewer.
const FACE_VIEWER = `translateZ(1px) rotateX(-${TILT}deg)`;
// Timeline of a move (0..1): the jump, the knight sinking into the square
// it landed on, then the square growing to fill the screen.
const HOP = 0.38;
const SINK = 0.22;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

// A square's four projected corners (top-left, top-right, bottom-right,
// bottom-left), relative to `box`.
function corners(square: Element, box: DOMRect): Point[] {
  return [...square.querySelectorAll("[data-corner]")].map((c) => {
    const r = c.getBoundingClientRect();
    return [r.left - box.left, r.top - box.top] as const;
  });
}

function Corners() {
  return [
    "top-0 left-0",
    "top-0 right-0",
    "right-0 bottom-0",
    "bottom-0 left-0",
  ].map((at) => <span key={at} data-corner className={cn("absolute", at)} />);
}

/*
  The opening screen: a 5×5 board seen at an angle, a knight in the
  middle and a section on each of four squares it can reach. The screen
  is pinned while you scroll through 60svh of "runway", and the
  scroll position *is* the animation: the knight jumps to About and the
  square grows until it fills the screen as About's background. Stop
  halfway and it stays halfway; scroll up and it plays backwards.
  Clicking a square (or dropping the knight on one) plays the same
  frames over time, then lands on that section. The knight doesn't just
  land: it drops into the square, as if through a trapdoor, and the
  square opens out from there.

  The knight itself is drawn flat, over the board, at the squares'
  projected positions: inside the 3D scene the browser's depth sorting
  would slice it against the squares.
*/
export function KnightBoard({
  sections,
  onBoardChange,
  intro,
  actions,
}: {
  sections: readonly BoardSection[];
  onBoardChange: (onBoard: boolean) => void;
  intro: React.ReactNode;
  actions: React.ReactNode;
}) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(false);
  const [ghost, setGhost] = useState<{ x: number; y: number; size: number }>();
  const [dragOver, setDragOver] = useState(-1);

  const runwayRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const centreRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pieceRef = useRef<HTMLButtonElement>(null);
  const bobRef = useRef<HTMLDivElement>(null);
  const spotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const moveDotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const coverRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const dragFrom = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);

  // Draws the move to section i at progress t (0 = knight in the centre,
  // 1 = square filling the screen). Writes styles directly: it runs on
  // every scroll frame.
  const paint = useCallback(
    (i: number, t: number) => {
      const scene = sceneRef.current;
      const grid = gridRef.current;
      const cover = coverRef.current;
      const target = spotRefs.current[i];
      if (!scene || !grid || !cover || !target || !centreRef.current) return;
      const sq = grid.offsetWidth / 5;
      const spot = SPOTS[i]!;
      const hop = clamp(t / HOP);
      const sink = clamp((t - HOP) / SINK) ** 2;
      const grow = clamp((t - HOP - SINK) / (1 - HOP - SINK));
      const k = easeInOut(hop);
      const arc = Math.sin(Math.PI * hop);

      // The dot under the knight slides along the board, shrinking while
      // the knight is in the air.
      const dot = dotRef.current!;
      dot.style.transform = `translate3d(${(spot.col - CENTRE.col) * sq * k}px, ${
        (spot.row - CENTRE.row) * sq * k
      }px, 0) scale(${(1 - arc * 0.6) * (1 - sink)})`;

      // The knight: its foot follows the projected square centres, its
      // size the projected square width, and it arcs up mid-jump.
      const box = scene.getBoundingClientRect();
      const from = corners(centreRef.current, box);
      const to = corners(target, box);
      const mid = (q: Point[], axis: 0 | 1) =>
        q.reduce((sum, p) => sum + p[axis], 0) / q.length;
      // Mean of the square's far and near edges.
      const width = (q: Point[]) =>
        (q[1]![0] - q[0]![0] + q[2]![0] - q[3]![0]) / 2;
      const size = lerp(width(from), width(to), k) * 1.15;
      const x = lerp(mid(from, 0), mid(to, 0), k);
      const foot = lerp(mid(from, 1), mid(to, 1), k) - arc * size * 1.1;
      // Sinking: the knight slides down through the square's centre line,
      // clipped there, so it disappears into the square.
      const drop = sink * size * 0.92;
      const piece = pieceRef.current!;
      piece.style.width = piece.style.height = `${size}px`;
      piece.style.transform = `translate(${x - size / 2}px, ${foot - size * 0.92 + drop}px)`;
      piece.style.clipPath = sink > 0 ? `inset(0 0 ${8 + sink * 92}% 0)` : "";
      bobRef.current!.classList.toggle("animate-bob", t === 0);
      // The label and move dot of the square it's heading for make way.
      [labelRefs, moveDotRefs].forEach((refs) =>
        refs.current.forEach((el, n) => {
          if (el) el.style.opacity = n === i ? `${1 - k}` : "";
        }),
      );

      if (grow <= 0) {
        cover.style.visibility = "hidden";
        return;
      }
      // The growing square: a layer clipped to the square's corners,
      // pulled out to the screen's corners.
      const e = easeInOut(grow);
      const coverBox = cover.getBoundingClientRect();
      const [w, h] = [coverBox.width, coverBox.height];
      const full: Point[] = [
        [0, 0],
        [w, 0],
        [w, h],
        [0, h],
      ];
      const points = corners(target, coverBox).map(
        ([cx, cy], n) =>
          `${lerp(cx, full[n]![0], e)}px ${lerp(cy, full[n]![1], e)}px`,
      );
      const light = sections[i]!.tone === "light";
      cover.style.visibility = "visible";
      cover.style.clipPath = `polygon(${points.join(",")})`;
      cover.style.backgroundColor = light
        ? `color-mix(in oklch, var(--square-dark), var(--square-light) ${e * 100}%)`
        : "var(--square-dark)";
      cover.dataset.tone = light && e > 0.5 ? "light" : "dark";
    },
    [sections],
  );

  // Scroll through the runway drives the move to About.
  useEffect(() => {
    let raf = 0;
    let onBoard: boolean | undefined;
    const frame = () => {
      raf = 0;
      const runway = runwayRef.current;
      if (!runway) return;
      const length = runway.offsetHeight - innerHeight;
      const p = length > 0 ? clamp(scrollY / length) : 0;
      if (!busy.current) paint(0, p);
      if (p < 1 !== onBoard) onBoardChange((onBoard = p < 1));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    schedule();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    // The board slides in and fonts settle after mount: keep the flat
    // knight on its square while that happens.
    const ro = new ResizeObserver(schedule);
    if (sceneRef.current) ro.observe(sceneRef.current);
    const settle = setInterval(schedule, 50);
    const stopSettling = setTimeout(() => clearInterval(settle), 1600);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      ro.disconnect();
      clearInterval(settle);
      clearTimeout(stopSettling);
    };
  }, [paint, onBoardChange]);

  // A click or a drop: the same frames, played over time, then straight
  // to the section (whose background the square has just become).
  const move = useCallback(
    async (i: number, from = 0) => {
      if (busy.current || scrollY > 0) return;
      busy.current = true;
      setSelected(false);
      const root = document.documentElement;
      root.style.overflow = "hidden";
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      await animate(from, 1, {
        duration: reduce ? 0 : (1 - from) * 0.95,
        ease: "linear",
        onUpdate: (t) => paint(i, t),
      });
      root.style.overflow = "";
      // Section top flush with the screen top (ignoring scroll-margin), so
      // the square and the background it becomes line up exactly.
      const section = document.getElementById(sections[i]!.id);
      if (section) scrollTo({ top: section.offsetTop, behavior: "instant" });
      busy.current = false;
    },
    [paint, sections],
  );

  const spotAt = (x: number, y: number) => {
    const hit = document
      .elementsFromPoint(x, y)
      .find(
        (el): el is HTMLElement =>
          el instanceof HTMLElement && !!el.dataset.spot,
      );
    return hit ? Number(hit.dataset.spot) : -1;
  };

  // Dragging: past a few pixels the knight comes off the board and follows
  // the pointer; letting go over a section square plays that move.
  const onPointerDown = (e: React.PointerEvent) => {
    if (busy.current) return;
    dragFrom.current = { x: e.clientX, y: e.clientY };
    dragged.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const from = dragFrom.current;
    if (!from) return;
    if (!dragged.current) {
      if (Math.hypot(e.clientX - from.x, e.clientY - from.y) < 6) return;
      dragged.current = true;
      setSelected(true);
    }
    const size = pieceRef.current!.getBoundingClientRect().height;
    setGhost({ x: e.clientX, y: e.clientY, size });
    setDragOver(spotAt(e.clientX, e.clientY));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragFrom.current = null;
    if (!dragged.current) return;
    setGhost(undefined);
    setDragOver(-1);
    const i = spotAt(e.clientX, e.clientY);
    // Already carried there, so skip the jump and just open the square.
    if (i >= 0) void move(i, HOP);
    else setSelected(false);
  };

  const showMoves = selected || !!ghost;

  return (
    <div
      ref={runwayRef}
      className="relative"
      // 60svh of scroll plays the whole move (see -mt on the first section).
      style={{ height: "160svh" }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setSelected(false);
      }}
    >
      <div
        // Mobile stacks everything; from md the text sits in the top-left
        // corner the diamond leaves free and the board takes the middle.
        className="sticky top-0 flex h-[100svh] flex-col items-center justify-center gap-6 overflow-hidden px-4 pt-20 pb-8 [--board:min(84vw,calc((100svh-21rem)*1.4),32rem)] md:pt-14 md:pb-16 md:[--board:min(48vw,calc((100svh-9rem)*1.4),46rem)] lg:[--board:min(54vw,calc((100svh-9rem)*1.4),46rem)]"
        style={
          {
            "--sq": "calc(var(--board) * 0.184)",
            "--edge": "calc(var(--board) * 0.045)",
          } as React.CSSProperties
        }
      >
        <div className="text-center md:absolute md:top-20 md:left-8 md:text-left lg:left-12">
          {intro}
          <div className="mt-10 hidden md:block">{actions}</div>
        </div>

        <div
          ref={sceneRef}
          // Pushed down a little from md, clear of the intro's corner.
          className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both relative duration-1000 [animation-delay:300ms] md:mt-16"
          style={{
            width: "var(--board)",
            height: "calc(var(--board) * 0.7)",
            perspective: "2400px",
          }}
        >
          <div
            className="bg-board-rim absolute top-1/2 left-1/2 size-[var(--board)] [transform-style:preserve-3d]"
            style={{
              transform: `translate(-50%, -50%) rotateX(${TILT}deg)`,
            }}
          >
            {/* Cast shadow and the front edge, facing the viewer. */}
            <div
              aria-hidden
              className="absolute inset-0 bg-black/35 blur-2xl"
              style={{
                transform:
                  "translateZ(calc(var(--edge) * -1)) translate(0, 5%)",
              }}
            />
            <div
              aria-hidden
              className="bg-board-edge absolute top-full left-0 h-[var(--edge)] w-full origin-top"
              style={{ transform: "rotateX(-90deg)" }}
            />

            <div
              ref={gridRef}
              className="absolute inset-[4%] grid grid-cols-5 grid-rows-5 [transform-style:preserve-3d]"
            >
              {Array.from({ length: 25 }, (_, n) => {
                const col = n % 5;
                const row = Math.floor(n / 5);
                const i = SPOTS.findIndex(
                  (s) => s.col === col && s.row === row,
                );
                const dark = (col + row) % 2 === 1;
                if (i < 0)
                  return (
                    <div
                      key={n}
                      ref={
                        col === CENTRE.col && row === CENTRE.row
                          ? centreRef
                          : undefined
                      }
                      className={cn(
                        "relative",
                        dark ? "bg-square-dark" : "bg-square-light",
                      )}
                    >
                      {col === CENTRE.col && row === CENTRE.row && <Corners />}
                    </div>
                  );
                const section = sections[i]!;
                return (
                  <button
                    key={n}
                    ref={(el) => {
                      spotRefs.current[i] = el;
                    }}
                    type="button"
                    data-spot={i}
                    onClick={() => void move(i)}
                    aria-label={`${t.rail.jump} ${t.nav[section.id]}`}
                    className={cn(
                      "bg-square-dark group relative transition-[transform,box-shadow] duration-300 ease-out outline-none [transform-style:preserve-3d] hover:[transform:translateZ(var(--edge))] hover:animate-none hover:bg-[var(--square-hover)] hover:shadow-[0_10px_24px_-6px_rgb(0_0_0/0.45)]",
                      showMoves ? "animate-breathe-strong" : "animate-breathe",
                      dragOver === i && "animate-none bg-[var(--square-hover)]",
                    )}
                  >
                    <Corners />
                    {/* A legal-move dot, as on chess.com: always there,
                        larger while the knight is picked up. */}
                    <span
                      ref={(el) => {
                        moveDotRefs.current[i] = el;
                      }}
                      aria-hidden
                      className={cn(
                        "absolute inset-[34%] rounded-full bg-black/20 transition-[scale,background-color] duration-200",
                        showMoves ? "scale-125 bg-black/30" : "scale-100",
                      )}
                    />
                    {/* The label stands on the square's far edge, facing
                        you, just clear of the move dot. */}
                    <span
                      aria-hidden
                      // Part of the square's hit area, so hovering or
                      // clicking the label counts too.
                      className="absolute top-[12%] left-1/2 [transform-style:preserve-3d]"
                      style={{
                        transform: `translateZ(calc(var(--sq) * 0.06)) ${FACE_VIEWER}`,
                      }}
                    >
                      <span
                        ref={(el) => {
                          labelRefs.current[i] = el;
                        }}
                        className="bg-background/90 text-foreground absolute bottom-0 left-0 flex -translate-x-1/2 items-center gap-1 rounded-full py-1 pr-3 pl-1.5 text-xs font-medium whitespace-nowrap shadow-[0_6px_16px_-8px_var(--shadow)] transition-[translate,scale,background-color,color] duration-300 group-hover:-translate-y-2 group-hover:scale-110 group-hover:bg-[var(--board-rim)] group-hover:text-[var(--on-dark)] sm:text-sm md:gap-1.5 md:py-1.5 md:pr-4 md:pl-2 md:text-base"
                      >
                        <ChessPiece
                          type={section.piece}
                          className="size-5 md:size-7"
                        />
                        {t.nav[section.id]}
                      </span>
                    </span>
                  </button>
                );
              })}

              {/* The knight's spot on the board: a dot, like the move
                  dots, sliding along with it. */}
              <div
                ref={dotRef}
                aria-hidden
                className="pointer-events-none absolute p-[6.8%]"
                style={{
                  left: `${CENTRE.col * 20}%`,
                  top: `${CENTRE.row * 20}%`,
                  width: "20%",
                  height: "20%",
                }}
              >
                <div className="size-full rounded-full bg-black/20" />
              </div>
            </div>
          </div>

          {/* The knight, flat on top; paint() places and sizes it. */}
          <button
            ref={pieceRef}
            type="button"
            onClick={() => {
              if (dragged.current) dragged.current = false;
              else if (!busy.current) setSelected((s) => !s);
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              dragFrom.current = null;
              dragged.current = false;
              setGhost(undefined);
              setDragOver(-1);
            }}
            aria-label={t.hero.knight}
            aria-pressed={selected}
            className={cn(
              "text-foreground absolute top-0 left-0 touch-none outline-none",
              ghost && "opacity-0",
            )}
          >
            <div ref={bobRef} className="size-full">
              <ChessPiece type="knight" className="size-full" />
            </div>
          </button>
        </div>

        <div className="md:hidden">{actions}</div>

        <p className="text-muted-foreground animate-in fade-in fill-mode-both flex items-center gap-2 text-sm duration-700 [animation-delay:1s] md:absolute md:right-8 md:bottom-8 lg:right-12">
          <ArrowDown className="size-4 animate-bounce" />
          {t.hero.hint}
        </p>

        {/* The growing square. It covers the board (and blocks it) while
            visible; data-tone lets the navbar match it. */}
        <div
          ref={coverRef}
          aria-hidden
          data-tone="dark"
          className="invisible absolute inset-0 z-10"
        />

        {ghost && (
          <div
            aria-hidden
            className="text-foreground pointer-events-none fixed z-[46] -translate-x-1/2 -translate-y-3/4 drop-shadow-[0_12px_10px_var(--shadow)]"
            style={{
              left: ghost.x,
              top: ghost.y,
              width: ghost.size,
              height: ghost.size,
            }}
          >
            <ChessPiece type="knight" className="size-full" />
          </div>
        )}
      </div>
    </div>
  );
}
