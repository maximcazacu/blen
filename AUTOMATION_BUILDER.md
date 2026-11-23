# Automation Builder

Choose Excel Data Cleanup, Spreadsheet Formatting or Basic Reporting. In the inspector, select a source worksheet and set operation parameters. Drag nodes and connect handles on desktop, or add a step with a button and connect it with the inspector. Use undo/redo to restore a prior configuration.

The compiler accepts one connected chain. The first two steps select a named worksheet and its used range. Add at least one operation. Each operation may appear once, deduplication precedes table creation, and a distinct summary sheet is the final step if present. Column indices start at zero. Worksheet names and positions are bounded, and generated string literals are escaped.

The supported set is worksheet, used range, duplicate removal, sort, table creation, header/column formatting and a row-count summary. The preview shows fixed fictional data and skips unavailable sample columns with an explanation. Actual Excel sorting and workbook behavior can differ from the simulation.

Saved workflows belong to the current account. Save changes before exporting so checkout snapshots the intended graph. The download contains `automation.ts`, `workflow.json`, `version.json` and `README.md`.

## Licensed Excel verification

The unit suite runs generated code against a small workbook API double. It does not execute scripts in Excel. When a licensed test environment is available, create a copy of a workbook with a Data sheet, a header row and sample rows. Confirm cleanup removes a duplicate and creates a sorted table, formatting changes the header and widths, and reporting creates a distinct Summary sheet with the correct count. Repeat with missing sheets, an out-of-range column and an existing table or report sheet. Review behavior and limits in [Microsoft’s Office Scripts documentation](https://learn.microsoft.com/en-us/office/dev/scripts/testing/platform-limits).
