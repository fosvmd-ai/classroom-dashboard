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
const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
};

// 기본 데이터 로드
let students = JSON.parse(localStorage.getItem('students')) || DEFAULT_STUDENTS;
let grades = JSON.parse(localStorage.getItem('grades')) || DEFAULT_GRADES;
let dailyLogs = JSON.parse(localStorage.getItem('dailyLogs')) || {};
let pointHistory = JSON.parse(localStorage.getItem('pointHistory')) || [];
let config = JSON.parse(localStorage.getItem('config')) || {
  today_announcement: "금요일 수학 3단원 단원평가 준비물(자, 연필, 지우개) 챙기기!\n주제 글쓰기 주제는 '내가 좋아하는 계절'입니다."
};

// [개선] 날짜별 과제 설정을 별도 보관하는 스토리지 로드
let dailyAssignments = JSON.parse(localStorage.getItem('dailyAssignments')) || {};
let pendingRequests = JSON.parse(localStorage.getItem('pendingRequests')) || {};
let teacherPasscode = localStorage.getItem('teacherPasscode') || '1234';
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

      const card = document.createElement('div');
      card.className = `student-card ${allComplete ? 'all-complete' : ''}`;
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

  document.getElementById('announcement-content').innerText = config.today_announcement;
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
    
    // [개선] 과제가 설정되어 있지 않다면 클릭 시 생성 팝업(Modal) 연동
    dayCell.onclick = () => {
      if (tasks.length > 0) {
        showDateDetail(dateKey);
      } else {
        openCreateAssignmentModal(dateKey);
      }
    };

    dayCell.innerHTML = `
      <span class="day-number">${day}</span>
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
    
    const tr = document.createElement('tr');
    
    // 번호, 이름 <td>
    let rowHtml = `<td>${student.student_id}</td><td style="font-weight:bold;">${student.name}</td>`;
    
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
  const tableBody = document.getElementById('roster-points-table-body');
  tableBody.innerHTML = '';

  // 학번 기준 정렬 (글로벌 배열 순서를 변경하지 않도록 얕은 복사 후 정렬)
  const sortedStudents = [...students].sort((a, b) => a.student_id.localeCompare(b.student_id));

  sortedStudents.forEach(student => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${student.student_id}</td>
      <td style="font-weight:bold;">${student.name}</td>
      <td style="color:var(--primary-color); font-weight:bold;">${student.total_points}점</td>
      <td>
        <div style="display:flex; justify-content:center; align-items:center; gap:6px;">
          <button class="btn-danger" style="padding: 4px 12px; font-size: 14px; font-weight: bold; border-radius: var(--radius-sm);" onclick="adjustPointsInline('${student.student_id}', -1)">-1</button>
          <input type="number" class="roster-point-edit-input" data-student-id="${student.student_id}" value="${student.total_points}" style="width:80px; text-align:center; margin: 0;">
          <button class="btn-success" style="padding: 4px 12px; font-size: 14px; font-weight: bold; border-radius: var(--radius-sm);" onclick="adjustPointsInline('${student.student_id}', 1)">+1</button>
        </div>
      </td>
      <td>
        <input type="text" class="roster-point-reason-input" data-student-id="${student.student_id}" placeholder="(선택 사항) 예: 발표 우수, 준비물 미참가 등" style="text-align:left;">
      </td>
      <td>
        <button class="btn-primary" style="padding: 6px 12px; font-size:13px; font-weight:bold; border-radius:var(--radius-sm);" onclick="viewStudentPortalFromTeacher('${student.student_id}')">🔍 조회</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
};

// 7-1-A. 수동 점수 1점단위 즉시 가감 버튼 헬퍼
const adjustPointsInline = (studentId, amount) => {
  const input = document.querySelector(`.roster-point-edit-input[data-student-id="${studentId}"]`);
  if (input) {
    const val = parseInt(input.value) || 0;
    input.value = Math.max(0, val + amount);
    playAudioEffect(amount > 0 ? 'coin' : 'buzz');
  }
};

// 7-1-B. 교사용 수첩 바로가기 함수
const viewStudentPortalFromTeacher = (studentId) => {
  referrerView = "teacher";
  window.location.hash = `student/${studentId}`;
};

// 7-2. 수동 점수 일괄 저장 처리
const saveRosterPoints = () => {
  const editInputs = document.querySelectorAll('.roster-point-edit-input');
  const reasonInputs = document.querySelectorAll('.roster-point-reason-input');
  
  let changedCount = 0;
  const nowStr = new Date().toISOString();

  editInputs.forEach((input, index) => {
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
        
        const reasonInput = reasonInputs[index];
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
    const idInput = row.querySelector('.roster-id-input').value.trim();
    const nameInput = row.querySelector('.roster-name-input').value.trim();

    if (!idInput || !nameInput) {
      alert("학번과 이름은 빈칸일 수 없습니다.");
      valid = false;
      return;
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

  // 교사용 비밀번호 입력칸에 현재 비밀번호 동기화
  const passcodeEl = document.getElementById('teacher-passcode-input');
  if (passcodeEl) {
    passcodeEl.value = teacherPasscode;
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

  let checkboxGroupHtml = '<div class="large-checkbox-group">';
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
  const basePortalUrl = window.location.href.split('#')[0];
  const fullPortalUrl = `${basePortalUrl}#student/${student.student_id}`;
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

