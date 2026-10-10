//@target illustrator

/*
 * Illustrator Text Layout Converter
 * Version: 2.0.0
 * Repository: https://github.com/t3zrk/illustrator-text-layout-converter
 *
 * Reformat text lists inside Adobe Illustrator:
 * - Column -> Row
 * - Row -> Column
 * - Reflow into N balanced rows
 *
 * Works with selected text frames and text frames inside selected groups.
 */

(function IllustratorTextLayoutConverter() {
    var APP_NAME = "Illustrator Text Layout Converter";
    var VERSION = "2.0.0";

    if (!app.documents.length) {
        alert(APP_NAME + "\n\nOpen an Illustrator document before running the script.");
        return;
    }

    var selectionRef = app.activeDocument.selection;
    if (!selectionRef || !selectionRef.length) {
        alert(APP_NAME + "\n\nSelect one or more text frames or groups containing text.");
        return;
    }

    var frames = collectTextFrames(selectionRef);
    if (!frames.length) {
        alert(APP_NAME + "\n\nNo text frames were found in the current selection.");
        return;
    }

    var dialog = new Window("dialog", APP_NAME + "  v" + VERSION);
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];
    dialog.spacing = 10;
    dialog.margins = 16;

    var intro = dialog.add("group");
    intro.orientation = "column";
    intro.alignChildren = ["left", "top"];
    intro.add("statictext", undefined, "Reformat list-based text without rebuilding text frames manually.");
    intro.add("statictext", undefined, frames.length + " text frame" + (frames.length === 1 ? "" : "s") + " selected.");

    var modePanel = dialog.add("panel", undefined, "Conversion mode");
    modePanel.orientation = "column";
    modePanel.alignChildren = ["left", "top"];
    modePanel.margins = [12, 18, 12, 12];

    var colToRow = modePanel.add("radiobutton", undefined, "Column \u2192 Row");
    var rowToCol = modePanel.add("radiobutton", undefined, "Row \u2192 Column");
    var reflowRows = modePanel.add("radiobutton", undefined, "Reflow into N balanced rows");
    colToRow.value = true;

    var nGroup = modePanel.add("group");
    nGroup.orientation = "row";
    nGroup.add("statictext", undefined, "Number of rows:");
    var nInput = nGroup.add("edittext", undefined, "2");
    nInput.characters = 5;
    nInput.enabled = false;

    var parsingPanel = dialog.add("panel", undefined, "Parsing");
    parsingPanel.orientation = "column";
    parsingPanel.alignChildren = ["fill", "top"];
    parsingPanel.margins = [12, 18, 12, 12];

    var separatorGroup = parsingPanel.add("group");
    separatorGroup.orientation = "row";
    separatorGroup.add("statictext", undefined, "Input separator:");
    var separatorDropdown = separatorGroup.add("dropdownlist", undefined, [
        "Auto detect",
        "Line breaks",
        "Comma",
        "Semicolon",
        "Tab"
    ]);
    separatorDropdown.selection = 0;

    var outputGroup = parsingPanel.add("group");
    outputGroup.orientation = "row";
    outputGroup.add("statictext", undefined, "Items within a row:");
    var outputSeparator = outputGroup.add("edittext", undefined, ", ");
    outputSeparator.characters = 10;

    var trimWhitespace = parsingPanel.add("checkbox", undefined, "Trim surrounding whitespace");
    trimWhitespace.value = true;

    var ignoreEmpty = parsingPanel.add("checkbox", undefined, "Ignore empty items");
    ignoreEmpty.value = true;

    var statusPanel = dialog.add("panel", undefined, "Status");
    statusPanel.orientation = "column";
    statusPanel.alignChildren = ["left", "top"];
    statusPanel.margins = [12, 18, 12, 12];
    var statusText = statusPanel.add("statictext", undefined, "Ready to preview.");
    statusText.characters = 68;

    var buttons = dialog.add("group");
    buttons.alignment = "right";
    var previewButton = buttons.add("button", undefined, "Preview");
    buttons.add("button", undefined, "Cancel", { name: "cancel" });
    var convertButton = buttons.add("button", undefined, "Convert", { name: "ok" });

    colToRow.onClick = syncModeState;
    rowToCol.onClick = syncModeState;
    reflowRows.onClick = syncModeState;

    previewButton.onClick = function () {
        var options = readOptions();
        if (!options) {
            return;
        }

        var analysis = analyze(frames, options);
        statusText.text = buildStatus(analysis);
        showPreview(analysis, options);
    };

    convertButton.onClick = function () {
        var options = readOptions();
        if (!options) {
            return;
        }

        var analysis = analyze(frames, options);
        statusText.text = buildStatus(analysis);

        if (!analysis.changedFrames) {
            alert(APP_NAME + "\n\nNo changes are required with the current settings.");
            return;
        }

        var confirmation =
            APP_NAME + "\n\n" +
            "Apply changes to " + analysis.changedFrames + " text frame" +
            (analysis.changedFrames === 1 ? "" : "s") + "?\n\n" +
            "Detected items: " + analysis.totalItems + "\n" +
            "Changed frames: " + analysis.changedFrames + " of " + analysis.totalFrames;

        if (!confirm(confirmation)) {
            return;
        }

        var updatedFrames = 0;
        var failedFrames = 0;

        for (var i = 0; i < analysis.results.length; i++) {
            if (!analysis.results[i].changed) {
                continue;
            }

            try {
                analysis.results[i].frame.contents = analysis.results[i].output;
                updatedFrames++;
            } catch (error) {
                failedFrames++;
            }
        }

        dialog.close(1);

        var completionMessage =
            APP_NAME + "\n\n" +
            "Conversion complete.\n" +
            "Updated " + updatedFrames + " text frame" +
            (updatedFrames === 1 ? "." : "s.");

        if (failedFrames) {
            completionMessage +=
                "\n\n" + failedFrames + " frame" +
                (failedFrames === 1 ? " could" : "s could") +
                " not be updated. Check whether the artwork is locked or otherwise protected.";
        }

        alert(completionMessage);
    };

    syncModeState();
    dialog.center();
    dialog.show();

    function syncModeState() {
        nInput.enabled = reflowRows.value;
    }

    function readOptions() {
        var mode = "columnToRow";

        if (rowToCol.value) {
            mode = "rowToColumn";
        } else if (reflowRows.value) {
            mode = "reflowRows";
        }

        var requestedRows = 0;
        if (mode === "reflowRows") {
            requestedRows = parseInt(nInput.text, 10);

            if (isNaN(requestedRows) || requestedRows < 1 || requestedRows > 999) {
                alert("Enter a valid row count between 1 and 999.");
                nInput.active = true;
                return null;
            }
        }

        var separatorMode = separatorDropdown.selection ?
            separatorDropdown.selection.text : "Auto detect";

        return {
            mode: mode,
            requestedRows: requestedRows,
            separatorMode: separatorMode,
            outputSeparator: outputSeparator.text,
            trimWhitespace: trimWhitespace.value,
            ignoreEmpty: ignoreEmpty.value
        };
    }

    function analyze(textFrames, options) {
        var results = [];
        var totalItems = 0;
        var changedFrames = 0;

        for (var i = 0; i < textFrames.length; i++) {
            var input = textFrames[i].contents;
            var items = parseItems(input, options);
            var output = convertItems(items, options);
            var changed = output !== input;

            totalItems += items.length;
            if (changed) {
                changedFrames++;
            }

            results.push({
                frame: textFrames[i],
                input: input,
                output: output,
                items: items,
                changed: changed
            });
        }

        return {
            results: results,
            totalFrames: textFrames.length,
            totalItems: totalItems,
            changedFrames: changedFrames
        };
    }

    function parseItems(text, options) {
        var normalized = normalizeLineBreaks(text);
        var parts;

        if (options.separatorMode === "Line breaks") {
            parts = normalized.split("\r");
        } else if (options.separatorMode === "Comma") {
            parts = normalized.split(",");
        } else if (options.separatorMode === "Semicolon") {
            parts = normalized.split(";");
        } else if (options.separatorMode === "Tab") {
            parts = normalized.split("\t");
        } else {
            parts = normalized.split(/(?:\r+|\t+|,\s*|;\s*)/);
        }

        var items = [];

        for (var i = 0; i < parts.length; i++) {
            var item = options.trimWhitespace ? trimString(parts[i]) : parts[i];

            if (options.ignoreEmpty && item === "") {
                continue;
            }

            items.push(item);
        }

        return items;
    }

    function convertItems(items, options) {
        if (!items.length) {
            return "";
        }

        if (options.mode === "columnToRow") {
            return items.join(options.outputSeparator);
        }

        if (options.mode === "rowToColumn") {
            return items.join("\r");
        }

        return reflowIntoRows(items, options.requestedRows, options.outputSeparator);
    }

    function reflowIntoRows(items, requestedRows, separator) {
        var rowCount = requestedRows;
        if (rowCount > items.length && items.length) {
            rowCount = items.length;
        }

        var baseSize = Math.floor(items.length / rowCount);
        var remainder = items.length % rowCount;
        var cursor = 0;
        var rows = [];

        for (var rowIndex = 0; rowIndex < rowCount; rowIndex++) {
            var rowSize = baseSize + (rowIndex < remainder ? 1 : 0);
            var chunk = [];
            var end = cursor + rowSize;

            while (cursor < end && cursor < items.length) {
                chunk.push(items[cursor]);
                cursor++;
            }

            rows.push(chunk.join(separator));
        }

        return rows.join("\r");
    }

    function showPreview(analysis, options) {
        var first = analysis.results.length ? analysis.results[0] : null;
        var preview = new Window("dialog", APP_NAME + " \u2014 Preview");
        preview.orientation = "column";
        preview.alignChildren = ["fill", "top"];
        preview.spacing = 10;
        preview.margins = 16;

        preview.add(
            "statictext",
            undefined,
            buildStatus(analysis)
        );

        if (first) {
            preview.add("statictext", undefined, "First selected frame");

            var originalPanel = preview.add("panel", undefined, "Before");
            originalPanel.orientation = "column";
            originalPanel.alignChildren = ["fill", "fill"];
            originalPanel.margins = 10;
            var beforeField = originalPanel.add(
                "edittext",
                undefined,
                previewText(first.input),
                { multiline: true, scrolling: true }
            );
            beforeField.preferredSize = [520, 110];
            beforeField.enabled = false;

            var convertedPanel = preview.add("panel", undefined, "After");
            convertedPanel.orientation = "column";
            convertedPanel.alignChildren = ["fill", "fill"];
            convertedPanel.margins = 10;
            var afterField = convertedPanel.add(
                "edittext",
                undefined,
                previewText(first.output),
                { multiline: true, scrolling: true }
            );
            afterField.preferredSize = [520, 110];
            afterField.enabled = false;
        }

        var closeGroup = preview.add("group");
        closeGroup.alignment = "right";
        closeGroup.add("button", undefined, "Close", { name: "ok" });

        preview.center();
        preview.show();
    }

    function buildStatus(analysis) {
        return (
            analysis.totalItems + " item" + (analysis.totalItems === 1 ? "" : "s") +
            " detected across " +
            analysis.totalFrames + " frame" + (analysis.totalFrames === 1 ? "" : "s") +
            "; " +
            analysis.changedFrames + " frame" + (analysis.changedFrames === 1 ? "" : "s") +
            " would change."
        );
    }

    function previewText(value) {
        var text = value || "";
        var maxLength = 1800;

        if (text.length > maxLength) {
            return text.substring(0, maxLength) + "\r\u2026";
        }

        return text;
    }

    function collectTextFrames(selectionItems) {
        var found = [];

        for (var i = 0; i < selectionItems.length; i++) {
            collectFromItem(selectionItems[i], found);
        }

        return found;
    }

    function collectFromItem(item, found) {
        if (!item) {
            return;
        }

        if (item.typename === "TextFrame") {
            pushUnique(found, item);
            return;
        }

        if (item.typename === "GroupItem") {
            for (var i = 0; i < item.pageItems.length; i++) {
                collectFromItem(item.pageItems[i], found);
            }
        }
    }

    function pushUnique(array, item) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === item) {
                return;
            }
        }

        array.push(item);
    }

    function normalizeLineBreaks(value) {
        return String(value).replace(/\r\n/g, "\r").replace(/\n/g, "\r");
    }

    function trimString(value) {
        return String(value).replace(/^\s+|\s+$/g, "");
    }
})();
