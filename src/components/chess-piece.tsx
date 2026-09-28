import { PIECE_SETS } from "~/lib/pieces";
import { cn } from "~/lib/utils";

export type PieceType = keyof typeof PIECE_SETS.black;

// Every piece on the site is a cburnett piece (see src/lib/pieces.ts) on
// a square 45×45 box, in its own colours. By default it follows the
// theme: black pieces on the light theme, white ones on the dark theme
// (switching themes switches sides).
export function ChessPiece({
  type,
  side = "theme",
  className,
  style,
}: {
  type: PieceType;
  side?: "black" | "white" | "theme";
  className?: string;
  style?: React.CSSProperties;
}) {
  const svg = (markup: string, extra?: string) => (
    <svg
      viewBox="0 0 45 45"
      className={cn(className, extra)}
      style={style}
      aria-hidden
      // Static markup from our own module, not user input.
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
  if (side === "theme")
    return (
      <>
        {svg(PIECE_SETS.black[type], "dark:hidden")}
        {svg(PIECE_SETS.white[type], "hidden dark:block")}
      </>
    );
  return svg(PIECE_SETS[side][type]);
}
