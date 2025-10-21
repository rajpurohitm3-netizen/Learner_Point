// Advanced Campus Placement Portal JavaScript
// -----------------------------------------------------------
// NOTE: This file builds upon the earlier basic implementation but
// now supports: theme toggling, mobile sidebar, chatbot widget, AI
// resume parsing simulation, skill-gap analysis, company portal, etc.
// -----------------------------------------------------------

// ---------------- Application State -----------------------
let currentUser = null;
let currentSection = 'dashboard';
const uiState = {
  darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
};

// Core in-memory datastore (subset for demo)
const applicationData = {
  users: {
    'student@college.edu': {
      type: 'student',
      name: 'Arjun Sharma',
      rollNo: '21CS001',
      department: 'Computer Science',
      year: '3rd Year',
      cgpa: 8.7,
      email: 'student@college.edu',
      phone: '+91-9876543210',
      address: 'Hostel-B-102, Campus Rd, Bangalore',
      skills: ['Python', 'JavaScript', 'React', 'Machine Learning', 'SQL'],
      certifications: ['AWS Cloud Practitioner', 'Google Analytics'],
      profileCompletion: 92,
      applications: [],
      preferences: {
        jobTypes: ['Full-time', 'Internship'],
        locations: 'Bangalore, Mumbai, Remote',
        salaryRange: '8-15 LPA'
      }
    },
    'faculty@college.edu': {
      type: 'faculty',
      name: 'Dr. Priya Mehta',
      department: 'Computer Science',
      email: 'faculty@college.edu'
    },
    'staff@college.edu': {
      type: 'staff',
      name: 'Rajesh Kumar',
      role: 'Placement Officer',
      email: 'staff@college.edu'
    },
    'admin@college.edu': {
      type: 'admin',
      name: 'Dr. Vikram Singh',
      role: 'Dean ‑ Placements',
      email: 'admin@college.edu'
    },
    'company@techcorp.com': {
      type: 'company',
      name: 'TechCorp HR',
      companyName: 'TechCorp Solutions',
      email: 'company@techcorp.com'
    }
  },
  jobs: [], // populated later for brevity
  applications: [],
  notifications: [
    {
      id: 1,
      title: 'System Update',
      message: 'Welcome to the new AI-powered placement portal!',
      time: 'Just now',
      type: 'info',
      read: false
    }
  ]
};

// Demo credentials
const demoCredentials = {
  'student@college.edu': 'student123',
  'faculty@college.edu': 'faculty123',
  'staff@college.edu': 'staff123',
  'admin@college.edu': 'admin123',
  'company@techcorp.com': 'company123'
};

// Basic skills database (subset)
const skillsCategoriesData = [
  { category: 'Programming Languages', skills: ['Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust'] },
  { category: 'Web Frameworks', skills: ['React', 'Angular', 'Vue.js', 'Django', 'Flask'] },
  { category: 'Data Science', skills: ['Machine Learning', 'Deep Learning', 'Pandas', 'NumPy'] },
  { category: 'Databases', skills: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis'] }
];

// ---------------- DOMContentLoaded -----------------------
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  showLoginScreen();
  // Apply initial theme
  setTheme(uiState.darkMode ? 'dark' : 'light');
});

// ---------------- Utility DOM Helpers --------------------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ---------------- UI Display Functions -------------------
function showLoginScreen() {
  $('#loginScreen').classList.remove('hidden');
  $('#mainApp').classList.add('hidden');
  $('#loginForm').reset();
}

function showMainApp() {
  $('#loginScreen').classList.add('hidden');
  $('#mainApp').classList.remove('hidden');
}

