"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "~/contexts/LanguageContext";
import { cn } from "~/lib/utils";
import { ChessPiece, type PieceType } from "./chess-piece";

type Side = "white" | "black";
type Piece = { id: string; type: PieceType; side: Side; sq: string };
type Status = "start" | "wrong" | "forced" | "solved";

// A smothered mate, mate in 2: 1.Qg8+ Rxg8 (the king can't take: the
// knight guards g8) 2.Nf7#, the king boxed in by its own rook and pawns.
const START: Piece[] = [
  { id: "wK", type: "king", side: "white", sq: "g1" },
  { id: "wQ", type: "queen", side: "white", sq: "c4" },
  { id: "wN", type: "knight", side: "white", sq: "h6" },
  ...["a2", "b2", "f2", "g2", "h2"].map(
    (sq): Piece => ({ id: `wP${sq}`, type: "pawn", side: "white", sq }),
  ),
  { id: "bK", type: "king", side: "black", sq: "h8" },
  { id: "bQ", type: "queen", side: "black", sq: "b8" },
  { id: "bR", type: "rook", side: "black", sq: "f8" },
  ...["a7", "b7", "g7", "h7"].map(
    (sq): Piece => ({ id: `bP${sq}`, type: "pawn", side: "black", sq }),
  ),
];
const SOLUTION = [
  { from: "c4", to: "g8", san: "Qg8+" },
  { from: "f8", to: "g8", san: "Rxg8" },
  { from: "h6", to: "f7", san: "Nf7#" },
];

const FILES = "abcdefgh";
const at = (f: number, r: number) =>
  f >= 0 && f < 8 && r >= 1 && r <= 8 ? `${FILES[f]}${r}` : null;
const coords = (sq: string) => [FILES.indexOf(sq[0]!), Number(sq[1])] as const;

// Where a piece can go, ignoring checks: enough to show move dots and to
// refuse impossible clicks. Whether the move is *the* move is the puzzle.
function targets(p: Piece, pieces: Piece[]): string[] {
  const occupant = (sq: string) => pieces.find((q) => q.sq === sq);
  const [f, r] = coords(p.sq);
  const out: string[] = [];
  const add = (sq: string | null) => {
    if (!sq) return false;
    const o = occupant(sq);
    if (!o || o.side !== p.side) out.push(sq);
    return !o;
  };
  const slide = (dirs: number[][]) =>
    dirs.forEach(([df, dr]) => {
      for (let k = 1; k < 8 && add(at(f + df! * k, r + dr! * k)); k++);
    });
  const straight = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  const diagonal = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  if (p.type === "rook") slide(straight);
  if (p.type === "bishop") slide(diagonal);
  if (p.type === "queen") slide([...straight, ...diagonal]);
  if (p.type === "king")
    [...straight, ...diagonal].forEach(([df, dr]) => add(at(f + df!, r + dr!)));
  if (p.type === "knight")
    [
      [1, 2],
      [2, 1],
      [2, -1],
      [1, -2],
      [-1, -2],
      [-2, -1],
      [-2, 1],
      [-1, 2],
    ].forEach(([df, dr]) => add(at(f + df!, r + dr!)));
  if (p.type === "pawn") {
    const dir = p.side === "white" ? 1 : -1;
    const one = at(f, r + dir);
    if (one && !occupant(one)) {
      out.push(one);
      const two = at(f, r + 2 * dir);
      if ((r === 2 || r === 7) && two && !occupant(two)) out.push(two);
    }
    [-1, 1].forEach((df) => {
      const sq = at(f + df, r + dir);
      const o = sq && occupant(sq);
      if (sq && o && o.side !== p.side) out.push(sq);
    });
  }
  return out;
}

const apply = (pieces: Piece[], from: string, to: string) =>
  pieces
    .filter((p) => p.sq !== to)
    .map((p) => (p.sq === from ? { ...p, sq: to } : p));

