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

const saveData = () => {
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

  if (isSyncingFromRemote) return;

  // 보안 강화: 학생 기기(비인증 상태)는 전체 원격 데이터 동기화를 차단하여 덮어쓰기 방지
  if (!isTeacherAuthenticated()) {
    console.log("[Sync Security] 비인증 기기의 전체 원격 저장 차단");
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
};

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
    
    dbRef = firebase.database().ref('classrooms/' + syncKey);
    dbRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        applyRemoteData(data);
      } else {
        console.log("[Firebase] 데이터 수신: 데이터가 없습니다 (null).");
        isFirebaseDataLoaded = true;
        
        // 교사 기기이고 아직 원격 DB가 비어있는 상태라면, 로컬 상태를 기준으로 원격을 초기화
        if (isTeacherAuthenticated() && !isSyncingFromRemote) {
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
    
    // Auth 상태 리스너
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
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

const loginWithFirebaseGoogle = () => {
  if (!firebaseConfig || !firebaseConfig.apiKey || !firebaseConfig.databaseURL || !firebaseConfig.projectId) {
    alert("❌ 먼저 파이어베이스 데이터베이스 정보(URL, API Key, Project ID)를 저장해 주세요.");
    return;
  }
  
  try {
    if (firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
    const provider = new firebase.auth.GoogleAuthProvider();
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
  if (firebase.apps.length > 0) {
    firebase.auth().signOut().then(() => {
      firebaseUser = null;
      localStorage.removeItem('firebaseUser');
      alert("로그아웃 되었습니다.");
      location.reload();
    }).catch(err => {
      console.error(err);
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
  
  let totalDeductionsCount = 0;
  
  datesToProcess.forEach(processDate => {
    students.forEach(student => {
      assignmentDates.forEach(assignDate => {
        if (assignDate >= processDate) return;
        
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
            // pointHistory에서 완료 로그(points_changed > 0) 중 가장 최신 것을 역순 검색
            const compLog = [...pointHistory].reverse().find(log => 
              log.student_id === student.student_id && 
              log.assignment_date === assignDate && 
              log.task_id === task.id && 
              log.points_changed > 0
            );
            if (compLog) {
              const compDate = compLog.timestamp.substring(0, 10);
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

const renderTeacherDashboard = () => {
  const gridEl = document.getElementById('students-grid');
  const unsubmittedEl = document.getElementById('unsubmitted-container');
  const btnAllDeduct = document.getElementById('btn-all-unsubmitted-deduct');
  
  const todayStr = currentDashboardDate;
  const todayLogs = dailyLogs[todayStr] || {};
  const todayTasks = dailyAssignments[todayStr] || [];

  if (currentDashboardViewMode === 'students') {
    if (gridEl) gridEl.classList.remove('hidden');
    if (unsubmittedEl) unsubmittedEl.classList.add('hidden');
    if (btnAllDeduct) btnAllDeduct.classList.add('hidden');
    
    gridEl.innerHTML = '';
    students.forEach((student, index) => {
      const studentLog = todayLogs[student.student_id] || {};
      const grade = evaluateGrade(student.total_points);
      
      let tasksHtml = '<div class="card-tasks-area">';
      let allComplete = todayTasks.length > 0;

      if (todayTasks.length > 0) {
        todayTasks.forEach(task => {
          const completed = studentLog[task.id] === true;
          if (!completed) allComplete = false;
          
          const emoji = getTaskEmoji(task.name);
          tasksHtml += `
            <div class="large-task-icon-wrapper ${completed ? 'completed' : ''}" 
                 onclick="toggleSingleTaskFromCard(event, '${student.student_id}', '${task.id}', ${task.points}, '${task.name}')"
                 title="${task.name} (${task.points}점) - 클릭 시 즉시 토글">
               <span class="large-task-emoji">${emoji}</span>
               <span class="task-status-dot ${completed ? 'completed' : ''}"></span>
            </div>
          `;
        });
      } else {
        allComplete = false;
        tasksHtml += `<span class="no-tasks-text">설정된 과제 없음 ⚪</span>`;
      }
      tasksHtml += '</div>';

      let smallGradeHtml = "";
      if (grade.icon) {
        smallGradeHtml = `<img src="${grade.icon}" class="small-grade-icon" title="${grade.name}">`;
      } else {
        smallGradeHtml = `<span class="small-grade-emoji" title="${grade.name}">${grade.emoji || '🌱'}</span>`;
      }

      const isAbsent = (absentLogs[todayStr] && absentLogs[todayStr][student.student_id] === true);
      const absentBadgeHtml = isAbsent ? `<span class="absent-badge" title="결석 (미제출 감점 유예 적용)">🤒 결석</span>` : '';
      
      const card = document.createElement('div');
      card.className = `student-card ${allComplete ? 'all-complete' : ''} ${isAbsent ? 'student-absent' : ''}`;
      card.onclick = (e) => openAssignmentModalByCard(e, student.student_id);
      
      card.setAttribute('draggable', 'true');
      const currentIndex = index;
      card.addEventListener('dragstart', (e) => handleDragStart(e, currentIndex));
      card.addEventListener('dragover', handleDragOver);
      card.addEventListener('dragenter', handleDragEnter);
      card.addEventListener('dragleave', handleDragLeave);
      card.addEventListener('drop', (e) => handleDrop(e, currentIndex));
      card.addEventListener('dragend', handleDragEnd);
      
      card.innerHTML = `
        <div class="card-id-name">
          <span class="student-number-badge">${student.student_id}</span>
          <span class="student-name-text">${student.name}</span>
          ${smallGradeHtml}
          ${absentBadgeHtml}
          <span class="student-points-text">(${student.total_points}점)</span>
        </div>
        ${tasksHtml}
      `;
      
      gridEl.appendChild(card);
    });
  } else {
    if (gridEl) gridEl.classList.add('hidden');
    if (unsubmittedEl) unsubmittedEl.classList.remove('hidden');
    if (btnAllDeduct) btnAllDeduct.classList.remove('hidden');
    
    renderUnsubmittedView(currentDashboardDate);
  }



  // 과제 이모지 범례 및 헤더 완료 범례 갱신
  const legendBar = document.getElementById('assignment-legend-bar');
  const legendEl = document.querySelector('.section-header .legend');
  
  if (legendEl) {
    if (currentDashboardViewMode === 'students') {
      legendEl.classList.remove('hidden');
    } else {
      legendEl.classList.add('hidden');
    }
  }

  if (legendBar) {
    legendBar.innerHTML = '';
    if (todayTasks.length > 0 && currentDashboardViewMode === 'students') {
      todayTasks.forEach(task => {
        const emoji = getTaskEmoji(task.name);
        let cleanName = task.name;
        if (cleanName.startsWith(emoji)) {
          cleanName = cleanName.replace(emoji, '').trim();
        }
        
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<span class="legend-emoji">${emoji}</span><span class="legend-name">${cleanName}</span><span class="legend-points">+${task.points}점</span>`;
        legendBar.appendChild(item);
      });
      legendBar.classList.remove('hidden');
    } else {
      legendBar.classList.add('hidden');
    }
  }

  // 날짜 선택기 상태 및 제목 동기화 갱신
  const titleEl = document.getElementById('dashboard-date-title');
  if (titleEl) {
    const todayStrReal = getTodayDateString();
    if (currentDashboardDate === todayStrReal) {
      if (currentDashboardViewMode === 'students') {
        titleEl.innerText = `👥 우리 반 학생 현황 (오늘)`;
      } else {
        titleEl.innerText = `📚 과제별 미제출자 현황 (오늘)`;
      }
    } else {
      if (currentDashboardViewMode === 'students') {
        titleEl.innerText = `👥 우리 반 학생 현황 (${currentDashboardDate})`;
      } else {
        titleEl.innerText = `📚 과제별 미제출자 현황 (${currentDashboardDate})`;
      }
    }
  }

  const picker = document.getElementById('dashboard-date-picker');
  if (picker) picker.value = currentDashboardDate;

  const announceDateDisplay = document.getElementById('announcement-date-display');
  const announceDateInput = document.getElementById('announcement-date-input');
  if (announceDateInput) announceDateInput.value = currentAnnouncementDate;
  if (announceDateDisplay) announceDateDisplay.innerText = formatKoreanDate(currentAnnouncementDate);

  const announceText = dailyAnnouncements[currentAnnouncementDate] || "";
  const announceContentEl = document.getElementById('announcement-content');
  if (announceContentEl && document.activeElement !== announceContentEl) {
    announceContentEl.innerText = announceText;
  }
  updateWeeklyLeaderboard();
  updateClassProgress();
  renderApprovalRequestsWidget();
};

// 4-1. 대시보드 조회 날짜 변경 및 오늘 날짜 복귀 제어
const changeDashboardDate = (dateVal) => {
  if (!dateVal) return;
  currentDashboardDate = dateVal;
  renderTeacherDashboard();
};

const resetDashboardDateToToday = () => {
  const todayStr = getTodayDateString();
  currentDashboardDate = todayStr;
  const picker = document.getElementById('dashboard-date-picker');
  if (picker) picker.value = todayStr;
  renderTeacherDashboard();
};

// ==========================================================================
// 5. [전면개편] 월간 달력 및 [신규] 동적 과제 빌더 모달 (Tab 2)
// ==========================================================================

let currentCalendarYear = 2026;
let currentCalendarMonth = 5;
let selectedRecordDate = "";
let activeCreateDate = ""; // 과제 생성용 목표 날짜

const initDailyRecordsTab = () => {
  const today = new Date();
  currentCalendarYear = today.getFullYear();
  currentCalendarMonth = today.getMonth();
};

const navigateMonth = (offset) => {
  currentCalendarMonth += offset;
  if (currentCalendarMonth < 0) {
    currentCalendarMonth = 11;
    currentCalendarYear--;
  } else if (currentCalendarMonth > 11) {
    currentCalendarMonth = 0;
    currentCalendarYear++;
  }
  renderCalendar();
};

const renderCalendar = () => {
  const monthDisplay = String(currentCalendarMonth + 1).padStart(2, '0');
  document.getElementById('calendar-month-year').innerText = `${currentCalendarYear}년 ${monthDisplay}월`;

  const gridEl = document.getElementById('calendar-days-grid');
  gridEl.innerHTML = '';

  const firstDayIndex = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
  const lastDayDate = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();
  const todayStr = getTodayDateString();

  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = "calendar-day empty";
    gridEl.appendChild(emptyCell);
  }

  for (let day = 1; day <= lastDayDate; day++) {
    const dayIndex = (firstDayIndex + day - 1) % 7;
    const dayStr = String(day).padStart(2, '0');
    const dateKey = `${currentCalendarYear}-${monthDisplay}-${dayStr}`;

    const tasks = dailyAssignments[dateKey] || [];
    const dayLogs = dailyLogs[dateKey] || {};

    let statsHtml = "";
    
    // 과제판이 존재한다면 집계 배지 렌더링
    if (tasks.length > 0) {
      statsHtml = `<div class="calendar-stats">`;
      let allCompletedCount = 0;
      
      const counts = {};
      tasks.forEach(t => counts[t.id] = 0);

      Object.values(dayLogs).forEach(log => {
        if (!log || typeof log !== 'object') return;
        let studentCompleteCount = 0;
        tasks.forEach(t => {
          if (log[t.id]) {
            counts[t.id]++;
            studentCompleteCount++;
          }
        });
        if (studentCompleteCount === tasks.length) {
          allCompletedCount++;
        }
      });

      if (allCompletedCount === students.length && students.length > 0) {
        statsHtml += `<div class="stat-badge all-completed" style="justify-content:center;margin-bottom:4px;">🎉 올클리어!</div>`;
      }
      tasks.forEach((t, idx) => {
        const count = counts[t.id] || 0;
        const uncompleted = students.length - count;
        
        // 과제 아이콘(이모지)과 전체 과제명을 함께 노출
        const emoji = getTaskEmoji(t.name);
        let nameWithoutEmoji = t.name;
        if (nameWithoutEmoji.startsWith(emoji)) {
          nameWithoutEmoji = nameWithoutEmoji.replace(emoji, '').trim();
        }
        const cleanName = `${emoji} ${nameWithoutEmoji}`;
        
        // 전원 제출이 완료된 과제는 녹색(all-completed) 배지로 명확하게 구분
        const isFullyCompleted = (uncompleted === 0 && students.length > 0);
        let badgeClass = isFullyCompleted ? "all-completed" : "math";
        
        if (!isFullyCompleted) {
          if (idx === 1) badgeClass = "writing";
          if (idx >= 2) badgeClass = "social";
        }
        
        const badgeContent = isFullyCompleted 
          ? `<span>${cleanName}</span><span>✅ 완료</span>`
          : `<span>${cleanName}</span><span>🟢${count} ⚪${uncompleted}</span>`;
        
        statsHtml += `
          <div class="stat-badge ${badgeClass}" style="${isFullyCompleted ? 'opacity: 0.85;' : ''}">
            ${badgeContent}
          </div>
        `;
      });
      statsHtml += `</div>`;
    }

    const dayCell = document.createElement('div');
    let cellClass = "calendar-day";
    if (dayIndex === 0) cellClass += " sun";
    if (dayIndex === 6) cellClass += " sat";
    if (dateKey === todayStr) cellClass += " today";
    
    dayCell.className = cellClass;
    
    // 과제판이 존재하거나 알림장이 작성되어 있다면 바로 상세조회로 이동
    // 둘 다 없다면 과제 생성 팝업(Modal) 연동
    dayCell.onclick = () => {
      const hasAnnounce = !!dailyAnnouncements[dateKey];
      if (tasks.length > 0 || hasAnnounce) {
        showDateDetail(dateKey);
      } else {
        openCreateAssignmentModal(dateKey);
      }
    };

    const announceText = dailyAnnouncements[dateKey];
    let announceHtml = "";
    if (announceText) {
      const shortText = announceText.replace(/\n/g, ' ').substring(0, 12) + (announceText.length > 12 ? '...' : '');
      announceHtml = `<div class="calendar-announce-badge" style="font-size: 11px; margin-top: 4px; color: #713f12; background: #fffdf0; padding: 2px 6px; border-radius: 4px; border: 1px solid #fde047; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; font-weight: bold;" title="${announceText.replace(/"/g, '&quot;')}">📢 ${shortText}</div>`;
    }

    dayCell.innerHTML = `
      <span class="day-number">${day}</span>
      ${announceHtml}
      ${statsHtml}
    `;

    gridEl.appendChild(dayCell);
  }
};

const showCalendarView = () => {
  document.getElementById('records-detail-view').classList.add('hidden');
  document.getElementById('records-calendar-view').classList.remove('hidden');
  renderCalendar();
};

// ==========================================================================
// [신규] 동적 과제 생성 모달창 처리
// ==========================================================================

const openCreateAssignmentModal = (dateKey) => {
  activeCreateDate = dateKey;
  const existing = dailyAssignments[dateKey] || [];
  
  const existingContainer = document.getElementById('existing-tasks-container');
  const existingList = document.getElementById('existing-tasks-list');
  const modeContainer = document.getElementById('create-modal-mode-container');
  const overwriteCheckbox = document.getElementById('overwrite-existing-tasks');
  const submitBtn = document.getElementById('btn-submit-assignment');
  const modalDesc = document.getElementById('create-modal-desc');
  const modalTitle = document.getElementById('create-modal-title');
  
  if (overwriteCheckbox) overwriteCheckbox.checked = false;
  
  if (existing.length > 0) {
    modalTitle.innerText = `📅 과제 추가/재설정 (${dateKey})`;
    modalDesc.innerText = `기존 과제 목록에 새로운 과제를 추가합니다. 학생들의 기존 제출 기록은 유지됩니다.`;
    
    if (existingContainer && existingList) {
      existingList.innerHTML = '';
      existing.forEach(t => {
        const li = document.createElement('li');
        li.innerText = `${t.name} (+${t.points}점)`;
        existingList.appendChild(li);
      });
      existingContainer.style.display = 'block';
    }
    
    if (modeContainer) modeContainer.style.display = 'flex';
    
    if (submitBtn) {
      submitBtn.innerText = "➕ 기존 과제에 추가하기";
      submitBtn.className = "btn-success btn-large";
      submitBtn.style.backgroundColor = "";
    }
  } else {
    modalTitle.innerText = `📅 새 과제판 생성 (${dateKey})`;
    modalDesc.innerText = `이 날짜의 과제 이름과 체크 시 완료 점수를 각각 설정해 주세요.`;
    
    if (existingContainer) existingContainer.style.display = 'none';
    if (modeContainer) modeContainer.style.display = 'none';
    
    if (submitBtn) {
      submitBtn.innerText = "🚀 과제판 생성하기";
      submitBtn.className = "btn-success btn-large";
      submitBtn.style.backgroundColor = "";
    }
  }
  
  // 개수 선택 기본 1개 초기화
  const countSelect = document.getElementById('create-task-count');
  countSelect.value = "1";
  
  // 이벤트 연결 및 기본 입력 폼 생성
  countSelect.onchange = () => generateTaskInputs();
  generateTaskInputs();

  document.getElementById('create-assignment-modal').classList.remove('hidden');
};

const toggleOverwriteMode = (isChecked) => {
  const submitBtn = document.getElementById('btn-submit-assignment');
  const modalDesc = document.getElementById('create-modal-desc');
  if (submitBtn) {
    if (isChecked) {
      submitBtn.innerText = "🔄 기존 과제 덮어쓰기 (초기화)";
      submitBtn.className = "btn-danger btn-large";
      submitBtn.style.backgroundColor = "#dc2626";
      if (modalDesc) {
        modalDesc.innerText = "⚠️ 경고: 기존 과제와 학생들의 모든 제출 완료 및 점수 기록이 삭제됩니다.";
      }
    } else {
      submitBtn.innerText = "➕ 기존 과제에 추가하기";
      submitBtn.className = "btn-success btn-large";
      submitBtn.style.backgroundColor = "";
      if (modalDesc) {
        modalDesc.innerText = "기존 과제 목록에 새로운 과제를 추가합니다. 학생들의 기존 제출 기록은 유지됩니다.";
      }
    }
  }
};

const closeCreateAssignmentModal = () => {
  document.getElementById('create-assignment-modal').classList.add('hidden');
  activeCreateDate = "";
};

const adjustTaskPoints = (btn, amount) => {
  const parent = btn.parentElement;
  const input = parent.querySelector('.new-task-points');
  if (input) {
    const val = parseInt(input.value) || 1;
    input.value = Math.max(1, val + amount);
  }
};

const generateTaskInputs = () => {
  const container = document.getElementById('create-task-inputs-container');
  container.innerHTML = '';
  
  const count = parseInt(document.getElementById('create-task-count').value);
  const defaultTaskNames = ["📐 수학 익힘책", "📖 주제 글쓰기", "🗺️ 사회 학습지", "📝 영어 단어", "🎨 미술 과제"];

  for (let i = 1; i <= count; i++) {
    const row = document.createElement('div');
    row.className = "task-input-row";
    
    const defaultName = defaultTaskNames[i - 1] || `과제 ${i}`;
    
    row.innerHTML = `
      <label>과제 ${i}:</label>
      <input type="text" class="new-task-name" placeholder="예: ${defaultName}" value="${defaultName}">
      <label style="min-width:30px; text-align:right;">배점:</label>
      <div style="display:flex; align-items:center; gap:4px;">
        <button type="button" class="btn-secondary" onclick="adjustTaskPoints(this, -1)" style="padding:4px 10px; font-weight:bold; cursor:pointer; font-size:12px; border-radius:4px; border:1px solid #cbd5e1;">▼</button>
        <input type="number" class="new-task-points" value="1" min="1" style="width:60px; text-align:center; margin:0; padding:6px 4px; border-radius:4px; border:1px solid #cbd5e1;">
        <button type="button" class="btn-success" onclick="adjustTaskPoints(this, 1)" style="padding:4px 10px; font-weight:bold; cursor:pointer; font-size:12px; border:none; border-radius:4px;">▲</button>
      </div>
    `;
    container.appendChild(row);
  }
};

const submitCreateAssignments = () => {
  const nameInputs = document.querySelectorAll('.new-task-name');
  const pointsInputs = document.querySelectorAll('.new-task-points');
  const overwriteCheckbox = document.getElementById('overwrite-existing-tasks');
  const isOverwrite = overwriteCheckbox ? overwriteCheckbox.checked : false;
  
  const existingTasks = dailyAssignments[activeCreateDate] || [];
  
  // 만약 기존 과제가 있고 사용자가 '덮어쓰기'를 선택한 경우 경고창
  if (isOverwrite && existingTasks.length > 0) {
    if (!confirm(`⚠️ 정말로 ${activeCreateDate}의 기존 과제를 삭제하고 새로 생성하시겠습니까?\n기존에 제출한 학생들의 완료 기록과 점수가 차감 및 롤백됩니다.`)) {
      return;
    }
  }

  // Find the max task ID number among existing tasks to avoid conflicts
  let maxIdNum = 0;
  if (!isOverwrite) {
    existingTasks.forEach(t => {
      const idParts = t.id.split('_');
      const num = parseInt(idParts[1]);
      if (!isNaN(num) && num > maxIdNum) {
        maxIdNum = num;
      }
    });
  }

  const tempTasks = [];
  let valid = true;

  nameInputs.forEach((input, index) => {
    const name = input.value.trim();
    const pts = parseInt(pointsInputs[index].value);

    if (!name) {
      alert("과제 이름을 모두 작성해 주세요.");
      valid = false;
      return;
    }
    if (isNaN(pts) || pts <= 0) {
      alert("과제별 배점은 1점 이상이어야 합니다.");
      valid = false;
      return;
    }

    tempTasks.push({
      id: `task_${maxIdNum + index + 1}`,
      name: name,
      points: pts
    });
  });

  if (!valid) return;

  // 1. 기존 과제 복구 또는 병합 처리
  if (isOverwrite && existingTasks.length > 0) {
    // 롤백 처리 (PointHistory 분석 및 점수 차감)
    students.forEach(s => {
      let netPointsChanged = 0;
      pointHistory.forEach(log => {
        if (log.student_id === s.student_id && isAssignmentLog(log, activeCreateDate, existingTasks)) {
          netPointsChanged += log.points_changed;
        }
      });
      if (netPointsChanged !== 0) {
        s.total_points = Math.max(0, (s.total_points || 0) - netPointsChanged);
      }
    });

    // 기존 과제 관련 히스토리 항목 완전히 영구 삭제 (growth leaderboard 누적 왜곡 방지)
    pointHistory = pointHistory.filter(log => !isAssignmentLog(log, activeCreateDate, existingTasks));

    // 덮어쓰기
    dailyAssignments[activeCreateDate] = tempTasks;
    dailyLogs[activeCreateDate] = {};
    
    students.forEach(s => {
      dailyLogs[activeCreateDate][s.student_id] = {};
      tempTasks.forEach(t => {
        dailyLogs[activeCreateDate][s.student_id][t.id] = false;
      });
    });

  } else {
    // 병합 저장 (신규/추가 모두 해당)
    dailyAssignments[activeCreateDate] = [...existingTasks, ...tempTasks];

    if (!dailyLogs[activeCreateDate]) {
      dailyLogs[activeCreateDate] = {};
    }
    
    students.forEach(s => {
      if (!dailyLogs[activeCreateDate][s.student_id]) {
        dailyLogs[activeCreateDate][s.student_id] = {};
      }
      tempTasks.forEach(t => {
        dailyLogs[activeCreateDate][s.student_id][t.id] = false;
      });
    });
  }

  saveData();
  closeCreateAssignmentModal();
  
  // 현재 활성화된 탭에 따라 화면 갱신 방식 분기
  const isDashboardActive = !document.getElementById('tab-content-dashboard').classList.contains('hidden');
  if (isDashboardActive) {
    renderTeacherDashboard();
  } else {
    showDateDetail(activeCreateDate);
  }
};

// [신규] 오늘 생성된 과제판 완전히 날려버리기
const deleteCurrentDayAssignments = () => {
  if (confirm(`⚠️ 정말로 ${selectedRecordDate}의 과제판 데이터를 삭제하시겠습니까?\n모든 학생의 당일 완료 기록과 점수가 삭제 및 차감됩니다.`)) {
    
    const tasks = dailyAssignments[selectedRecordDate] || [];

    // 점수 롤백 처리 (PointHistory 분석)
    students.forEach(s => {
      let netPointsChanged = 0;
      pointHistory.forEach(log => {
        if (log.student_id === s.student_id && isAssignmentLog(log, selectedRecordDate, tasks)) {
          netPointsChanged += log.points_changed;
        }
      });
      if (netPointsChanged !== 0) {
        s.total_points = Math.max(0, (s.total_points || 0) - netPointsChanged);
      }
    });

    // 관련 히스토리 항목 완전히 영구 삭제 (growth leaderboard 누적 왜곡 방지)
    pointHistory = pointHistory.filter(log => !isAssignmentLog(log, selectedRecordDate, tasks));

    // 스토리지 삭제
    delete dailyAssignments[selectedRecordDate];
    delete dailyLogs[selectedRecordDate];
    
    saveData();
    updateWeeklyLeaderboard();
    showCalendarView();
  }
};

// ==========================================================================
// [전면개편] 일자별 상세 학생 과제 체크 렌더링 (동적 필드 렌더링)
// ==========================================================================

const showDateDetail = (dateKey) => {
  selectedRecordDate = dateKey;
  
  document.getElementById('records-calendar-view').classList.add('hidden');
  document.getElementById('records-detail-view').classList.remove('hidden');

  const parsedDate = new Date(dateKey);
  const formattedTitle = `${parsedDate.getFullYear()}년 ${parsedDate.getMonth() + 1}월 ${parsedDate.getDate()}일 과제 수행 상세`;
  document.getElementById('detail-date-title').innerText = formattedTitle;

  // 알림장 텍스트 바인딩
  const detailAnnounceEl = document.getElementById('records-detail-announcement-content');
  if (detailAnnounceEl) {
    detailAnnounceEl.innerText = dailyAnnouncements[dateKey] || "";
  }

  renderDailyRecordsTable();
};

const renderDailyRecordsTable = () => {
  const tableHead = document.getElementById('detail-table-thead');
  const tableBody = document.getElementById('records-table-body');
  tableBody.innerHTML = '';
  tableHead.innerHTML = '';

  const tasks = dailyAssignments[selectedRecordDate] || [];
  const dayLogs = dailyLogs[selectedRecordDate] || {};

  // 1. 헤더 동적 그리기
  let headTr = `<tr><th width="80px">번호</th><th width="120px">이름</th>`;
  tasks.forEach(t => {
    headTr += `<th>${t.name} (+${t.points}점)</th>`;
  });
  headTr += `<th width="120px">누적 점수</th></tr>`;
  tableHead.innerHTML = headTr;

  // 2. 바디 동적 그리기
  students.forEach(student => {
    const studentLog = dayLogs[student.student_id] || {};
    const isAbsent = (absentLogs[selectedRecordDate] && absentLogs[selectedRecordDate][student.student_id] === true);
    
    const tr = document.createElement('tr');
    if (isAbsent) {
      tr.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
    }
    
    // 번호, 이름 <td>
    const nameDisplay = isAbsent ? `${student.name} <span style="font-size:11px; padding:2px 4px; border-radius:3px; background:#ef4444; color:white; font-weight:bold; margin-left:4px;">🤒 결석</span>` : student.name;
    let rowHtml = `<td>${student.student_id}</td><td style="font-weight:bold;">${nameDisplay}</td>`;
    
    // 과제 개수만큼 체크박스 동적 생성
    tasks.forEach(t => {
      const checked = studentLog[t.id] === true;
      rowHtml += `<td><input type="checkbox" class="table-checkbox" ${checked ? 'checked' : ''} onchange="toggleTaskInTableDynamic('${student.student_id}', '${t.id}', ${t.points}, '${t.name}', this.checked)"></td>`;
    });

    // 점수 <td>
    rowHtml += `<td style="font-weight:bold; color:var(--primary-color);">${student.total_points}점</td>`;
    
    tr.innerHTML = rowHtml;
    tableBody.appendChild(tr);
  });
};

// 체크 박스 조작 이벤트 바인딩 (동적 배점 연동)
const toggleTaskInTableDynamic = (studentId, taskId, points, taskName, isChecked) => {
  if (!dailyLogs[selectedRecordDate]) dailyLogs[selectedRecordDate] = {};
  if (!dailyLogs[selectedRecordDate][studentId]) dailyLogs[selectedRecordDate][studentId] = {};

  const studentLog = dailyLogs[selectedRecordDate][studentId];
  const oldVal = studentLog[taskId];
  if (oldVal === isChecked) return;

  const nowStr = new Date().toISOString();
  let delta = isChecked ? points : -points;

  studentLog[taskId] = isChecked;

  // 히스토리에 날짜 정보를 포함시켜 과제 삭제 시 이력이 완벽히 같이 청소될 수 있도록 포맷팅
  pointHistory.push({
    student_id: studentId,
    timestamp: nowStr,
    points_changed: delta,
    reason: `${selectedRecordDate} [${taskName}] 과제 완료 ${isChecked ? '적립' : '취소 회수'} (테이블 수정)`,
    assignment_date: selectedRecordDate,
    task_id: taskId
  });

  const index = students.findIndex(s => s.student_id === studentId);
  if (index !== -1) {
    const current = students[index].total_points || 0;
    students[index].total_points = Math.max(0, current + delta);
  }

  saveData();
  playAudioEffect(isChecked ? 'coin' : 'buzz');
  renderDailyRecordsTable();
  updateWeeklyLeaderboard();
};

// ==========================================================================
// 7. 학생 점수 및 명단 관리 (Tab 3)
// ==========================================================================

// 7-1. 학생 수동 점수 수정 화면 렌더링
const renderRosterPointsManager = () => {
  populateRosterGradeFilter();
  
  const tableBody = document.getElementById('roster-points-table-body');
  if (!tableBody) return;
  tableBody.innerHTML = '';

  // 전체 선택 체크박스 초기화
  const selectAllCheckbox = document.getElementById('roster-select-all');
  if (selectAllCheckbox) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  }

  // 학번 기준 정렬 (글로벌 배열 순서를 변경하지 않도록 얕은 복사 후 정렬)
  const sortedStudents = [...students].sort((a, b) => a.student_id.localeCompare(b.student_id));

  sortedStudents.forEach(student => {
    const grade = evaluateGrade(student.total_points);
    const tr = document.createElement('tr');
    tr.dataset.studentId = student.student_id;
    tr.dataset.studentName = student.name;
    tr.dataset.gradeMinPoints = grade.min_points;

    // 등급 아이콘 이미지 여부
    let gradeIconHtml = "";
    if (grade.icon) {
      gradeIconHtml = `<img src="${grade.icon}" alt="${grade.name}" style="width:20px; height:20px; border-radius:4px; vertical-align:middle; margin-right:4px;">`;
    }
    const gradeText = `${grade.emoji || '🌱'} ${grade.name}`;

    tr.innerHTML = `
      <td>
        <input type="checkbox" class="roster-select-student" data-student-id="${student.student_id}" onchange="updateRosterSelectAllState()" style="width: 16px; height: 16px; cursor: pointer;">
      </td>
      <td>${student.student_id}</td>
      <td style="font-weight:bold; color:var(--text-main);">${student.name}</td>
      <td>
        <span class="grade-badge-roster" style="font-size:12px; font-weight:bold; padding:4px 8px; border-radius:12px; background:rgba(99, 102, 241, 0.08); color:#4f46e5; border:1px solid rgba(99, 102, 241, 0.15); display:inline-flex; align-items:center;">
          ${gradeIconHtml}${gradeText}
        </span>
      </td>
      <td style="color:#4f46e5; font-weight:bold; font-size:15px;">${student.total_points}점</td>
      <td>
        <div style="display:flex; justify-content:center; align-items:center; gap:6px;">
          <button class="btn-danger" style="padding: 4px 10px; font-size: 13px; font-weight: bold; border-radius: var(--radius-sm);" onclick="adjustPointsInline('${student.student_id}', -1)">-1</button>
          <input type="number" class="roster-point-edit-input" data-student-id="${student.student_id}" value="${student.total_points}" style="width:70px; text-align:center; margin: 0; padding:6px; font-size:13px;">
          <button class="btn-success" style="padding: 4px 10px; font-size: 13px; font-weight: bold; border-radius: var(--radius-sm);" onclick="adjustPointsInline('${student.student_id}', 1)">+1</button>
        </div>
      </td>
      <td>
        <input type="text" class="roster-point-reason-input" data-student-id="${student.student_id}" placeholder="(선택 사항) 예: 발표 우수, 준비물 미지참 등" style="text-align:left; font-size:13px; padding:6px 10px; width:100%;">
      </td>
      <td>
        <button class="btn-primary" style="padding: 6px 12px; font-size:13px; font-weight:bold; border-radius:var(--radius-sm); background-color:#2563eb; border-color:#2563eb;" onclick="viewStudentPortalFromTeacher('${student.student_id}')">🔍 조회</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
  
  // 검색 및 필터 상태 반영
  filterRosterList();
  renderPointHistoryDatabase();
};

const renderPointHistoryDatabase = () => {
  const tableBody = document.getElementById('history-database-table-body');
  if (!tableBody) return;
  tableBody.innerHTML = '';

  // Sort pointHistory by timestamp desc
  const sortedHistory = [...pointHistory].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  const totalCountEl = document.getElementById('history-total-count');
  if (totalCountEl) {
    totalCountEl.innerText = sortedHistory.length;
  }

  if (sortedHistory.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding: 20px;">점수 변동 내역이 아직 없습니다.</td></tr>`;
    return;
  }

  sortedHistory.forEach(log => {
    const student = students.find(s => s.student_id === log.student_id);
    const studentName = student ? student.name : "삭제된 학생";
    const change = log.points_changed;
    const isPositive = change > 0;
    const sign = isPositive ? "+" : "";
    const badgeClass = isPositive ? "positive" : "negative";
    
    // Formatting date
    const d = new Date(log.timestamp);
    const dateFormatted = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    const tr = document.createElement('tr');
    tr.dataset.studentId = log.student_id;
    tr.dataset.studentName = studentName.toLowerCase();
    tr.dataset.reason = (log.reason || "").toLowerCase();
    tr.dataset.isPositive = isPositive ? "true" : "false";

    tr.innerHTML = `
      <td style="color:var(--text-muted); font-family: monospace;">${dateFormatted}</td>
      <td>${log.student_id}</td>
      <td style="font-weight:bold; color:var(--text-main);">${studentName}</td>
      <td>
        <span class="points-badge ${badgeClass}" style="display:inline-block; font-size:11px; padding:2px 8px; border-radius:10px; font-weight:bold;">${sign}${change}점</span>
      </td>
      <td style="text-align:left; font-weight:500; padding-left:12px;">${log.reason}</td>
    `;
    tableBody.appendChild(tr);
  });
};

const filterPointHistoryTable = () => {
  const searchStudent = document.getElementById('history-search-student').value.trim().toLowerCase();
  const searchReason = document.getElementById('history-search-reason').value.trim().toLowerCase();
  const typeFilter = document.getElementById('history-filter-type').value;

  const rows = document.querySelectorAll('#history-database-table-body tr');
  let visibleCount = 0;

  rows.forEach(row => {
    // Skip empty row
    if (row.cells.length === 1) return;

    const studentId = row.dataset.studentId || "";
    const studentName = row.dataset.studentName || "";
    const reason = row.dataset.reason || "";
    const isPositive = row.dataset.isPositive === "true";

    const matchStudent = !searchStudent || studentId.includes(searchStudent) || studentName.includes(searchStudent);
    const matchReason = !searchReason || reason.includes(searchReason);
    
    let matchType = true;
    if (typeFilter === 'positive') matchType = isPositive;
    else if (typeFilter === 'negative') matchType = !isPositive;

    if (matchStudent && matchReason && matchType) {
      row.classList.remove('hidden');
      visibleCount++;
    } else {
      row.classList.add('hidden');
    }
  });

  const totalCountEl = document.getElementById('history-total-count');
  if (totalCountEl) {
    totalCountEl.innerText = visibleCount;
  }
};

// 7-1-A. 수동 점수 1점단위 즉시 가감 버튼 헬퍼
const adjustPointsInline = (studentId, amount) => {
  const input = document.querySelector(`.roster-point-edit-input[data-student-id="${studentId}"]`);
  if (input) {
    const val = parseInt(input.value) || 0;
    input.value = Math.max(0, val + amount);
    
    // 임시 하이라이트 플래시 효과
    input.style.backgroundColor = amount > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    setTimeout(() => { input.style.backgroundColor = ''; }, 1000);
    
    playAudioEffect(amount > 0 ? 'coin' : 'buzz');
  }
};

// 7-1-B. 교사용 수첩 바로가기 함수
const viewStudentPortalFromTeacher = (studentId) => {
  referrerView = "teacher";
  window.location.hash = `student/${studentId}`;
};

// 7-1-C. 등급 필터 옵션 동적 채우기
const populateRosterGradeFilter = () => {
  const filterSelect = document.getElementById('roster-grade-filter');
  if (!filterSelect) return;
  
  // 첫 번째 '전체 등급 보기' 옵션은 남기고 초기화
  filterSelect.innerHTML = '<option value="all">전체 등급 보기</option>';
  
  // 등급 기준 점수 오름차순 정렬 후 추가
  const sorted = [...grades].sort((a, b) => a.min_points - b.min_points);
  sorted.forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.min_points;
    opt.innerText = `${g.emoji || '⭐'} ${g.name} (${g.min_points}점 이상)`;
    filterSelect.appendChild(opt);
  });
};

// 7-1-D. 체크박스 전체 선택/해제
const toggleRosterSelectAll = (checked) => {
  const rows = document.querySelectorAll('#roster-points-table-body tr');
  rows.forEach(row => {
    if (row.style.display !== 'none') {
      const cb = row.querySelector('.roster-select-student');
      if (cb) cb.checked = checked;
    }
  });
};

// 7-1-E. 개별 체크박스 변경 시 전체 선택 상태 동기화 (Indeterminate 대응)
const updateRosterSelectAllState = () => {
  const selectAll = document.getElementById('roster-select-all');
  if (!selectAll) return;
  
  const visibleCbs = Array.from(document.querySelectorAll('#roster-points-table-body tr'))
    .filter(row => row.style.display !== 'none')
    .map(row => row.querySelector('.roster-select-student'))
    .filter(Boolean);
    
  if (visibleCbs.length === 0) {
    selectAll.checked = false;
    selectAll.indeterminate = false;
    return;
  }
  
  const allChecked = visibleCbs.every(cb => cb.checked);
  const noneChecked = visibleCbs.every(cb => !cb.checked);
  
  if (allChecked) {
    selectAll.checked = true;
    selectAll.indeterminate = false;
  } else if (noneChecked) {
    selectAll.checked = false;
    selectAll.indeterminate = false;
  } else {
    selectAll.checked = false;
    selectAll.indeterminate = true;
  }
};

// 7-1-F. 검색 및 등급 필터 적용
const filterRosterList = () => {
  const searchInput = document.getElementById('roster-search-input');
  const gradeFilter = document.getElementById('roster-grade-filter');
  
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const filterVal = gradeFilter ? gradeFilter.value : "all";
  
  const rows = document.querySelectorAll('#roster-points-table-body tr');
  rows.forEach(row => {
    const studentId = row.dataset.studentId || "";
    const name = row.dataset.studentName ? row.dataset.studentName.toLowerCase() : "";
    const gradeMinPoints = parseInt(row.dataset.gradeMinPoints) || 0;
    
    const matchesSearch = studentId.includes(query) || name.includes(query);
    const matchesGrade = (filterVal === "all") || (parseInt(filterVal) === gradeMinPoints);
    
    if (matchesSearch && matchesGrade) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
      // 숨겨진 행의 체크박스는 선택 해제 처리하여 일괄 작업 실수 방지
      const cb = row.querySelector('.roster-select-student');
      if (cb) cb.checked = false;
    }
  });
  
  // 전체선택 상태 갱신
  updateRosterSelectAllState();
};

// 7-1-G. 추천 템플릿 설정 및 점수 부여
const setBatchTemplate = (reason, points) => {
  const reasonInput = document.getElementById('batch-reason-input');
  if (reasonInput) {
    reasonInput.value = reason;
  }
  applyBatchPoints(points);
};

// 7-1-H. 선택된 학생들에게 일괄 점수/사유 가감 적용
const applyBatchPoints = (delta) => {
  const checkboxes = document.querySelectorAll('.roster-select-student:checked');
  if (checkboxes.length === 0) {
    alert("❌ 점수를 가감할 학생을 먼저 선택해 주세요 (체크박스 선택).");
    return;
  }
  
  const batchReasonInput = document.getElementById('batch-reason-input');
  const reasonText = batchReasonInput ? batchReasonInput.value.trim() : "";
  
  checkboxes.forEach(cb => {
    const studentId = cb.dataset.studentId;
    const input = document.querySelector(`.roster-point-edit-input[data-student-id="${studentId}"]`);
    const reasonInput = document.querySelector(`.roster-point-reason-input[data-student-id="${studentId}"]`);
    
    if (input) {
      const val = parseInt(input.value) || 0;
      input.value = Math.max(0, val + delta);
      
      // 하이라이트 플래시 효과
      input.style.backgroundColor = delta > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
      setTimeout(() => { input.style.backgroundColor = ''; }, 1000);
    }
    
    if (reasonInput && reasonText) {
      reasonInput.value = reasonText;
      reasonInput.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
      setTimeout(() => { reasonInput.style.backgroundColor = ''; }, 1000);
    }
  });
  
  playAudioEffect(delta > 0 ? 'coin' : 'buzz');
};

// 7-2. 수동 점수 일괄 저장 처리
const saveRosterPoints = () => {
  const editInputs = document.querySelectorAll('.roster-point-edit-input');
  
  let changedCount = 0;
  const nowStr = new Date().toISOString();

  editInputs.forEach((input) => {
    const studentId = input.dataset.studentId;
    const newPoints = parseInt(input.value);
    
    if (isNaN(newPoints) || newPoints < 0) {
      return;
    }

    const student = students.find(s => s.student_id === studentId);
    if (student) {
      const oldPoints = student.total_points || 0;
      if (oldPoints !== newPoints) {
        const delta = newPoints - oldPoints;
        student.total_points = newPoints;
        
        // 학번에 매칭되는 사유 값 가져오기 (DOM 인덱스 독립적 매칭)
        const reasonInput = document.querySelector(`.roster-point-reason-input[data-student-id="${studentId}"]`);
        const reason = (reasonInput && reasonInput.value.trim()) 
          ? reasonInput.value.trim() 
          : "수동 수정";

        pointHistory.push({
          student_id: studentId,
          timestamp: nowStr,
          points_changed: delta,
          reason: reason
        });
        
        changedCount++;
      }
    }
  });

  if (changedCount > 0) {
    saveData();
    playAudioEffect('chime');
    renderRosterPointsManager();
    renderTeacherDashboard();
    alert(`💾 총 ${changedCount}명의 학생 점수가 수정 및 저장되었습니다!`);
  } else {
    alert("변경된 점수가 없습니다.");
  }
};

// 7-3. 명단 상세 수정 모달 제어
const openRosterDetailModal = () => {
  renderRosterManager();
  document.getElementById('roster-detail-modal').classList.remove('hidden');
};

const closeRosterDetailModal = () => {
  document.getElementById('roster-detail-modal').classList.add('hidden');
};

// 7-4. 기존 명단 관리 (추가/삭제 상세 뷰용)
const renderRosterManager = () => {
  const tableBody = document.getElementById('roster-table-body');
  tableBody.innerHTML = '';

  students.forEach((student, index) => {
    const tr = document.createElement('tr');
    tr.dataset.index = index;
    tr.innerHTML = `
      <td><input type="text" class="roster-id-input" value="${student.student_id}"></td>
      <td><input type="text" class="roster-name-input" value="${student.name}" style="font-weight:bold;"></td>
      <td><button class="btn-delete" onclick="deleteRosterRow(this)">❌ 삭제</button></td>
    `;
    tableBody.appendChild(tr);
  });
};

const openRosterBulkModal = () => {
  const namesText = students.map(s => s.name).join('\n');
  document.getElementById('bulk-roster-textarea').value = namesText;
  document.getElementById('roster-bulk-modal').classList.remove('hidden');
};

const closeRosterBulkModal = () => {
  document.getElementById('roster-bulk-modal').classList.add('hidden');
};

const getEditDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const isTypoCorrection = (name1, name2) => {
  const dist = getEditDistance(name1, name2);
  return dist <= 1; // 1글자 이하 차이만 오타 수정으로 간주
};

const migrateStudentData = (oldStudents, newStudents) => {
  const oldLogs = JSON.parse(JSON.stringify(dailyLogs));
  const oldHistory = [...pointHistory];
  
  // 1. 새 학생 리스트의 각 학생을 기존 학생 리스트와 매핑하여 식별
  const studentMapping = []; // { newS, oldS, isNew }
  
  newStudents.forEach(newS => {
    // 1-A. 학번과 이름이 완전히 일치하는 경우 (동일 학생)
    let matched = oldStudents.find(oldS => oldS.student_id === newS.student_id && oldS.name === newS.name);
    if (matched) {
      studentMapping.push({ newS, oldS: matched, isNew: false });
      return;
    }
    
    // 1-B. 이름만 일치하는 경우 (학번 변동 / 번호 밀림)
    matched = oldStudents.find(oldS => oldS.name === newS.name);
    if (matched) {
      studentMapping.push({ newS, oldS: matched, isNew: false });
      return;
    }
    
    // 1-C. 학번만 일치하고 이름은 오타 수정으로 판단되는 경우 (단순 이름 오타 수정)
    matched = oldStudents.find(oldS => oldS.student_id === newS.student_id);
    if (matched && isTypoCorrection(matched.name, newS.name)) {
      studentMapping.push({ newS, oldS: matched, isNew: false });
      return;
    }
    
    // 1-D. 그 외의 경우는 완전히 새로운 학생 전입 (기존 기록 승계 없음)
    studentMapping.push({ newS, oldS: null, isNew: true });
  });
  
  // 2. 점수 승계 처리
  studentMapping.forEach(({ newS, oldS, isNew }) => {
    if (isNew) {
      newS.total_points = 0;
    } else {
      newS.total_points = oldS.total_points || 0;
    }
  });

  // 3. 일자별 과제 수행 로그 (dailyLogs) 마이그레이션 및 초기화
  const newDailyLogs = {};
  const dates = new Set([...Object.keys(dailyLogs), ...Object.keys(dailyAssignments)]);
  
  dates.forEach(dateKey => {
    newDailyLogs[dateKey] = {};
    const dayTasks = dailyAssignments[dateKey] || [];
    
    studentMapping.forEach(({ newS, oldS, isNew }) => {
      newDailyLogs[dateKey][newS.student_id] = {};
      
      if (isNew) {
        // 새 학생: 당일 과제는 모두 미완료(false)로 생성
        dayTasks.forEach(t => {
          newDailyLogs[dateKey][newS.student_id][t.id] = false;
        });
      } else {
        // 기존 학생: 변경 전 학번(oldS.student_id)의 수행 내역을 변경 후 학번으로 복사
        const oldSLog = (oldLogs[dateKey] || {})[oldS.student_id] || {};
        dayTasks.forEach(t => {
          newDailyLogs[dateKey][newS.student_id][t.id] = oldSLog[t.id] === true;
        });
      }
    });
  });
  
  // 4. 포인트 획득/감점 상세 내역 (pointHistory) 마이그레이션
  const newPointHistory = [];
  oldHistory.forEach(historyItem => {
    // 해당 이력의 주인공이 매핑 테이블에 있는지 확인
    const mapping = studentMapping.find(m => m.oldS && m.oldS.student_id === historyItem.student_id);
    if (mapping) {
      // 새로운 학번(newS.student_id)으로 이력을 복사
      newPointHistory.push({
        ...historyItem,
        student_id: mapping.newS.student_id
      });
    }
  });
  
  // 글로벌 스테이트에 적용
  dailyLogs = newDailyLogs;
  pointHistory = newPointHistory;
};

const submitBulkRoster = () => {
  const textareaVal = document.getElementById('bulk-roster-textarea').value;
  const names = textareaVal.split('\n')
    .map(name => name.trim())
    .filter(name => name.length > 0);

  if (names.length === 0) {
    alert("입력된 학생 이름이 없습니다.");
    return;
  }

  const newStudents = [];
  names.forEach((name, index) => {
    const studentId = String(index + 1).padStart(2, '0');
    newStudents.push({
      student_id: studentId,
      name: name,
      total_points: 0
    });
  });

  const oldStudents = [...students];
  migrateStudentData(oldStudents, newStudents);

  students = newStudents;
  saveData();
  
  closeRosterBulkModal();
  renderRosterPointsManager();
  renderTeacherDashboard();
  
  alert(`📋 총 ${names.length}명의 학생 명단이 반영되었습니다!`);
};

const addNewStudentRow = () => {
  const tableBody = document.getElementById('roster-table-body');
  const tr = document.createElement('tr');
  
  let nextIdStr = "01";
  if (students.length > 0) {
    const maxId = Math.max(...students.map(s => parseInt(s.student_id)));
    nextIdStr = String(maxId + 1).padStart(2, '0');
  }

  tr.innerHTML = `
    <td><input type="text" class="roster-id-input" value="${nextIdStr}"></td>
    <td><input type="text" class="roster-name-input" placeholder="이름 입력" style="font-weight:bold;"></td>
    <td><button class="btn-delete" onclick="deleteRosterRow(this)">❌ 삭제</button></td>
  `;
  tableBody.appendChild(tr);
};

const deleteRosterRow = (btn) => {
  const row = btn.closest('tr');
  row.remove();
};

const saveRoster = () => {
  const rows = document.querySelectorAll('#roster-table-body tr');
  const newStudents = [];
  const idSet = new Set();
  let valid = true;

  rows.forEach(row => {
    let idInput = row.querySelector('.roster-id-input').value.trim();
    const nameInput = row.querySelector('.roster-name-input').value.trim();

    if (!idInput || !nameInput) {
      alert("학번과 이름은 빈칸일 수 없습니다.");
      valid = false;
      return;
    }

    // 번호 한 자리 입력 자동 보정 (예: 5 -> 05)
    if (idInput.length === 1 && !isNaN(idInput)) {
      idInput = idInput.padStart(2, '0');
    }

    if (idSet.has(idInput)) {
      alert(`중복된 학번(${idInput})이 존재합니다.`);
      valid = false;
      return;
    }

    idSet.add(idInput);
    
    newStudents.push({
      student_id: idInput,
      name: nameInput,
      total_points: 0
    });
  });

  if (!valid) return;

  const oldStudents = [...students];
  migrateStudentData(oldStudents, newStudents);

  students = newStudents;
  saveData();
  alert("💾 학생 명단이 성공적으로 저장 및 갱신되었습니다!");
  closeRosterDetailModal();
  renderRosterPointsManager();
  renderTeacherDashboard();
};

// ==========================================================================
// 8. [개선] 신용등급 설정 탭 제어 (동적 개수 & 프리셋 드롭다운 선택기) (Tab 4)
// ==========================================================================

const renderGradesConfig = () => {
  const tableBody = document.getElementById('grades-table-body');
  tableBody.innerHTML = '';

  grades.sort((a, b) => a.min_points - b.min_points);

  grades.forEach((grade, index) => {
    const tr = document.createElement('tr');
    tr.dataset.index = index;

    // 프리셋 드롭다운 HTML 생성
    let selectHtml = `<select class="grade-emoji-select" style="font-size:16px;">`;
    EMOJI_PRESETS.forEach(emoji => {
      const selected = (grade.emoji === emoji) ? "selected" : "";
      selectHtml += `<option value="${emoji}" ${selected}>${emoji}</option>`;
    });
    selectHtml += `</select>`;

    // 이미지 파일 업로드 엘리먼트 동적 렌더링
    const hasIcon = !!grade.icon;
    const iconUploadHtml = hasIcon 
      ? `
        <div class="image-upload-wrapper">
          <img src="${grade.icon}" class="grade-icon-preview" alt="미리보기">
          <button class="btn-icon-clear" onclick="removeGradeIcon(${index})" title="이미지 삭제">❌</button>
        </div>
      `
      : `
        <div class="image-upload-wrapper">
          <button class="file-upload-btn" onclick="triggerGradeIconFileInput(${index})">📂 이미지 등록</button>
          <input type="file" accept="image/*" id="grade-file-input-${index}" style="display:none;" onchange="handleGradeIconUpload(this, ${index})">
        </div>
      `;

    tr.innerHTML = `
      <td>${selectHtml}</td>
      <td>${iconUploadHtml}</td>
      <td><input type="text" class="grade-name-input" value="${grade.name}" style="font-weight:bold;"></td>
      <td><input type="number" class="grade-points-input" value="${grade.min_points}"></td>
      <td><button class="btn-delete" onclick="deleteGradeRow(this)">❌ 삭제</button></td>
    `;
    tableBody.appendChild(tr);
  });

  // 교사용 및 학생용 비밀번호 입력칸 동기화
  const passcodeEl = document.getElementById('teacher-passcode-input');
  if (passcodeEl) {
    passcodeEl.value = teacherPasscode;
  }
  const studentPasscodeEl = document.getElementById('student-passcode-input');
  if (studentPasscodeEl) {
    studentPasscodeEl.value = config.student_passcode || "";
  }
};

// 8-1. 등급 이미지 업로드 파일 트리거 및 Base64 파싱
const triggerGradeIconFileInput = (index) => {
  document.getElementById(`grade-file-input-${index}`).click();
};

const handleGradeIconUpload = (fileInput, index) => {
  const file = fileInput.files[0];
  if (!file) return;

  if (file.size > 500 * 1024) {
    alert("⚠️ 이미지 용량이 너무 큽니다. LocalStorage 제한으로 500KB 이하 이미지를 사용해 주세요.");
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    grades[index].icon = e.target.result; // Base64 Data URL 대입
    renderGradesConfig(); // 변경 즉시 리렌더링하여 미리보기 표시
  };
  reader.readAsDataURL(file);
};

const removeGradeIcon = (index) => {
  grades[index].icon = "";
  renderGradesConfig();
};

const openGradesBulkModal = () => {
  const text = grades.map(g => `${g.name}, ${g.min_points}, ${g.emoji || '⭐'}`).join('\n');
  document.getElementById('bulk-grades-textarea').value = text;
  document.getElementById('grades-bulk-modal').classList.remove('hidden');
};

const closeGradesBulkModal = () => {
  document.getElementById('grades-bulk-modal').classList.add('hidden');
};

const submitBulkGrades = () => {
  const textareaVal = document.getElementById('bulk-grades-textarea').value;
  const lines = textareaVal.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
    
  if (lines.length === 0) {
    alert("입력된 등급 정보가 없습니다.");
    return;
  }
  
  const newGrades = [];
  let valid = true;
  
  lines.forEach((line, idx) => {
    const parts = line.split(',').map(part => part.trim());
    const name = parts[0];
    const pointsVal = parts[1];
    const emoji = parts[2] || "⭐";
    
    if (!name) {
      alert(`${idx + 1}번째 줄: 등급명이 누락되었습니다.`);
      valid = false;
      return;
    }
    
    const minPoints = parseInt(pointsVal);
    if (isNaN(minPoints)) {
      alert(`${idx + 1}번째 줄: 최소 점수(${pointsVal})가 올바른 숫자가 아닙니다.`);
      valid = false;
      return;
    }
    
    // 기존 등급에 이미지가 등록되어 있었다면 이미지(icon) 데이터 보존
    const existing = grades.find(g => g.name === name);
    const icon = existing ? (existing.icon || "") : "";
    
    newGrades.push({
      name: name,
      min_points: minPoints,
      emoji: emoji,
      icon: icon
    });
  });
  
  if (!valid) return;
  
  newGrades.sort((a, b) => a.min_points - b.min_points);
  
  grades = newGrades;
  saveData();
  
  closeGradesBulkModal();
  renderGradesConfig();
  renderTeacherDashboard();
  
  alert(`🏆 총 ${grades.length}개의 신용 등급 기준이 성공적으로 반영되었습니다!`);
};

// [신규] 등급 등락 증감 추가
const addNewGradeRow = () => {
  grades.push({
    name: "새 등급 등급명",
    min_points: 100,
    emoji: "⭐",
    icon: ""
  });
  renderGradesConfig();
};

const deleteGradeRow = (btn) => {
  const row = btn.closest('tr');
  row.remove();
};

const saveGradesConfig = () => {
  const rows = document.querySelectorAll('#grades-table-body tr');
  const newGrades = [];
  let valid = true;

  rows.forEach(row => {
    const emoji = row.querySelector('.grade-emoji-select').value;
    const name = row.querySelector('.grade-name-input').value.trim();
    const points = parseInt(row.querySelector('.grade-points-input').value.trim());
    
    const index = parseInt(row.dataset.index);
    const icon = grades[index] ? grades[index].icon : "";

    if (!name || isNaN(points)) {
      alert("등급 이름과 최소 기준 점수는 올바른 값이어야 합니다.");
      valid = false;
      return;
    }

    newGrades.push({
      name: name,
      min_points: points,
      emoji: emoji,
      icon: icon
    });
  });

  if (!valid) return;

  grades = newGrades;
  saveData();
  playAudioEffect('chime');
  alert("💾 신용등급 기준 설정이 성공적으로 저장되었습니다!");
  renderGradesConfig();
};

// ==========================================================================
// 9. 팝업창 및 과제 체크 / QR 로직 (Modal) (동적 과제 수 대응)
// ==========================================================================

const openAssignmentModal = (student) => {
  activeStudent = student;
  
  const todayStr = currentDashboardDate;
  const todayTasks = dailyAssignments[todayStr] || [];
  const studentLog = (dailyLogs[todayStr] || {})[student.student_id] || {};
  
  const modalBody = document.getElementById('modal-dashboard-body');
  modalBody.innerHTML = '';

  // 1. 오늘 과제가 아예 생성되지 않은 경우 분기
  if (todayTasks.length === 0) {
    modalBody.innerHTML = `
      <div style="flex:1; text-align:center; padding:30px;">
        <h3 style="margin-bottom:12px; color:var(--text-muted);">오늘은 과제판이 설정되어 있지 않습니다.</h3>
        <p style="font-size:14px; margin-bottom:20px;">'일자별 과제 관리' 탭에서 오늘 날짜를 선택하여 과제를 추가한 뒤 체크해 주세요.</p>
        <button class="btn-secondary" onclick="closeModal()">닫기</button>
      </div>
    `;
    document.getElementById('modal-title').innerText = `${student.student_id}번 ${student.name} - 과제판 정보 없음`;
    document.getElementById('assignment-modal').classList.remove('hidden');
    return;
  }

  // 2. 동적 체크박스 목록 그리기
  document.getElementById('modal-title').innerText = `${student.student_id}번 ${student.name} - 오늘 과제 체크하기`;

  const isAbsent = (absentLogs[todayStr] && absentLogs[todayStr][student.student_id] === true);

  let checkboxGroupHtml = '<div class="large-checkbox-group">';
  
  // 결석 여부 조작 체크박스 추가
  checkboxGroupHtml += `
    <label class="large-checkbox-label" style="border-color:#ef4444; background:rgba(239, 68, 68, 0.04); margin-bottom: 15px;">
      <input type="checkbox" id="modal-absent-checkbox" ${isAbsent ? 'checked' : ''}>
      <span class="checkbox-custom" style="border-color:#ef4444;"></span>
      <span class="label-text" style="color:#ef4444; font-weight:bold;">🤒 오늘 결석함 (과제 미제출 감점 하루 유예)</span>
    </label>
  `;

  todayTasks.forEach(task => {
    const checked = studentLog[task.id] === true;
    checkboxGroupHtml += `
      <label class="large-checkbox-label">
        <input type="checkbox" class="modal-dynamic-checkbox" data-task-id="${task.id}" data-points="${task.points}" data-name="${task.name}" ${checked ? 'checked' : ''}>
        <span class="checkbox-custom"></span>
        <span class="label-text">${task.name} 완료 (+${task.points}점)</span>
      </label>
    `;
  });
  checkboxGroupHtml += '</div>';

  // QR URL 매핑
  let queryStr = "";
  if (currentSyncMode === 'firebase' && firebaseConfig && firebaseConfig.databaseURL) {
    const params = new URLSearchParams({
      dbUrl: firebaseConfig.databaseURL,
      apiKey: firebaseConfig.apiKey || '',
      projId: firebaseConfig.projectId || '',
      syncKey: firebaseConfig.classroomSyncKey || ''
    });
    queryStr = "?" + params.toString();
  } else if (currentSyncMode === 'gdrive' && googleClientId) {
    queryStr = "?gClientId=" + encodeURIComponent(googleClientId);
  }
  
  let basePortalUrl = window.location.href.split('#')[0];
  if (basePortalUrl.includes('localhost') || basePortalUrl.includes('127.0.0.1')) {
    basePortalUrl = "https://fosvmd-ai.github.io/classroom-dashboard/";
  }
  
  const fullPortalUrl = `${basePortalUrl}${queryStr}#student/${student.student_id}`;
  const encodedUrl = encodeURIComponent(fullPortalUrl);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedUrl}`;

  // 모달 내부 레이아웃 구성
  modalBody.innerHTML = `
    <!-- 좌측: 과제 체크 목록 -->
    <div class="modal-left">
      <h3>📚 오늘의 과제 체크</h3>
      ${checkboxGroupHtml}
      <div class="modal-actions">
        <button class="btn-success btn-large" onclick="saveAssignmentChanges()">저장하기</button>
        <button class="btn-danger btn-large" onclick="closeModal()">취소</button>
      </div>
    </div>

    <!-- 우측: 모바일 QR 조회 링크 -->
    <div class="modal-right">
      <h3>📱 개인 모바일 포털</h3>
      <div class="qr-container">
        <img src="${qrUrl}" alt="개인 페이지 QR 코드">
      </div>
      <p class="qr-desc">스마트폰 카메라로 스캔하면<br><strong>내 점수, 미제출 과제, 등급</strong>을 바로 확인해요!</p>
    </div>
  `;

  document.getElementById('assignment-modal').classList.remove('hidden');
};

const closeModal = () => {
  document.getElementById('assignment-modal').classList.add('hidden');
  activeStudent = null;
};

// 동적 체크박스 모달 저장 처리
const saveAssignmentChanges = () => {
  if (!activeStudent) return;
  const todayStr = currentDashboardDate;
  
  // 결석 상태 저장
  const absentCheckbox = document.getElementById('modal-absent-checkbox');
  if (absentCheckbox) {
    if (!absentLogs[todayStr]) absentLogs[todayStr] = {};
    absentLogs[todayStr][activeStudent.student_id] = absentCheckbox.checked;
  }
  
  if (!dailyLogs[todayStr]) dailyLogs[todayStr] = {};
  const oldLog = dailyLogs[todayStr][activeStudent.student_id] || {};
  
  const checkboxes = document.querySelectorAll('.modal-dynamic-checkbox');
  const newTasksLog = {};
  
  let pointsDelta = 0;
  const nowStr = new Date().toISOString();

  checkboxes.forEach(cb => {
    const taskId = cb.dataset.taskId;
    const points = parseInt(cb.dataset.points);
    const taskName = cb.dataset.name;
    const isChecked = cb.checked;

    newTasksLog[taskId] = isChecked;

    const oldChecked = oldLog[taskId] === true;

    if (isChecked && !oldChecked) {
      pointsDelta += points;
      pointHistory.push({
        student_id: activeStudent.student_id,
        timestamp: nowStr,
        points_changed: points,
        reason: `${taskName} 완료 적립`,
        assignment_date: todayStr,
        task_id: taskId
      });
    } else if (!isChecked && oldChecked) {
      pointsDelta -= points;
      pointHistory.push({
        student_id: activeStudent.student_id,
        timestamp: nowStr,
        points_changed: -points,
        reason: `${taskName} 취소 차감`,
        assignment_date: todayStr,
        task_id: taskId
      });
    }
  });

  dailyLogs[todayStr][activeStudent.student_id] = newTasksLog;
  
  const index = students.findIndex(s => s.student_id === activeStudent.student_id);
  if (index !== -1) {
    const currentPoints = students[index].total_points || 0;
    students[index].total_points = Math.max(0, currentPoints + pointsDelta);
  }

  saveData();
  closeModal();
  renderTeacherDashboard();
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

  // 파이어베이스 동기화 모드이고 아직 데이터를 받지 못한 경우 로딩 화면 표시
  if (currentSyncMode === 'firebase' && !isFirebaseDataLoaded) {
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
    
    // 5초 후 타임아웃 메시지 노출
    if (!window.portalLoadingTimer) {
      window.portalLoadingTimer = setTimeout(() => {
        const timeoutEl = document.getElementById('portal-loading-timeout');
        if (timeoutEl) {
          timeoutEl.classList.remove('hidden');
        }
        window.portalLoadingTimer = null;
      }, 5000);
    }
    return;
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
  const todayStr = getTodayDateString();
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

const renderApprovalRequestsWidget = () => {
  const widgetEl = document.getElementById('approvals-widget');
  const countBadgeEl = document.getElementById('approval-count-badge');
  const listEl = document.getElementById('approval-requests-list');
  
  if (!widgetEl || !listEl || !countBadgeEl) return;
  
  // Collect all requests from pendingRequests
  const requests = [];
  Object.entries(pendingRequests).forEach(([dateKey, dateObj]) => {
    Object.entries(dateObj).forEach(([studentId, taskObj]) => {
      Object.entries(taskObj).forEach(([taskId, val]) => {
        // 하위 호환성: val이 true이거나 객체 형태의 { requested: true }인 경우
        const isRequested = val === true || (val && (val.requested === true || val === 'true'));
        if (isRequested) {
          // Find student and task information
          const student = students.find(s => s.student_id === studentId);
          const dayTasks = dailyAssignments[dateKey] || [];
          const task = dayTasks.find(t => t.id === taskId);
          
          // 메타데이터가 있으면 우선 사용, 없으면 과제 데이터에서 가져오고 최후에는 기본값 사용
          const finalTaskName = (val && typeof val === 'object' && val.taskName) || (task ? task.name : `알 수 없는 과제 (${taskId})`);
          const finalPoints = (val && typeof val === 'object' && typeof val.points === 'number') ? val.points : (task ? task.points : 3);
          
          if (student) {
            requests.push({
              dateKey,
              studentId,
              studentName: student.name,
              taskId,
              taskName: finalTaskName,
              points: finalPoints
            });
          }
        }
      });
    });
  });
  
  // Sort requests by date and student id
  requests.sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.studentId.localeCompare(b.studentId));
  
  countBadgeEl.innerText = requests.length;
  
  if (requests.length === 0) {
    widgetEl.classList.add('hidden');
    listEl.innerHTML = '';
    return;
  }
  
  widgetEl.classList.remove('hidden');
  listEl.innerHTML = '';
  
  requests.forEach(req => {
    const li = document.createElement('li');
    li.className = 'approval-item';
    
    // date display: e.g. 2026-06-12 -> 6/12
    const dateParts = req.dateKey.split('-');
    const dateDisplay = `${parseInt(dateParts[1])}/${parseInt(dateParts[2])}`;
    
    li.innerHTML = `
      <div class="approval-item-info">
        <div class="approval-item-student">
          <span class="student-number-badge compact">${req.studentId}</span>
          <span>${req.studentName}</span>
        </div>
        <div class="approval-item-task" title="${req.taskName} (+${req.points}점) [${dateDisplay}]">
          [${dateDisplay}] ${req.taskName} (+${req.points}점)
        </div>
      </div>
      <div class="approval-item-actions">
        <button class="btn-approve" onclick="approveTaskRequest('${req.studentId}', '${req.dateKey}', '${req.taskId}', '${req.taskName}', ${req.points})" title="승인">✔️</button>
        <button class="btn-reject" onclick="rejectTaskRequest('${req.studentId}', '${req.dateKey}', '${req.taskId}', '${req.taskName}')" title="반려">❌</button>
      </div>
    `;
    listEl.appendChild(li);
  });
};

const approveTaskRequest = (studentId, dateKey, taskId, taskName, points) => {
  // 1. dailyLogs에 승인 완료 처리
  if (!dailyLogs[dateKey]) dailyLogs[dateKey] = {};
  if (!dailyLogs[dateKey][studentId]) dailyLogs[dateKey][studentId] = {};
  dailyLogs[dateKey][studentId][taskId] = true;
  
  // 2. 점수 가산
  const student = students.find(s => s.student_id === studentId);
  if (student) {
    student.total_points = (student.total_points || 0) + points;
  }
  
  // 3. 포인트 히스토리 추가
  const nowStr = new Date().toISOString();
  pointHistory.push({
    student_id: studentId,
    timestamp: nowStr,
    points_changed: points,
    reason: `${taskName} 완료 승인 (모바일 제출)`,
    assignment_date: dateKey,
    task_id: taskId
  });
  
  // 4. pendingRequests에서 삭제
  if (pendingRequests[dateKey] && pendingRequests[dateKey][studentId]) {
    delete pendingRequests[dateKey][studentId][taskId];
    // Clean up empty objects
    if (Object.keys(pendingRequests[dateKey][studentId]).length === 0) {
      delete pendingRequests[dateKey][studentId];
    }
    if (Object.keys(pendingRequests[dateKey]).length === 0) {
      delete pendingRequests[dateKey];
    }
  }

  // 파이어베이스 동기화 모드 시 개별 경로 원자적 제거로 동시성 보장
  if (currentSyncMode === 'firebase' && dbRef) {
    dbRef.child('pendingRequests').child(dateKey).child(studentId).child(taskId).remove().catch(err => {
      console.error("[Firebase] 승인 요청 삭제 실패:", err);
    });
  }
  
  saveData();
  playAudioEffect('chime');
  alert(`✔️ ${student ? student.name : studentId} 학생의 '${taskName}' 과제가 승인 처리되었습니다 (+${points}점).`);
  renderTeacherDashboard();
};

const rejectTaskRequest = (studentId, dateKey, taskId, taskName) => {
  // 1. pendingRequests에서 삭제
  if (pendingRequests[dateKey] && pendingRequests[dateKey][studentId]) {
    delete pendingRequests[dateKey][studentId][taskId];
    // Clean up empty objects
    if (Object.keys(pendingRequests[dateKey][studentId]).length === 0) {
      delete pendingRequests[dateKey][studentId];
    }
    if (Object.keys(pendingRequests[dateKey]).length === 0) {
      delete pendingRequests[dateKey];
    }
  }

  // 파이어베이스 동기화 모드 시 개별 경로 원자적 제거로 동시성 보장
  if (currentSyncMode === 'firebase' && dbRef) {
    dbRef.child('pendingRequests').child(dateKey).child(studentId).child(taskId).remove().catch(err => {
      console.error("[Firebase] 승인 요청 삭제 실패:", err);
    });
  }
  
  saveData();
  playAudioEffect('buzz');
  const student = students.find(s => s.student_id === studentId);
  alert(`❌ ${student ? student.name : studentId} 학생의 '${taskName}' 과제 요청이 반려되었습니다.`);
  renderTeacherDashboard();
};

const goBackToTeacherDashboard = () => {
  window.location.hash = "#student-login";
};

// ==========================================================================
// 11. 교실 보조 칠판 타이머 (Classroom Timer)
// ==========================================================================

let timerInterval = null;
let timerSeconds = 0;

const updateTimerDisplay = () => {
  const mins = Math.floor(timerSeconds / 60);
  const secs = timerSeconds % 60;
  const minsStr = String(mins).padStart(2, '0');
  const secsStr = String(secs).padStart(2, '0');
  
  const display = document.getElementById('timer-display');
  display.innerText = `${minsStr}:${secsStr}`;
  display.style.color = '';
};

const adjustTimer = (seconds) => {
  timerSeconds = Math.max(0, timerSeconds + seconds);
  updateTimerDisplay();
};

const toggleTimer = () => {
  const startBtn = document.getElementById('btn-timer-start');
  
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    startBtn.innerText = "▶️ 시작";
  } else {
    if (timerSeconds === 0) {
      timerSeconds = 300;
    }
    startBtn.innerText = "⏸️ 일시정지";
    timerInterval = setInterval(() => {
      if (timerSeconds > 0) {
        timerSeconds--;
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        timerInterval = null;
        startBtn.innerText = "▶️ 시작";
        
        const display = document.getElementById('timer-display');
        display.innerText = "⌛ 종료!";
        display.style.color = 'var(--danger-color)';
        
        playAlarmAudio();
      }
    }, 1000);
  }
};

const resetTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  document.getElementById('btn-timer-start').innerText = "▶️ 시작";
  timerSeconds = 0;
  updateTimerDisplay();
};

const playAlarmAudio = () => {
  const isMuted = localStorage.getItem('volume_muted') === 'true';
  if (isMuted) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const playBeep = (time, freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
      
      osc.start(time);
      osc.stop(time + 0.3);
    };
    
    const now = audioCtx.currentTime;
    playBeep(now, 880);
    playBeep(now + 0.4, 880);
    playBeep(now + 0.8, 880);
  } catch (e) {
    console.error("Audio API 미지원 브라우저:", e);
  }
};

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

const copyStudentPortalLink = () => {
  let queryStr = "";
  if (currentSyncMode === 'firebase' && firebaseConfig && firebaseConfig.databaseURL) {
    const params = new URLSearchParams({
      dbUrl: firebaseConfig.databaseURL,
      apiKey: firebaseConfig.apiKey || '',
      projId: firebaseConfig.projectId || '',
      syncKey: firebaseConfig.classroomSyncKey || ''
    });
    queryStr = "?" + params.toString();
  }
  
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

const saveTeacherPasscode = () => {
  const input = document.getElementById('teacher-passcode-input');
  if (!input) return;
  const val = input.value.trim();
  if (val.length < 4) {
    alert("⚠️ 비밀번호는 4자리 이상이어야 합니다.");
    return;
  }
  teacherPasscode = val;
  saveData();
  alert("🔒 교사용 비밀번호가 성공적으로 변경되었습니다!");
};

const saveStudentPasscode = () => {
  const input = document.getElementById('student-passcode-input');
  if (!input) return;
  const val = input.value.trim();
  config.student_passcode = val;
  saveData();
  alert("🔒 학생용 공통 비밀번호가 성공적으로 변경되었습니다!");
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

const loginAsTeacher = () => {
  if (currentSyncMode === 'local') {
    if (!tokenClient) {
      initGoogleDriveSync();
    }
    if (tokenClient) {
      tokenClient.requestAccessToken();
      sessionStorage.setItem('teacher_authenticated', 'true');
    } else {
      // Fallback: GIS 라이브러리가 없거나 설정 오류 발생 시 로컬 전용 진입 허용
      sessionStorage.setItem('teacher_authenticated', 'true');
      alert("🎉 로컬 개발 모드로 로그인되었습니다. (구글 로그인 생략)");
      window.location.hash = "#teacher";
      location.reload();
    }
  } else if (currentSyncMode === 'firebase') {
    if (firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then((result) => {
      const user = result.user;
      firebaseUser = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      };
      localStorage.setItem('firebaseUser', JSON.stringify(firebaseUser));
      sessionStorage.setItem('teacher_authenticated', 'true');
      
      // 자동 연동: 구글 계정 ID(UID)를 이 선생님의 학급 연동 키로 자동 할당
      firebaseConfig.classroomSyncKey = user.uid;
      localStorage.setItem('firebaseConfig', JSON.stringify(firebaseConfig));
      
      alert(`🎉 안녕하세요, ${user.displayName} 선생님!\n선생님의 학급 관리 대시보드로 로그인되었습니다.`);
      window.location.hash = "#teacher";
      location.reload();
    }).catch((error) => {
      console.error("[Firebase] 교사 로그인 실패:", error);
      alert("❌ 로그인 실패: " + error.message);
    });
  } else if (currentSyncMode === 'gdrive') {
    if (!tokenClient) {
      initGoogleDriveSync();
    }
    if (tokenClient) {
      tokenClient.requestAccessToken();
      sessionStorage.setItem('teacher_authenticated', 'true');
    } else {
      alert("❌ 구글 드라이브 동기화 초기화 실패. Client ID를 확인해 주세요.");
    }
  }
};

const promptTeacherLogin = () => {
  window.location.hash = "#teacher";
};


// ==========================================================================
// 12. 학급 데이터 백업 및 복원 (Classroom Data Backup & Restore)
// ==========================================================================

const exportClassroomData = () => {
  const backupData = {
    students: JSON.parse(localStorage.getItem('students')),
    grades: JSON.parse(localStorage.getItem('grades')),
    dailyLogs: JSON.parse(localStorage.getItem('dailyLogs')),
    pointHistory: JSON.parse(localStorage.getItem('pointHistory')),
    config: JSON.parse(localStorage.getItem('config')),
    dailyAssignments: JSON.parse(localStorage.getItem('dailyAssignments')),
    pendingRequests: JSON.parse(localStorage.getItem('pendingRequests')) || {},
    absentLogs: JSON.parse(localStorage.getItem('absentLogs')) || {},
    processedDeductionDates: JSON.parse(localStorage.getItem('processedDeductionDates')) || [],
    teacherPasscode: localStorage.getItem('teacherPasscode') || '1234',
    dailyAnnouncements: JSON.parse(localStorage.getItem('dailyAnnouncements')) || {}
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const now = new Date();
  const dateStr = now.getFullYear() + 
    String(now.getMonth() + 1).padStart(2, '0') + 
    String(now.getDate()).padStart(2, '0');
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `classroom_backup_${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  alert("📋 학급 데이터 백업 파일이 성공적으로 생성되어 다운로드되었습니다.");
};

const triggerImportFileInput = () => {
  document.getElementById('import-data-file-input').click();
};

const importClassroomData = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      // 스키마 검증
      if (!data || !data.students || !data.grades) {
        alert("❌ 올바르지 않은 백업 파일 형식입니다. 'students' 및 'grades' 정보가 필요합니다.");
        return;
      }

      const proceed = confirm("⚠️ 경고: 데이터를 가져오면 현재 등록된 모든 학생 점수, 일자별 과제 및 등급 설정 기록이 완전히 덮어씌워지고 복원됩니다. 정말 계속하시겠습니까?");
      if (!proceed) {
        event.target.value = '';
        return;
      }

      // localStorage 데이터 복원
      localStorage.setItem('students', JSON.stringify(data.students));
      localStorage.setItem('grades', JSON.stringify(data.grades));
      localStorage.setItem('dailyLogs', JSON.stringify(data.dailyLogs || {}));
      localStorage.setItem('pointHistory', JSON.stringify(data.pointHistory || []));
      localStorage.setItem('config', JSON.stringify(data.config || {}));
      localStorage.setItem('dailyAssignments', JSON.stringify(data.dailyAssignments || {}));
      localStorage.setItem('pendingRequests', JSON.stringify(data.pendingRequests || {}));
      localStorage.setItem('absentLogs', JSON.stringify(data.absentLogs || {}));
      localStorage.setItem('processedDeductionDates', JSON.stringify(data.processedDeductionDates || []));
      localStorage.setItem('teacherPasscode', String(data.teacherPasscode || '1234'));
      localStorage.setItem('dailyAnnouncements', JSON.stringify(data.dailyAnnouncements || {}));

      // 만약 파이어베이스가 연동되어 있다면, 리로드 전 파이어베이스에도 즉시 업로드하여 덮어씌워짐 방지
      if (currentSyncMode === 'firebase' && dbRef) {
        students = data.students;
        grades = data.grades;
        dailyLogs = data.dailyLogs || {};
        pointHistory = data.pointHistory || [];
        config = data.config || {};
        dailyAssignments = data.dailyAssignments || {};
        pendingRequests = data.pendingRequests || {};
        absentLogs = data.absentLogs || {};
        processedDeductionDates = data.processedDeductionDates || [];
        teacherPasscode = String(data.teacherPasscode || '1234');
        dailyAnnouncements = data.dailyAnnouncements || {};

        dbRef.set({
          students,
          grades,
          dailyLogs,
          pointHistory,
          config,
          dailyAssignments,
          pendingRequests,
          absentLogs,
          processedDeductionDates,
          teacherPasscode,
          dailyAnnouncements
        }).then(() => {
          alert("🎉 학급 데이터 로컬 복원 및 파이어베이스 동기화 업로드가 완료되었습니다!");
          location.reload();
        }).catch(err => {
          console.error("[Firebase] 가져오기 데이터 업로드 실패:", err);
          alert("🎉 학급 데이터 로컬 복원은 완료되었으나 파이어베이스 업로드 중 오류가 발생했습니다: " + err.message);
          location.reload();
        });
        return; // 리로드는 파이어베이스 업로드 완료 후 실행
      }

      // 만약 구글 드라이브가 연동되어 있다면, 리로드 전 구글 드라이브에도 즉시 업로드하여 덮어씌워짐 방지
      if (googleAccessToken && googleDriveFileId) {
        // 임시로 로컬 변수도 최신화해주어 업로드 데이터로 쓰이게 함
        students = data.students;
        grades = data.grades;
        dailyLogs = data.dailyLogs || {};
        pointHistory = data.pointHistory || [];
        config = data.config || {};
        dailyAssignments = data.dailyAssignments || {};
        pendingRequests = data.pendingRequests || {};
        absentLogs = data.absentLogs || {};
        processedDeductionDates = data.processedDeductionDates || [];
        teacherPasscode = String(data.teacherPasscode || '1234');
        dailyAnnouncements = data.dailyAnnouncements || {};

        uploadGoogleDriveBackupFile(googleDriveFileId).then(() => {
          alert("🎉 학급 데이터 로컬 복원 및 구글 드라이브 동기화 업로드가 완료되었습니다!");
          location.reload();
        }).catch(err => {
          console.error("[Google Drive] 가져오기 데이터 업로드 실패:", err);
          alert("🎉 학급 데이터 로컬 복원은 완료되었으나 구글 드라이브 업로드 중 오류가 발생했습니다: " + err.message);
          location.reload();
        });
        return; // 리로드는 구글 드라이브 업로드 완료 후 실행
      }

      alert("🎉 학급 데이터 복원이 완료되었습니다. 최신 정보를 반영하기 위해 대시보드를 새로고침합니다.");
      location.reload();

    } catch (err) {
      alert("❌ 파일 읽기 중 오류가 발생했습니다: " + err.message);
    }
  };
  reader.readAsText(file);
};

const archiveAndResetNewSemester = () => {
  if (!confirm("⚠️ [새 학기 전환 / 데이터 초기화]\n\n정말로 새 학기 전환을 진행하시겠습니까?\n이 작업은 다음과 같이 진행됩니다:\n1. 현재 학급 데이터 백업 파일(.json)이 자동으로 다운로드됩니다.\n2. 알림장 역사, 일일 과제 수행 기록, 포인트 변동 로그가 모두 초기화됩니다.\n3. 학생 명단은 유지되나, 모든 학생의 점수가 0점으로 재설정됩니다.\n\n계속하시겠습니까?")) {
    return;
  }
  
  // 1. 백업 데이터 자동 다운로드 실행
  exportClassroomData();
  
  // 2. 이력 데이터 초기화
  dailyLogs = {};
  pointHistory = [];
  dailyAssignments = {};
  dailyAnnouncements = {};
  pendingRequests = {};
  absentLogs = {};
  processedDeductionDates = [];
  
  // 3. 학생 점수 0점 리셋
  students.forEach(s => {
    s.total_points = 0;
  });
  
  // 4. 저장 및 페이지 새로고침
  saveData();
  
  alert("🎉 새 학기 전환 및 데이터 초기화가 완료되었습니다!\n다운로드 폴더에서 백업용 데이터 파일을 확인해 주세요.");
  location.reload();
};


// ==========================================================================
// 13. HTML 인라인 이벤트 핸들러용 Window 전역 바인딩
// ==========================================================================
window.switchTab = switchTab;
window.navigateMonth = navigateMonth;
window.showCalendarView = showCalendarView;
window.showDateDetail = showDateDetail;
window.exportClassroomData = exportClassroomData;
window.triggerImportFileInput = triggerImportFileInput;
window.archiveAndResetNewSemester = archiveAndResetNewSemester;
window.importClassroomData = importClassroomData;
window.renderPointHistoryDatabase = renderPointHistoryDatabase;
window.filterPointHistoryTable = filterPointHistoryTable;
window.toggleTaskInTableDynamic = toggleTaskInTableDynamic;
window.addNewStudentRow = addNewStudentRow;
window.deleteRosterRow = deleteRosterRow;
window.saveRoster = saveRoster;
window.addNewGradeRow = addNewGradeRow;
window.deleteGradeRow = deleteGradeRow;
window.saveGradesConfig = saveGradesConfig;
window.closeModal = closeModal;
window.saveAssignmentChanges = saveAssignmentChanges;
window.openAssignmentModalByCard = openAssignmentModalByCard;
window.toggleSingleTaskFromCard = toggleSingleTaskFromCard;
window.setDashboardViewMode = setDashboardViewMode;
window.toggleTaskFromUnsubmittedList = toggleTaskFromUnsubmittedList;
window.bulkDeductUnsubmitted = bulkDeductUnsubmitted;
window.closeBulkDeductConfirmModal = closeBulkDeductConfirmModal;
window.allUnsubmittedDeduct = allUnsubmittedDeduct;
window.goBackToTeacherDashboard = goBackToTeacherDashboard;
window.adjustTimer = adjustTimer;
window.toggleTimer = toggleTimer;
window.resetTimer = resetTimer;
window.openCreateAssignmentModal = openCreateAssignmentModal;
window.closeCreateAssignmentModal = closeCreateAssignmentModal;
window.submitCreateAssignments = submitCreateAssignments;
window.toggleOverwriteMode = toggleOverwriteMode;
window.deleteCurrentDayAssignments = deleteCurrentDayAssignments;
window.requestTaskApproval = requestTaskApproval;
window.approveTaskRequest = approveTaskRequest;
window.rejectTaskRequest = rejectTaskRequest;
window.renderApprovalRequestsWidget = renderApprovalRequestsWidget;

// Expose currentDashboardDate with a getter/setter to support inline onclick handlers
Object.defineProperty(window, 'currentDashboardDate', {
  get: () => currentDashboardDate,
  set: (val) => { currentDashboardDate = val; }
});
window.generateTaskInputs = generateTaskInputs;
window.openRosterBulkModal = openRosterBulkModal;
window.closeRosterBulkModal = closeRosterBulkModal;
window.submitBulkRoster = submitBulkRoster;
window.renderRosterPointsManager = renderRosterPointsManager;
window.saveRosterPoints = saveRosterPoints;
window.openRosterDetailModal = openRosterDetailModal;
window.closeRosterDetailModal = closeRosterDetailModal;
window.adjustPointsInline = adjustPointsInline;
window.adjustTaskPoints = adjustTaskPoints;
window.triggerGradeIconFileInput = triggerGradeIconFileInput;
window.handleGradeIconUpload = handleGradeIconUpload;
window.removeGradeIcon = removeGradeIcon;
window.submitStudentLogin = submitStudentLogin;
window.goBackToStudentPortalLogin = goBackToStudentPortalLogin;
window.copyStudentPortalLink = copyStudentPortalLink;
window.viewStudentPortalFromTeacher = viewStudentPortalFromTeacher;
window.saveTeacherPasscode = saveTeacherPasscode;
window.saveStudentPasscode = saveStudentPasscode;
window.verifyStudentPortalPasscode = verifyStudentPortalPasscode;
window.promptTeacherLogin = promptTeacherLogin;
window.openGradesBulkModal = openGradesBulkModal;
window.closeGradesBulkModal = closeGradesBulkModal;
window.submitBulkGrades = submitBulkGrades;
window.changeDashboardDate = changeDashboardDate;
window.resetDashboardDateToToday = resetDashboardDateToToday;


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
const openPickerModal = () => {
  const oldOverlay = document.querySelector('.winner-announcement-overlay');
  if (oldOverlay) oldOverlay.remove();
  
  const listEl = document.getElementById('picker-slots-list');
  if (listEl) {
    listEl.style.transition = 'none';
    listEl.style.transform = `translateY(0px)`;
    listEl.innerHTML = `<li class="picker-slot-card">🎲 추첨 대기</li>`;
  }
  
  document.getElementById('picker-modal').classList.remove('hidden');
};

const closePickerModal = () => {
  document.getElementById('picker-modal').classList.add('hidden');
};

const startRollPicker = (mode) => {
  let candidates = [...students];
  
  if (mode === 'unsubmitted') {
    const dateStr = currentDashboardDate || new Date().toISOString().split('T')[0];
    const todayTasks = dailyAssignments[dateStr] || [];
    if (todayTasks.length === 0) {
      alert("❌ 오늘 배정된 과제가 없어 미제출 학생을 추첨할 수 없습니다.");
      return;
    }
    
    candidates = students.filter(student => {
      const studentLog = (dailyLogs[dateStr] && dailyLogs[dateStr][student.student_id]) || {};
      return todayTasks.some(task => studentLog[task.id] !== true);
    });
  }
  
  if (candidates.length === 0) {
    alert(mode === 'unsubmitted' ? "🎉 미제출 학생이 없습니다! 모두 과제를 완료했습니다." : "❌ 추첨할 학생이 없습니다.");
    return;
  }
  
  document.getElementById('btn-pick-all').disabled = true;
  document.getElementById('btn-pick-unsubmitted').disabled = true;
  
  const oldOverlay = document.querySelector('.winner-announcement-overlay');
  if (oldOverlay) oldOverlay.remove();
  
  const winner = candidates[Math.floor(Math.random() * candidates.length)];
  
  const listEl = document.getElementById('picker-slots-list');
  listEl.innerHTML = '';
  
  const rollLength = 30;
  const rollItems = [];
  for (let i = 0; i < rollLength - 1; i++) {
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    rollItems.push(randomStudent);
  }
  rollItems.push(winner);
  
  rollItems.forEach((student) => {
    const li = document.createElement('li');
    li.className = 'picker-slot-card';
    li.innerText = `${student.student_id}번 ${student.name}`;
    listEl.appendChild(li);
  });
  
  let currentIndex = 0;
  let speed = 40;
  let elapsed = 0;
  
  listEl.style.transition = 'none';
  listEl.style.transform = `translateY(45px)`;
  
  const tick = () => {
    currentIndex++;
    listEl.style.transition = 'transform 0.08s ease-out';
    listEl.style.transform = `translateY(${45 - currentIndex * 90}px)`;
    
    playAudioEffect('coin');
    
    if (currentIndex >= rollLength - 1) {
      setTimeout(() => {
        announceWinner(winner);
      }, 200);
      return;
    }
    
    elapsed += speed;
    speed = 40 + Math.pow(currentIndex / rollLength, 3.5) * 400;
    
    setTimeout(tick, speed);
  };
  
  setTimeout(tick, speed);
};

const announceWinner = (student) => {
  document.getElementById('btn-pick-all').disabled = false;
  document.getElementById('btn-pick-unsubmitted').disabled = false;
  
  const modalBody = document.querySelector('#picker-modal .modal-body');
  if (!modalBody) return;
  
  playAudioEffect('triumph');
  triggerConfettiEffect();
  
  const overlay = document.createElement('div');
  overlay.className = 'winner-announcement-overlay';
  
  overlay.innerHTML = `
    <span style="font-size: 80px; margin-bottom: 10px;">🏆</span>
    <h3 style="font-size: 18px; color: #38bdf8; font-weight: bold; margin-bottom: 12px; letter-spacing: 1px;">오늘의 발표자 당첨!</h3>
    <div class="winner-name-text">${student.student_id}번 ${student.name}</div>
    <button class="btn-success btn-large" style="margin-top: 10px; background-color: #38bdf8; border-color: #0284c7; padding: 10px 24px;" onclick="closeWinnerOverlay(this)">확인</button>
  `;
  
  modalBody.appendChild(overlay);
};

const closeWinnerOverlay = (btn) => {
  const overlay = btn.closest('.winner-announcement-overlay');
  if (overlay) overlay.remove();
  
  const listEl = document.getElementById('picker-slots-list');
  if (listEl) {
    listEl.style.transition = 'none';
    listEl.style.transform = `translateY(0px)`;
    listEl.innerHTML = `<li class="picker-slot-card">🎲 추첨 대기</li>`;
  }
};

// 모둠 활동 타이머 모달 열기/닫기
const openTimerModal = () => {
  document.getElementById('timer-modal').classList.remove('hidden');
};

const closeTimerModal = () => {
  document.getElementById('timer-modal').classList.add('hidden');
};

window.toggleTheme = toggleTheme;
window.toggleVolume = toggleVolume;
window.openPickerModal = openPickerModal;
window.closePickerModal = closePickerModal;
window.openTimerModal = openTimerModal;
window.closeTimerModal = closeTimerModal;
window.startRollPicker = startRollPicker;
window.closeWinnerOverlay = closeWinnerOverlay;
window.updateClassProgress = updateClassProgress;
window.triggerConfettiEffect = triggerConfettiEffect;
window.saveGoogleDriveConfig = saveGoogleDriveConfig;
window.disconnectGoogleDrive = disconnectGoogleDrive;
window.loginWithGoogleDrive = loginWithGoogleDrive;
window.syncWithGoogleDriveManual = syncWithGoogleDriveManual;
window.logoutGoogleDrive = logoutGoogleDrive;
window.copyTeacherDashboardLink = copyTeacherDashboardLink;
window.initFirebaseSync = initFirebaseSync;
window.saveFirebaseConfig = saveFirebaseConfig;
window.disconnectFirebase = disconnectFirebase;
window.loginWithFirebaseGoogle = loginWithFirebaseGoogle;
window.logoutFirebaseGoogle = logoutFirebaseGoogle;
window.changeSyncMode = changeSyncMode;
window.toggleRosterSelectAll = toggleRosterSelectAll;
window.updateRosterSelectAllState = updateRosterSelectAllState;
window.filterRosterList = filterRosterList;
window.setBatchTemplate = setBatchTemplate;
window.applyBatchPoints = applyBatchPoints;
window.toggleFbAdvancedFields = toggleFbAdvancedFields;
window.loginAsTeacher = loginAsTeacher;

const handleTeacherLogout = () => {
  sessionStorage.removeItem('teacher_authenticated');
  clearGoogleTokens();
  if (currentSyncMode === 'firebase') {
    if (firebase.apps.length > 0) {
      firebase.auth().signOut().catch(err => console.error(err));
    }
    firebaseUser = null;
    localStorage.removeItem('firebaseUser');
  }
  alert("로그아웃 되었습니다.");
  location.reload();
};
window.handleTeacherLogout = handleTeacherLogout;

const toggleLandingSettings = () => {
  const panel = document.getElementById('landing-settings-panel');
  if (!panel) return;
  const isHidden = panel.classList.contains('hidden');
  if (isHidden) {
    panel.classList.remove('hidden');
    
    // Load current values
    const modeSelect = document.getElementById('landing-sync-mode');
    if (modeSelect) modeSelect.value = currentSyncMode;
    
    const inputGdriveClientId = document.getElementById('landing-gdrive-client-id');
    if (inputGdriveClientId) inputGdriveClientId.value = googleClientId || '';
    
    const inputFbUrl = document.getElementById('landing-fb-db-url');
    const inputFbApiKey = document.getElementById('landing-fb-api-key');
    const inputFbProjId = document.getElementById('landing-fb-project-id');
    const inputFbSyncKey = document.getElementById('landing-fb-sync-key');
    
    if (firebaseConfig) {
      const isDefault = (firebaseConfig.databaseURL === defaultFirebaseConfig.databaseURL);
      if (inputFbUrl) inputFbUrl.value = isDefault ? '' : (firebaseConfig.databaseURL || '');
      if (inputFbApiKey) inputFbApiKey.value = isDefault ? '' : (firebaseConfig.apiKey || '');
      if (inputFbProjId) inputFbProjId.value = isDefault ? '' : (firebaseConfig.projectId || '');
      if (inputFbSyncKey) inputFbSyncKey.value = firebaseConfig.classroomSyncKey || '';
    }
    
    changeLandingSyncMode(currentSyncMode);
  } else {
    panel.classList.add('hidden');
  }
};

const changeLandingSyncMode = (mode) => {
  const gdriveFields = document.getElementById('landing-gdrive-fields');
  const firebaseFields = document.getElementById('landing-firebase-fields');
  if (gdriveFields && firebaseFields) {
    if (mode === 'gdrive') {
      gdriveFields.classList.remove('hidden');
      firebaseFields.classList.add('hidden');
    } else if (mode === 'firebase') {
      firebaseFields.classList.remove('hidden');
      gdriveFields.classList.add('hidden');
    } else {
      gdriveFields.classList.add('hidden');
      firebaseFields.classList.add('hidden');
    }
  }
};

const saveLandingSettings = () => {
  const mode = document.getElementById('landing-sync-mode').value;
  
  if (mode === 'gdrive') {
    const clientId = document.getElementById('landing-gdrive-client-id').value.trim();
    if (!clientId) {
      alert("❌ Google Client ID는 필수 입력 사항입니다.");
      return;
    }
    localStorage.setItem('googleClientId', clientId);
    googleClientId = clientId;
    localStorage.setItem('currentSyncMode', 'gdrive');
    currentSyncMode = 'gdrive';
  } else if (mode === 'firebase') {
    const dbUrl = document.getElementById('landing-fb-db-url').value.trim();
    const apiKey = document.getElementById('landing-fb-api-key').value.trim();
    const projId = document.getElementById('landing-fb-project-id').value.trim();
    const syncKey = document.getElementById('landing-fb-sync-key').value.trim();
    
    if (!dbUrl && !apiKey && !projId) {
      localStorage.setItem('firebaseConfig', JSON.stringify(defaultFirebaseConfig));
      firebaseConfig = defaultFirebaseConfig;
    } else {
      if (!dbUrl || !apiKey || !projId) {
        alert("❌ 파이어베이스 설정을 모두 입력하거나, 전부 비워두어 기본 서버를 사용해 주세요.");
        return;
      }
      const newConfig = {
        databaseURL: dbUrl,
        apiKey: apiKey,
        projectId: projId,
        authDomain: projId + ".firebaseapp.com",
        classroomSyncKey: syncKey || ''
      };
      localStorage.setItem('firebaseConfig', JSON.stringify(newConfig));
      firebaseConfig = newConfig;
    }
    localStorage.setItem('currentSyncMode', 'firebase');
    currentSyncMode = 'firebase';
  } else {
    localStorage.setItem('currentSyncMode', 'local');
    currentSyncMode = 'local';
  }
  
  alert("💾 설정이 성공적으로 저장되었습니다!");
  location.reload();
};

const loginLocalBypass = () => {
  currentSyncMode = 'local';
  localStorage.setItem('currentSyncMode', 'local');
  sessionStorage.setItem('teacher_authenticated', 'true');
  alert("🎉 구글 로그인 없이 로컬 모드로 진입합니다.\n(데이터는 브라우저의 localStorage에만 저장됩니다.)");
  window.location.hash = "#teacher";
  location.reload();
};

window.toggleLandingSettings = toggleLandingSettings;
window.changeLandingSyncMode = changeLandingSyncMode;
window.saveLandingSettings = saveLandingSettings;
window.loginLocalBypass = loginLocalBypass;

const handleAlwaysOnTopChange = (checked) => {
  localStorage.setItem('electronAlwaysOnTop', checked ? 'true' : 'false');
  if (window.electronAPI && window.electronAPI.setAlwaysOnTop) {
    window.electronAPI.setAlwaysOnTop(checked);
  }
};

window.handleAlwaysOnTopChange = handleAlwaysOnTopChange;


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



const initAnnouncementEditor = () => {
  const contentEl = document.getElementById('announcement-content');
  if (contentEl) {
    // 포커스를 잃었을 때 자동으로 저장
    contentEl.addEventListener('blur', () => {
      const newText = contentEl.innerText.trim();
      if (newText) {
        dailyAnnouncements[currentAnnouncementDate] = newText;
      } else {
        delete dailyAnnouncements[currentAnnouncementDate];
      }
      // Keep legacy today_announcement in sync for today's date
      config.today_announcement = dailyAnnouncements[getTodayDateString()] || "";
      saveData();
    });

    // 엔터 입력 시 자동으로 번호 매기기 및 문장 구분
    contentEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);

        // 커서 앞쪽의 텍스트 추출
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(contentEl);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const textBeforeCaret = preCaretRange.toString();

        // 줄바꿈으로 분리하여 현재 줄 분석
        const linesBefore = textBeforeCaret.split('\n');
        const currentLine = linesBefore[linesBefore.length - 1];

        // 숫자로 시작하는지 확인 (예: "1. ", "2. ")
        const numberMatch = currentLine.match(/^(\d+)\.\s*(.*)/);

        if (numberMatch) {
          const num = parseInt(numberMatch[1], 10);
          const textAfterNumber = numberMatch[2].trim();

          if (textAfterNumber === '') {
            // 내용 없이 번호만 있는 줄에서 엔터를 치면 번호를 지우고 줄바꿈만 수행 (리스트 종료)
            e.preventDefault();
            const lenToDelete = currentLine.length;
            for (let i = 0; i < lenToDelete; i++) {
              document.execCommand('delete');
            }
            document.execCommand('insertText', false, '\n');
          } else {
            // 내용이 있는 줄에서 엔터를 치면 다음 번호를 자동으로 매겨서 줄바꿈
            e.preventDefault();
            const nextNum = num + 1;
            document.execCommand('insertText', false, `\n${nextNum}. `);
          }
        } else {
          // 숫자로 시작하지 않는 경우, 텍스트가 존재하면 자동으로 "1. "으로 시작
          if (currentLine.trim() !== '') {
            e.preventDefault();
            document.execCommand('insertText', false, '\n1. ');
          }
        }
      }
    });

    // 붙여넣기 시 서식을 모두 지우고 일반 텍스트만 들어가도록 처리
    contentEl.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    });

    // 알림장 영역(widget-body)을 클릭하면 텍스트 박스에 바로 포커싱
    const widgetBody = contentEl.closest('.widget-body');
    if (widgetBody) {
      widgetBody.addEventListener('click', (e) => {
        if (e.target !== contentEl) {
          contentEl.focus();
          
          // 커서를 텍스트 가장 끝으로 이동시키는 헬퍼
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(contentEl);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      });
    }
  }
};

const initDetailAnnouncementEditor = () => {
  const contentEl = document.getElementById('records-detail-announcement-content');
  if (contentEl) {
    // 포커스를 잃었을 때 자동으로 저장
    contentEl.addEventListener('blur', () => {
      const newText = contentEl.innerText.trim();
      if (newText) {
        dailyAnnouncements[selectedRecordDate] = newText;
      } else {
        delete dailyAnnouncements[selectedRecordDate];
      }
      
      // 만약 현재 수정 중인 날짜가 오늘이라면 메인 화면 알림장 버퍼에도 반영
      const todayStr = getTodayDateString();
      if (selectedRecordDate === todayStr) {
        config.today_announcement = newText;
        const mainContentEl = document.getElementById('announcement-content');
        if (mainContentEl) mainContentEl.innerText = newText;
      }
      
      saveData();
      renderCalendar(); // 달력의 알림장 미리보기 배지 갱신용
    });

    // 엔터 입력 시 자동으로 번호 매기기 및 문장 구분
    contentEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const range = selection.getRangeAt(0);

        // 커서 앞쪽의 텍스트 추출
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(contentEl);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const textBeforeCaret = preCaretRange.toString();

        // 줄바꿈으로 분리하여 현재 줄 분석
        const linesBefore = textBeforeCaret.split('\n');
        const currentLine = linesBefore[linesBefore.length - 1];

        // 숫자로 시작하는지 확인 (예: "1. ", "2. ")
        const numberMatch = currentLine.match(/^(\d+)\.\s*(.*)/);

        if (numberMatch) {
          const num = parseInt(numberMatch[1], 10);
          const textAfterNumber = numberMatch[2].trim();

          if (textAfterNumber === '') {
            // 내용 없이 번호만 있는 줄에서 엔터를 치면 번호를 지우고 줄바꿈만 수행 (리스트 종료)
            e.preventDefault();
            const lenToDelete = currentLine.length;
            for (let i = 0; i < lenToDelete; i++) {
              document.execCommand('delete');
            }
            document.execCommand('insertText', false, '\n');
          } else {
            // 내용이 있는 줄에서 엔터를 치면 다음 번호를 자동으로 매겨서 줄바꿈
            e.preventDefault();
            const nextNum = num + 1;
            document.execCommand('insertText', false, `\n${nextNum}. `);
          }
        } else {
          // 숫자로 시작하지 않는 경우, 텍스트가 존재하면 자동으로 "1. "으로 시작
          if (currentLine.trim() !== '') {
            e.preventDefault();
            document.execCommand('insertText', false, '\n1. ');
          }
        }
      }
    });

    // 붙여넣기 시 서식을 모두 지우고 일반 텍스트만 들어가도록 처리
    contentEl.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      document.execCommand('insertText', false, text);
    });
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
  processAutoDeductions(); // 미제출 과제 자동 감점 실행
  
  // 테마 및 볼륨 초기화
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }
  updateThemeButton();
  updateVolumeButton();
  
  startClock();
  initDailyRecordsTab();
  initAnnouncementEditor();
  initDetailAnnouncementEditor();
  
  // 구글 드라이브 연동 초기화 및 자동 동기화
  initGoogleDriveSync();
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
  
  router();
};
