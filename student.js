// ==========================================================================
// 1. 초기 데이터 및 State Management (LocalStorage)
// ==========================================================================

const DEFAULT_STUDENTS = [
  { student_id: "01", name: "김도윤", total_points: 105 },
  { student_id: "02", name: "이지우", total_points: 85 },
  { student_id: "03", name: "박서준", total_points: 55 },
  { student_id: "04", name: "김민서", total_points: 120 },
  { student_id: "05", name: "이하준", total_points: 95 },
  { student_id: "06", name: "서아윤", total_points: 40 },
  { student_id: "07", name: "최도현", total_points: 75 },
  { student_id: "08", name: "한지아", total_points: 110 },
  { student_id: "09", name: "정우진", total_points: 25 },
  { student_id: "10", name: "윤서연", total_points: 90 },
  { student_id: "11", name: "임건우", total_points: 65 },
  { student_id: "12", name: "오하은", total_points: 115 },
  { student_id: "13", name: "송민재", total_points: 50 },
  { student_id: "14", name: "신유나", total_points: 80 },
  { student_id: "15", name: "황준우", total_points: 130 },
  { student_id: "16", name: "안수빈", total_points: 70 },
  { student_id: "17", name: "전시우", total_points: 35 },
  { student_id: "18", name: "유다은", total_points: 100 },
  { student_id: "19", name: "조현우", total_points: 60 },
  { student_id: "20", name: "배서현", total_points: 85 }
];

const DEFAULT_GRADES = [
  { name: "신용 새싹 🌱", min_points: 0, emoji: "🌱", icon: "" },
  { name: "신용 일반 🥈", min_points: 30, emoji: "🥈", icon: "" },
  { name: "신용 우수 🥇", min_points: 60, emoji: "🥇", icon: "" },
  { name: "신용 최우수 💎", min_points: 90, emoji: "💎", icon: "" },
  { name: "신용 장인 👑", min_points: 120, emoji: "👑", icon: "" }
];

// 이모지 프리셋 목록
const EMOJI_PRESETS = [
  "🌱", "🌿", "🍀", "🌸", "🥉", "🥈", "🥇", "💎", "👑", "🛡️", 
  "🏆", "⭐", "🌟", "🔥", "❤️", "🔔", "🚀", "🎓", "🦁", "🧸"
];

// 시간/날짜 도출 함수
// 시간/날짜 도출 함수
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

// 날짜 포맷팅 헬퍼 (예: 2026-06-15 -> 2026년 6월 15일 (월요일))
const formatKoreanDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  const d = new Date(year, month - 1, day);
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayOfWeek = weekdays[d.getDay()];
  
  return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
};

// 기본 데이터 로드
let students = JSON.parse(localStorage.getItem('students')) || DEFAULT_STUDENTS;
let grades = JSON.parse(localStorage.getItem('grades')) || DEFAULT_GRADES;
let dailyLogs = JSON.parse(localStorage.getItem('dailyLogs')) || {};
let pointHistory = JSON.parse(localStorage.getItem('pointHistory')) || [];
let config = JSON.parse(localStorage.getItem('config')) || {
  today_announcement: "금요일 수학 3단원 단원평가 준비물(자, 연필, 지우개) 챙기기!\n주제 글쓰기 주제는 '내가 좋아하는 계절'입니다.",
  student_passcode: ""
};
if (config.student_passcode === undefined) {
  config.student_passcode = "";
}
if (config.gridColumns === undefined) {
  config.gridColumns = 7;
}
if (config.auto_deduction_enabled === undefined) {
  config.auto_deduction_enabled = true;
}

// 날짜별 알림장 데이터 로드 및 마이그레이션
let dailyAnnouncements = JSON.parse(localStorage.getItem('dailyAnnouncements')) || {};
let currentAnnouncementDate = getTodayDateString();
let currentPortalAnnouncementDate = getTodayDateString();

if (Object.keys(dailyAnnouncements).length === 0 && config.today_announcement) {
  dailyAnnouncements[getTodayDateString()] = config.today_announcement;
}

// [개선] 날짜별 과제 설정을 별도 보관하는 스토리지 로드
let dailyAssignments = JSON.parse(localStorage.getItem('dailyAssignments')) || {};
let pendingRequests = JSON.parse(localStorage.getItem('pendingRequests')) || {};
let absentLogs = JSON.parse(localStorage.getItem('absentLogs')) || {};
let processedDeductionDates = JSON.parse(localStorage.getItem('processedDeductionDates')) || [];
let teacherPasscode = localStorage.getItem('teacherPasscode') || '1234';
let googleClientId = localStorage.getItem('googleClientId') || '1010660265980-1dj6r5h1f3ls8ln0bmjrf5u3s9qjcekg.apps.googleusercontent.com';
let googleAccessToken = localStorage.getItem('googleAccessToken') || '';
let googleDriveFileId = localStorage.getItem('googleDriveFileId') || '';
let googleUserProfile = JSON.parse(localStorage.getItem('googleUserProfile')) || null;
let currentSyncMode = localStorage.getItem('currentSyncMode') || 'local';
const defaultFirebaseConfig = {
  apiKey: "AIzaSyAF8DShxXRK1O88Bm5I-c9TWT0Z5EvT5k4",
  projectId: "gen-lang-client-0447859342",
  authDomain: "gen-lang-client-0447859342.firebaseapp.com",
  databaseURL: "https://gen-lang-client-0447859342-default-rtdb.firebaseio.com/"
};
let firebaseConfig = JSON.parse(localStorage.getItem('firebaseConfig')) || defaultFirebaseConfig;
if (firebaseConfig) {
  if (firebaseConfig.apiKey === "AIzaSyAF8DShxXRK1088Bm5I-c9TWT0Z5EvT5k4") {
    firebaseConfig.apiKey = defaultFirebaseConfig.apiKey;
  }
  if (!firebaseConfig.authDomain && firebaseConfig.projectId) {
    firebaseConfig.authDomain = firebaseConfig.projectId + ".firebaseapp.com";
  }
  localStorage.setItem('firebaseConfig', JSON.stringify(firebaseConfig));
}
let dbRef = null;
let firebaseUser = JSON.parse(localStorage.getItem('firebaseUser')) || null;
let isSyncingFromRemote = false;
let isFirebaseDataLoaded = false;
let hasAttemptedInitialization = false;
let referrerView = "login";
let currentDashboardDate = getTodayDateString();
let currentDashboardViewMode = "students";

// 초기 구동 데이터 마이그레이션 (하위 호환 및 오늘 날짜 디폴트 과제 할당)
const initDatabaseMigration = () => {
  const todayStr = getTodayDateString();
  
  // dailyAssignments가 비어있다면 오늘 날짜에 디폴트 3개 과제 강제 세팅
  if (Object.keys(dailyAssignments).length === 0) {
    dailyAssignments[todayStr] = [
      { id: "task_1", name: "📐 수학 익힘책", points: 3 },
      { id: "task_2", name: "📖 주제 글쓰기", points: 3 },
      { id: "task_3", name: "🗺️ 사회 학습지", points: 3 }
    ];
    
    // 로그 초기화
    if (!dailyLogs[todayStr]) {
      dailyLogs[todayStr] = {};
      students.forEach(s => {
        dailyLogs[todayStr][s.student_id] = { task_1: false, task_2: false, task_3: false };
      });
    }
  }

  // 예시 히스토리가 비어있다면 1회 생성
  if (pointHistory.length === 0) {
    const reasons = ["📐 수학 익힘책 완료 적립", "📖 주제 글쓰기 완료 적립", "🗺️ 사회 학습지 완료 적립"];
    const now = new Date();
    students.forEach(s => {
      const s_val = parseInt(s.student_id);
      if (s_val % 4 === 0) {
        const timestamp = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        pointHistory.push({
          student_id: s.student_id,
          timestamp: timestamp.toISOString(),
          points_changed: 3,
          reason: reasons[0]
        });
      }
    });
  }
  saveData();
};

const saveData = (skipFirebase = false) => {
  localStorage.setItem('students', JSON.stringify(students));
  localStorage.setItem('grades', JSON.stringify(grades));
  localStorage.setItem('dailyLogs', JSON.stringify(dailyLogs));
  localStorage.setItem('pointHistory', JSON.stringify(pointHistory));
  localStorage.setItem('config', JSON.stringify(config));
  localStorage.setItem('dailyAssignments', JSON.stringify(dailyAssignments));
  localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests));
  localStorage.setItem('absentLogs', JSON.stringify(absentLogs));
  localStorage.setItem('processedDeductionDates', JSON.stringify(processedDeductionDates));
  localStorage.setItem('teacherPasscode', String(teacherPasscode));
  localStorage.setItem('dailyAnnouncements', JSON.stringify(dailyAnnouncements));

  if (skipFirebase) return; // 로컬만 저장하고 파이어베이스 동기화 건너뜀
  if (isSyncingFromRemote) return;

  // 보안 필터: 교사이거나, 과제 권한이 허용된 학생이거나, 학생 포털에서 본인의 정보(출석체크 등)를 변경하는 경우 허용
  let isAllowedToSave = isTeacherAuthenticated();
  if (!isAllowedToSave) {
    const hash = window.location.hash;
    if (hash.startsWith('#student/')) {
      const studentId = hash.replace('#student/', '');
      const student = students.find(s => s.student_id === studentId);
      if (student) {
        isAllowedToSave = true;
      }
    }
  }

  if (!isAllowedToSave) {
    console.log("[Sync Security] 비인증 기기 및 권한 없는 학생의 전체 원격 저장 차단");
    return;
  }

  // 구글 드라이브 동기화 모드
  if (currentSyncMode === 'gdrive' && googleAccessToken && googleDriveFileId) {
    uploadGoogleDriveBackupFile(googleDriveFileId).catch(err => {
      console.error("[Google Drive] 백그라운드 자동 업로드 실패:", err);
      if (!googleAccessToken) {
        updateSyncStatusUI();
      }
    });
  }

  // 파이어베이스 동기화 모드
  if (currentSyncMode === 'firebase' && dbRef) {
    // 동시성 개선: set 대신 update를 사용하고 pendingRequests는 학생 개별 업로드로만 제어하여 덮어쓰기 방지
    dbRef.update({
      students,
      grades,
      dailyLogs,
      pointHistory,
      config,
      dailyAssignments,
      absentLogs,
      processedDeductionDates,
      teacherPasscode,
      dailyAnnouncements
    }).catch(err => {
      console.error("[Firebase] 백그라운드 자동 업로드 실패:", err);
      // 교사 화면인 경우 알림창 표시 (권한 거부 또는 연결 실패 인지 유도)
      if (isTeacherAuthenticated()) {
        const errStr = err.message || '';
        if (errStr.includes('permission_denied') || errStr.toLowerCase().includes('permission denied')) {
          alert("⚠️ [서버 저장 실패] 데이터베이스 쓰기 권한이 거부되었습니다 (Permission Denied).\n\n파이어베이스 규칙(Rules) 탭에서 \".write\": true 로 규칙을 변경했는지 확인해 주시거나, 교사 설정 탭에서 구글 로그인을 진행해 주세요.");
        } else {
          alert("⚠️ [서버 저장 실패] " + err.message);
        }
      }
    });
  }
}

// URL 파라미터 파싱을 통해 구글 클라이언트 ID 자동 주입 (연동 링크 대응)
const parseUrlParams = () => {
  let searchStr = window.location.search;
  
  if (!searchStr) {
    const urlParts = window.location.href.split('?');
    if (urlParts.length > 1) {
      searchStr = '?' + urlParts[1];
    }
  }
  
  if (searchStr) {
    const cleanSearchStr = searchStr.split('#')[0];
    const searchParams = new URLSearchParams(cleanSearchStr);
    
    // 구글 클라이언트 ID 파싱
    const clientId = searchParams.get('gClientId');
    if (clientId) {
      localStorage.setItem('googleClientId', clientId);
      googleClientId = clientId;
      localStorage.setItem('currentSyncMode', 'gdrive');
      currentSyncMode = 'gdrive';
      
      // const cleanHash = window.location.hash.split('?')[0];
      // window.history.replaceState({}, document.title, window.location.pathname + cleanHash);
      return;
    }

    // 파이어베이스 설정 파싱
    const dbUrl = searchParams.get('dbUrl');
    const apiKey = searchParams.get('apiKey');
    const projId = searchParams.get('projId');
    const syncKey = searchParams.get('syncKey');
    
    if (dbUrl) {
      const configObj = {
        databaseURL: dbUrl,
        apiKey: apiKey || '',
        projectId: projId || '',
        authDomain: projId ? (projId + ".firebaseapp.com") : '',
        classroomSyncKey: syncKey || ''
      };
      localStorage.setItem('firebaseConfig', JSON.stringify(configObj));
      firebaseConfig = configObj;
      localStorage.setItem('currentSyncMode', 'firebase');
      currentSyncMode = 'firebase';
      
      // const cleanHash = window.location.hash.split('?')[0];
      // window.history.replaceState({}, document.title, window.location.pathname + cleanHash);
    } else if (syncKey) {
      // dbUrl이 없고 syncKey만 파라미터로 넘어온 경우 -> 공용 파이어베이스(defaultFirebaseConfig)를 활용해 연동
      const configObj = {
        databaseURL: defaultFirebaseConfig.databaseURL,
        apiKey: defaultFirebaseConfig.apiKey,
        projectId: defaultFirebaseConfig.projectId,
        authDomain: defaultFirebaseConfig.projectId + ".firebaseapp.com",
        classroomSyncKey: syncKey
      };
      localStorage.setItem('firebaseConfig', JSON.stringify(configObj));
      firebaseConfig = configObj;
      localStorage.setItem('currentSyncMode', 'firebase');
      currentSyncMode = 'firebase';
    }
  }
};

const changeSyncMode = (mode) => {
  localStorage.setItem('currentSyncMode', mode);
  currentSyncMode = mode;
  alert(`동기화 모드가 변경되었습니다: ${mode === 'local' ? '로컬 오프라인' : mode === 'gdrive' ? '구글 드라이브' : '파이어베이스'}\n반영을 위해 페이지를 새로고침합니다.`);
  location.reload();
};


