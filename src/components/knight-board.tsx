"use client";

import { animate } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { useLanguage } from "~/contexts/LanguageContext";
import { cn } from "~/lib/utils";
import { ChessPiece, type PieceType } from "./chess-piece";

export type BoardSection = {
  id: "about" | "experience" | "projects" | "contact" | "puzzle";
  piece: PieceType;
};

type Spot = { col: number; row: number };
type Point = readonly [number, number];

const CENTRE: Spot = { col: 2, row: 2 };
// Each section's square: all knight moves from the centre. About on top,
// Experience and the puzzle on the right, Contact at the bottom, Work on
// the left.
const SPOT: Record<BoardSection["id"], Spot> = {
  about: { col: 1, row: 0 },
  experience: { col: 4, row: 1 },
  puzzle: { col: 4, row: 3 },
  contact: { col: 3, row: 4 },
  projects: { col: 0, row: 3 },
};
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
  is pinned while you scroll through 2 screens of "runway", and the
  scroll position *is* the animation: the knight jumps to the active
  section's square and the square grows until it fills the screen as that
  section's background. Stop halfway and it stays halfway; scroll up and
  it plays backwards. Only one section is on the page at a time: About by
  default, or whichever square was clicked (or had the knight dropped on
  it), which plays the same frames over time and lands there. Back on the
  board, the active section resets to About. The knight doesn't just
  land: it drops into the square, as if through a trapdoor, and the
  square opens out from there.

  The knight itself is drawn flat, over the board, at the squares'
  projected positions: inside the 3D scene the browser's depth sorting
  would slice it against the squares.
