const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '..', 'app.js');
let content = fs.readFileSync(appJsPath, 'utf8');

// Normalize line endings to LF
content = content.replace(/\r\n/g, '\n');

// Helper to replace content with start/end markers
function addMarkers(target, startMarker = '// @TEACHER_ONLY_START', endMarker = '// @TEACHER_ONLY_END') {
  const normTarget = target.replace(/\r\n/g, '\n');
  if (!content.includes(normTarget)) {
    console.error(`Target not found for marking: ${normTarget.substring(0, 100)}...`);
    process.exit(1);
  }
  content = content.replace(normTarget, `${startMarker}\n${normTarget}\n${endMarker}`);
}

// 1. Block 1: renderTeacherDashboard to saveAssignmentChanges
const b1Start = 'const renderTeacherDashboard = () => {';
const b1End = `  saveData();
  closeModal();
  renderTeacherDashboard();
};`;

const b1StartIdx = content.indexOf(b1Start);
const b1EndIdx = content.indexOf(b1End);

if (b1StartIdx === -1 || b1EndIdx === -1) {
  console.error(`Block 1 targets not found: start=${b1StartIdx}, end=${b1EndIdx}`);
  process.exit(1);
}

// Wrap Block 1
content = content.substring(0, b1StartIdx) + '// @TEACHER_ONLY_START\n' + content.substring(b1StartIdx, b1EndIdx + b1End.length) + '\n// @TEACHER_ONLY_END' + content.substring(b1EndIdx + b1End.length);

// 2. Block 2: openPortalUnsubmittedModal to playAlarmAudio
const b2Start = 'const openPortalUnsubmittedModal = () => {';
const b2End = `  } catch (e) {
    console.error("Audio API 미지원 브라우저:", e);
  }
};`;

const b2StartIdx = content.indexOf(b2Start);
const b2EndIdx = content.indexOf(b2End);

if (b2StartIdx === -1 || b2EndIdx === -1) {
  console.error(`Block 2 targets not found: start=${b2StartIdx}, end=${b2EndIdx}`);
  process.exit(1);
}

content = content.substring(0, b2StartIdx) + '// @TEACHER_ONLY_START\n' + content.substring(b2StartIdx, b2EndIdx + b2End.length) + '\n// @TEACHER_ONLY_END' + content.substring(b2EndIdx + b2End.length);

// 3. Block 3.1: saveTeacherPasscode to saveStudentPasscode
const b31Start = 'const saveTeacherPasscode = () => {';
const b31End = `  config.student_passcode = val;
  saveData();
  alert("🔒 학생용 공통 비밀번호가 성공적으로 변경되었습니다!");
};`;

const b31StartIdx = content.indexOf(b31Start);
const b31EndIdx = content.indexOf(b31End);

if (b31StartIdx === -1 || b31EndIdx === -1) {
  console.error(`Block 3.1 targets not found: start=${b31StartIdx}, end=${b31EndIdx}`);
  process.exit(1);
}

content = content.substring(0, b31StartIdx) + '// @TEACHER_ONLY_START\n' + content.substring(b31StartIdx, b31EndIdx + b31End.length) + '\n// @TEACHER_ONLY_END' + content.substring(b31EndIdx + b31End.length);

// 4. Block 3.2: loginAsTeacher to window.adjustTaskPoints
const b32Start = 'const loginAsTeacher = () => {';
const b32End = 'window.adjustTaskPoints = adjustTaskPoints;';

const b32StartIdx = content.indexOf(b32Start);
const b32EndIdx = content.indexOf(b32End);

if (b32StartIdx === -1 || b32EndIdx === -1) {
  console.error(`Block 3.2 targets not found: start=${b32StartIdx}, end=${b32EndIdx}`);
  process.exit(1);
}

content = content.substring(0, b32StartIdx) + '// @TEACHER_ONLY_START\n' + content.substring(b32StartIdx, b32EndIdx + b32End.length) + '\n// @TEACHER_ONLY_END' + content.substring(b32EndIdx + b32End.length);

// 5. Granular window exports in app.js
// 5.1 triggerGradeIconFileInput to removeGradeIcon
addMarkers(`window.triggerGradeIconFileInput = triggerGradeIconFileInput;
window.handleGradeIconUpload = handleGradeIconUpload;
window.removeGradeIcon = removeGradeIcon;`);

// 5.2 viewStudentPortalFromTeacher to saveStudentPasscode
addMarkers(`window.viewStudentPortalFromTeacher = viewStudentPortalFromTeacher;
window.saveTeacherPasscode = saveTeacherPasscode;
window.saveStudentPasscode = saveStudentPasscode;`);

// 5.3 promptTeacherLogin to resetDashboardDateToToday
addMarkers(`window.promptTeacherLogin = promptTeacherLogin;
window.openGradesBulkModal = openGradesBulkModal;
window.closeGradesBulkModal = closeGradesBulkModal;
window.submitBulkGrades = submitBulkGrades;
window.changeDashboardDate = changeDashboardDate;
window.resetDashboardDateToToday = resetDashboardDateToToday;`);

// 6. Block 4: openPickerModal to handleAlwaysOnTopChange
const b4Start = 'const openPickerModal = () => {';
const b4End = 'window.handleAlwaysOnTopChange = handleAlwaysOnTopChange;';

const b4StartIdx = content.indexOf(b4Start);
const b4EndIdx = content.indexOf(b4End);

if (b4StartIdx === -1 || b4EndIdx === -1) {
  console.error(`Block 4 targets not found: start=${b4StartIdx}, end=${b4EndIdx}`);
  process.exit(1);
}

content = content.substring(0, b4StartIdx) + '// @TEACHER_ONLY_START\n' + content.substring(b4StartIdx, b4EndIdx + b4End.length) + '\n// @TEACHER_ONLY_END' + content.substring(b4EndIdx + b4End.length);

// 7. Block 5: initAnnouncementEditor to initDetailAnnouncementEditor
const b5Start = 'const initAnnouncementEditor = () => {';
const b5End = `    // 붙여넣기 시 서식을 모두 지우고 일반 텍스트만 들어가도록 처리
    contentEl.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    });
  }
};`;

const b5StartIdx = content.indexOf(b5Start);
// Look for the end of initDetailAnnouncementEditor, which is b5End
const b5EndIdx = content.indexOf(b5End, b5StartIdx);

if (b5StartIdx === -1 || b5EndIdx === -1) {
  console.error(`Block 5 targets not found: start=${b5StartIdx}, end=${b5EndIdx}`);
  process.exit(1);
}

content = content.substring(0, b5StartIdx) + '// @TEACHER_ONLY_START\n' + content.substring(b5StartIdx, b5EndIdx + b5End.length) + '\n// @TEACHER_ONLY_END' + content.substring(b5EndIdx + b5End.length);

// 8. window.onload teacher-only initializations
addMarkers('  processAutoDeductions(); // 미제출 과제 자동 감점 실행');
addMarkers(`  initDailyRecordsTab();
  initAnnouncementEditor();
  initDetailAnnouncementEditor();`);
addMarkers(`  // 구글 드라이브 연동 초기화 및 자동 동기화
  if (currentSyncMode === 'gdrive') {
    initGoogleDriveSync();
  }`);

// Convert back to CRLF if the original file had it (optional, but let's keep LF as it's standard and works everywhere)
fs.writeFileSync(appJsPath, content, 'utf8');
console.log('Successfully added all teacher-only markers to app.js!');