// 구글 드라이브 & 파이어베이스 연동 상태 UI 업데이트
const updateSyncStatusUI = () => {
  const statusBadge = document.getElementById('sync-status-badge');
  const statusText = document.getElementById('sync-status-text');
  const btnHeaderSync = document.getElementById('btn-header-sync');
  
  const headerIndicator = document.querySelector('.server-badge .status-indicator');
  const headerIpAddress = document.getElementById('ip-address');
  
  if (headerIndicator && headerIpAddress) {
    if (currentSyncMode === 'firebase') {
      if (dbRef) {
        headerIndicator.className = 'status-indicator online';
        headerIpAddress.innerText = '실시간 동기화 중';
      } else {
        headerIndicator.className = 'status-indicator waiting';
        headerIpAddress.innerText = '파이어베이스 대기';
      }
    } else if (currentSyncMode === 'gdrive') {
      if (googleAccessToken) {
        headerIndicator.className = 'status-indicator online';
        headerIpAddress.innerText = '드라이브 동기화 중';
      } else {
        headerIndicator.className = 'status-indicator waiting';
        headerIpAddress.innerText = '드라이브 대기';
      }
    } else {
      headerIndicator.className = 'status-indicator local';
      headerIpAddress.innerText = '로컬 작동 중 (오프라인)';
    }
  }
  
  // 동기화 모드 셀렉터 동기화
  const modeSelector = document.getElementById('sync-mode-selector');
  if (modeSelector) {
    modeSelector.value = currentSyncMode;
  }
  
  // 모드별 설정 카드 노출/비노출 제어
  const gdriveCard = document.getElementById('gdrive-config-card');
  const firebaseCard = document.getElementById('firebase-config-card');
  if (gdriveCard && firebaseCard) {
    if (currentSyncMode === 'gdrive') {
      gdriveCard.classList.remove('hidden');
      firebaseCard.classList.add('hidden');
    } else if (currentSyncMode === 'firebase') {
      firebaseCard.classList.remove('hidden');
      gdriveCard.classList.add('hidden');
    } else {
      gdriveCard.classList.add('hidden');
      firebaseCard.classList.add('hidden');
    }
  }

  // 1. 구글 드라이브 카드 값 설정
  const inputClientId = document.getElementById('gdrive-client-id');
  if (inputClientId) {
    inputClientId.value = googleClientId || '';
  }
  
  const gdriveDisconnectBtn = document.getElementById('btn-gdrive-disconnect');
  const profileContainer = document.getElementById('google-drive-user-profile');
  const stateDesc = document.getElementById('google-drive-state-desc');

  // 2. 파이어베이스 카드 값 설정
  const fbUrlInput = document.getElementById('fb-db-url');
  const fbApiKeyInput = document.getElementById('fb-api-key');
  const fbProjIdInput = document.getElementById('fb-project-id');
  const fbSyncKeyInput = document.getElementById('fb-sync-key');
  
  if (firebaseConfig) {
    const isDefault = (firebaseConfig.databaseURL === defaultFirebaseConfig.databaseURL);
    if (fbUrlInput) {
      fbUrlInput.value = isDefault ? '' : (firebaseConfig.databaseURL || '');
      fbUrlInput.placeholder = isDefault ? '(기본 제공 공유 서버 사용 중)' : 'https://your-project.firebaseio.com';
    }
    if (fbApiKeyInput) {
      fbApiKeyInput.value = isDefault ? '' : (firebaseConfig.apiKey || '');
      fbApiKeyInput.placeholder = isDefault ? '(기본 공유 API Key 사용 중)' : 'AIzaSy...';
    }
    if (fbProjIdInput) {
      fbProjIdInput.value = isDefault ? '' : (firebaseConfig.projectId || '');
      fbProjIdInput.placeholder = isDefault ? '(기본 공유 Project ID 사용 중)' : 'my-project';
    }
    if (fbSyncKeyInput) {
      fbSyncKeyInput.value = firebaseConfig.classroomSyncKey || '';
    }
  }

  const fbDisconnectBtn = document.getElementById('btn-fb-disconnect');
  const fbProfileContainer = document.getElementById('firebase-user-profile');

  // 모드별 연동 상태 배지 표시 및 헤더/프로필 UI 제어
  if (currentSyncMode === 'gdrive') {
    if (googleClientId) {
      if (googleAccessToken) {
        if (statusBadge) statusBadge.className = 'sync-status-badge badge-online';
        if (statusText) statusText.innerText = '구글 드라이브 동기화 활성화됨';
        if (gdriveDisconnectBtn) gdriveDisconnectBtn.classList.remove('hidden');
        if (btnHeaderSync) btnHeaderSync.style.display = 'inline-flex';
        
        if (profileContainer && googleUserProfile) {
          const photoURL = googleUserProfile.photoURL || 'https://www.gstatic.com/images/branding/product/2x/avatar_square_blue_120dp.png';
          profileContainer.innerHTML = `
            <img src="${photoURL}" class="google-profile-img" alt="Google Profile" style="width:36px; height:36px; border-radius:50%; object-fit:cover;">
            <div class="google-user-info-text">
              <span class="google-user-name">${googleUserProfile.displayName || '선생님'}</span>
              <span class="google-user-email">${googleUserProfile.email || ''}</span>
            </div>
            <button onclick="logoutGoogleDrive()" style="padding: 6px 12px; font-size: 12px; font-weight: bold; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-main); cursor: pointer; transition: var(--transition-smooth);">
              ❌ 로그아웃
            </button>
          `;
        }
        if (stateDesc) stateDesc.innerText = "구글 계정과 연동되어 구글 드라이브에 백업 파일이 자동으로 동기화됩니다.";
      } else {
        if (statusBadge) statusBadge.className = 'sync-status-badge badge-offline';
        if (statusText) statusText.innerText = '구글 로그인 대기 중';
        if (gdriveDisconnectBtn) gdriveDisconnectBtn.classList.remove('hidden');
        if (btnHeaderSync) btnHeaderSync.style.display = 'none';
        
        if (profileContainer) {
          profileContainer.innerHTML = `
            <button id="btn-gdrive-login" onclick="loginWithGoogleDrive()" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid #dadce0; border-radius: 4px; background: white; color: #3c4043; font-size: 14px; font-weight: bold; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: var(--transition-smooth);">
              Google 계정 연동 및 로그인
            </button>
          `;
        }
        if (stateDesc) stateDesc.innerText = "Google Client ID가 올바릅니다. 구글 계정을 연동해 주세요.";
      }
    } else {
      if (statusBadge) statusBadge.className = 'sync-status-badge badge-offline';
      if (statusText) statusText.innerText = '구글 설정 미완료';
      if (gdriveDisconnectBtn) gdriveDisconnectBtn.classList.add('hidden');
      if (btnHeaderSync) btnHeaderSync.style.display = 'none';
      if (profileContainer) {
        profileContainer.innerHTML = `<span style="font-size: 13px; color: var(--text-muted); font-weight: bold;">⚠️ 먼저 구글 Client ID 설정을 완료해 주세요.</span>`;
      }
      if (stateDesc) stateDesc.innerText = "구글 드라이브 연동을 위해 발급받은 Google Client ID가 필요합니다.";
    }
  } else if (currentSyncMode === 'firebase') {
    if (firebaseConfig && firebaseConfig.databaseURL) {
      if (dbRef) {
        if (statusBadge) statusBadge.className = 'sync-status-badge badge-online';
        if (statusText) {
          const syncKeyDisplay = firebaseConfig.classroomSyncKey || '설정 미완료';
          statusText.innerText = `파이어베이스 실시간 동기화 중 (연동 키: ${syncKeyDisplay})`;
        }
        if (fbDisconnectBtn) fbDisconnectBtn.classList.remove('hidden');
        if (btnHeaderSync) btnHeaderSync.style.display = 'none';
        
        if (fbProfileContainer && firebaseUser) {
          const photoURL = firebaseUser.photoURL || 'https://www.gstatic.com/images/branding/product/2x/avatar_square_blue_120dp.png';
          fbProfileContainer.innerHTML = `
            <img src="${photoURL}" class="google-profile-img" alt="Google Profile" style="width:36px; height:36px; border-radius:50%; object-fit:cover;">
            <div class="google-user-info-text">
              <span class="google-user-name">${firebaseUser.displayName || '선생님'}</span>
              <span class="google-user-email">${firebaseUser.email || ''}</span>
            </div>
            <button onclick="logoutFirebaseGoogle()" style="padding: 6px 12px; font-size: 12px; font-weight: bold; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-card); color: var(--text-main); cursor: pointer; transition: var(--transition-smooth);">
              ❌ 로그아웃
            </button>
          `;
        }
      } else {
        if (statusBadge) statusBadge.className = 'sync-status-badge badge-offline';
        if (statusText) statusText.innerText = '파이어베이스 연결 대기 중...';
        if (fbDisconnectBtn) fbDisconnectBtn.classList.remove('hidden');
        if (btnHeaderSync) btnHeaderSync.style.display = 'none';
        
        if (fbProfileContainer) {
          fbProfileContainer.innerHTML = `
            <button id="btn-fb-google-login" onclick="loginWithFirebaseGoogle()" style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; border: 1px solid #dadce0; border-radius: 4px; background: white; color: #3c4043; font-size: 13px; font-weight: bold; cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
              구글 계정으로 연동하기
            </button>
          `;
        }
      }
    } else {
      if (statusBadge) statusBadge.className = 'sync-status-badge badge-offline';
      if (statusText) statusText.innerText = '파이어베이스 설정 미완료';
      if (fbDisconnectBtn) fbDisconnectBtn.classList.add('hidden');
      if (btnHeaderSync) btnHeaderSync.style.display = 'none';
      if (fbProfileContainer) {
        fbProfileContainer.innerHTML = `<span style="font-size: 13px; color: var(--text-muted); font-weight: bold;">⚠️ 먼저 파이어베이스 설정을 저장해 주세요.</span>`;
      }
    }
  } else {
    // 로컬 전용 모드
    if (statusBadge) statusBadge.className = 'sync-status-badge badge-offline';
    if (statusText) statusText.innerText = '로컬 모드로 작동 중 (오프라인)';
    if (btnHeaderSync) btnHeaderSync.style.display = 'none';
  }

  // 교사 헤더 프로필 뱃지 및 로그아웃 버튼 제어
  const teacherProfileBadge = document.getElementById('teacher-profile-badge');
  const teacherProfileName = document.getElementById('teacher-profile-name');
  if (teacherProfileBadge && teacherProfileName) {
    if (isTeacherAuthenticated()) {
      teacherProfileBadge.style.display = 'inline-flex';
      if (currentSyncMode === 'firebase' && firebaseUser) {
        teacherProfileName.innerText = `${firebaseUser.displayName || '교사'} 선생님`;
      } else if (googleUserProfile) {
        teacherProfileName.innerText = `${googleUserProfile.displayName || '교사'} 선생님`;
      } else {
        teacherProfileName.innerText = '교사 (로컬)';
      }
    } else {
      teacherProfileBadge.style.display = 'none';
    }
  }

  // 랜딩 페이지 교사용 바로가기 제어
  const btnLandingTeacherLogin = document.getElementById('btn-landing-teacher-login');
  const btnLandingTeacherBypass = document.getElementById('btn-landing-teacher-bypass');
  const btnLandingGoDashboard = document.getElementById('btn-landing-go-dashboard');
  if (btnLandingTeacherLogin && btnLandingTeacherBypass && btnLandingGoDashboard) {
    if (isTeacherAuthenticated()) {
      btnLandingTeacherLogin.classList.add('hidden');
      btnLandingTeacherBypass.classList.add('hidden');
      btnLandingGoDashboard.classList.remove('hidden');
    } else {
      btnLandingTeacherLogin.classList.remove('hidden');
      btnLandingTeacherBypass.classList.remove('hidden');
      btnLandingGoDashboard.classList.add('hidden');
    }
  }
};

// 원격 데이터 수신 및 로컬 상태 적용
const applyRemoteData = (data) => {
  if (!data) return;
  
  isFirebaseDataLoaded = true;
  isSyncingFromRemote = true;

  // 캐시 기반 임시 표시 중이었다면 배너 제거
  window.__showingCachedPortal = false;
  const syncBanner = document.getElementById('portal-sync-banner');
  if (syncBanner) syncBanner.remove();
  
  // 데이터 덮어쓰기
  students = data.students || students;
  grades = data.grades || grades;
  dailyLogs = data.dailyLogs || dailyLogs;
  pointHistory = data.pointHistory || pointHistory;
  config = data.config || config;
  dailyAssignments = data.dailyAssignments || dailyAssignments;
  pendingRequests = data.pendingRequests || {};
  absentLogs = data.absentLogs || {};
  processedDeductionDates = data.processedDeductionDates || [];
  teacherPasscode = data.teacherPasscode || '1234';
  dailyAnnouncements = data.dailyAnnouncements || dailyAnnouncements;
  
  // 로컬 localStorage에도 영구 보존
  localStorage.setItem('students', JSON.stringify(students));
  localStorage.setItem('grades', JSON.stringify(grades));
  localStorage.setItem('dailyLogs', JSON.stringify(dailyLogs));
  localStorage.setItem('pointHistory', JSON.stringify(pointHistory));
  localStorage.setItem('config', JSON.stringify(config));
  localStorage.setItem('dailyAssignments', JSON.stringify(dailyAssignments));
  localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests));
  localStorage.setItem('absentLogs', JSON.stringify(absentLogs));
  localStorage.setItem('processedDeductionDates', JSON.stringify(processedDeductionDates));
  localStorage.setItem('teacherPasscode', String(teacherPasscode));
  localStorage.setItem('dailyAnnouncements', JSON.stringify(dailyAnnouncements));
  
  isSyncingFromRemote = false;
  
  // 미제출 감점 처리 재평가 (혹시 누락된 날이 있다면 자동 처리)
  processAutoDeductions();
  
  // 현재 활성 뷰 리렌더링
  const hash = window.location.hash;
  if (hash === "#teacher") {
    // 현재 활성화된 탭 버튼에 따라 분기 렌더링
    const activeTabBtn = document.querySelector('.tab-btn.active');
    if (activeTabBtn) {
      const activeTab = activeTabBtn.id.replace('tab-btn-', '');
      if (activeTab === 'dashboard') {
        renderTeacherDashboard();
      } else if (activeTab === 'records') {
        if (!document.getElementById('records-detail-view').classList.contains('hidden')) {
          renderDailyRecordsTable();
        } else {
          renderCalendar();
        }
      } else if (activeTab === 'roster') {
        renderRosterPointsManager();
      } else if (activeTab === 'grades') {
        renderGradesConfig();
      }
    }
    updateWeeklyLeaderboard();
    renderApprovalRequestsWidget(); // 실시간 데이터 수신 시 결재 요청 목록 동적 리렌더링
  } else if (hash.startsWith('#student/')) {
    router(); // 학생 수첩 리렌더링
  }
};

// ==========================================================================
// Firebase 실시간 동기화 연동 로직
// ==========================================================================