function showToast(title, message, type = 'info') {
  const id = `toast-${Date.now()}`;
  const toast = document.createElement('div');
  toast.id = id;
  toast.className = `toast ${type}`;
  toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-message">${message}</div>`;
  $('#toastContainer').appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

function showLoading() { $('#loadingSpinner').classList.remove('hidden'); }
function hideLoading() { $('#loadingSpinner').classList.add('hidden'); }

// ---------------- Event Listeners ------------------------
function setupEventListeners() {
  // Login form -------------------
  $('#loginForm').addEventListener('submit', handleLogin);

  // Sidebar toggle (mobile) ------
  $('#sidebarToggle').addEventListener('click', () => {
    $('#sidebar').classList.toggle('mobile-open');
  });

  // Theme toggle -----------------
  $('#themeToggle').addEventListener('click', () => {
    uiState.darkMode = !uiState.darkMode;
    setTheme(uiState.darkMode ? 'dark' : 'light');
  });

  // Logout -----------------------
  $('#logoutBtn').addEventListener('click', () => {
    currentUser = null; showLoginScreen(); showToast('Logged out', 'See you again!', 'info');
  });

  // Notification bell ------------
  $('#notificationBell').addEventListener('click', () => navigateToSection('notifications'));

  // Quick action -----------------
  $('#quickAction').addEventListener('click', handleQuickAction);

  // Global search ----------------
  $('#globalSearch').addEventListener('input', (e)=>console.log('Search:', e.target.value));

  // Skill gap analysis -----------
  const sgBtn = $('#skillGapAnalysisBtn');
  if (sgBtn) sgBtn.addEventListener('click', runSkillGapAnalysis);

  // Resume upload ----------------
  const resumeInput = $('#resumeInput');
  if (resumeInput) resumeInput.addEventListener('change', handleResumeUpload);
  const uploadArea = $('#resumeUploadArea');
  if (uploadArea) {
    ['dragover','drop'].forEach(evt => uploadArea.addEventListener(evt, e => e.preventDefault()));
    uploadArea.addEventListener('dragover', ()=> uploadArea.classList.add('dragover'));
    uploadArea.addEventListener('dragleave', ()=> uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e)=>{ uploadArea.classList.remove('dragover'); resumeInput.files = e.dataTransfer.files; handleResumeUpload(); });
  }

  // Chatbot widget --------------
  $('#chatbotToggle').addEventListener('click', ()=>$('#chatbotPanel').classList.toggle('hidden'));
  $('#closeChatbot').addEventListener('click', ()=>$('#chatbotPanel').classList.add('hidden'));
  $('#widgetSendBtn').addEventListener('click', ()=>sendChat('#widgetChatInput', '#widgetChatMessages'));
  $('#modalSendBtn')?.addEventListener('click', ()=>sendChat('#modalChatInput', '#modalChatMessages'));
  $('.chatbot-container #sendChatBtn')?.addEventListener('click', ()=>sendChat('#chatInput', '#chatMessages'));
  $$('.question-btn').forEach(btn=>btn.addEventListener('click', (e)=>{
    $('#chatInput').value = e.target.dataset.question; sendChat('#chatInput', '#chatMessages');
  }));

  // Tabs (profile) --------------
  $$('.tab-btn').forEach(btn=>btn.addEventListener('click', ()=>switchTab(btn.dataset.tab)));

  // Forms -----------------------
  $('#personalForm')?.addEventListener('submit', savePersonalInfo);
  $('#academicForm')?.addEventListener('submit', saveAcademicInfo);
  $('#preferencesForm')?.addEventListener('submit', savePreferences);
  $('#savePrivacyBtn')?.addEventListener('click', savePrivacySettings);

  // Skills selection ------------
  document.addEventListener('click', (e)=>{
    const item = e.target.closest('.skill-item');
    if(!item) return;
    const skill = item.dataset.skill;
    item.classList.toggle('selected');
    const checked = item.classList.contains('selected');
    if(checked) {
      if(!currentUser.skills.includes(skill)) currentUser.skills.push(skill);
    } else {
      currentUser.skills = currentUser.skills.filter(s=>s!==skill);
    }
    updateSelectedSkills();
    updateProfileCompletion();
  });

  // Add certification -----------
  $('#addCertificationBtn')?.addEventListener('click', ()=>{
    const val = $('#certificationName').value.trim();
    if(val) {
      currentUser.certifications.push(val);
      $('#certificationName').value='';
      renderCertifications();
      updateProfileCompletion();
    }
  });

  // Modal events ----------------
  $('#closeApplicationModal')?.addEventListener('click', ()=>hideModal('jobApplicationModal'));
  $('#cancelApplication')?.addEventListener('click', ()=>hideModal('jobApplicationModal'));
  $('#applicationForm')?.addEventListener('submit', submitApplication);

  $('#closeJobPostModal')?.addEventListener('click', ()=>hideModal('jobPostModal'));
  $('#cancelJobPost')?.addEventListener('click', ()=>hideModal('jobPostModal'));
  $('#jobPostForm')?.addEventListener('submit', submitJobPost);
  $('#saveJobDraft')?.addEventListener('click', ()=>{ showToast('Saved', 'Job draft saved', 'success'); hideModal('jobPostModal'); });

  // Apply initial skill categories
  loadSkillsCategories();
}

