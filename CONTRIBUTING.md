# Contributing

Contributions are welcome when they keep the utility lightweight and compatible with Adobe Illustrator's ExtendScript environment.

## Guidelines

- Preserve ExtendScript-compatible JavaScript syntax.
- Avoid browser-only or Node.js APIs in the production JSX file.
- Keep the UI compact and production-oriented.
- Test changes on point text and area text.
- Test parsing with line breaks, commas, semicolons, and tabs.
- Test N-row reflow with both evenly and unevenly divisible item counts.
- Avoid silently changing artwork without a preview or clear confirmation path.

## Suggested contribution flow

1. Fork the repository.
2. Create a focused branch.
3. Make and test the change.
4. Update the changelog when behavior changes.
5. Open a pull request explaining the production problem the change solves.
