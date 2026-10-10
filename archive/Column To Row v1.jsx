//@target illustrator

var doc = app.activeDocument;
if (!doc || !app.selection.length || app.selection[0].typename !== 'TextFrame') {
  alert("Please select a single point or area text frame.");
  exit();
}

var tf = app.selection[0];

// === Build UI ===
var dlg = new Window('dialog', 'Column ↔ Row Converter');
dlg.orientation = 'column';
dlg.alignChildren = 'fill';

var modeGroup = dlg.add('group');
modeGroup.orientation = 'column';
modeGroup.alignChildren = 'left';

var colToRow = modeGroup.add('radiobutton', undefined, 'Column → Row');
var rowToCol = modeGroup.add('radiobutton', undefined, 'Row → Column');
var rowToN = modeGroup.add('radiobutton', undefined, 'Split into N rows:');

var nGroup = dlg.add('group');
nGroup.add('statictext', undefined, 'Number of rows:');
var nInput = nGroup.add('edittext', undefined, '2');
nInput.characters = 4;
nInput.enabled = false;

// Enable input only for N-rows mode
rowToN.onClick = function() { nInput.enabled = true; }
colToRow.onClick = function() { nInput.enabled = false; }
rowToCol.onClick = function() { nInput.enabled = false; }

// Buttons
var btns = dlg.add('group');
btns.alignment = 'center';
btns.add('button', undefined, 'Cancel', {name: 'cancel'});
btns.add('button', undefined, 'OK', {name: 'ok'});

// === Main logic ===
if (dlg.show() !== 1) exit(); // Cancelled

var text = tf.contents;

// Illustrator uses \r for line breaks. Split manually.
var rawLines = text.split('\r');
var lines = [];
for (var i = 0; i < rawLines.length; i++) {
  if (rawLines[i] !== '') lines.push(rawLines[i]);
}

var result = '';

if (colToRow.value) {
  // Convert column to single row
  result = lines.join(', ');
}
else if (rowToCol.value) {
  // Convert comma row to column
  var items = text.split(/,\s*/);
  result = items.join('\r');
}
else {
  // Split into N rows
  var N = parseInt(nInput.text, 10);
  if (isNaN(N) || N < 1) {
    alert("Please enter a valid number of rows (≥ 1)");
    exit();
  }

  // Flatten items (handles both comma and line-based)
  var items = (text.indexOf(',') > -1) ? text.split(/,\s*/) : lines;

  var perRow = Math.ceil(items.length / N);
  var rows = [];

  for (var r = 0; r < N; r++) {
    var chunk = items.slice(r * perRow, r * perRow + perRow);
    if (chunk.length) rows.push(chunk.join(', '));
  }

  result = rows.join('\r');
}

// Update the text frame
tf.contents = result;