*/
export function KnightBoard({
  sections,
  onBoardChange,
  onActiveChange,
  intro,
  actions,
}: {
  sections: readonly BoardSection[];
  onBoardChange: (onBoard: boolean) => void;
  // The section on the page below the board (an index into `sections`).
  onActiveChange: (i: number) => void;
  intro: React.ReactNode;
  actions: React.ReactNode;
}) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(false);
  // The knight while dragged: its size is state (set once per drag), its
  // position is written straight to ghostRef, so moving the pointer
  // doesn't re-render the whole board.
  const [ghost, setGhost] = useState<{ size: number; x: number; y: number }>();
  const ghostRef = useRef<HTMLDivElement>(null);
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
  const active = useRef(0);
  // How far the scroll has taken the move (0..1), for clicks mid-scroll.
  const progress = useRef(0);
  // Whether the current history entry is a section we pushed on top of
  // the board's entry (so leaving can pop it instead of adding another).
  const pushed = useRef(false);
  const started = useRef(false);
  const dragFrom = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);

  // The board's projected geometry, measured once and reused: reading
  // layout on every scroll frame (between style writes) is what made the
  // move stutter on phones. Cleared on resize, on layout changes and while
  // the board is still sliding in; the next paint measures again. Every
  // position is relative to the pinned screen (the cover's box).
  type Geometry = {
    sq: number;
    centre: Point[];
    spots: Point[][];
    // The scene's top-left in the pinned screen (the knight lives in it).
    scene: Point;
    w: number;
    h: number;
  };
  const geometry = useRef<Geometry | null>(null);
  // What was last drawn: scrolling through a section keeps the move at
  // its end, and repainting the full-screen cover for nothing is costly.
  const painted = useRef("");
  const measure = useCallback((): Geometry | null => {
    const grid = gridRef.current;
    const cover = coverRef.current;
    const scene = sceneRef.current;
    if (!grid || !cover || !scene || !centreRef.current) return null;
    const box = cover.getBoundingClientRect();
    const s = scene.getBoundingClientRect();
    return {
      sq: grid.offsetWidth / 5,
      centre: corners(centreRef.current, box),
      spots: spotRefs.current.map((el) => (el ? corners(el, box) : [])),
      scene: [s.left - box.left, s.top - box.top],
      w: box.width,
      h: box.height,
    };
  }, []);

  // Draws the move to section i at progress t (0 = knight in the centre,
  // 1 = square filling the screen). Writes styles directly: it runs on
  // every scroll frame.
  const paint = useCallback(
    (i: number, t: number) => {
      const key = `${i}:${t}`;
      if (geometry.current && painted.current === key) return;
      const g = (geometry.current ??= measure());
      const cover = coverRef.current;
      if (!g || !cover || !g.spots[i]?.length) return;
      painted.current = key;
      // The knight is positioned inside the scene.
      const [ox, oy] = g.scene;
      const sq = g.sq;
      const spot = SPOT[sections[i]!.id];
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
      const from = g.centre;
      const to = g.spots[i]!;
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
      // Hidden until this first places it (see the button's classes).
      piece.style.visibility = "visible";
      piece.style.transform = `translate(${x - ox - size / 2}px, ${foot - oy - size * 0.92 + drop}px)`;
      piece.style.clipPath = sink > 0 ? `inset(0 0 ${8 + sink * 92}% 0)` : "";
      bobRef.current!.classList.toggle("animate-bob", t === 0);
      // The label and move dot of the square it's heading for make way.
      [labelRefs, moveDotRefs].forEach((refs) =>
        refs.current.forEach((el, n) => {
          if (el) el.style.opacity = n === i ? `${1 - k}` : "";
        }),
      );

      // The section is clipped to the square too, so leaving it folds the
      // page back into its square (the intro in reverse). While the square
      // fills the screen it's unclipped; once the square has closed, fully
      // clipped.
      const room = document.getElementById(sections[i]!.id);
      if (grow <= 0) {
        cover.style.visibility = "hidden";
        if (room) room.style.clipPath = "inset(50%)";
        return;
      }
      if (room && grow >= 1) room.style.clipPath = "";
      // The growing square: a layer clipped to the square's corners,
      // pulled out to the screen's corners.
      const e = easeInOut(grow);
      const { w, h } = g;
      const full: Point[] = [
        [0, 0],
        [w, 0],
        [w, h],
        [0, h],
      ];
      const at = to.map(
        ([cx, cy], n) =>
          [lerp(cx, full[n]![0], e), lerp(cy, full[n]![1], e)] as const,
      );
      const polygon = (dx: number, dy: number) =>
        `polygon(${at.map(([x, y]) => `${x - dx}px ${y - dy}px`).join(",")})`;
      cover.style.visibility = "visible";
      cover.style.clipPath = polygon(0, 0);
      // Dark wood while it grows, turning into the page as it fills it:
      // the section below sits on the page background.
      cover.style.backgroundColor = `color-mix(in oklch, var(--square-dark), var(--background) ${e ** 1.6 * 100}%)`;
      if (room && grow < 1) {
        // The same shape in the section's own coordinates (the pinned
        // screen sits at the top of the viewport while this runs).
        const box = room.getBoundingClientRect();
        room.style.clipPath = polygon(box.left, box.top);
      }
    },
    [sections, measure],
  );

  // The URL follows the page: arriving in a section gives it its own
  // history entry (#about, #experience...), so Back always returns to the
  // board; getting back to the board by scrolling pops that entry.
  const arrive = useCallback(
    (i: number) => {
      const hash = `#${sections[i]!.id}`;
      if (location.hash === hash) return;
      if (location.hash) {
        history.replaceState(null, "", hash);
      } else {
        history.pushState(null, "", hash);
        pushed.current = true;
      }
    },
    [sections],
  );
  const leave = useCallback(() => {
    if (!location.hash) return;
    if (pushed.current) {
      pushed.current = false;
      history.back();
    } else {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }, []);

  // Scroll through the runway drives the move to About.
  useEffect(() => {
    let raf = 0;
    let onBoard: boolean | undefined;
    let leaving = 0;
    // How far into the section the page was (null on the board), and
    // whether the window has been resized since the last frame.
    let inRoom: number | null = null;
    let resized = false;
    const frame = () => {
      raf = 0;
      const runway = runwayRef.current;
      const pinned = coverRef.current;
      if (!runway || !pinned) return;
      // The runway's length is its height minus the pinned screen's (a
      // fixed 100svh), not the window's: on phones innerHeight changes as
      // the address bar shows and hides, which made the move jump.
      const length = runway.offsetHeight - pinned.offsetHeight;
      // The move completes a little before the runway ends. That last
      // stretch (40% of a screen) is a hold: the section scrolls in over
      // the finished square, and on the way back up it scrolls away
      // before the square starts shrinking, instead of at the first nudge.
      const hold = pinned.offsetHeight * 0.4;
      // A resize (rotating a phone, dragging the window) changes the
      // runway's length, which used to read as scrolling back out of the
      // section and sent the page home. Keep the same place in the section
      // instead.
      if (resized && inRoom !== null) {
        resized = false;
        scrollTo({ top: length + inRoom, behavior: "instant" });
      }
      resized = false;
      const p = length > hold ? clamp(scrollY / (length - hold)) : 0;
      inRoom = p === 1 ? scrollY - length : null;
      const was = progress.current;
      progress.current = p;
      // Only the knight's jump follows the scroll. Scrolling down, once it
      // has landed the rest (sinking in, the square filling the screen)
      // plays by itself and lands at the section's top. Scrolling back out
      // of a section, once the square starts shrinking, the way home does
      // too. Neither can be left halfway, or skipped with a big flick.
      if (!busy.current && was === 1 && p < 1) void retreat(p);
      else if (!busy.current && p > was && p >= HOP && p < 1) void advance(p);
      if (!busy.current) {
        // Back on the board: scrolling down leads to About again.
        if (p === 0 && active.current !== 0)
          onActiveChange((active.current = 0));
        paint(active.current, p);
        if (p === 1) arrive(active.current);
        // Leave the section's history entry once the page has come to rest
        // on the board, not mid-scroll (history.back() there made mobile
        // browsers stutter).
        clearTimeout(leaving);
        if (p === 0) leaving = window.setTimeout(leave, 250);
      }
      if (p < 1 !== onBoard) {
        onBoardChange((onBoard = p < 1));
        // In a section the board is out of sight: pause its endless
        // animations (the knight's bob, the squares' breathing).
        runway.toggleAttribute("data-idle", !onBoard);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    // Scroll input is watched (not blocked) so the automatic steps can wait
    // for a flick's momentum to die out before handing scrolling back:
    // otherwise it carries straight on, through the section or back down.
    let lastInput = 0;
    const onInput = () => (lastInput = performance.now());
    const inputSettled = () =>
      new Promise<void>((resolve) => {
        const start = performance.now();
        const check = () => {
          const now = performance.now();
          if (now - lastInput > 200 || now - start > 700) resolve();
          else setTimeout(check, 80);
        };
        check();
      });
    // Plays the move from `from` to `to` over time with scrolling locked,
    // lands the page at `top`, and unlocks once input has gone quiet.
    const autoplay = async (
      from: number,
      to: number,
      duration: number,
      top: () => number,
    ) => {
      busy.current = true;
      const root = document.documentElement;
      root.style.overflow = "hidden";
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      await animate(from, to, {
        duration: reduce ? 0 : duration,
        ease: "linear",
        onUpdate: (t) => paint(active.current, t),
      });
      scrollTo({ top: top(), behavior: "instant" });
      await inputSettled();
      root.style.overflow = "";
      busy.current = false;
      schedule();
    };
    // Into the section: the knight sinks in, the square fills the screen,
    // the page lands at the section's top (whose background it becomes).
    const advance = (from: number) =>
      autoplay(from, 1, 0.15 + (1 - from) * 0.6, () => {
        const section = document.getElementById(sections[active.current]!.id);
        return section?.offsetTop ?? 0;
      });
    // Home: the square closes back into its square, the knight hops back
    // to the centre, the page lands on the board.
    const retreat = (from: number) =>
      autoplay(from, 0, 0.15 + from * 0.55, () => 0);
    const remeasure = () => {
      geometry.current = null;
      schedule();
    };
    const onResize = () => {
      resized = true;
      remeasure();
    };
    schedule();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", onResize);
    const inputs = ["wheel", "touchmove", "keydown"] as const;
    inputs.forEach((type) =>
      addEventListener(type, onInput, { passive: true }),
    );
    // The board slides in and fonts settle after mount: keep measuring
    // while that happens.
    const ro = new ResizeObserver(remeasure);
    if (sceneRef.current) ro.observe(sceneRef.current);
    const settle = setInterval(remeasure, 50);
    const stopSettling = setTimeout(() => clearInterval(settle), 1600);
    // Web fonts can land later than that and move the board (the intro
    // above it changes height).
    void document.fonts?.ready.then(remeasure);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", onResize);
      inputs.forEach((type) => removeEventListener(type, onInput));
      ro.disconnect();
      clearInterval(settle);
      clearTimeout(stopSettling);
      clearTimeout(leaving);
    };
  }, [paint, sections, onBoardChange, onActiveChange, arrive, leave]);

  // A click or a drop: the same frames, played over time, then straight
  // to the section (whose background the square has just become). Works
  // mid-scroll too: heading for the same square, the move carries on from
  // where the scroll left it; for another square, the knight first hops
  // back to the centre, so nothing snaps.
  const move = useCallback(
    async (i: number, from = 0) => {
      if (busy.current) return;
      busy.current = true;
      setSelected(false);
      const root = document.documentElement;
      root.style.overflow = "hidden";
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const now = progress.current;
      if (now > 0 && from === 0) {
        if (i === active.current) from = now;
        else
          await animate(now, 0, {
            duration: reduce ? 0 : now * 0.5,
            ease: "linear",
            onUpdate: (t) => paint(active.current, t),
          });
      }
      // Swap the section in now; it renders hidden while the move plays.
      onActiveChange((active.current = i));
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
    [paint, sections, onActiveChange],
  );

  // Back / Forward, and links straight to a section (/#projects).
  useEffect(() => {
    // Scroll position comes from the hash, not the browser's memory.
    history.scrollRestoration = "manual";
    const indexOf = (hash: string) =>
      sections.findIndex((s) => `#${s.id}` === hash);

    // Opening the site on a section: put the board underneath it in the
    // history, then open the section directly.
    const start = started.current ? -1 : indexOf(location.hash);
    started.current = true;
    if (start >= 0) {
      history.replaceState(null, "", location.pathname + location.search);
      history.pushState(null, "", `#${sections[start]!.id}`);
      pushed.current = true;
      onActiveChange((active.current = start));
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const section = document.getElementById(sections[start]!.id);
          if (section)
            scrollTo({ top: section.offsetTop, behavior: "instant" });
        }),
      );
    }

    const onPop = () => {
      const i = indexOf(location.hash);
      // Other fragments (the skip link's #main) aren't ours.
      if (location.hash && i < 0) return;
      if (i < 0) {
        // Back to the board: scroll up, which plays the move in reverse.
        pushed.current = false;
        if (scrollY > 0) scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      // Forward (or a typed hash): make that move from the board.
      pushed.current = true;
      if (scrollY > 0) scrollTo({ top: 0, behavior: "instant" });
      requestAnimationFrame(() => void move(i));
    };
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, [sections, move, onActiveChange]);

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
      setGhost({
        size: pieceRef.current!.getBoundingClientRect().height,
        x: e.clientX,
        y: e.clientY,
      });
    }
    const el = ghostRef.current;
    if (el) {
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
    }
    // Same value on most moves, and React skips those re-renders.
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
      className="relative [&[data-idle]_*]:[animation-play-state:paused]"
      // Two screens of scroll play the whole move (see -mt on the
      // section): enough distance that a flick doesn't fly straight past
      // it into the section.
      style={{ height: "300svh" }}
      onKeyDown={(e) => {
        if (e.key === "Escape") setSelected(false);
      }}
    >
      <div
        // Mobile stacks everything, weighted upwards (more padding below)
        // so the board sits at the screen's centre, nearly full width (its
        // near edge, wider in perspective, keeps a few pixels' margin); from
        // md the text sits in the top-left corner and the board takes the
        // middle.
        className="sticky top-0 flex h-[100svh] flex-col items-center justify-center gap-6 overflow-hidden px-4 pt-14 pb-32 [--board:min(91vw,calc((100svh-24rem)*1.4),34rem)] md:pt-14 md:pb-16 md:[--board:min(48vw,calc((100svh-9rem)*1.4),46rem)] lg:[--board:min(54vw,calc((100svh-9rem)*1.4),46rem)]"
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
                const i = sections.findIndex(
                  (s) => SPOT[s.id].col === col && SPOT[s.id].row === row,
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
                      "bg-square-dark group relative transition-[transform,box-shadow] duration-300 ease-out outline-none [transform-style:preserve-3d] hover:[transform:translateZ(var(--edge))] hover:bg-[var(--square-hover)] hover:shadow-[0_10px_24px_-6px_rgb(0_0_0/0.45)]",
                      dragOver === i && "bg-[var(--square-hover)]",
                    )}
                  >
                    <Corners />
                    {/* The breathing: light wood fading in and out on top of
                        the square. Off while the square is highlighted. */}
                    <span
                      aria-hidden
                      className={cn(
                        // Resting at 0, so it stays invisible when reduced
                        // motion collapses the animation.
                        "bg-square-light absolute inset-0 opacity-0 group-hover:hidden",
                        showMoves
                          ? "animate-breathe-strong [--breathe:0.38]"
                          : "animate-breathe",
                        dragOver === i && "hidden",
                      )}
                    />
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
                        // White pills in both themes: they sit on the wooden
                        // board, which stays wood-coloured either way.
                        className="absolute bottom-0 left-0 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/95 py-1 pr-3 pl-1.5 text-xs font-medium whitespace-nowrap text-[#2b1d12] shadow-[0_6px_16px_-8px_rgb(0_0_0/0.45)] ring-[var(--square-hover)] transition-[translate,scale,box-shadow] duration-300 group-hover:-translate-y-2 group-hover:scale-110 group-hover:ring-2 sm:text-sm md:gap-1.5 md:py-1.5 md:pr-4 md:pl-2 md:text-base"
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
              // Hidden and sizeless until paint() places it: before that
              // the SVG would fall back to the browser's default 300x150.
              "text-foreground invisible absolute top-0 left-0 size-0 touch-none outline-none",
              ghost && "opacity-0",
            )}
          >
            <div ref={bobRef} className="size-full">
              <ChessPiece type="knight" className="size-full" />
            </div>
          </button>
        </div>

        {/* Clear of the board's front edge, which reaches below the scene
            box in perspective. */}
        <div className="mt-6 md:hidden">{actions}</div>

        <p className="text-muted-foreground animate-in fade-in fill-mode-both flex items-center gap-2 text-sm duration-700 [animation-delay:1s] md:absolute md:right-8 md:bottom-8 lg:right-12">
          <ArrowDown className="size-4 animate-bounce" />
          {t.hero.hint}
        </p>

        {/* The growing square. It covers the board (and blocks it) while
            visible. */}
        <div
          ref={coverRef}
          aria-hidden
          className="invisible absolute inset-0 z-10"
        />

        {ghost && (
          <div
            ref={ghostRef}
            aria-hidden
            className="text-foreground pointer-events-none fixed z-[46] -translate-x-1/2 -translate-y-3/4 drop-shadow-[0_12px_10px_var(--shadow)]"
            style={{
              // Where the pointer was when it appeared; moves follow via ref.
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
