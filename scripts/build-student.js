const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'app.js');
const studentJsPath = path.join(__dirname, '..', 'student.js');

if (!fs.existsSync(appJsPath)) {
  console.error('Error: app.js does not exist.');
  process.exit(1);
}

console.log('[Build] Parsing app.js to generate student.js...');
const code = fs.readFileSync(appJsPath, 'utf8');
const lines = code.split('\n');

const outputLines = [];
let inTeacherSection = false;
let strippedLinesCount = 0;

for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed === '// @TEACHER_ONLY_START') {
    inTeacherSection = true;
    continue;
  }
  if (trimmed === '// @TEACHER_ONLY_END') {
    inTeacherSection = false;
    continue;
  }
  if (!inTeacherSection) {
    outputLines.push(line);
  } else {
    strippedLinesCount++;
  }
}

// Write generated file
fs.writeFileSync(studentJsPath, outputLines.join('\n'), 'utf8');

const originalSizeKb = (fs.statSync(appJsPath).size / 1024).toFixed(1);
const studentSizeKb = (fs.statSync(studentJsPath).size / 1024).toFixed(1);

console.log(`[Build] Successfully generated student.js!`);
console.log(`[Build] Stripped ${strippedLinesCount} lines of teacher-only code.`);
console.log(`[Build] File sizes: app.js = ${originalSizeKb} KB | student.js = ${studentSizeKb} KB`);