/*
  A flat board with a smothered mate to find. Click a white piece to see
  where it can go, then click the square. Right moves are played (Black's
  forced reply follows by itself); anything else is taken back with a
  nudge. Pieces are always their real colours here, whatever the theme.
*/
export function ChessPuzzle() {
  const { t } = useLanguage();
  const [pieces, setPieces] = useState(START);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("start");
  const [wrong, setWrong] = useState<string | null>(null);
  const [last, setLast] = useState<{ from: string; to: string } | null>(null);
  const [armed, setArmed] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) =>
    timers.current.push(window.setTimeout(fn, ms));

  const selectedPiece = pieces.find((p) => p.sq === selected);
  const moves = selectedPiece ? targets(selectedPiece, pieces) : [];

  const play = (from: string, to: string, n: number) => {
    setPieces((ps) => apply(ps, from, to));
    setLast({ from, to });
    setStep(n + 1);
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPieces(START);
    setStep(0);
    setSelected(null);
    setStatus("start");
    setWrong(null);
    setLast(null);
  };

  // White's move from the solution at `n`, then Black's forced reply.
  const whiteMoves = (n: number) => {
    const move = SOLUTION[n]!;
    play(move.from, move.to, n);
    if (n + 1 >= SOLUTION.length) {
      setStatus("solved");
      return;
    }
    later(() => {
      const reply = SOLUTION[n + 1]!;
      play(reply.from, reply.to, n + 1);
      setStatus("forced");
    }, 550);
  };

  const playing = status !== "solved" && step % 2 === 0;

  // A white move, from a click or a drop. Impossible moves are ignored;
  // possible but wrong ones are shown, then taken back.
  const attempt = (from: string, to: string) => {
    setSelected(null);
    const piece = pieces.find((p) => p.sq === from);
    if (!piece || !targets(piece, pieces).includes(to)) return;
    const expected = SOLUTION[step]!;
    if (from === expected.from && to === expected.to) {
      setWrong(null);
      whiteMoves(step);
      return;
    }
    const before = pieces;
    setPieces(apply(pieces, from, to));
    setWrong(to);
    setStatus("wrong");
    later(() => {
      setPieces(before);
      setWrong(null);
    }, 650);
  };

  const click = (sq: string) => {
    if (!playing) return;
    if (pieces.find((p) => p.sq === sq)?.side === "white") {
      setSelected(sq === selected ? null : sq);
      return;
    }
    if (selected) attempt(selected, sq);
    else setSelected(null);
  };

  // Drag and drop: past a few pixels a white piece follows the pointer;
  // letting go drops it on the square underneath. The held piece's
  // position is written straight to its element (pieceEls), so moving the
  // pointer doesn't re-render the board; `drag` only marks the start and
  // end of a drag, with where it started.
  const gridRef = useRef<HTMLDivElement>(null);
  const pieceEls = useRef(new Map<string, HTMLDivElement>());
  const press = useRef<{ from: string; x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const [drag, setDrag] = useState<{ from: string; x: number; y: number }>();
  const heldAt = (x: number, y: number) =>
    `translate(${x}px, ${y}px) translate(-50%, -50%) scale(1.1)`;

  const pointAt = (e: React.PointerEvent) => {
    const r = gridRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width };
  };
  const onPointerDown = (e: React.PointerEvent) => {
    // Every press starts clean: with the pointer captured, a drag's own
    // click may never reach a square to clear this.
    dragged.current = false;
    const sq = (e.target as HTMLElement).closest<HTMLElement>("[data-sq]")
      ?.dataset.sq;
    if (!playing || !sq || pieces.find((p) => p.sq === sq)?.side !== "white")
      return;
    press.current = { from: sq, x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p) return;
    const { x, y } = pointAt(e);
    if (!dragged.current) {
      if (Math.hypot(e.clientX - p.x, e.clientY - p.y) < 5) return;
      dragged.current = true;
      setSelected(p.from);
      setDrag({ from: p.from, x, y });
      return;
    }
    const id = pieces.find((q) => q.sq === p.from)?.id;
    const el = id && pieceEls.current.get(id);
    if (el) el.style.transform = heldAt(x, y);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const p = press.current;
    press.current = null;
    if (!p || !dragged.current) return;
    setDrag(undefined);
    const { x, y, w } = pointAt(e);
    const to = at(Math.floor((x / w) * 8), 8 - Math.floor((y / w) * 8));
    if (to && to !== p.from) attempt(p.from, to);
  };

  const showSolution = () => {
    reset();
    setArmed(true);
    later(() => whiteMoves(0), 400);
    later(() => whiteMoves(2), 1700);
  };

  const mated = status === "solved" ? "h8" : null;
  const message = {
    start: t.puzzle.prompt,
    wrong: t.puzzle.wrong,
    forced: t.puzzle.forced,
    solved: t.puzzle.solved,
  }[status];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,34rem)_1fr] lg:gap-16">
      <div
        className="border-board-rim relative aspect-square w-full border-[10px] shadow-[0_24px_48px_-24px_var(--shadow)] [-webkit-tap-highlight-color:transparent] sm:border-[14px]"
        style={{ backgroundColor: "var(--board-rim)" }}
      >
        {/* Until "Press to play" is tapped the board takes no touches, so a
            swipe across it scrolls the page like anywhere else. */}
        {!armed && (
          <button
            type="button"
            onClick={() => setArmed(true)}
            className="group absolute inset-0 z-20 grid place-items-center bg-black/30 transition-colors hover:bg-black/20"
          >
            <span className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[#2b1d12] shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)] transition-transform group-hover:scale-105 group-active:scale-95">
              {t.puzzle.play}
            </span>
          </button>
        )}
        <div
          ref={gridRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            press.current = null;
            setDrag(undefined);
          }}
          className={cn(
            "grid size-full grid-cols-8 grid-rows-8",
            !armed && "pointer-events-none",
          )}
        >
          {Array.from({ length: 64 }, (_, n) => {
            const f = n % 8;
            const r = 8 - Math.floor(n / 8);
            const sq = `${FILES[f]}${r}`;
            const light = (f + r) % 2 === 1;
            const highlight =
              sq === selected || sq === last?.from || sq === last?.to;
            const own = pieces.find((p) => p.sq === sq)?.side === "white";
            return (
              <button
                key={sq}
                type="button"
                data-sq={sq}
                onClick={() => {
                  // A drag ends with a click on the square it started on.
                  if (dragged.current) dragged.current = false;
                  else click(sq);
                }}
                aria-label={sq}
                className={cn(
                  "relative outline-none",
                  light ? "bg-square-light" : "bg-square-dark",
                  // Once playing, only squares with a piece to drag stop
                  // touch scrolling.
                  armed && own && playing && "cursor-grab touch-none",
                )}
              >
                {highlight && (
                  <span className="absolute inset-0 bg-[var(--square-hover)]/70" />
                )}
                {sq === wrong && (
                  <span className="absolute inset-0 bg-red-500/45" />
                )}
                {sq === mated && (
                  <span className="absolute inset-0 bg-[radial-gradient(circle,rgb(220_38_38/0.85),rgb(220_38_38/0)_70%)]" />
                )}
                {moves.includes(sq) &&
                  (pieces.some((p) => p.sq === sq) ? (
                    <span className="absolute inset-[4%] rounded-full border-[5px] border-black/20" />
                  ) : (
                    <span className="absolute inset-[34%] rounded-full bg-black/20" />
                  ))}
                {f === 0 && (
                  <span
                    className={cn(
                      "absolute top-0.5 left-1 text-[10px] font-semibold sm:text-xs",
                      light ? "text-square-dark" : "text-square-light",
                    )}
                  >
                    {r}
                  </span>
                )}
                {r === 1 && (
                  <span
                    className={cn(
                      "absolute right-1 bottom-0 text-[10px] font-semibold sm:text-xs",
                      light ? "text-square-dark" : "text-square-light",
                    )}
                  >
                    {FILES[f]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Pieces sit on top and slide between squares (transforms: moving
            left/top would cost a layout a frame); the one being dragged
            follows the pointer instead. */}
        <div className="pointer-events-none absolute inset-0">
          {pieces.map((p) => {
            const [f, r] = coords(p.sq);
            const held = drag?.from === p.sq;
            return (
              <div
                key={p.id}
                ref={(el) => {
                  if (el) pieceEls.current.set(p.id, el);
                  else pieceEls.current.delete(p.id);
                }}
                className={cn(
                  "absolute top-0 left-0 size-[12.5%]",
                  held
                    ? "z-10 drop-shadow-[0_10px_8px_rgb(0_0_0/0.35)]"
                    : "transition-transform duration-300 ease-out",
                )}
                style={{
                  // Held: where the drag started; later moves via pieceEls.
                  transform: held
                    ? heldAt(drag.x, drag.y)
                    : `translate(${f * 100}%, ${(8 - r) * 100}%)`,
                }}
              >
                <ChessPiece type={p.type} side={p.side} className="size-full" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:pt-2">
        <p className="font-display text-3xl sm:text-4xl">{message}</p>
        <ol className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-lg">
          {SOLUTION.slice(0, step).map((move, n) => (
            <li key={move.san}>
              {n % 2 === 0 && (
                <span className="text-muted-foreground">{n / 2 + 1}. </span>
              )}
              <span className={cn(n === 2 && "text-accent font-medium")}>
                {move.san}
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="border-foreground/20 hover:border-foreground inline-flex h-11 items-center rounded-full border px-5 text-sm font-medium transition-colors"
          >
            {t.puzzle.reset}
          </button>
          {status !== "solved" && (
            <button
              type="button"
              onClick={showSolution}
              className="text-muted-foreground hover:text-foreground inline-flex h-11 items-center px-2 text-sm font-medium underline decoration-current/30 underline-offset-4 transition-colors"
            >
              {t.puzzle.solution}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