const initFirebaseSync = () => {
  if (currentSyncMode !== 'firebase') return;
  if (!firebaseConfig || !firebaseConfig.databaseURL) {
    updateSyncStatusUI();
    return;
  }

  // ★ Firebase SDK 비동기 로드 대기 + 차단 감지 자동 오프라인 폴백
  if (typeof firebase === 'undefined') {
    // SDK가 아직 로드 안 됨 → 최대 3초 대기 후 재시도
    if (!window.__firebaseSdkRetryCount) window.__firebaseSdkRetryCount = 0;
    window.__firebaseSdkRetryCount++;

    // 광고 차단으로 SDK 로드 실패 확정된 경우 즉시 오프라인 폴백
    if (window.__firebaseBlocked) {
      console.warn('[Firebase] SDK 차단 감지 → 오프라인(캐시) 모드로 자동 전환');
      isFirebaseDataLoaded = true; // 로딩 스피너 해제
      window.firebasePermissionError = false;
      window.__showingCachedPortal = false;
      const syncBanner = document.getElementById('portal-sync-banner');
      if (syncBanner) syncBanner.remove();
      // 차단 안내 배너 표시
      setTimeout(() => {
        const existing = document.getElementById('portal-blocked-banner');
        if (!existing && window.location.hash.startsWith('#student/')) {
          const banner = document.createElement('div');
          banner.id = 'portal-blocked-banner';
          banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(90deg,#f59e0b,#ef4444);color:#fff;text-align:center;padding:6px 12px;font-size:12px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.15);';
          banner.innerHTML = '⚠️ 브라우저 광고 차단으로 실시간 연결 불가 — 저장된 데이터를 표시합니다';
          document.body.prepend(banner);
        }
        if (window.location.hash.startsWith('#student/')) router();
      }, 100);
      return;
    }

    // 최대 30회(3초) 재시도 후 포기
    if (window.__firebaseSdkRetryCount <= 30) {
      setTimeout(initFirebaseSync, 100);
    } else {
      console.warn('[Firebase] SDK 로드 3초 초과 → 오프라인 모드 전환');
      isFirebaseDataLoaded = true;
      window.__showingCachedPortal = false;
      const syncBanner = document.getElementById('portal-sync-banner');
      if (syncBanner) syncBanner.remove();
      if (window.location.hash.startsWith('#student/')) router();
    }
    return;
  }
  // SDK 로드 성공 시 재시도 카운터 초기화
  window.__firebaseSdkRetryCount = 0;

  try {
    let app;
    if (firebase.apps.length === 0) {
      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = firebase.app();
    }
    
    const syncKey = firebaseConfig.classroomSyncKey;
    if (!syncKey) {
      updateSyncStatusUI();
      return;
    }
    
    const connectToClassroom = (key) => {
      // 기존 리스너 해제
      if (dbRef) {
        dbRef.off();
      }
      dbRef = firebase.database().ref('classrooms/' + key);
      dbRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
          applyRemoteData(data);
          hasAttemptedInitialization = false;
        } else {
          console.log("[Firebase] 데이터 수신: 데이터가 없습니다 (null).");
          isFirebaseDataLoaded = true;
          
          // 교사 기기이고 아직 원격 DB가 비어있는 상태라면, 로컬 상태를 기준으로 원격을 초기화
          if (isTeacherAuthenticated() && !isSyncingFromRemote && !hasAttemptedInitialization) {
            hasAttemptedInitialization = true;
            console.log("[Firebase] 교사 권한이 감지되어 원격 데이터베이스를 로컬 데이터로 초기화합니다.");
            dbRef.update({
              students,
              grades,
              dailyLogs,
              pointHistory,
              config,
              dailyAssignments,
              absentLogs,
              processedDeductionDates,
              teacherPasscode,
              dailyAnnouncements
            }).catch(err => {
              console.error("[Firebase] 원격 초기화 오류:", err);
            });
          }
          
          // 학생 포털 대기 상태 해제 및 렌더링
          if (window.location.hash.startsWith('#student/')) {
            router();
          }
        }
      }, (error) => {
        console.error("[Firebase] 데이터 수신 오류:", error);
        const errCode = error.code || '';
        const errStr = error.message || '';
        const combinedErr = (errCode + " " + errStr).toLowerCase();
        if (combinedErr.includes('permission')) {
          window.firebasePermissionError = true;
        }
        if (window.location.hash.startsWith('#student/')) {
          router();
        }
      });
    };

    // 인증된 Firebase 사용자 기반으로만 연결 (최초 연결도 onAuthStateChanged에서 처리)
    // classroomSyncKey가 있으면 onAuthStateChanged 전 임시 연결 (캐시된 Auth 세션 활용)
    connectToClassroom(syncKey);
    
    // Auth 상태 리스너: 인증된 구글 계정이 저장된 classroomSyncKey와 다를 경우 즉시 데이터 격리 처리
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const currentSyncKey = firebaseConfig ? firebaseConfig.classroomSyncKey : null;

        // 인증된 계정과 현재 연결된 학급 키가 다른 경우 → 계정 교체 감지
        if (currentSyncKey && currentSyncKey !== user.uid) {
          console.log("[Firebase] onAuthStateChanged: 다른 계정 감지 → 로컬 데이터 초기화 후 새 학급으로 전환합니다.");
          // 로컬 캐시 전면 삭제
          localStorage.removeItem('students');
          localStorage.removeItem('grades');
          localStorage.removeItem('dailyLogs');
          localStorage.removeItem('pointHistory');
          localStorage.removeItem('config');
          localStorage.removeItem('dailyAssignments');
          localStorage.removeItem('pendingRequests');
          localStorage.removeItem('absentLogs');
          localStorage.removeItem('processedDeductionDates');
          localStorage.removeItem('dailyAnnouncements');
          localStorage.removeItem('teacherPasscode');
          
          // 메모리 상태도 초기화
          students = [...DEFAULT_STUDENTS];
          grades = [...DEFAULT_GRADES];
          dailyLogs = {};
          pointHistory = [];
          dailyAssignments = {};
          pendingRequests = {};
          absentLogs = {};
          processedDeductionDates = [];
          dailyAnnouncements = {};
          hasAttemptedInitialization = false;

          // classroomSyncKey를 새 UID로 업데이트하고 저장
          firebaseConfig.classroomSyncKey = user.uid;
          localStorage.setItem('firebaseConfig', JSON.stringify(firebaseConfig));
          
          // 새 계정의 학급 경로로 재연결
          connectToClassroom(user.uid);
        }

        firebaseUser = {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        };
        localStorage.setItem('firebaseUser', JSON.stringify(firebaseUser));
      } else {
        firebaseUser = null;
        localStorage.removeItem('firebaseUser');
      }
      updateSyncStatusUI();
    });
  } catch (err) {
    console.error("[Firebase] 초기화 오류:", err);
  }
};

const toggleFbAdvancedFields = () => {
  const fields = document.getElementById('fb-advanced-config-fields');
  if (fields) {
    fields.classList.toggle('hidden');
    const toggleBtn = document.getElementById('btn-fb-advanced-toggle');
    if (toggleBtn) {
      const isHidden = fields.classList.contains('hidden');
      toggleBtn.innerText = isHidden 
        ? "🛠️ 개인 파이어베이스 서버 정보 설정 (고급 설정)" 
        : "🛠️ 개인 파이어베이스 서버 정보 설정 닫기";
    }
  }
};

const saveFirebaseConfig = () => {
  const dbUrl = document.getElementById('fb-db-url').value.trim();
  const apiKey = document.getElementById('fb-api-key').value.trim();
  const projId = document.getElementById('fb-project-id').value.trim();
  const syncKey = document.getElementById('fb-sync-key').value.trim();
  
  let configObj = null;
  
  // 고급설정 입력폼이 비어있거나 플레이스홀더 상태(기본 서버 이용)인 경우 default config 복사해 활용
  if (!dbUrl && !apiKey && !projId) {
    configObj = {
      databaseURL: defaultFirebaseConfig.databaseURL,
      apiKey: defaultFirebaseConfig.apiKey,
      projectId: defaultFirebaseConfig.projectId,
      authDomain: defaultFirebaseConfig.authDomain,
      classroomSyncKey: syncKey
    };
  } else {
    if (!dbUrl) {
      alert("❌ Database URL을 입력해 주세요.");
      return;
    }
    configObj = {
      databaseURL: dbUrl,
      apiKey: apiKey,
      projectId: projId,
      authDomain: projId ? (projId + ".firebaseapp.com") : '',
      classroomSyncKey: syncKey
    };
  }
  
  localStorage.setItem('firebaseConfig', JSON.stringify(configObj));
  firebaseConfig = configObj;
  localStorage.setItem('currentSyncMode', 'firebase');
  currentSyncMode = 'firebase';
  
  alert("💾 파이어베이스 설정이 저장되었습니다. 연동을 위해 새로고침합니다.");
  location.reload();
};

const disconnectFirebase = () => {
  const proceed = confirm("⚠️ 정말 파이어베이스 연동을 해제하고 로컬 단독 모드로 전환하시겠습니까? (이후 데이터는 현재 브라우저에만 저장됩니다.)");
  if (!proceed) return;
  
  if (firebase.apps.length > 0) {
    firebase.auth().signOut().catch(err => console.error(err));
  }
  
  sessionStorage.removeItem('teacher_authenticated');
  localStorage.removeItem('firebaseConfig');
  localStorage.removeItem('firebaseUser');
  localStorage.setItem('currentSyncMode', 'local');
  firebaseConfig = null;
  firebaseUser = null;
  currentSyncMode = 'local';
  alert("❌ 파이어베이스 연동이 해제되고 로컬 모드로 전환되었습니다.");
  location.reload();
};

const loginWithFirebaseGoogle = async () => {
  if (!firebaseConfig || !firebaseConfig.apiKey || !firebaseConfig.databaseURL || !firebaseConfig.projectId) {
    alert("❌ 먼저 파이어베이스 데이터베이스 정보(URL, API Key, Project ID)를 저장해 주세요.");
    return;
  }
  
  try {
    if (firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
    // 기존 Firebase 세션을 먼저 종료하여 계정 선택 창이 반드시 뜨도록 처리
    try { await firebase.auth().signOut(); } catch(e) {}
    
    // 로그인 시도 전 로컬 학급 데이터 무조건 전면 삭제 (UID 비교 없이 항상 초기화)
    // → 어느 계정이든 로그인 후 Firebase 클라우드에서 해당 계정 데이터를 새로 불러옴
    console.log("[Firebase] 로그인 시도 전 로컬 학급 데이터 전면 초기화");
    localStorage.removeItem('students');
    localStorage.removeItem('grades');
    localStorage.removeItem('dailyLogs');
    localStorage.removeItem('pointHistory');
    localStorage.removeItem('config');
    localStorage.removeItem('dailyAssignments');
    localStorage.removeItem('pendingRequests');
    localStorage.removeItem('absentLogs');
    localStorage.removeItem('processedDeductionDates');
    localStorage.removeItem('dailyAnnouncements');
    localStorage.removeItem('teacherPasscode');
    localStorage.removeItem('firebaseUser');

    const provider = new firebase.auth.GoogleAuthProvider();
    // 로그인 시 항상 구글 계정 선택 창을 띄우도록 설정하여 다른 계정 전환 지원
    provider.setCustomParameters({ prompt: 'select_account' });
    
    firebase.auth().signInWithPopup(provider).then((result) => {
      const user = result.user;

      firebaseUser = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      };
      localStorage.setItem('firebaseUser', JSON.stringify(firebaseUser));
      
      // 구글 로그인 성공 시 계정 고유 ID를 연동 키로 자동 할당
      firebaseConfig.classroomSyncKey = user.uid;
      localStorage.setItem('firebaseConfig', JSON.stringify(firebaseConfig));
      
      alert("🎉 구글 계정으로 연동에 성공했습니다!\n학급 연동 키(Classroom Key)가 귀하의 구글 계정 고유 ID로 설정되었습니다.");
      location.reload();
    }).catch((error) => {
      console.error("[Firebase] 구글 로그인 오류:", error);
      alert("❌ 로그인 실패: " + error.message);
    });
  } catch (err) {
    console.error(err);
    alert("❌ 파이어베이스 구글 연동 오류: " + err.message);
  }
};

const logoutFirebaseGoogle = () => {
  sessionStorage.removeItem('teacher_authenticated');
  
  // 다른 사용자 계정과의 혼선 및 정보 유출 방지를 위해 로컬 클래스 데이터 캐시 청소
  localStorage.removeItem('students');
  localStorage.removeItem('grades');
  localStorage.removeItem('dailyLogs');
  localStorage.removeItem('pointHistory');
  localStorage.removeItem('config');
  localStorage.removeItem('dailyAssignments');
  localStorage.removeItem('pendingRequests');
  localStorage.removeItem('absentLogs');
  localStorage.removeItem('processedDeductionDates');
  localStorage.removeItem('dailyAnnouncements');
  localStorage.removeItem('teacherPasscode');

  if (firebaseConfig) {
    delete firebaseConfig.classroomSyncKey;
    localStorage.setItem('firebaseConfig', JSON.stringify(firebaseConfig));
  }
  
  // 동기화 모드를 로컬로 리셋
  localStorage.setItem('currentSyncMode', 'local');
  currentSyncMode = 'local';

  if (firebase.apps.length > 0) {
    firebase.auth().signOut().then(() => {
      firebaseUser = null;
      localStorage.removeItem('firebaseUser');
      alert("로그아웃 되었습니다.");
      location.reload();
    }).catch(err => {
      console.error(err);
      location.reload();
    });
  } else {
    firebaseUser = null;
    localStorage.removeItem('firebaseUser');
    location.reload();
  }
};

let tokenClient;

// Google Identity Services (GIS) 및 Google Drive API 초기화
const initGoogleDriveSync = () => {
  if (!googleClientId) {
    updateSyncStatusUI();
    return;
  }
  
  if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
    console.log("Google Accounts SDK not loaded yet, retrying in 100ms...");
    setTimeout(initGoogleDriveSync, 100);
    return;
  }

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: googleClientId,
    scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    callback: (tokenResponse) => {
      if (tokenResponse.error !== undefined) {
        console.error("Google Auth error:", tokenResponse.error);
        alert("❌ 구글 로그인 실패: " + tokenResponse.error);
        return;
      }
      googleAccessToken = tokenResponse.access_token;
      localStorage.setItem('googleAccessToken', googleAccessToken);
      
      handleAfterLogin();
    },
  });
  
  updateSyncStatusUI();
};

const handleAfterLogin = async () => {
  try {
    await fetchUserProfile();
    if (currentSyncMode === 'gdrive') {
      await syncWithGoogleDrive();
      alert("🎉 구글 드라이브 연동 및 동기화가 완료되었습니다!");
    } else {
      // local 모드일 때
      sessionStorage.setItem('teacher_authenticated', 'true');
      alert(`🎉 안녕하세요, ${googleUserProfile ? googleUserProfile.displayName : ''} 선생님!\n로컬 모드로 교사 대시보드에 로그인되었습니다.`);
    }
  } catch (err) {
    console.error(err);
    alert("❌ 구글 로그인 실패: " + err.message);
  } finally {
    updateSyncStatusUI();
    window.location.hash = "#teacher";
    location.reload();
  }
};