// ---------------- Authentication -------------------------
function handleLogin(e) {
  e.preventDefault();
  const role = $('#roleSelect').value;
  const uname = $('#username').value.trim();
  const pwd = $('#password').value;
  if(!demoCredentials[uname] || demoCredentials[uname]!==pwd) return showToast('Error','Invalid credentials','error');
  const user = applicationData.users[uname];
  if(!user || user.type!==role) return showToast('Error','Role mismatch','error');
  currentUser = user;
  showLoading();
  setTimeout(()=>{
    hideLoading();
    showMainApp();
    $('#userName').textContent = currentUser.name;
    $('#userRole').textContent = currentUser.type.toUpperCase();
    $('#userAvatar').textContent = currentUser.name.charAt(0);
    setupNavigation(role);
    navigateToSection('dashboard');
    showToast('Welcome', `Hello ${currentUser.name}!`, 'success');
  }, 1200);
}

// ---------------- Theme ----------------------------------
function setTheme(mode) {
  document.documentElement.dataset.colorScheme = mode;
  $('#themeToggle').textContent = mode==='dark' ? '☀️' : '🌙';
}

// ---------------- Navigation -----------------------------
function setupNavigation(role) {
  const navItemsCommon = [
    {id:'dashboard', label:'Dashboard', icon:'📊'},
    {id:'notifications', label:'Notifications', icon:'🔔'}
  ];
  const navByRole = {
    student:[{id:'profile',label:'My Profile',icon:'👤'},{id:'jobs',label:'Job Opportunities',icon:'💼'},{id:'applications',label:'My Applications',icon:'📋'},{id:'interviews',label:'Interviews',icon:'🎯'},{id:'mentorship',label:'Mentorship',icon:'🤝'},{id:'chatbot',label:'AI Assistant',icon:'🤖'}],
    faculty:[{id:'analytics',label:'Analytics',icon:'📈'},{id:'interviews',label:'Interviews',icon:'🎯'}],
    staff:[{id:'jobManagement',label:'Job Management',icon:'📝'},{id:'analytics',label:'Analytics',icon:'📈'},{id:'interviews',label:'Interviews',icon:'🎯'}],
    admin:[{id:'analytics',label:'Analytics',icon:'📈'},{id:'jobManagement',label:'Job Management',icon:'📝'},{id:'settings',label:'Settings',icon:'⚙️'}],
    company:[{id:'companyDashboard',label:'Company Dashboard',icon:'🏢'},{id:'jobManagement',label:'Job Posts',icon:'📝'},{id:'interviews',label:'Interviews',icon:'🎯'}]
  };
  const navHTML = [...navItemsCommon, ...navByRole[role]].map(i=>`<li class="nav-item"><a href="#" class="nav-link${i.id==='dashboard'?' active':''}" data-section="${i.id}"><span class="nav-icon">${i.icon}</span>${i.label}</a></li>`).join('');
  $('#sidebar .sidebar-content').innerHTML = `<ul class="nav-menu">${navHTML}</ul>`;
  $$('#sidebar .nav-link').forEach(link=>link.addEventListener('click', (ev)=>{ev.preventDefault(); navigateToSection(link.dataset.section); if(window.innerWidth<768) $('#sidebar').classList.remove('mobile-open')}));
}

