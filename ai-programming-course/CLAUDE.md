# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI 编程课程（AI Programming Course）— a Chinese-language course teaching beginners to build and ship software with AI assistance. The tech stack taught is TypeScript + Next.js + Supabase + Vercel.

## Repository Structure

This is a **pure content repository** — all files are Markdown, no build system, no dependencies, no tests. There is no package.json or lockfile.

```
quick-start/   → Day 1: environment setup → build AI chat app → deploy (9 lessons)
week-01/       → AI-assisted programming techniques (8 lessons)
week-02/       → Programming fundamentals deep dive (12 lessons)
resources/     → Glossary, cheatsheets, reading list
```

Each directory has its own `README.md` serving as a table of contents with lesson order and estimated time.

## Writing Conventions

- All course content is in **Chinese** (Simplified)
- Markdown format, one `.md` file per lesson
- Filenames use `##-topic-name.md` pattern (number prefix for ordering)
- Code examples within lessons use the course tech stack (TypeScript, Next.js, Supabase)
- Technical terms often appear as `中文 (English)` pairs or in the glossary (`resources/glossary.md`)

## When Editing Content

- Maintain consistent lesson numbering within each directory
- Keep the parent `README.md` index in sync when adding/removing/renaming lessons
- Preserve the teaching progression: Quick Start → Week 1 → Week 2 (concrete → conceptual → foundational)