const clearGoogleTokens = () => {
  googleAccessToken = '';
  googleDriveFileId = '';
  googleUserProfile = null;
  localStorage.removeItem('googleAccessToken');
  localStorage.removeItem('googleDriveFileId');
  localStorage.removeItem('googleUserProfile');
};

const fetchUserProfile = async () => {
  if (!googleAccessToken) return;
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { 'Authorization': `Bearer ${googleAccessToken}` }
  });
  if (!res.ok) {
    if (res.status === 401) {
      clearGoogleTokens();
    }
    throw new Error("사용자 정보를 가져오지 못했습니다.");
  }
  const data = await res.json();
  googleUserProfile = {
    displayName: data.name,
    email: data.email,
    photoURL: data.picture
  };
  localStorage.setItem('googleUserProfile', JSON.stringify(googleUserProfile));
};

const findGoogleDriveBackupFile = async () => {
  if (!googleAccessToken) return null;
  const url = 'https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
    q: "name = 'classroom_dashboard_backup.json' and trashed = false",
    fields: "files(id, name)",
    spaces: "drive"
  });
  
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${googleAccessToken}` }
  });
  if (!res.ok) {
    if (res.status === 401) {
      clearGoogleTokens();
    }
    throw new Error("구글 드라이브 파일 검색 실패");
  }
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    googleDriveFileId = data.files[0].id;
    localStorage.setItem('googleDriveFileId', googleDriveFileId);
    return googleDriveFileId;
  }
  return null;
};

const downloadGoogleDriveBackupFile = async (fileId) => {
  if (!googleAccessToken) return;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { 'Authorization': `Bearer ${googleAccessToken}` }
  });
  if (!res.ok) {
    if (res.status === 401) {
      clearGoogleTokens();
    }
    throw new Error("구글 드라이브 백업 파일 다운로드 실패");
  }
  const data = await res.json();
  applyRemoteData(data);
};

const uploadGoogleDriveBackupFile = async (fileId) => {
  if (!googleAccessToken) return;
  
  const metadata = {
    name: 'classroom_dashboard_backup.json',
    mimeType: 'application/json'
  };
  
  const fileContent = JSON.stringify({
    students,
    grades,
    dailyLogs,
    pointHistory,
    config,
    dailyAssignments,
    pendingRequests,
    absentLogs,
    processedDeductionDates,
    teacherPasscode
  });
  
  const boundary = 'foo_bar_baz';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";
  
  const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      close_delim;
  
  let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  let method = 'POST';
  
  if (fileId) {
    url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
    method = 'PATCH';
  }
  
  const res = await fetch(url, {
    method: method,
    headers: {
      'Authorization': `Bearer ${googleAccessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });
  
  if (!res.ok) {
    if (res.status === 401) {
      clearGoogleTokens();
    }
    throw new Error("구글 드라이브 백업 파일 업로드 실패");
  }
  
  const data = await res.json();
  if (data.id && !fileId) {
    googleDriveFileId = data.id;
    localStorage.setItem('googleDriveFileId', googleDriveFileId);
  }
};

const syncWithGoogleDrive = async () => {
  if (!googleAccessToken) return;
  
  const fileId = await findGoogleDriveBackupFile();
  if (fileId) {
    await downloadGoogleDriveBackupFile(fileId);
  } else {
    await uploadGoogleDriveBackupFile(null);
  }
};

const syncWithGoogleDriveManual = async () => {
  if (!googleAccessToken) {
    alert("❌ 구글 드라이브 연동이 해제되어 있습니다. 설정을 먼저 확인해 주세요.");
    return;
  }
  
  const btnHeader = document.getElementById('btn-header-sync');
  if (btnHeader) {
    btnHeader.innerHTML = `🔄 동기화 중...`;
    btnHeader.disabled = true;
    btnHeader.classList.add('spin-animation');
  }
  
  try {
    await syncWithGoogleDrive();
    alert("🎉 구글 드라이브 동기화가 성공적으로 완료되었습니다!");
  } catch (err) {
    console.error(err);
    alert("❌ 구글 드라이브 동기화 실패: " + err.message);
  } finally {
    if (btnHeader) {
      btnHeader.innerHTML = `🔄 드라이브 동기화`;
      btnHeader.disabled = false;
      btnHeader.classList.remove('spin-animation');
    }
    updateSyncStatusUI();
  }
};

const loginWithGoogleDrive = () => {
  if (!googleClientId) {
    alert("❌ 먼저 Google Client ID를 입력하고 '클라우드 설정 저장'을 눌러주세요.");
    return;
  }
  
  if (!tokenClient) {
    initGoogleDriveSync();
  }
  
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    alert("구글 인증 라이브러리가 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.");
  }
};

const logoutGoogleDrive = () => {
  const proceed = confirm("⚠️ 정말 로그아웃하시겠습니까? (로그아웃 시 구글 드라이브 동기화가 중단되며 로컬 저장소 데이터만 유지됩니다.)");
  if (!proceed) return;
  
  sessionStorage.removeItem('teacher_authenticated');
  clearGoogleTokens();
  alert("ℹ️ 구글 계정 로그아웃이 완료되었습니다.");
  location.reload();
};

const saveGoogleDriveConfig = () => {
  const clientId = document.getElementById('gdrive-client-id').value.trim();
  
  if (!clientId) {
    alert("❌ Google Client ID는 필수 입력 사항입니다.");
    return;
  }
  
  localStorage.setItem('googleClientId', clientId);
  googleClientId = clientId;
  
  alert("🎉 구글 드라이브 설정이 저장되었습니다. 연동을 완료하기 위해 구글 계정으로 로그인해 주세요.");
  initGoogleDriveSync();
};

const disconnectGoogleDrive = () => {
  const proceed = confirm("⚠️ 정말 구글 드라이브 연동을 해제하고 로컬 단독 모드로 전환하시겠습니까? (이후 데이터는 현재 브라우저에만 저장됩니다.)");
  if (!proceed) return;
  
  clearGoogleTokens();
  localStorage.removeItem('googleClientId');
  googleClientId = '';
  
  alert("ℹ️ 구글 드라이브 연동이 해제되었습니다. 로컬 모드로 전환하기 위해 새로고침합니다.");
  location.reload();
};

const copyTeacherDashboardLink = () => {
  let queryStr = "";
  if (currentSyncMode === 'gdrive' && googleClientId) {
    queryStr = "?gClientId=" + encodeURIComponent(googleClientId);
  } else if (currentSyncMode === 'firebase' && firebaseConfig && firebaseConfig.databaseURL) {
    const params = new URLSearchParams({
      dbUrl: firebaseConfig.databaseURL,
      apiKey: firebaseConfig.apiKey || '',
      projId: firebaseConfig.projectId || '',
      syncKey: firebaseConfig.classroomSyncKey || ''
    });
    queryStr = "?" + params.toString();
  }
  
  const url = window.location.origin + window.location.pathname + queryStr + "#teacher";
  
  const textarea = document.createElement('textarea');
  textarea.value = url;
  textarea.style.position = 'fixed';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    const successful = document.execCommand('copy');
    if (successful) {
      alert("📋 설정 정보가 포함된 교사용 대시보드 주소가 클립보드에 복사되었습니다.\n\n다른 브라우저나 기기(태블릿 등)의 주소창에 이 링크를 붙여넣기 하시면 설정이 한 번에 자동 연동됩니다!");
    } else {
      alert("❌ 복사 실패. 주소창의 링크를 수동으로 복사해 주세요.");
    }
  } catch (err) {
    console.error(err);
  }
  document.body.removeChild(textarea);
};

// ==========================================================================
// 2. 탭 전환 제어 (Tab Navigation)
// ==========================================================================

const switchTab = (tabName) => {
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => content.classList.add('hidden'));

  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => btn.classList.remove('active'));

  document.getElementById(`tab-content-${tabName}`).classList.remove('hidden');
  document.getElementById(`tab-btn-${tabName}`).classList.add('active');

  if (tabName === 'dashboard') {
    renderTeacherDashboard();
  } else if (tabName === 'records') {
    showCalendarView();
  } else if (tabName === 'roster') {
    renderRosterPointsManager();
  } else if (tabName === 'grades') {
    renderGradesConfig();
  }
};

// 시계 헬퍼
const startClock = () => {
  const clockEl = document.getElementById('clock');
  const update = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = String(hours % 12 || 12).padStart(2, '0');
    clockEl.innerHTML = `<span class="clock-ampm">${ampm}</span><span class="clock-time">${displayHours}:${minutes}:${seconds}</span>`;
  };
  setInterval(update, 1000);
  update();
};

// ==========================================================================
// 3. 등급 판정 및 성장왕 집계
// ==========================================================================

const evaluateGrade = (points) => {
  const sortedGrades = [...grades].sort((a, b) => b.min_points - a.min_points);
  for (let grade of sortedGrades) {
    if (points >= grade.min_points) {
      return grade;
    }
  }
  return grades[0] || { name: "새싹 등급 🌱", emoji: "🌱", icon: "" };
};