// ---------------- Section Router -------------------------
function navigateToSection(id){
  currentSection=id;
  $$('.nav-link').forEach(l=>l.classList.toggle('active',l.dataset.section===id));
  $$('.content-section').forEach(sec=>sec.classList.toggle('hidden',sec.id!==id));
  $('#breadcrumb').textContent = ($(`[data-section="${id}"]`)?.textContent)||'Dashboard';
  // load specific content
  switch(id){
    case 'dashboard': loadDashboard(); break;
    case 'profile': loadProfile(); break;
    case 'jobs': loadJobs(); break;
    case 'applications': loadApplications(); break;
    case 'analytics': loadAnalytics(); break;
    case 'jobManagement': loadJobManagement(); break;
    case 'companyDashboard': loadCompanyDashboard(); break;
    case 'notifications': loadNotifications(); break;
  }
}

// ---------------- Dashboard ------------------------------
function loadDashboard(){
  const dash = $('#dashboardContent');
  if(!dash) return;
  dash.innerHTML = `<div class="dashboard-widget"><div class="widget-header"><h3 class="widget-title">Coming Soon</h3></div><p>Role specific widgets will be displayed here.</p></div>`;
  $('#quickActionText').textContent = (currentUser.type==='student'?'Apply Now':currentUser.type==='company'?'Post Job':'Quick Action');
}

// ---------------- Profile -------------------------------
function loadProfile(){
  if(currentUser.type!=='student') return;
  // personal details
  $('#fullName').value=currentUser.name||'';
  $('#email').value=currentUser.email||'';
  $('#phone').value=currentUser.phone||'';
  $('#rollNo').value=currentUser.rollNo||'';
  $('#address').value=currentUser.address||'';
  $('#department').value=currentUser.department||'';
  $('#currentYear').value=currentUser.year||'';
  $('#cgpa').value=currentUser.cgpa||'';
  loadSkillsCategories();
  updateSelectedSkills();
  renderCertifications();
  updateProfileCompletion();
}

function savePersonalInfo(e){e.preventDefault();['fullName','email','phone','rollNo','address'].forEach(id=>currentUser[id.replace(/([A-Z])/g, m=>'_'+m.toLowerCase())]= $('#'+id).value);showToast('Saved','Personal info updated','success');updateProfileCompletion();}
function saveAcademicInfo(e){e.preventDefault(); currentUser.department=$('#department').value; currentUser.year=$('#currentYear').value; currentUser.cgpa=parseFloat($('#cgpa').value)||currentUser.cgpa; showToast('Saved','Academic info updated','success');updateProfileCompletion(); }
function savePreferences(e){e.preventDefault(); currentUser.preferences={ jobTypes:[...$$('#preferences input[type="checkbox"]')].filter(cb=>cb.checked).map(cb=>cb.value), locations:$('#locations').value, salaryRange:$('#salaryRange').value }; showToast('Preferences','Saved successfully','success'); updateProfileCompletion();}
function savePrivacySettings(){showToast('Privacy','Settings saved','success');}

function updateProfileCompletion(){ const p=currentUser.profileCompletion||0; $('#profileProgress').style.width=p+'%'; $('#profilePercentage').textContent=p+'%'; }

// Skills
function loadSkillsCategories(){ const cont=$('#skillsCategories'); if(!cont) return; cont.innerHTML=skillsCategoriesData.map(cat=>`<div class="skill-category"><h4>${cat.category}</h4><div class="skills-grid">${cat.skills.map(skill=>`<div class="skill-item ${currentUser.skills.includes(skill)?'selected':''}" data-skill="${skill}">${skill}</div>`).join('')}</div></div>`).join(''); }
function updateSelectedSkills(){ const list=$('#selectedSkills'); list.innerHTML=currentUser.skills.length? currentUser.skills.map(s=>`<span class="skill-badge">${s}<button class="remove-skill" data-skill="${s}">×</button></span>`).join(''):'<p class="text-muted">No skills selected yet</p>'; }
function renderCertifications(){ const area=$('#certificationsList'); area.innerHTML=currentUser.certifications.map(c=>`<span class="certification-badge">${c}</span>`).join(''); }

