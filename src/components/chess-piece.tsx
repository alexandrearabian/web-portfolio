import { PIECES } from "~/lib/pieces";

export type PieceType = keyof typeof PIECES;

// Every piece on the site is a cburnett piece (see src/lib/pieces.ts),
// drawn in currentColor on a square 45×45 box.
export function ChessPiece({
  type,
  className,
  style,
}: {
  type: PieceType;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 45 45"
      className={className}
      style={style}
      aria-hidden
      // Static markup from our own module, not user input.
      dangerouslySetInnerHTML={{ __html: PIECES[type] }}
    />
  );
}