const updateWeeklyLeaderboard = () => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const growthMap = {};
  pointHistory.forEach(log => {
    const logTime = new Date(log.timestamp);
    if (logTime >= sevenDaysAgo) {
      growthMap[log.student_id] = (growthMap[log.student_id] || 0) + log.points_changed;
    }
  });

  const growthList = Object.entries(growthMap)
    .filter(([_, score]) => score > 0)
    .map(([student_id, score]) => {
      const student = students.find(s => s.student_id === student_id);
      return {
        name: student ? student.name : `학생 ${student_id}`,
        growth: score
      };
    });

  growthList.sort((a, b) => b.growth - a.growth);
  const top3 = growthList.slice(0, 3);

  const listEl = document.getElementById('leaderboard-list');
  listEl.innerHTML = '';
  
  if (top3.length === 0) {
    listEl.innerHTML = `<li class="no-kings">성장 중인 학생이 없습니다.</li>`;
    return;
  }

  const rankEmojis = ["🥇", "🥈", "🥉"];
  top3.forEach((king, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="rank-badge">${rankEmojis[idx]} ${king.name}</span>
      <span class="growth-val">+${king.growth}점</span>
    `;
    listEl.appendChild(li);
  });
};

// ==========================================================================
// 4. 메인 대시보드 렌더링 (동적 배지 매핑 적용)
// ==========================================================================

const openAssignmentModalByCard = (event, studentId) => {
  if (event) event.stopPropagation();
  const student = students.find(s => s.student_id === studentId);
  if (student) {
    openAssignmentModal(student);
  }
};

const getTaskEmoji = (taskName) => {
  // 이름에서 첫 번째 이모지를 검색하여 반환, 없을 경우 기본 메모패드(📝) 반환
  const match = taskName.match(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1FAFF}]/u);
  return match ? match[0] : "📝";
};

const isAssignmentLog = (log, dateKey, tasks) => {
  if (log.assignment_date === dateKey) return true;
  if (log.reason.includes(`${dateKey} [`)) return true;
  
  // Fallback for older logs without assignment_date
  const logDate = log.timestamp.substring(0, 10);
  if (logDate === dateKey) {
    if (tasks && tasks.length > 0) {
      return tasks.some(t => {
        const name = t.name.trim();
        const emoji = getTaskEmoji(name);
        const cleanName = name.replace(emoji, '').trim();
        return log.reason.includes(name) || (cleanName && log.reason.includes(cleanName));
      });
    }
  }
  return false;
};

const toggleSingleTaskFromCard = (event, studentId, taskId, points, taskName) => {
  if (event) event.stopPropagation();
  
  const student = students.find(s => s.student_id === studentId);
  if (!student) return;
  
  const todayStr = currentDashboardDate;
  if (!dailyLogs[todayStr]) dailyLogs[todayStr] = {};
  if (!dailyLogs[todayStr][studentId]) {
    dailyLogs[todayStr][studentId] = {};
    const todayTasks = dailyAssignments[todayStr] || [];
    todayTasks.forEach(t => { dailyLogs[todayStr][studentId][t.id] = false; });
  }
  
  const studentLog = dailyLogs[todayStr][studentId];
  const currentlyCompleted = studentLog[taskId] === true;
  
  // 상태 변경
  const targetCompleted = !currentlyCompleted;
  studentLog[taskId] = targetCompleted;
  
  const nowStr = new Date().toISOString();
  let pointsDelta = targetCompleted ? points : -points;
  
  pointHistory.push({
    student_id: studentId,
    timestamp: nowStr,
    points_changed: pointsDelta,
    reason: `${taskName} ${targetCompleted ? '완료 적립' : '취소 차감'} (대시보드 클릭)`,
    assignment_date: todayStr,
    task_id: taskId
  });
  
  student.total_points = Math.max(0, (student.total_points || 0) + pointsDelta);
  
  saveData();
  playAudioEffect(targetCompleted ? 'coin' : 'buzz');
  renderTeacherDashboard();
};

const setDashboardViewMode = (mode) => {
  currentDashboardViewMode = mode;
  
  const btnStudents = document.getElementById('btn-view-students');
  const btnUnsubmitted = document.getElementById('btn-view-unsubmitted');
  
  if (btnStudents && btnUnsubmitted) {
    if (mode === 'students') {
      btnStudents.style.background = '#ffffff';
      btnStudents.style.color = 'var(--text-main)';
      btnStudents.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      
      btnUnsubmitted.style.background = 'transparent';
      btnUnsubmitted.style.color = 'var(--text-muted)';
      btnUnsubmitted.style.boxShadow = 'none';
    } else {
      btnUnsubmitted.style.background = '#ffffff';
      btnUnsubmitted.style.color = 'var(--text-main)';
      btnUnsubmitted.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      
      btnStudents.style.background = 'transparent';
      btnStudents.style.color = 'var(--text-muted)';
      btnStudents.style.boxShadow = 'none';
    }
  }
  
  renderTeacherDashboard();
};

const renderUnsubmittedView = (baseDateStr) => {
  const containerEl = document.getElementById('unsubmitted-container');
  if (!containerEl) return;
  containerEl.innerHTML = '';
  
  // 최근 일주일(7일) 날짜 배열 생성 (선택된 baseDateStr 기준 역순)
  const dates = [];
  const baseDate = new Date(baseDateStr);
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  
  let hasAnyTasks = false;
  let hasAnyUnsubmittedTasks = false;
  
  dates.forEach(dateKey => {
    const tasks = dailyAssignments[dateKey] || [];
    const dayLogs = dailyLogs[dateKey] || {};
    
    if (tasks.length > 0) {
      hasAnyTasks = true;
      
      tasks.forEach(task => {
        // 해당 날짜의 해당 과제 미제출 학생 수집
        const unsubmittedStudents = [];
        students.forEach(student => {
          const studentLog = dayLogs[student.student_id] || {};
          if (studentLog[task.id] !== true) {
            unsubmittedStudents.push(student);
          }
        });
        
        const submittedCount = students.length - unsubmittedStudents.length;
        const unsubmittedCount = unsubmittedStudents.length;
        
        // 모두 제출한 과제는 표시하지 않음
        if (unsubmittedCount === 0) {
          return;
        }
        
        hasAnyUnsubmittedTasks = true;
        
        unsubmittedStudents.sort((a, b) => a.student_id.localeCompare(b.student_id));
        
        const emoji = getTaskEmoji(task.name);
        let cleanName = task.name;
        if (cleanName.startsWith(emoji)) {
          cleanName = cleanName.replace(emoji, '').trim();
        }
        
        const taskCard = document.createElement('div');
        taskCard.className = 'unsubmitted-task-card';
        
        let chipsHtml = '<div class="unsubmitted-chips-list">';
        unsubmittedStudents.forEach(s => {
          chipsHtml += `
            <div class="unsubmitted-student-chip" 
                 onclick="toggleTaskFromUnsubmittedList(event, '${s.student_id}', '${task.id}', ${task.points}, '${task.name}', '${dateKey}')"
                 title="클릭 시 '${cleanName}' 완료 처리">
              <span class="student-number-badge compact">${s.student_id}</span>
              <span class="student-name">${s.name}</span>
            </div>
          `;
        });
        chipsHtml += '</div>';
        
        // 날짜 표시 포맷 (예: 2026-06-12 -> 6/12)
        const dateParts = dateKey.split('-');
        const dateDisplay = `${parseInt(dateParts[1])}/${parseInt(dateParts[2])}`;
        
        let deductBtnHtml = `
          <button class="btn-bulk-deduct" 
                  onclick="bulkDeductUnsubmitted(event, '${task.id}', '${task.name}', '${dateKey}')" 
                  title="'${cleanName}' 미제출자 일괄 감점">
            📉 미제출자 ${unsubmittedCount}명 일괄 -1점 감점
          </button>
        `;
        
        taskCard.innerHTML = `
          <div class="unsubmitted-task-header">
            <div class="task-title-area">
              <span class="task-date-badge">${dateDisplay}</span>
              <span class="task-emoji">${emoji}</span>
              <span class="task-name">${cleanName}</span>
              <span class="task-points">+${task.points}점</span>
            </div>
            <div class="task-ratio-badge">
              제출 ${submittedCount} / 미제출 ${unsubmittedCount}
            </div>
          </div>
          <div class="unsubmitted-task-body">
            ${deductBtnHtml}
            ${chipsHtml}
          </div>
        `;
        
        containerEl.appendChild(taskCard);
      });
    }
  });
  
  if (!hasAnyTasks) {
    containerEl.innerHTML = `
      <div style="width:100%; text-align:center; padding:40px; background:white; border-radius:var(--radius-md); border:1px dashed var(--border-color);">
        <span style="font-size:44px;">⚪</span>
        <h3 style="margin-top:12px; color:var(--text-muted);">최근 일주일 내에 설정된 과제가 없습니다.</h3>
      </div>
    `;
  } else if (!hasAnyUnsubmittedTasks) {
    containerEl.innerHTML = `
      <div style="width:100%; text-align:center; padding:40px; background:var(--success-bg); border-radius:var(--radius-md); border:1px dashed var(--success-border); box-shadow: var(--shadow-sm);">
        <span style="font-size:44px;">🎉</span>
        <h3 style="margin-top:12px; color:var(--success-color);">밀린 과제가 하나도 없습니다! 전원 모든 과제 제출 완료 🟢</h3>
      </div>
    `;
  }
};

const toggleTaskFromUnsubmittedList = (event, studentId, taskId, points, taskName, dateKey) => {
  if (event) event.stopPropagation();
  
  const student = students.find(s => s.student_id === studentId);
  if (!student) return;
  
  const targetDateKey = dateKey || currentDashboardDate;
  if (!dailyLogs[targetDateKey]) dailyLogs[targetDateKey] = {};
  if (!dailyLogs[targetDateKey][studentId]) {
    dailyLogs[targetDateKey][studentId] = {};
    const dayTasks = dailyAssignments[targetDateKey] || [];
    dayTasks.forEach(t => { dailyLogs[targetDateKey][studentId][t.id] = false; });
  }
  
  const studentLog = dailyLogs[targetDateKey][studentId];
  // 미제출 목록에서 선택했으므로 완료(true) 처리
  studentLog[taskId] = true;
  
  const nowStr = new Date().toISOString();
  pointHistory.push({
    student_id: studentId,
    timestamp: nowStr,
    points_changed: points,
    reason: `${taskName} 완료 적립 (최근 7일 미제출자 명단 클릭)`,
    assignment_date: targetDateKey,
    task_id: taskId
  });
  
  student.total_points = Math.max(0, (student.total_points || 0) + points);
  
  saveData();
  playAudioEffect('coin');
  renderTeacherDashboard();
};

let bulkDeductPendingAction = null;

const closeBulkDeductConfirmModal = () => {
  document.getElementById('bulk-deduct-confirm-modal').classList.add('hidden');
  bulkDeductPendingAction = null;
};

const bulkDeductUnsubmitted = (event, taskId, taskName, dateKey) => {
  if (event) event.stopPropagation();
  
  const targetDateKey = dateKey || currentDashboardDate;
  const dayLogs = dailyLogs[targetDateKey] || {};
  const dayTasks = dailyAssignments[targetDateKey] || [];
  const task = dayTasks.find(t => t.id === taskId);
  if (!task) return;
  
  const emoji = getTaskEmoji(taskName);
  let cleanName = taskName;
  if (cleanName.startsWith(emoji)) {
    cleanName = cleanName.replace(emoji, '').trim();
  }
  
  // Find all students who haven't completed this task
  const unsubmittedStudents = [];
  students.forEach(student => {
    const studentLog = dayLogs[student.student_id] || {};
    if (studentLog[taskId] !== true) {
      unsubmittedStudents.push(student);
    }
  });
  
  if (unsubmittedStudents.length === 0) {
    alert("감점할 미제출 학생이 없습니다.");
    return;
  }
  
  const dateParts = targetDateKey.split('-');
  const dateDisplay = `${parseInt(dateParts[1])}/${parseInt(dateParts[2])}`;
  
  // Set modal text message
  document.getElementById('bulk-deduct-modal-message').innerText = 
    `정말로 '${cleanName} (${dateDisplay})' 미제출 학생 ${unsubmittedStudents.length}명에게 각각 -1점을 감점하시겠습니까?`;
  
  // Set pending action
  bulkDeductPendingAction = () => {
    const nowStr = new Date().toISOString();
    
    unsubmittedStudents.forEach(s => {
      s.total_points = Math.max(0, (s.total_points || 0) - 1);
      pointHistory.push({
        student_id: s.student_id,
        timestamp: nowStr,
        points_changed: -1,
        reason: `${cleanName} 미제출 감점 (-1점) [${dateDisplay}]`,
        assignment_date: targetDateKey,
        task_id: taskId
      });
    });
    
    saveData();
    closeBulkDeductConfirmModal();
    renderTeacherDashboard();
    alert(`📉 '${cleanName} (${dateDisplay})' 미제출 학생 ${unsubmittedStudents.length}명에게 1점 감점 처리가 완료되었습니다.`);
  };
  
  // Bind click event to confirm button
  const confirmBtn = document.getElementById('bulk-deduct-confirm-btn');
  confirmBtn.onclick = () => {
    if (bulkDeductPendingAction) {
      bulkDeductPendingAction();
    }
  };
  
  // Open modal
  document.getElementById('bulk-deduct-confirm-modal').classList.remove('hidden');
};

const allUnsubmittedDeduct = (baseDateStr) => {
  const baseDate = new Date(baseDateStr);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  
  // Calculate unsubmitted count for each student
  const studentDeductions = [];
  let totalDeductedPoints = 0;
  let affectedStudentsCount = 0;
  
  students.forEach(student => {
    const studentDeductionsForThisStudent = [];
    
    dates.forEach(dateKey => {
      const tasks = dailyAssignments[dateKey] || [];
      const dayLogs = dailyLogs[dateKey] || {};
      const studentLog = dayLogs[student.student_id] || {};
      
      tasks.forEach(task => {
        if (studentLog[task.id] !== true) {
          studentDeductionsForThisStudent.push({
            dateKey: dateKey,
            taskId: task.id,
            taskName: task.name
          });
        }
      });
    });
    
    if (studentDeductionsForThisStudent.length > 0) {
      studentDeductions.push({
        student: student,
        deductions: studentDeductionsForThisStudent
      });
      totalDeductedPoints += studentDeductionsForThisStudent.length;
      affectedStudentsCount++;
    }
  });
  
  if (affectedStudentsCount === 0) {
    alert("감점할 미제출 과제가 있는 학생이 없습니다.");
    return;
  }
  
  const dateParts = baseDateStr.split('-');
  const dateDisplay = `${parseInt(dateParts[1])}/${parseInt(dateParts[2])}`;
  
  // Set modal text message
  document.getElementById('bulk-deduct-modal-message').innerText = 
    `정말로 최근 일주일 (${dateDisplay} 기준) 모든 미제출 과제 총 ${totalDeductedPoints}건에 대해 학생 ${affectedStudentsCount}명에게 미제출 수만큼 감점하시겠습니까?\n(각각 미제출 과제 개수만큼 1점씩 감점됩니다.)`;
  
  // Set pending action
  bulkDeductPendingAction = () => {
    const nowStr = new Date().toISOString();
    
    studentDeductions.forEach(item => {
      const s = item.student;
      const deductions = item.deductions;
      const count = deductions.length;
      s.total_points = Math.max(0, (s.total_points || 0) - count);
      
      deductions.forEach(d => {
        pointHistory.push({
          student_id: s.student_id,
          timestamp: nowStr,
          points_changed: -1,
          reason: `${d.taskName} 미제출 감점 (-1점) [${d.dateKey}]`,
          assignment_date: d.dateKey,
          task_id: d.taskId
        });
      });
    });
    
    saveData();
    closeBulkDeductConfirmModal();
    renderTeacherDashboard();
    alert(`📉 총 ${affectedStudentsCount}명의 학생에게 미제출 과제 수만큼 감점 처리(총 -${totalDeductedPoints}점)가 완료되었습니다.`);
  };
  
  // Bind click event to confirm button
  const confirmBtn = document.getElementById('bulk-deduct-confirm-btn');
  confirmBtn.onclick = () => {
    if (bulkDeductPendingAction) {
      bulkDeductPendingAction();
    }
  };
  
  // Open modal
  document.getElementById('bulk-deduct-confirm-modal').classList.remove('hidden');
};

// 날짜 문자열(YYYY-MM-DD)을 현지 시간 Date 객체로 변환
const parseLocalDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// Date 객체를 현지 시간 YYYY-MM-DD 문자열로 변환
const formatLocalDate = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// 평일 일수(주말 제외) 계산 헬퍼 함수
const getWeekdaysBetween = (startDateStr, endDateStr) => {
  const start = parseLocalDate(startDateStr);
  const end = parseLocalDate(endDateStr);
  const weekdays = [];
  
  const current = new Date(start);
  current.setDate(current.getDate() + 1);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) { // 0: 일요일, 6: 토요일 제외
      weekdays.push(formatLocalDate(current));
    }
    current.setDate(current.getDate() + 1);
  }
  return weekdays;
};

// 미제출 과제에 대한 일일 자동 감점 처리 (평일 기준, 결석생 하루 유예 적용)
const processAutoDeductions = () => {
  // 자동 감점 기능 비활성화 시 즉시 종료
  if (config.auto_deduction_enabled === false) {
    return;
  }
  // 보안 및 권한 설정: 교사로 로그인/인증된 브라우저가 아닐 경우 실행을 방지
  if (!isTeacherAuthenticated()) {
    return;
  }
  const todayStr = getTodayDateString();
  
  const assignmentDates = Object.keys(dailyAssignments).sort();
  if (assignmentDates.length === 0) return;
  
  const oldestDateStr = assignmentDates[0];
  
  const today = parseLocalDate(todayStr);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);
  
  // oldestDateStr 다음날부터 어제까지의 평일 목록 구하기
  const candidates = getWeekdaysBetween(oldestDateStr, yesterdayStr);
  const datesToProcess = candidates.filter(d => !processedDeductionDates.includes(d));
  
  if (datesToProcess.length === 0) return;
  
  // O(H) 성능 최적화: pointHistory 속 완료 로그(points_changed > 0)들을 미리 O(H)로 맵에 인덱싱
  const completionLogMap = {};
  pointHistory.forEach(log => {
    if (log.points_changed > 0 && log.student_id && log.assignment_date && log.task_id) {
      const key = `${log.student_id}_${log.assignment_date}_${log.task_id}`;
      const compDate = log.timestamp.substring(0, 10);
      if (!completionLogMap[key] || compDate < completionLogMap[key]) {
        completionLogMap[key] = compDate;
      }
    }
  });
  
  let totalDeductionsCount = 0;
  
  datesToProcess.forEach(processDate => {
    const processDateObj = parseLocalDate(processDate);
    students.forEach(student => {
      assignmentDates.forEach(assignDate => {
        if (assignDate >= processDate) return;
        
        // 성능 최적화: 14일 초과된 너무 오래된 과제는 감점 검토에서 스킵
        const assignDateObj = parseLocalDate(assignDate);
        const diffTime = Math.abs(processDateObj - assignDateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 14) return;
        
        const tasks = dailyAssignments[assignDate] || [];
        const dayLogs = dailyLogs[assignDate] || {};
        const studentLog = dayLogs[student.student_id] || {};
        const isAbsent = (absentLogs[assignDate] && absentLogs[assignDate][student.student_id] === true);
        
        const weekdaysSinceAssign = getWeekdaysBetween(assignDate, processDate);
        if (weekdaysSinceAssign.length === 0) return;
        
        const firstWeekdayAfter = weekdaysSinceAssign[0];
        
        // 결석한 학생은 첫 번째 평일의 미제출 감점 유예 (하루 유예)
        if (isAbsent && processDate === firstWeekdayAfter) {
          return;
        }
        
        tasks.forEach(task => {
          let isCompletedOnProcessDate = false;
          
          if (studentLog[task.id] === true) {
            const compDate = completionLogMap[`${student.student_id}_${assignDate}_${task.id}`];
            if (compDate) {
              if (compDate <= processDate) {
                isCompletedOnProcessDate = true;
              }
            } else {
              isCompletedOnProcessDate = true;
            }
          }
          
          if (!isCompletedOnProcessDate) {
            student.total_points = Math.max(0, (student.total_points || 0) - 1);
            
            const reason = `${task.name} 미제출 자동 감점 (-1점) [${assignDate}]${isAbsent ? ' (결석 유예 적용)' : ''}`;
            
            pointHistory.push({
              student_id: student.student_id,
              timestamp: new Date(processDate + 'T18:00:00').toISOString(),
              points_changed: -1,
              reason: reason,
              assignment_date: assignDate,
              task_id: task.id,
              is_auto_deduction: true
            });
            
            totalDeductionsCount++;
          }
        });
      });
    });
    
    processedDeductionDates.push(processDate);
  });
  
  saveData();
  if (totalDeductionsCount > 0) {
    console.log(`[자동 감점] 처리된 평일: ${datesToProcess.join(', ')}. 총 감점 건수: ${totalDeductionsCount}`);
  }
};

let dragSourceIndex = null;

const handleDragStart = (e, index) => {
  dragSourceIndex = index;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', index);
  e.currentTarget.classList.add('dragging');
};

const handleDragOver = (e) => {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  return false;
};

const handleDragEnter = (e) => {
  e.currentTarget.classList.add('drag-over');
};

const handleDragLeave = (e) => {
  e.currentTarget.classList.remove('drag-over');
};

const handleDrop = (e, targetIndex) => {
  e.stopPropagation();
  e.preventDefault();
  
  const sourceIndex = dragSourceIndex !== null ? dragSourceIndex : parseInt(e.dataTransfer.getData('text/plain'));
  
  if (sourceIndex !== null && !isNaN(sourceIndex) && sourceIndex !== targetIndex) {
    // Reorder students array
    const draggedStudent = students.splice(sourceIndex, 1)[0];
    students.splice(targetIndex, 0, draggedStudent);
    
    saveData();
    renderTeacherDashboard();
  }
  return false;
};

const handleDragEnd = (e) => {
  dragSourceIndex = null;
  const cards = document.querySelectorAll('.student-card');
  cards.forEach(card => {
    card.classList.remove('dragging');
    card.classList.remove('drag-over');
  });
};


// ==========================================================================
// 10. 학생 모바일 전용 개별 포털 (동적 과제 대응)
// ==========================================================================

const bypassFirebaseLoadingForStudent = (studentId) => {
  isFirebaseDataLoaded = true;
  renderStudentPortal(studentId);
};
window.bypassFirebaseLoadingForStudent = bypassFirebaseLoadingForStudent;

const renderStudentPortal = (studentId) => {
  // 파이어베이스 데이터베이스 권한 에러(Permission Denied) 감지 시 안내 화면 노출
  if (window.firebasePermissionError) {
    document.getElementById('student-view').innerHTML = `
      <div class="portal-main-layout" style="display:flex; justify-content:center; align-items:center; min-height:80vh; padding: 20px;">
        <div class="portal-card" style="max-width:400px; width:100%; text-align:center; padding:32px; border-radius:16px; box-shadow:0 10px 25px rgba(0,0,0,0.15); background:var(--bg-card); border:1px solid var(--border-color);">
          <div style="font-size:48px; margin-bottom:16px;">⚠️</div>
          <h2 style="color:var(--text-main); margin-bottom:8px; font-weight:800; font-size: 20px;">서버 권한 거부됨</h2>
          <p style="color:var(--text-muted); font-size:14px; margin-bottom:24px; line-height:1.5;">
            데이터베이스 읽기 권한이 거부되었습니다 (Permission Denied).<br><br>
            선생님 교사 대시보드의 파이어베이스 **규칙(Rules)** 탭에서 규칙이 공개(true)로 게시되어 있는지 확인해 주세요.
          </p>
          <button onclick="bypassFirebaseLoadingForStudent('${studentId}')" class="btn-secondary" style="width:100%; padding:10px; font-weight:bold; font-size:13px;">오프라인(로컬) 모드로 진입</button>
        </div>
      </div>
    `;
    return;
  }

  // 파이어베이스 동기화 모드이고 아직 데이터를 받지 못한 경우
  if (currentSyncMode === 'firebase' && !isFirebaseDataLoaded) {
    // ★ 캐시 우선 표시: localStorage에 이전 학급 데이터가 있으면 바로 렌더링
    const cachedStudents = (() => {
      try { return JSON.parse(localStorage.getItem('students')) || []; } catch(e) { return []; }
    })();
    const cachedStudent = cachedStudents.find(s => s.student_id === studentId);
    
    if (cachedStudent) {
      // 캐시 데이터를 메모리에 적용하여 즉시 렌더링 (Firebase 수신 전 임시)
      if (!students || students.length === 0 || students === window.__DEFAULT_STUDENTS) {
        students = cachedStudents;
        try { grades = JSON.parse(localStorage.getItem('grades')) || grades; } catch(e) {}
        try { dailyLogs = JSON.parse(localStorage.getItem('dailyLogs')) || dailyLogs; } catch(e) {}
        try { pointHistory = JSON.parse(localStorage.getItem('pointHistory')) || pointHistory; } catch(e) {}
        try { config = JSON.parse(localStorage.getItem('config')) || config; } catch(e) {}
        try { dailyAssignments = JSON.parse(localStorage.getItem('dailyAssignments')) || dailyAssignments; } catch(e) {}
        try { absentLogs = JSON.parse(localStorage.getItem('absentLogs')) || absentLogs; } catch(e) {}
        try { dailyAnnouncements = JSON.parse(localStorage.getItem('dailyAnnouncements')) || dailyAnnouncements; } catch(e) {}
        try { teacherPasscode = localStorage.getItem('teacherPasscode') || teacherPasscode; } catch(e) {}
      }
      // 타이머 해제 후 바로 아래 렌더링 로직으로 통과 (캐시 배너는 applyRemoteData 후 제거)
      if (window.portalLoadingTimer) {
        clearTimeout(window.portalLoadingTimer);
        window.portalLoadingTimer = null;
      }
      // 렌더링 후 "동기화 중" 배너 부착 (비동기)
      window.__showingCachedPortal = true;
      setTimeout(() => {
        const existingBanner = document.getElementById('portal-sync-banner');
        if (!existingBanner && window.__showingCachedPortal) {
          const banner = document.createElement('div');
          banner.id = 'portal-sync-banner';
          banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(90deg,#3b82f6,#6366f1);color:#fff;text-align:center;padding:6px 12px;font-size:13px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.15);';
          banner.innerHTML = '🔄 최신 데이터를 서버에서 불러오는 중...';
          document.body.prepend(banner);
        }
      }, 50);
      // 통과: 아래 렌더링 로직이 캐시 데이터로 실행됨
    } else {
      // 캐시 없음 → 스피너 표시 (3초 후 타임아웃 안내)
      const isFirebaseBlocked = (typeof firebase === 'undefined');
      
      document.getElementById('student-view').innerHTML = `
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
        <div class="portal-main-layout" style="display:flex; justify-content:center; align-items:center; min-height:80vh; padding: 20px;">
          <div class="portal-card" style="max-width:400px; width:100%; text-align:center; padding:32px; border-radius:16px; box-shadow:0 10px 25px rgba(0,0,0,0.15); background:var(--bg-card); border:1px solid var(--border-color);">
            <div class="loading-icon-spinner" style="font-size:48px; margin-bottom:16px; display:inline-block; ${isFirebaseBlocked ? '' : 'animation: spin 2s linear infinite;'}">${isFirebaseBlocked ? '⚠️' : '⏳'}</div>
            <h2 style="color:var(--text-main); margin-bottom:8px; font-weight:800; font-size: 20px;">${isFirebaseBlocked ? '보안/차단 감지됨' : '서버 연결 중...'}</h2>
            <p style="color:var(--text-muted); font-size:14px; margin-bottom:24px; line-height:1.5;">
              ${isFirebaseBlocked 
                ? '브라우저(네이버/웨일 등)의 광고 차단 또는 추적 방지 기능으로 인해 파이어베이스 서버 연결 도구가 차단되었습니다.' 
                : '학급 실시간 동기화 서버에 연결하고 있습니다.<br>잠시만 기다려 주세요.'}
            </p>
            <div id="portal-loading-timeout" class="${isFirebaseBlocked ? '' : 'hidden'}">
              <p style="color:var(--danger-color); font-size:13px; font-weight:bold; margin-bottom:16px;">
                ${isFirebaseBlocked 
                  ? '실시간 기능(과제 완료 요청 등)이 작동하지 않을 수 있습니다.' 
                  : '⚠️ 실시간 서버 연결 시간이 초과되었습니다.<br>(인터넷 연결 또는 브라우저의 차단 설정을 확인해 주세요.)'}
              </p>
              <button onclick="bypassFirebaseLoadingForStudent('${studentId}')" class="btn-secondary" style="width:100%; padding:10px; font-weight:bold; font-size:13px;">오프라인(로컬) 모드로 진입</button>
            </div>
          </div>
        </div>
      `;
      
      // 3초 후 타임아웃 메시지 노출 (5초 → 3초로 단축)
      if (!window.portalLoadingTimer) {
        window.portalLoadingTimer = setTimeout(() => {
          const timeoutEl = document.getElementById('portal-loading-timeout');
          if (timeoutEl) {
            timeoutEl.classList.remove('hidden');
          }
          window.portalLoadingTimer = null;
        }, 3000);
      }
      return;
    }
  }
  
  // 만약 타이머가 돌고 있었다면 해제
  if (window.portalLoadingTimer) {
    clearTimeout(window.portalLoadingTimer);
    window.portalLoadingTimer = null;
  }

  const student = students.find(s => s.student_id === studentId);
  if (!student) {
    document.getElementById('student-view').innerHTML = `
      <div class="portal-main-layout">
        <div class="portal-card" style="text-align:center;">
          <h2 style="color:var(--danger-color);margin-bottom:15px;">⚠️ 조회 실패</h2>
          <p>학번 ${studentId}에 해당하는 학생 정보가 조회되지 않습니다.</p>
          <button onclick="goBackToTeacherDashboard()" class="btn-primary" style="margin-top:20px;">홈으로 가기</button>
        </div>
      </div>
    `;
    return;
  }

  // 학생용 비밀번호 검증
  const verified = sessionStorage.getItem('student_portal_verified_' + studentId) === 'true';
  const needPasscode = config.student_passcode && config.student_passcode.trim() !== "";
  
  if (needPasscode && !verified) {
    document.getElementById('student-view').innerHTML = `
      <div class="portal-main-layout" style="display:flex; justify-content:center; align-items:center; min-height:80vh; padding: 20px;">
        <div class="portal-card" style="max-width:400px; width:100%; text-align:center; padding:32px; border-radius:16px; box-shadow:0 10px 25px rgba(0,0,0,0.15); background:var(--bg-card); border:1px solid var(--border-color);">
          <div style="font-size:48px; margin-bottom:16px;">🔑</div>
          <h2 style="color:var(--text-main); margin-bottom:8px; font-weight:800; font-size: 22px;">학생 포털 보안 확인</h2>
          <p style="color:var(--text-muted); font-size:14px; margin-bottom:24px; line-height:1.5;">선생님이 설정한 학급 학생 비밀번호를 입력해주세요.</p>
          
          <div style="display:flex; flex-direction:column; gap:16px; text-align:left; margin-bottom:20px;">
            <input type="password" id="student-portal-verify-input" placeholder="비밀번호 입력" onkeydown="if(event.key === 'Enter') verifyStudentPortalPasscode('${studentId}')" style="width:100%; padding:12px; font-size:16px; border:1px solid var(--border-color); border-radius:8px; outline:none; text-align:center; background:var(--bg-card); color:var(--text-main);">
            <p id="student-portal-verify-error" style="color:var(--danger-color); font-size:13px; font-weight:bold; text-align:center; margin:0;" class="hidden">⚠️ 비밀번호가 일치하지 않습니다.</p>
          </div>
          
          <div style="display:flex; gap:10px;">
            <button onclick="goBackToTeacherDashboard()" class="btn-secondary" style="flex:1; padding:12px; font-weight:bold;">홈으로</button>
            <button onclick="verifyStudentPortalPasscode('${studentId}')" class="btn-primary" style="flex:2; padding:12px; font-weight:bold; background:#6366f1; border-color:#4f46e5;">확인</button>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // 만약 비밀번호 검증을 통과했고, student-view의 원본 템플릿이 지워진 상태라면 복원
  if (window.originalStudentViewHtml && !document.getElementById('portal-student-title')) {
    document.getElementById('student-view').innerHTML = window.originalStudentViewHtml;
  }

  document.getElementById('portal-student-title').innerText = `🛡️ ${student.student_id}번 ${student.name} 학생의 신용수첩`;
  document.getElementById('portal-points').innerText = `${student.total_points}점`;

  // 오늘 출석 체크 여부 확인
  const todayStr = getTodayDateString();
  const hasAttended = student.attendance && student.attendance[todayStr] === true;
  const attendBtn = document.getElementById('portal-attendance-btn');
  const attendStatus = document.getElementById('portal-attendance-status');
  
  if (attendBtn && attendStatus) {
    if (hasAttended) {
      attendBtn.classList.add('hidden');
      attendStatus.classList.remove('hidden');
    } else {
      attendBtn.classList.remove('hidden');
      attendStatus.classList.add('hidden');
      attendBtn.setAttribute('onclick', `checkStudentAttendance('${student.student_id}')`);
    }
  }

  const grade = evaluateGrade(student.total_points);
  document.getElementById('portal-grade-name').innerText = grade.name;

  const portalAnnounceDateDisplay = document.getElementById('portal-announcement-date-display');
  const portalAnnounceDateInput = document.getElementById('portal-announcement-date-input');
  if (portalAnnounceDateInput) portalAnnounceDateInput.value = currentPortalAnnouncementDate;
  if (portalAnnounceDateDisplay) portalAnnounceDateDisplay.innerText = formatKoreanDate(currentPortalAnnouncementDate);

  const portalAnnounceEl = document.getElementById('portal-announcement-content');
  if (portalAnnounceEl) {
    portalAnnounceEl.innerText = dailyAnnouncements[currentPortalAnnouncementDate] || "알림장이 없습니다.";
  }
  
  const iconEl = document.getElementById('portal-grade-icon');
  const emojiEl = document.getElementById('portal-grade-emoji');
  
  if (grade.icon) {
    iconEl.src = grade.icon;
    iconEl.classList.remove('hidden');
    emojiEl.classList.add('hidden');
  } else {
    emojiEl.innerText = grade.emoji;
    emojiEl.classList.remove('hidden');
    iconEl.classList.add('hidden');
  }

  // 오늘 과제 수행 현황 그리기 (동적 생성)
  const todayTasks = dailyAssignments[todayStr] || [];
  const studentLog = (dailyLogs[todayStr] || {})[student.student_id] || {};

  const portalTaskListEl = document.getElementById('portal-task-list');
  portalTaskListEl.innerHTML = '';

  if (todayTasks.length > 0) {
    todayTasks.forEach(task => {
      const isComplete = studentLog[task.id] === true;
      const isPending = !!(pendingRequests[todayStr] && 
                           pendingRequests[todayStr][student.student_id] && 
                           pendingRequests[todayStr][student.student_id][task.id]);
      
      const li = document.createElement('li');
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';
      li.style.padding = '8px 0';
      li.style.borderBottom = '1px solid var(--border-color)';
      
      let statusHtml = "";
      if (isComplete) {
        statusHtml = `<span style="color:var(--success-color); font-weight:bold;">제출 완료 🟢</span>`;
      } else if (isPending) {
        statusHtml = `<span class="portal-task-status-pending">⏳ 승인 대기 중</span>`;
      } else {
        statusHtml = `<button class="btn-portal-request" onclick="requestTaskApproval('${student.student_id}', '${task.id}', '${task.name}', null, ${task.points})">✔️ 완료 요청</button>`;
      }
      
      li.innerHTML = `<span style="font-weight:bold; color:var(--text-main);">${task.name}</span> ${statusHtml}`;
      portalTaskListEl.appendChild(li);
    });
  } else {
    portalTaskListEl.innerHTML = `<li style="text-align:center; padding:15px; color:var(--text-muted); width:100%;">오늘은 배정된 과제가 없습니다.</li>`;
  }

  // 과제 권한 학생에게만 관리용 버튼 노출
  const managerActions = document.getElementById('portal-task-manager-actions');
  if (managerActions) {
    if (student.can_manage_tasks === true) {
      managerActions.classList.remove('hidden');
    } else {
      managerActions.classList.add('hidden');
    }
  }

  // [Option B] 최근 7일간의 미제출 과제 추적 (동적 대응)
  const outstandingEl = document.getElementById('portal-outstanding-list');
  outstandingEl.innerHTML = '';

  const outstanding = [];
  const now = new Date();
  
  for (let i = 0; i < 7; i++) {
    const pastDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const year = pastDate.getFullYear();
    const month = String(pastDate.getMonth() + 1).padStart(2, '0');
    const dateStr = String(pastDate.getDate()).padStart(2, '0');
    const checkDateKey = `${year}-${month}-${dateStr}`;

    const tasksForDay = dailyAssignments[checkDateKey] || [];
    const logsForDay = dailyLogs[checkDateKey] || {};
    const studentLogForDay = logsForDay[student.student_id] || {};

    if (tasksForDay.length > 0) {
      tasksForDay.forEach(task => {
        // 해당 과제가 제출되지 않은 경우
        if (studentLogForDay[task.id] !== true) {
          const isPending = !!(pendingRequests[checkDateKey] && 
                               pendingRequests[checkDateKey][student.student_id] && 
                               pendingRequests[checkDateKey][student.student_id][task.id]);
          outstanding.push({
            dateKey: checkDateKey,
            taskId: task.id,
            date: `${month}월 ${dateStr}일`,
            task_name: task.name,
            points: task.points,
            is_pending: isPending
          });
        }
      });
    }
  }

  if (outstanding.length > 0) {
    outstanding.forEach(item => {
      const div = document.createElement('div');
      div.className = "outstanding-item";
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.style.alignItems = 'center';
      div.style.padding = '6px 0';
      div.style.borderBottom = '1px dashed var(--border-color)';
      
      let statusHtml = "";
      if (item.is_pending) {
        statusHtml = `<span class="portal-task-status-pending" style="font-size: 11px; padding: 2px 6px;">⏳ 승인 대기 중</span>`;
      } else {
        statusHtml = `<button class="btn-portal-request" style="font-size: 11px; padding: 4px 8px;" onclick="requestTaskApproval('${student.student_id}', '${item.taskId}', '${item.task_name}', '${item.dateKey}', ${item.points || 3})">✔️ 완료 요청</button>`;
      }
      
      div.innerHTML = `<span style="font-size: 14px; font-weight: bold; color: var(--text-main);">${item.is_pending ? '⏳' : '🔴'} [${item.date}] - ${item.task_name}</span> ${statusHtml}`;
      outstandingEl.appendChild(div);
    });
  } else {
    outstandingEl.innerHTML = `<div class="no-outstanding-msg">🎉 최근 7일 내 밀린 과제가 한 개도 없어요! 참 잘했습니다.</div>`;
  }

  const historyEl = document.getElementById('portal-history-list');
  historyEl.innerHTML = '';

  const studentHistory = pointHistory
    .filter(log => log.student_id === studentId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 15);

  if (studentHistory.length === 0) {
    historyEl.innerHTML = `<div style="text-align:center;padding:15px;color:var(--text-muted)">변동 이력이 없습니다.</div>`;
    return;
  }

  studentHistory.forEach(log => {
    const row = document.createElement('div');
    row.className = "history-item-row";
    
    const changeVal = log.points_changed;
    const sign = changeVal > 0 ? "+" : "";
    const isPositive = changeVal > 0;
    
    const logTime = new Date(log.timestamp);
    const timeFormatted = `${logTime.getMonth() + 1}/${logTime.getDate()} ${String(logTime.getHours()).padStart(2, '0')}:${String(logTime.getMinutes()).padStart(2, '0')}`;

    row.innerHTML = `
      <span class="points-badge ${isPositive ? 'positive' : 'negative'}">[${sign}${changeVal}점]</span>
      <span class="reason">${log.reason}</span>
      <span class="time">${timeFormatted}</span>
    `;
    historyEl.appendChild(row);
  });
};

const requestTaskApproval = (studentId, taskId, taskName, dateKey, points) => {
  const targetDate = dateKey || getTodayDateString();
  if (!pendingRequests[targetDate]) {
    pendingRequests[targetDate] = {};
  }
  if (!pendingRequests[targetDate][studentId]) {
    pendingRequests[targetDate][studentId] = {};
  }
  
  const reqObj = {
    requested: true,
    taskName: taskName,
    points: points || 3
  };
  pendingRequests[targetDate][studentId][taskId] = reqObj;
  
  // 로컬 저장
  localStorage.setItem('pendingRequests', JSON.stringify(pendingRequests));
  
  const showSuccess = (isSynced) => {
    playAudioEffect('coin');
    if (isSynced) {
      alert(`📥 '${taskName}' 과제 완료 승인 요청이 교사 대시보드로 전송되었습니다!`);
    } else {
      alert(`⚠️ 실시간 동기화(Firebase)가 연결되지 않아 교사 대시보드로 전송되지 않고 로컬에만 저장되었습니다.\n교사용 대시보드에서 생성된 최신 QR 코드를 다시 스캔해 주세요.`);
    }
    renderStudentPortal(studentId);
  };
  
  // 파이어베이스 동기화 모드 시 개별 경로 원자적 갱신으로 동시성 보장
  if (currentSyncMode === 'firebase' && dbRef) {
    dbRef.child('pendingRequests').child(targetDate).child(studentId).child(taskId).set(reqObj)
      .then(() => {
        showSuccess(true);
      })
      .catch(err => {
        console.error("[Firebase] 완료 요청 업로드 실패:", err);
        const errStr = err.message || '';
        if (errStr.includes('permission_denied') || errStr.toLowerCase().includes('permission denied')) {
          alert(`❌ 과제 승인 요청 전송에 실패했습니다: 권한 없음 (Permission Denied)\n\n교사 대시보드 설정에서 개인 파이어베이스 서버를 생성해 연동하셔야 합니다.\n\n[조치 방법]\n1. 본인의 Firebase 콘솔에서 Realtime Database를 생성합니다.\n2. 규칙(Rules) 탭에서 ".read": true, ".write": true 로 변경하여 공개합니다.\n3. 교사 대시보드 '⚙️ 기본설정' 탭에서 개인 파이어베이스 주소 및 API 키를 입력하여 저장해 주세요.`);
        } else {
          alert(`❌ 과제 승인 요청 전송에 실패했습니다: ${err.message}\n인터넷 연결을 확인하고 다시 시도해 주세요.`);
        }
      });
  } else {
    showSuccess(false);
  }
};

const getWeekdaysOfCurrentWeek = (dateStr) => {
  const d = parseLocalDate(dateStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 월요일 날짜 구하기
  const monday = new Date(d.setDate(diff));
  
  const weekdays = [];
  for (let i = 0; i < 5; i++) {
    const temp = new Date(monday);
    temp.setDate(monday.getDate() + i);
    weekdays.push(formatLocalDate(temp));
  }
  return weekdays;
};

const checkWeeklyBonus = (student, todayStr) => {
  const weekdays = getWeekdaysOfCurrentWeek(todayStr);
  const weekId = weekdays[0]; // 월요일 날짜를 주 고유 ID로 사용
  
  // 이미 이번 주 보너스를 받았는지 체크
  student.weekly_bonus = student.weekly_bonus || {};
  if (student.weekly_bonus[weekId]) {
    return false;
  }
  
  // 오늘이 금요일(5), 토요일(6), 일요일(0) 인 경우에만 주간 완료 보너스 지급 판정
  const d = parseLocalDate(todayStr);
  const isFridayOrLater = d.getDay() >= 5 || d.getDay() === 0;
  if (!isFridayOrLater) {
    return false;
  }
  
  // 월~금 모든 날짜에 대해 출석 및 과제 완수 검증
  let isAllComplete = true;
  for (const date of weekdays) {
    // 1. 출석체크 검사
    const attended = student.attendance && student.attendance[date] === true;
    if (!attended) {
      isAllComplete = false;
      break;
    }
    
    // 2. 과제 제출 검사
    const tasks = dailyAssignments[date] || [];
    const dayLogs = dailyLogs[date] || {};
    const studentLog = dayLogs[student.student_id] || {};
    
    for (const task of tasks) {
      if (studentLog[task.id] !== true) {
        isAllComplete = false;
        break;
      }
    }
    if (!isAllComplete) break;
  }
  
  if (isAllComplete) {
    // 보너스 점수 지급 (+1점)
    student.weekly_bonus[weekId] = true;
    student.total_points = parseInt(student.total_points || 0) + 1;
    
    // 이력 등록
    const bonusItem = {
      student_id: student.student_id,
      timestamp: new Date().toISOString(),
      points_changed: 1,
      reason: `🎁 [주간 완수 보너스] 이번 주 출석 및 과제 100% 완수 보너스 (+1)`,
      is_weekly_bonus: true
    };
    pointHistory.push(bonusItem);
    return true;
  }
  
  return false;
};

const checkStudentAttendance = (studentId) => {
  const student = students.find(s => s.student_id === studentId);
  if (!student) return;

  const todayStr = getTodayDateString();
  student.attendance = student.attendance || {};
  if (student.attendance[todayStr]) {
    alert("이미 오늘 출석 체크를 완료했습니다.");
    return;
  }

  // 1. 출석 체크 처리 (점수는 더하지 않고 출석 마크만 저장)
  student.attendance[todayStr] = true;

  // 2. 주간 완수 보너스 검증 실행
  const gotBonus = checkWeeklyBonus(student, todayStr);

  // 저장 및 포털 화면 새로고침
  saveData();
  
  if (gotBonus) {
    playAudioEffect('coin');
    alert("🎉 오늘 출석 체크가 완료되었습니다!\n\n🎁 축하합니다! 이번 주 출석 및 과제를 100% 완수하여 주간 보너스 신용점수 1점이 추가 적립되었습니다!");
  } else {
    playAudioEffect('coin');
    alert("🎉 오늘 출석 체크가 완료되었습니다!");
  }
  
  renderStudentPortal(studentId);
};
window.checkStudentAttendance = checkStudentAttendance;


// ==========================================================================
// 12. 해시 라우터 및 초기 구동화면 스위칭 (Router)
// ==========================================================================

const router = () => {
  const hash = window.location.hash;
  const teacherView = document.getElementById('teacher-view');
  const studentView = document.getElementById('student-view');
  const studentLoginView = document.getElementById('student-login-view');
  const teacherLoginView = document.getElementById('teacher-login-view');
  const landingView = document.getElementById('landing-view');

  if (hash.startsWith("#student/")) {
    let studentId = hash.split("/")[1];
    
    // 번호 한 자리 입력 자동 보정 (예: 1 -> 01) 후 리다이렉트
    if (studentId.length === 1 && !isNaN(studentId)) {
      studentId = studentId.padStart(2, '0');
      window.location.hash = `student/${studentId}`;
      return;
    }
    
    teacherView.classList.add('hidden');
    if (studentLoginView) studentLoginView.classList.add('hidden');
    if (teacherLoginView) teacherLoginView.classList.add('hidden');
    if (landingView) landingView.classList.add('hidden');
    studentView.classList.remove('hidden');
    
    renderStudentPortal(studentId);
  } else if (hash === "#teacher") {
    if (isTeacherAuthenticated()) {
      studentView.classList.add('hidden');
      if (studentLoginView) studentLoginView.classList.add('hidden');
      if (teacherLoginView) teacherLoginView.classList.add('hidden');
      if (landingView) landingView.classList.add('hidden');
      teacherView.classList.remove('hidden');
      switchTab('dashboard');
    } else {
      // 인증되지 않은 경우 통합 랜딩 뷰로 리다이렉트하여 교사 로그인이 보이게 함
      window.location.hash = "#landing";
    }
  } else if (hash === "#student-login" || hash === "#landing") {
    // 학생 수첩 조회화면 또는 통합 랜딩 뷰 명시적 진입
    // 교사가 로그인한 상태이더라도 대시보드로 리다이렉트하지 않고 조회 화면을 보여줌
    teacherView.classList.add('hidden');
    studentView.classList.add('hidden');
    if (studentLoginView) studentLoginView.classList.add('hidden');
    if (teacherLoginView) teacherLoginView.classList.add('hidden');
    if (landingView) landingView.classList.remove('hidden');
  } else {
    // 디폴트 메인화면: 통합 랜딩 뷰 (#landing)
    // 교사가 이미 로그인한 상태라면 대시보드로 자동 리다이렉트
    if (isTeacherAuthenticated()) {
      window.location.hash = "#teacher";
      return;
    }
    
    teacherView.classList.add('hidden');
    studentView.classList.add('hidden');
    if (studentLoginView) studentLoginView.classList.add('hidden');
    if (teacherLoginView) teacherLoginView.classList.add('hidden');
    if (landingView) landingView.classList.remove('hidden');
    
    // 로그인 인풋 및 에러 메시지 초기화
    const landingStudentIdEl = document.getElementById('landing-student-id');
    const landingStudentNameEl = document.getElementById('landing-student-name');
    const landingLoginErrorEl = document.getElementById('landing-login-error');
    if (landingStudentIdEl) landingStudentIdEl.value = "";
    if (landingStudentNameEl) landingStudentNameEl.value = "";
    if (landingLoginErrorEl) landingLoginErrorEl.classList.add('hidden');
  }
};
// 12-1. 학생 조회용 포털 로그인 로직 (통합 랜딩 및 레거시 지원)
const submitStudentLogin = () => {
  const idInputEl = document.getElementById('landing-student-id') || document.getElementById('login-student-id');
  const nameInputEl = document.getElementById('landing-student-name') || document.getElementById('login-student-name');
  const errorMsg = document.getElementById('landing-login-error') || document.getElementById('login-error-msg');
  
  if (!idInputEl || !nameInputEl) return;
  const idInput = idInputEl.value.trim();
  const nameInput = nameInputEl.value.trim();
  
  let formattedId = idInput;
  // 번호 한 자리 입력 자동 보정 (예: 5 -> 05)
  if (idInput.length === 1 && !isNaN(idInput)) {
    formattedId = idInput.padStart(2, '0');
  }
  
  const matchedStudent = students.find(s => s.student_id === formattedId && s.name === nameInput);
  
  if (matchedStudent) {
    if (errorMsg) errorMsg.classList.add('hidden');
    window.location.hash = `student/${matchedStudent.student_id}`;
  } else {
    if (errorMsg) errorMsg.classList.remove('hidden');
  }
};

const goBackToStudentPortalLogin = () => {
  if (referrerView === "teacher") {
    window.location.hash = "#teacher"; // 교사용 관리판으로 복귀
    setTimeout(() => switchTab('roster'), 50); // 점수 관리 탭 강제 활성화
  } else {
    window.location.hash = "landing";
  }
};

const getStudentPortalQueryString = () => {
  if (currentSyncMode === 'firebase' && firebaseConfig && firebaseConfig.databaseURL) {
    // 공용 파이어베이스를 사용하는 경우 URL 단축을 위해 syncKey만 포함
    if (firebaseConfig.databaseURL === defaultFirebaseConfig.databaseURL) {
      const params = new URLSearchParams({
        syncKey: firebaseConfig.classroomSyncKey || ''
      });
      return "?" + params.toString();
    } else {
      // 커스텀 파이어베이스를 사용하는 경우 전체 설정을 유지
      const params = new URLSearchParams({
        dbUrl: firebaseConfig.databaseURL,
        apiKey: firebaseConfig.apiKey || '',
        projId: firebaseConfig.projectId || '',
        syncKey: firebaseConfig.classroomSyncKey || ''
      });
      return "?" + params.toString();
    }
  } else if (currentSyncMode === 'gdrive' && googleClientId) {
    return "?gClientId=" + encodeURIComponent(googleClientId);
  }
  return "";
};

const copyStudentPortalLink = () => {
  const queryStr = getStudentPortalQueryString();
  
  let basePortalUrl = window.location.origin + window.location.pathname;
  if (basePortalUrl.includes('localhost') || basePortalUrl.includes('127.0.0.1')) {
    basePortalUrl = "https://fosvmd-ai.github.io/classroom-dashboard/";
  }
  const fullPortalUrl = basePortalUrl + queryStr + "#landing";
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(fullPortalUrl)
      .then(() => {
        alert("📋 학생 수첩 조회 링크가 클립보드에 복사되었습니다!\n\n링크: " + fullPortalUrl);
      })
      .catch(err => {
        console.error("클립보드 복사 실패, 대체 방식 시도:", err);
        fallbackCopyText(fullPortalUrl);
      });
  } else {
    fallbackCopyText(fullPortalUrl);
  }
};

const fallbackCopyText = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Keep it off-screen
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      alert("📋 학생 수첩 조회 링크가 클립보드에 복사되었습니다!\n\n링크: " + text);
    } else {
      alert("링크 복사에 실패했습니다. 아래 주소를 직접 복사해 주세요:\n\n" + text);
    }
  } catch (err) {
    console.error("대체 방식 복사 실패:", err);
    alert("링크 복사에 실패했습니다. 아래 주소를 직접 복사해 주세요:\n\n" + text);
  }

  document.body.removeChild(textArea);
};


