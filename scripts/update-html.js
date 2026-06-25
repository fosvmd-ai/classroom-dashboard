const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// Normalize line endings to LF
content = content.replace(/\r\n/g, '\n');

// 1. Replace the inline handlers in index.html
const replacements = [
  {
    target: 'onclick="loginAsTeacher()"',
    replacement: 'onclick="handleTeacherLoginClick()"'
  },
  {
    target: 'onclick="loginLocalBypass()"',
    replacement: 'onclick="handleTeacherLocalBypassClick()"'
  },
  {
    target: 'onclick="toggleLandingSettings()"',
    replacement: 'onclick="handleTeacherToggleLandingSettingsClick()"'
  },
  {
    target: 'onchange="changeLandingSyncMode(this.value)"',
    replacement: 'onchange="handleTeacherChangeLandingSyncModeClick(this.value)"'
  },
  {
    target: 'onclick="saveLandingSettings()"',
    replacement: 'onclick="handleTeacherSaveLandingSettingsClick()"'
  }
];

replacements.forEach(r => {
  if (!content.includes(r.target)) {
    console.error(`Target not found in index.html: ${r.target}`);
    process.exit(1);
  }
  content = content.replace(r.target, r.replacement);
});

// 2. Replace the script tag at the bottom
const scriptTarget = '<script src="app.js?v=1.0.25" defer></script>';
const scriptReplacement = `<!-- 동적 스크립트 로더 및 교사용 기능 동적 승격 프록시 -->
  <script>
    (function() {
      // 1. 환경 감지
      var isElectron = typeof process !== 'undefined' && process.versions && process.versions.electron;
      var hash = window.location.hash || '';
      var query = window.location.search || '';
      
      var isStudentPath = hash.startsWith('#student/') || hash === '#student-login';
      var hasStudentParams = query.includes('syncKey=') || query.includes('dbUrl=');
      
      var isTeacherLoggedIn = false;
      try {
        isTeacherLoggedIn = !!localStorage.getItem('teacher_passcode') || !!localStorage.getItem('fb_teacher_uid');
      } catch (e) {}

      // 교사 로그인/설정 펜딩 플래그 확인
      var isTeacherPending = localStorage.getItem('teacher_login_pending') || localStorage.getItem('teacher_settings_pending');

      // 2. 초기 로드 스크립트 결정
      // Electron 앱이거나, 강제로 교사 페이지(#teacher)를 보려 하거나, 펜딩 플래그가 있거나, 이미 교사 로그인이 저장되어 있고 학생 페이지가 아닐 때만 app.js 로드
      var loadTeacherScript = isElectron || hash.startsWith('#teacher') || isTeacherPending || (isTeacherLoggedIn && !isStudentPath);
      
      window.__loadedScriptType = loadTeacherScript ? 'teacher' : 'student';
      var scriptSrc = loadTeacherScript ? 'app.js?v=1.0.25' : 'student.js?v=1.0.25';

      console.log('[Dashboard] 로드할 스크립트 타입:', window.__loadedScriptType, '->', scriptSrc);

      var script = document.createElement('script');
      script.src = scriptSrc;
      script.defer = true;
      document.body.appendChild(script);

      // 3. hashchange 이벤트 리스너를 추가하여, hash가 #teacher로 바뀌면 즉시 새로고침하여 app.js 로딩 보장
      window.addEventListener('hashchange', function() {
        var currentHash = window.location.hash || '';
        if (currentHash.startsWith('#teacher') && window.__loadedScriptType !== 'teacher') {
          location.reload();
        }
      });
    })();

    // 4. index.html의 인라인 이벤트 핸들러용 교사 로그인/설정 진입 프록시 함수들
    function handleTeacherLoginClick() {
      localStorage.setItem('teacher_login_pending', 'google');
      if (window.location.hash !== '#teacher') {
        window.location.hash = '#teacher';
      }
      location.reload();
    }

    function handleTeacherLocalBypassClick() {
      localStorage.setItem('teacher_login_pending', 'local');
      if (window.location.hash !== '#teacher') {
        window.location.hash = '#teacher';
      }
      location.reload();
    }

    function handleTeacherToggleLandingSettingsClick() {
      localStorage.setItem('teacher_settings_pending', 'true');
      if (window.location.hash !== '#teacher') {
        window.location.hash = '#teacher';
      }
      location.reload();
    }

    function handleTeacherChangeLandingSyncModeClick(val) {
      if (window.__loadedScriptType === 'teacher' && typeof changeLandingSyncMode === 'function') {
        changeLandingSyncMode(val);
      }
    }

    function handleTeacherSaveLandingSettingsClick() {
      if (window.__loadedScriptType === 'teacher' && typeof saveLandingSettings === 'function') {
        saveLandingSettings();
      }
    }
  </script>`;

if (!content.includes(scriptTarget)) {
  console.error(`Script tag not found in index.html: ${scriptTarget}`);
  process.exit(1);
}
content = content.replace(scriptTarget, scriptReplacement);

fs.writeFileSync(htmlPath, content, 'utf8');
console.log('Successfully updated index.html with dynamic loader and wrappers!');