const renderStudentPortal = (studentId) => {
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

  document.getElementById('portal-student-title').innerText = `🛡️ ${student.student_id}번 ${student.name} 학생의 신용수첩`;
  document.getElementById('portal-points').innerText = `${student.total_points}점`;

  const grade = evaluateGrade(student.total_points);
  document.getElementById('portal-grade-name').innerText = grade.name;

  const portalAnnounceEl = document.getElementById('portal-announcement-content');
  if (portalAnnounceEl) {
    portalAnnounceEl.innerText = config.today_announcement || "알림장이 없습니다.";
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
      const isPending = (pendingRequests[todayStr] && 
                         pendingRequests[todayStr][student.student_id] && 
                         pendingRequests[todayStr][student.student_id][task.id] === true);
      
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
        statusHtml = `<button class="btn-portal-request" onclick="requestTaskApproval('${student.student_id}', '${task.id}', '${task.name}')">✔️ 완료 요청</button>`;
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
          const isPending = (pendingRequests[checkDateKey] && 
                             pendingRequests[checkDateKey][student.student_id] && 
                             pendingRequests[checkDateKey][student.student_id][task.id] === true);
          outstanding.push({
            dateKey: checkDateKey,
            taskId: task.id,
            date: `${month}월 ${dateStr}일`,
            task_name: task.name,
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
        statusHtml = `<button class="btn-portal-request" style="font-size: 11px; padding: 4px 8px;" onclick="requestTaskApproval('${student.student_id}', '${item.taskId}', '${item.task_name}', '${item.dateKey}')">✔️ 완료 요청</button>`;
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

const requestTaskApproval = (studentId, taskId, taskName, dateKey) => {
  const targetDate = dateKey || getTodayDateString();
  if (!pendingRequests[targetDate]) {
    pendingRequests[targetDate] = {};
  }
  if (!pendingRequests[targetDate][studentId]) {
    pendingRequests[targetDate][studentId] = {};
  }
  
  pendingRequests[targetDate][studentId][taskId] = true;
  saveData();
  
  playAudioEffect('coin');
  alert(`📥 '${taskName}' 과제 완료 승인 요청이 교사 대시보드로 전송되었습니다!`);
  renderStudentPortal(studentId);
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
      Object.entries(taskObj).forEach(([taskId, requested]) => {
        if (requested === true) {
          // Find student and task information
          const student = students.find(s => s.student_id === studentId);
          const dayTasks = dailyAssignments[dateKey] || [];
          const task = dayTasks.find(t => t.id === taskId);
          
          if (student && task) {
            requests.push({
              dateKey,
              studentId,
              studentName: student.name,
              taskId,
              taskName: task.name,
              points: task.points
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

  if (hash.startsWith("#student/")) {
    const studentId = hash.split("/")[1];
    
    teacherView.classList.add('hidden');
    studentLoginView.classList.add('hidden');
    studentView.classList.remove('hidden');
    
    renderStudentPortal(studentId);
  } else if (hash === "#student-login") {
    teacherView.classList.add('hidden');
    studentView.classList.add('hidden');
    studentLoginView.classList.remove('hidden');
    
    // 로그인 폼 입력 및 에러 메시지 초기화
    document.getElementById('login-student-id').value = "";
    document.getElementById('login-student-name').value = "";
    document.getElementById('login-error-msg').classList.add('hidden');
  } else if (hash === "#teacher") {
    if (sessionStorage.getItem('teacher_authenticated') === 'true') {
      studentView.classList.add('hidden');
      studentLoginView.classList.add('hidden');
      teacherView.classList.remove('hidden');
      switchTab('dashboard');
    } else {
      const entered = prompt("🔒 교사용 관리자 비밀번호를 입력해 주세요:");
      if (entered === teacherPasscode) {
        sessionStorage.setItem('teacher_authenticated', 'true');
        studentView.classList.add('hidden');
        studentLoginView.classList.add('hidden');
        teacherView.classList.remove('hidden');
        switchTab('dashboard');
      } else {
        if (entered !== null) {
          alert("❌ 비밀번호가 올바르지 않습니다.");
        }
        window.location.hash = "#student-login";
      }
    }
  } else {
    // 기본적으로 학생 로그인 포털로 리다이렉트하여 학생의 교사 대시보드 접근 방지
    window.location.hash = "#student-login";
  }
};

// 12-1. 학생 조회용 포털 로그인 로직
const submitStudentLogin = () => {
  const idInput = document.getElementById('login-student-id').value.trim();
  const nameInput = document.getElementById('login-student-name').value.trim();
  const errorMsg = document.getElementById('login-error-msg');
  
  let formattedId = idInput;
  // 번호 한 자리 입력 자동 보정 (예: 5 -> 05)
  if (idInput.length === 1 && !isNaN(idInput)) {
    formattedId = idInput.padStart(2, '0');
  }
  
  const matchedStudent = students.find(s => s.student_id === formattedId && s.name === nameInput);
  
  if (matchedStudent) {
    errorMsg.classList.add('hidden');
    window.location.hash = `student/${matchedStudent.student_id}`;
  } else {
    errorMsg.classList.remove('hidden');
  }
};

const goBackToStudentPortalLogin = () => {
  if (referrerView === "teacher") {
    window.location.hash = "#teacher"; // 교사용 관리판으로 복귀
    setTimeout(() => switchTab('roster'), 50); // 점수 관리 탭 강제 활성화
  } else {
    window.location.hash = "student-login";
  }
};

const copyStudentPortalLink = () => {
  const fullPortalUrl = window.location.origin + window.location.pathname + "#student-login";
  
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
  localStorage.setItem('teacherPasscode', teacherPasscode);
  alert("🔒 교사용 비밀번호가 성공적으로 변경되었습니다!");
};

const promptTeacherLogin = () => {
  if (sessionStorage.getItem('teacher_authenticated') === 'true') {
    window.location.hash = "#teacher";
    return;
  }
  const entered = prompt("🔒 교사용 관리자 비밀번호를 입력해 주세요:");
  if (entered === null) return;
  
  if (entered === teacherPasscode) {
    sessionStorage.setItem('teacher_authenticated', 'true');
    window.location.hash = "#teacher";
  } else {
    alert("❌ 비밀번호가 올바르지 않습니다.");
  }
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
    teacherPasscode: localStorage.getItem('teacherPasscode') || '1234'
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
      localStorage.setItem('teacherPasscode', String(data.teacherPasscode || '1234'));

      alert("🎉 학급 데이터 복원이 완료되었습니다. 최신 정보를 반영하기 위해 대시보드를 새로고침합니다.");
      location.reload();

    } catch (err) {
      alert("❌ 파일 읽기 중 오류가 발생했습니다: " + err.message);
    }
  };
  reader.readAsText(file);
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
window.importClassroomData = importClassroomData;
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


const initAnnouncementEditor = () => {
  const contentEl = document.getElementById('announcement-content');
  if (contentEl) {
    // 포커스를 잃었을 때 자동으로 localStorage에 저장
    contentEl.addEventListener('blur', () => {
      const newText = contentEl.innerText.trim();
      config.today_announcement = newText;
      localStorage.setItem('config', JSON.stringify(config));
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



window.addEventListener('hashchange', router);
window.onload = () => {
  initDatabaseMigration(); // 데이터 로드 마이그레이션 적용
  
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
  
  // 학급 달성률 게이지 업데이트
  updateClassProgress();
  
  router();
};