const verifyStudentPortalPasscode = (studentId) => {
  const input = document.getElementById('student-portal-verify-input');
  const errorEl = document.getElementById('student-portal-verify-error');
  if (!input) return;
  
  const val = input.value.trim();
  if (val === (config.student_passcode || "").trim()) {
    sessionStorage.setItem('student_portal_verified_' + studentId, 'true');
    renderStudentPortal(studentId);
  } else {
    if (errorEl) errorEl.classList.remove('hidden');
    input.value = "";
    input.focus();
    playAudioEffect('buzz');
  }
};

const isTeacherAuthenticated = () => {
  if (currentSyncMode === 'gdrive') {
    return !!googleAccessToken;
  }
  // Electron 데스크톱 앱 내에서 구동 중이거나, 교사 비밀번호 인증 토큰이 활성화된 경우 교사로 판정
  if (window.electronAPI && window.electronAPI.isElectron) {
    return true;
  }
  if (sessionStorage.getItem('teacher_authenticated') === 'true') {
    return true;
  }
  if (currentSyncMode === 'firebase') {
    return !!firebaseUser;
  }
  return false;
};

window.submitStudentLogin = submitStudentLogin;
window.goBackToStudentPortalLogin = goBackToStudentPortalLogin;
window.copyStudentPortalLink = copyStudentPortalLink;
window.verifyStudentPortalPasscode = verifyStudentPortalPasscode;