function switchTab(id){ $$('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===id)); $$('.tab-content').forEach(c=>c.classList.toggle('active',c.id===id)); }

// Skill gap analysis (simulated)
function runSkillGapAnalysis(){ const missing=['Kubernetes','Docker','AWS','TypeScript','GraphQL'].filter(s=>!currentUser.skills.includes(s)); const roadmap=`<ul>${missing.map(s=>`<li>Add <strong>${s}</strong> to enhance your profile</li>`).join('')}</ul>`; $('#roadmapContent').innerHTML=missing.length?roadmap:'<p>You are all set! Great job.</p>'; $('#skillRoadmap').style.display='block'; showToast('AI Analysis Ready','Personalized roadmap generated','success'); }

// Resume upload & AI parsing
function handleResumeUpload(){ const file=$('#resumeInput').files[0]; if(!file) return; $('#uploadedResume').style.display='block'; $('#resumeFileName').textContent=file.name; $('#resumeFileSize').textContent=(file.size/1024/1024).toFixed(2)+' MB'; // AI parsing simulation
  setTimeout(()=>{
    $('#aiParsingResults').style.display='block'; $('#parsingSummary').innerHTML=`<div class="parsing-item"><h5>Name</h5><p>${currentUser.name}</p></div><div class="parsing-item"><h5>Education</h5><p>${currentUser.department}</p></div><div class="parsing-item"><h5>Skills Found</h5><p>${currentUser.skills.slice(0,3).join(', ')}...</p></div>`; showToast('Resume Parsed','AI successfully extracted your details','success'); },1200);
}

// ---------------- Jobs (simplified) ----------------------
function loadJobs(){ $('#totalJobsCount').textContent=applicationData.jobs.length; $('#jobsGrid').innerHTML='<p class="text-muted">Job listing feature to be enhanced.</p>'; }

function submitApplication(e){ e.preventDefault(); showToast('Applied','Application submitted','success'); hideModal('jobApplicationModal'); }

function submitJobPost(e){ e.preventDefault(); showToast('Posted','Job posted successfully','success'); hideModal('jobPostModal'); }

// ---------------- Company Dashboard ----------------------
function loadCompanyDashboard(){ $('#recruitmentPipeline').innerHTML='<p class="text-muted">Recruitment pipeline coming soon.</p>'; }

// ---------------- Notifications --------------------------
function loadNotifications(){ const list=$('#notificationsList'); list.innerHTML=applicationData.notifications.map(n=>`<div class="notification-item ${n.read?'':'unread'}"><div class="notification-header"><h4 class="notification-title">${n.title}</h4><span class="notification-time">${n.time}</span></div><div class="notification-content">${n.message}</div></div>`).join(''); $('#notificationCount').textContent=applicationData.notifications.filter(n=>!n.read).length; }

// ---------------- Analytics / Job Management placeholders --
function loadAnalytics(){ $('#analytics').querySelectorAll('.metric-value').forEach(el=>{}); }
function loadJobManagement(){ $('#jobsTableBody').innerHTML='<tr><td colspan="9">No data yet</td></tr>'; }
function loadApplications(){ $('#applicationsList').innerHTML='<p class="text-muted">No applications yet.</p>'; }

// ---------------- Chatbot --------------------------------
function sendChat(inputSel,msgContainerSel){ const input=$(inputSel); if(!input.value.trim()) return; const container=$(msgContainerSel); const userTxt=input.value.trim(); container.appendChild(createChatMessage('user',userTxt)); input.value=''; setTimeout(()=>{ const reply=generateBotReply(userTxt); container.appendChild(createChatMessage('bot',reply)); container.scrollTop=container.scrollHeight; },800); }
function createChatMessage(sender,text){ const div=document.createElement('div'); div.className=`chat-message ${sender==='user'?'user-message':'bot-message'}`; div.innerHTML=`<div class="message-avatar">${sender==='user'?'🧑':'🤖'}</div><div class="message-content"><p>${text}</p></div>`; return div; }
function generateBotReply(q){ if(q.toLowerCase().includes('skill')) return 'Focus on emerging tech such as Docker & Kubernetes.'; if(q.toLowerCase().includes('interview')) return 'Practice DSA problems and review your projects.'; return 'Thanks for reaching out! Our AI module will be enhanced soon.'; }

// ---------------- Misc -----------------------------------
function handleQuickAction(){ switch(currentUser.type){ case 'student': navigateToSection('jobs'); break; case 'company': showModal('jobPostModal'); break; default: navigateToSection('analytics'); }
}

function showModal(id){ $('#'+id).classList.remove('hidden'); }
function hideModal(id){ $('#'+id).classList.add('hidden'); }
