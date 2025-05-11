import Link from "next/link";
import { ModeToggle } from "./mode-toggle";

export function Navbar() {
  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-8">
        <div className="flex items-center gap-2">
          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-purple-500"
            >
              Home
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium transition-colors hover:text-purple-500"
            >
              About
            </Link>
            <Link
              href="#projects"
              className="text-sm font-medium transition-colors hover:text-purple-500"
            >
              Projects
            </Link>
            <Link
              href="#contact"
              className="text-sm font-medium transition-colors hover:text-purple-500"
            >
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