// ==========================================================================
// 14. 학급 고도화 4대 핵심 기능 (발표자 추첨, 사운드 합성, 달성률 게이지, Confetti)
// ==========================================================================

// 14-1. 테마 스위처 (다크 모드 / 라이트 모드)
const toggleTheme = () => {
  const body = document.body;
  body.classList.toggle('dark-theme');
  const isDark = body.classList.contains('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  updateThemeButton();
};

const updateThemeButton = () => {
  const btn = document.getElementById('btn-theme-toggle');
  if (!btn) return;
  if (document.body.classList.contains('dark-theme')) {
    btn.innerText = "☀️ 화면 밝게";
    btn.style.backgroundColor = "#e2e8f0";
    btn.style.borderColor = "#cbd5e1";
    btn.style.color = "#1e293b";
  } else {
    btn.innerText = "🌗 화면 어둡게";
    btn.style.backgroundColor = "#6366f1";
    btn.style.borderColor = "#4f46e5";
    btn.style.color = "#ffffff";
  }
};

// 14-2. Web Audio API 효과음 합성기
const toggleVolume = () => {
  const isMuted = localStorage.getItem('volume_muted') === 'true';
  const newMuted = !isMuted;
  localStorage.setItem('volume_muted', String(newMuted));
  updateVolumeButton();
};

const updateVolumeButton = () => {
  const btn = document.getElementById('btn-volume-toggle');
  if (!btn) return;
  const isMuted = localStorage.getItem('volume_muted') === 'true';
  if (isMuted) {
    btn.innerText = "🔇 소리 끔";
    btn.style.backgroundColor = "#64748b";
    btn.style.borderColor = "#475569";
  } else {
    btn.innerText = "🔊 소리 켬";
    btn.style.backgroundColor = "#f59e0b";
    btn.style.borderColor = "#d97706";
  }
};

const playAudioEffect = (type) => {
  const isMuted = localStorage.getItem('volume_muted') === 'true';
  if (isMuted) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  
  try {
    const ctx = new AudioContext();
    if (type === 'coin') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.25);
      
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      
      osc.start(now);
      osc.stop(now + 0.25);
    } 
    else if (type === 'buzz') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.005, now + 0.35);
      
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.3);
      
      osc.start(now);
      osc.stop(now + 0.35);
    } 
    else if (type === 'chime') {
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((f, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + index * 0.08);
        gain.gain.setValueAtTime(0.04, now + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.5);
        
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.5);
      });
    } 
    else if (type === 'triumph') {
      const now = ctx.currentTime;
      const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((f, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + index * 0.05);
        gain.gain.setValueAtTime(0.05, now + index * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.002, now + index * 0.05 + 0.7);
        
        osc.start(now + index * 0.05);
        osc.stop(now + index * 0.05 + 0.7);
      });
    }
  } catch (err) {
    console.error("Audio Synthesis Error:", err);
  }
};

