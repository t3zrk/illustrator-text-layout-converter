# Portfolio Case Study — Illustrator Text Layout Converter

## One-line description

An Adobe Illustrator utility that converts list-based copy between column, row, and balanced multi-row layouts directly inside selected text frames.

## The problem

Creative production often receives copy in structures that do not match the intended layout. A designer may receive a vertical list that needs to become a single row, a comma-separated list that needs to become a column, or dozens of items that need to be distributed evenly across a fixed number of rows.

Doing this manually is repetitive, error-prone, and especially inefficient when the same operation is required across multiple campaign assets.

## The solution

I built an Illustrator ExtendScript utility with a compact ScriptUI interface that lets the designer:

- Convert columns to rows
- Convert rows to columns
- Reflow lists into a requested number of balanced rows
- Choose or auto-detect separators
- Process multiple selected text frames
- Include text inside selected groups
- Preview the result before modifying the artwork

## What changed from the original prototype

The first version handled only one selected text frame and used a fixed comma-oriented workflow.

The production version adds:

- Multi-frame processing
- Recursive group support
- Balanced row distribution
- Input-separator controls
- Configurable row separators
- Whitespace and empty-item controls
- Preview
- Validation and confirmation
- Better status reporting

## Design / engineering decisions

### Balanced reflow

Instead of calculating a single `ceil(items / rows)` chunk size, the converter distributes the remainder across the first rows.

For 10 items across 3 rows:

- Basic ceiling split: 4 / 4 / 2
- Balanced split: 4 / 3 / 3

The second result is more useful visually.

### Explicit parsing controls

Production copy does not always arrive comma-separated. The tool supports:

- Auto detect
- Line breaks
- Commas
- Semicolons
- Tabs

### Preview before mutation

The tool reports how many items it detected and how many selected text frames will change. A before/after preview of the first selected frame helps catch incorrect parsing before the artwork is modified.

## My role

Concept, workflow analysis, interaction design, Illustrator scripting, testing strategy, documentation, and AI-assisted development.

## Stack

- Adobe Illustrator
- ExtendScript / JavaScript
- ScriptUI
- Regular expressions
- GitHub

## Portfolio caption

**Illustrator Text Layout Converter** — A production automation script for Adobe Illustrator that restructures list-based copy between columns, rows, and balanced multi-row layouts, with multi-frame processing, separator controls, and a preview-first workflow.

## Resume bullet

Built an Adobe Illustrator ExtendScript utility that automates list-layout conversion across selected creative assets, adding multi-frame processing, balanced row distribution, configurable parsing, validation, and preview controls to reduce repetitive production editing.

## Interview explanation

I built this after noticing that a simple copy-formatting problem kept repeating in production work. The first version solved it for a single text frame, but I treated that as a prototype. I then redesigned it around actual production failure points: inconsistent separators, multiple selected frames, text inside groups, uneven row distribution, and accidental edits. The final version adds parsing controls, balanced distribution, preview, validation, and safer confirmation.
