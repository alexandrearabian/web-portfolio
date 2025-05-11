"use client";

import Link from "next/link";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { useState } from "react";
import type { Repo } from "./actions/getRepos";

export default function HomePage({ repos }: { repos: Repo[] }) {
  const [focusWink, setFocusWink] = useState(false);
  const [focusAmazed, setFocusAmazed] = useState(false);

  return (
    <div className="bg-background relative mt-16 min-h-screen">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8841fc2e_1px,transparent_1px),linear-gradient(to_bottom,#8841fc2e_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="from-background via-background/20 to-background fixed inset-0 bg-gradient-to-b"></div>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-24">
        <div className="bg-background/70 m-auto flex w-35 justify-center rounded-full border border-purple-600">
          {focusWink && (
            <Image src="/wink.png" alt="Background" width={140} height={140} />
          )}
          {focusAmazed && (
            <Image
              src="/amazed.png"
              alt="Background"
              width={140}
              height={140}
            />
          )}
          {!focusWink && !focusAmazed && (
            <Image src="/smile.png" alt="Background" width={140} height={140} />
          )}
        </div>
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-foreground bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-5xl font-bold tracking-tight sm:text-7xl">
              Hi, I&apos;m{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Alexandre Arabian
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              A passionate software engineer and web developer crafting
              beautiful, functional, and user-friendly digital experiences.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="#contact"
              className="rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500"
              onMouseEnter={() => setFocusWink(true)}
              onMouseLeave={() => setFocusWink(false)}
              onFocus={() => setFocusWink(true)} // keyboard accessibility
              onBlur={() => setFocusWink(false)}
            >
              Contact Me
            </Link>

            <Link
              href="#projects"
              className="rounded-full border border-purple-600 px-6 py-3 text-sm font-semibold transition-colors hover:bg-purple-600/10"
              onMouseEnter={() => setFocusAmazed(true)}
              onMouseLeave={() => setFocusAmazed(false)}
              onFocus={() => setFocusAmazed(true)} // keyboard accessibility
              onBlur={() => setFocusAmazed(false)}
            >
              View My Work
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative container mx-auto px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 text-center text-3xl font-bold">About Me</h2>
          <div className="grid gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                I&apos;m a software engineer with a passion for creating elegant
                solutions to complex problems.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With expertise in modern web technologies and a keen eye for
                design, I build applications that are both beautiful and
                functional.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                When I&apos;m not coding, you can find me drawing, playing
                chess, coding and... oh.
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "React",
                  "Next.js",
                  "TypeScript",
                  "Node.js",
                  "Tailwind CSS",
                  "Javascript",
                  "CSS",
                  "HTML",
                  "Python",
                  "Java",
                  "C",
                  "C#",
                  "MySQL",
                  "Git",
                ].map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-purple-600/10 px-3 py-1 text-sm text-purple-600"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="relative container mx-auto px-4 py-24">
        <div></div>
        <h2 className="mb-12 text-center text-3xl font-bold">
          Featured Projects
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {repos.slice(0, 4).map((repo: Repo) => (
            <Card
              key={repo.id}
              className="group bg-background relative overflow-hidden rounded-lg border p-6 shadow-lg transition-colors hover:border-purple-500"
            >
              <CardHeader>
                <h2>{repo.name}</h2>
              </CardHeader>
              <CardDescription>{repo.description}</CardDescription>
              <CardContent>
                <p>{repo.description}</p>
                <span className="rounded-full bg-purple-600/10 px-2 py-1 text-xs text-purple-600">
                  {repo.language}
                </span>
              </CardContent>
              <CardFooter className="flex gap-4">
                <Link
                  href={repo.html_url}
                  target="_blank"
                  className="flex items-center gap-2 rounded-full border border-purple-600 px-6 py-3 text-sm font-semibold transition-colors hover:bg-purple-600/10"
                >
                  <Github className="h-4 w-4" />
                  Github
                </Link>
                <Link
                  href="#"
                  className="rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500"
                >
                  View Project →
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="relative container mx-auto px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-8 text-3xl font-bold">Get In Touch</h2>
          <p className="text-muted-foreground mb-12 text-xl">
            I&apos;m always open to discussing new projects, creative ideas, or
            opportunities to bring your vision to life.
          </p>
          <div className="flex justify-center space-x-6">
            <Link
              href="mailto:a.arabian.j@example.com"
              className="text-muted-foreground transition-colors hover:text-purple-600"
            >
              <Mail className="h-6 w-6" />
            </Link>
            <Link
              href="https://github.com/alexandrearabian"
              className="text-muted-foreground transition-colors hover:text-purple-600"
            >
              <Github className="h-6 w-6" />
            </Link>
            <Link
              href="https://www.linkedin.com/in/alexandre-arabian-jensezian/"
              className="text-muted-foreground transition-colors hover:text-purple-600"
            >
              <Linkedin className="h-6 w-6" />
            </Link>
            <Link
              href="https://twitter.com/yourusername"
              className="text-muted-foreground transition-colors hover:text-purple-600"
            >
              <Twitter className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