// 14-3. 오늘의 학급 과제 달성률 게이지 및 Confetti
const updateClassProgress = () => {
  const dateStr = currentDashboardDate || new Date().toISOString().split('T')[0];
  const todayTasks = dailyAssignments[dateStr] || [];
  const totalStudents = students.length;
  
  const progressBarFill = document.getElementById('class-progress-bar-fill');
  const progressText = document.getElementById('class-progress-text');
  
  if (todayTasks.length === 0 || totalStudents === 0) {
    if (progressBarFill) progressBarFill.style.width = '0%';
    if (progressText) progressText.innerText = "제출률: 0% (완료 0 / 총 0건) - 오늘의 설정된 과제가 없습니다.";
    return;
  }
  
  let totalExpected = todayTasks.length * totalStudents;
  let totalCompleted = 0;
  
  students.forEach(student => {
    const studentLog = (dailyLogs[dateStr] && dailyLogs[dateStr][student.student_id]) || {};
    todayTasks.forEach(task => {
      if (studentLog[task.id] === true) {
        totalCompleted++;
      }
    });
  });
  
  const percent = Math.round((totalCompleted / totalExpected) * 100);
  
  if (progressBarFill) progressBarFill.style.width = `${percent}%`;
  if (progressText) progressText.innerText = `제출률: ${percent}% (완료 ${totalCompleted} / 총 ${totalExpected}건)`;
  
  // 100% 달성 시 폭죽 세레머니
  if (percent === 100 && totalCompleted > 0) {
    const flagKey = `class_progress_all_clear_${dateStr}`;
    if (sessionStorage.getItem(flagKey) !== 'true') {
      sessionStorage.setItem(flagKey, 'true');
      triggerConfettiEffect();
      playAudioEffect('triumph');
    }
  }
};

// Confetti 캔버스 애니메이션
let confettiActive = false;
let confettiAnimationId = null;
const confettiParticles = [];
const confettiColors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

class ConfettiParticle {
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * -canvasHeight - 20;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 10 - 5;
    this.size = Math.random() * 8 + 6;
    this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    this.speedX = Math.random() * 4 - 2;
    this.speedY = Math.random() * 5 + 3;
  }
  
  update(canvasWidth, canvasHeight) {
    this.x += this.speedX;
    this.y += this.speedY;
    this.rotation += this.rotationSpeed;
    
    if (this.y > canvasHeight) {
      this.y = -20;
      this.x = Math.random() * canvasWidth;
    }
  }
  
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

const triggerConfettiEffect = () => {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  confettiParticles.length = 0;
  for (let i = 0; i < 150; i++) {
    confettiParticles.push(new ConfettiParticle(canvas.width, canvas.height));
  }
  
  if (confettiAnimationId) {
    cancelAnimationFrame(confettiAnimationId);
  }
  
  confettiActive = true;
  let duration = 240; // 4 seconds at 60fps
  
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (duration <= 0) {
      confettiActive = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    
    confettiParticles.forEach(p => {
      p.update(canvas.width, canvas.height);
      p.draw(ctx);
    });
    
    duration--;
    confettiAnimationId = requestAnimationFrame(animate);
  };
  
  animate();
};

// 14-4. 슬롯머신 발표자 추첨기


const autoSyncOnLoad = async () => {
  if (currentSyncMode === 'gdrive') {
    if (googleClientId && googleAccessToken) {
      try {
        await fetchUserProfile();
        await syncWithGoogleDrive();
        console.log("[Google Drive] 자동 동기화 성공");
      } catch (err) {
        console.warn("[Google Drive] 자동 동기화 실패 (인증 만료 등):", err);
      } finally {
        updateSyncStatusUI();
      }
    } else {
      updateSyncStatusUI();
    }
  } else if (currentSyncMode === 'firebase') {
    initFirebaseSync();
  } else {
    updateSyncStatusUI();
  }
};




// 알림장 날짜 변경 이벤트 핸들러 (이벤트 위임)
document.addEventListener('change', (e) => {
  if (e.target && e.target.id === 'announcement-date-input') {
    currentAnnouncementDate = e.target.value;
    const displayEl = document.getElementById('announcement-date-display');
    const contentEl = document.getElementById('announcement-content');
    if (displayEl) displayEl.innerText = formatKoreanDate(currentAnnouncementDate);
    if (contentEl) {
      contentEl.innerText = dailyAnnouncements[currentAnnouncementDate] || "";
    }
  }
  
  if (e.target && e.target.id === 'portal-announcement-date-input') {
    currentPortalAnnouncementDate = e.target.value;
    const displayEl = document.getElementById('portal-announcement-date-display');
    const contentEl = document.getElementById('portal-announcement-content');
    if (displayEl) displayEl.innerText = formatKoreanDate(currentPortalAnnouncementDate);
    if (contentEl) {
      contentEl.innerText = dailyAnnouncements[currentPortalAnnouncementDate] || "알림장이 없습니다.";
    }
  }
});

window.addEventListener('hashchange', router);
window.onload = () => {
  // 학생용 수첩 원래 HTML 레이아웃을 전역 백업 (비밀번호 확인창 등으로 덮어쓰기될 경우 복원용)
  const studentViewEl = document.getElementById('student-view');
  if (studentViewEl) {
    window.originalStudentViewHtml = studentViewEl.innerHTML;
  }
  parseUrlParams(); // URL 파라미터로 전파된 구글 클라이언트 ID 파싱
  initDatabaseMigration(); // 데이터 로드 마이그레이션 적용
  
  // 테마 및 볼륨 초기화
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
  updateThemeButton();
  updateVolumeButton();
  
  startClock();
  
  autoSyncOnLoad();
  
  // 학급 달성률 게이지 업데이트
  updateClassProgress();
  
  // 일렉트론 데스크톱 환경 초기화
  if (window.electronAPI && window.electronAPI.isElectron) {
    const elSettings = document.getElementById('electron-only-settings');
    if (elSettings) {
      elSettings.classList.remove('hidden');
    }
    const alwaysOnTopCheck = document.getElementById('electron-always-on-top');
    const isAlwaysOnTop = localStorage.getItem('electronAlwaysOnTop') === 'true';
    if (alwaysOnTopCheck) {
      alwaysOnTopCheck.checked = isAlwaysOnTop;
    }
    if (window.electronAPI.setAlwaysOnTop) {
      window.electronAPI.setAlwaysOnTop(isAlwaysOnTop);
    }
  }

  // 교사 로그인/설정 펜딩 처리 실행 (웹 버전 동적 승급 대응)
  
  router();
};
