# Changelog

All notable changes to this project are documented here.

## [2.0.0] - 2026-10-10

### Added
- Multiple selected text-frame support
- Recursive processing for text inside selected groups
- Input separator selection: auto, line break, comma, semicolon, tab
- Configurable separator for items within each row
- Whitespace trimming option
- Empty-item handling option
- Preview dialog with before/after text
- Detected-item and changed-frame counts
- Confirmation before applying edits
- Balanced N-row distribution
- Production-oriented validation and messaging

### Changed
- Renamed the project from a narrow "Column To Row" utility to **Illustrator Text Layout Converter**
- Reworked the script into isolated parsing, conversion, preview, and selection-collection functions
- Improved no-document and invalid-selection handling

## [1.0.0]

### Added
- Column → Row
- Row → Column
- Split into N rows
- Basic ScriptUI dialog
