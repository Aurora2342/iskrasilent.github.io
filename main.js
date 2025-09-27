const ROOT = document.getElementById('root');
let DATA = { users: [], videos: [] };
let CURRENT_USER = null;
let CURRENT_VIEW = 'home'; // home, myChannel, search

// ----------------- LocalStorage keys -----------------
const USERS_KEY = 'iskraSilentUsers';
const VIDEOS_KEY = 'iskraSilentVideos';
const CURRENT_USER_KEY = 'iskraSilentCurrentUser';

// ----------------- Load data from localStorage -----------------
function loadData() {
  const savedUsers = localStorage.getItem(USERS_KEY);
  if(savedUsers) DATA.users = JSON.parse(savedUsers);

  const savedVideos = localStorage.getItem(VIDEOS_KEY);
  if(savedVideos) DATA.videos = JSON.parse(savedVideos);

  const savedUserEmail = localStorage.getItem(CURRENT_USER_KEY);
  if(savedUserEmail) CURRENT_USER = DATA.users.find(u => u.email === savedUserEmail) || null;
}

// ----------------- Save data -----------------
function saveUsers() { localStorage.setItem(USERS_KEY, JSON.stringify(DATA.users)); }
function saveVideos() { localStorage.setItem(VIDEOS_KEY, JSON.stringify(DATA.videos)); }
function saveCurrentUser() { localStorage.setItem(CURRENT_USER_KEY, CURRENT_USER.email); }

// ----------------- Login/Register -----------------
function renderLogin() {
  ROOT.innerHTML = `
    <div class="container">
      <h1>Iskra Silent — Login/Register</h1>
      <input id="email" placeholder="Email"/><br/>
      <input id="password" type="password" placeholder="Password"/><br/>
      <input id="channel" placeholder="Channel name (for register)"/><br/>
      <input id="avatar" type="file" accept="image/*"/><br/>
      <button id="loginBtn">Login</button>
      <button id="registerBtn">Register</button>
    </div>
  `;
  document.getElementById('loginBtn').onclick = loginUser;
  document.getElementById('registerBtn').onclick = registerUser;
}

function loginUser() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const user = DATA.users.find(u => u.email === email && u.password === password);
  if(!user) return alert('Invalid credentials');
  CURRENT_USER = user;
  saveCurrentUser();
  renderApp();
}

function registerUser() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const channel = document.getElementById('channel').value.trim();
  const avatarInput = document.getElementById('avatar');

  if(!email || !password || !channel) return alert('Fill all fields');
  if(DATA.users.some(u => u.email === email)) return alert('Email exists');

  let avatar = null;
  if(avatarInput.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      avatar = e.target.result;
      DATA.users.push({email,password,channel,avatar});
      saveUsers();
      CURRENT_USER = DATA.users[DATA.users.length-1];
      saveCurrentUser();
      renderApp();
    };
    reader.readAsDataURL(avatarInput.files[0]);
  } else {
    DATA.users.push({email,password,channel,avatar});
    saveUsers();
    CURRENT_USER = DATA.users[DATA.users.length-1];
    saveCurrentUser();
    renderApp();
  }
}

// ----------------- App Rendering -----------------
function renderApp() {
  let html = `
    <div class="container">
      <h1>${CURRENT_USER.avatar?`<img src="${CURRENT_USER.avatar}" class="avatar"/>`:''} ${CURRENT_USER.channel} — Iskra Silent</h1>
      <nav>
        <button onclick="switchView('home')">Home</button>
        <button onclick="switchView('myChannel')">My Channel</button>
        <button onclick="switchView('search')">Search</button>
        <button onclick="logoutUser()">Logout</button>
      </nav>
      <hr/>
  `;

  if(CURRENT_VIEW==='home'){
    html+=`<h2>Welcome!</h2><p>Use the menu to upload videos, view your channel or search videos.</p>`;
  }

  if(CURRENT_VIEW==='myChannel'){
    html+=`
      <h2>Upload Video</h2>
      <input type="file" id="videoUpload" multiple accept="video/*"/><br/>
      <input id="videoDesc" placeholder="Description"/><br/>
      <select id="videoVisibility">
        <option value="private">Private</option>
        <option value="public">Public</option>
      </select><br/>
      <button id="addVideoBtn">Add Video</button>
      <h2>My Videos</h2>
      <input id="filterSearch" placeholder="Filter by name, description or visibility"/>
      <div id="videoList"></div>
    `;
  }

  if(CURRENT_VIEW==='search'){
    html+=`
      <h2>Search Videos</h2>
      <input id="searchInput" placeholder="Search by name, description or channel"/>
      <div id="searchResults"></div>
    `;
  }

  html+='</div>';
  ROOT.innerHTML = html;

  if(CURRENT_VIEW==='myChannel'){
    document.getElementById('addVideoBtn').onclick = addVideo;
    document.getElementById('filterSearch').oninput = renderVideos;
  }

  if(CURRENT_VIEW==='search'){
    document.getElementById('searchInput').oninput = renderSearch;
  }

  renderVideos();
  renderSearch();
}

// ----------------- Navigation -----------------
function switchView(view){ CURRENT_VIEW=view; renderApp(); }
function logoutUser(){ CURRENT_USER=null; localStorage.removeItem(CURRENT_USER_KEY); CURRENT_VIEW='home'; renderLogin(); }

// ----------------- Video Functions -----------------
function addVideo(){
  const files = document.getElementById('videoUpload').files;
  const desc = document.getElementById('videoDesc').value.trim();
  const visibility = document.getElementById('videoVisibility').value;
  if(!files.length) return alert('Select files');

  Array.from(files).forEach(file=>{
    const url = URL.createObjectURL(file);
    DATA.videos.push({
      id: Date.now()+Math.random(),
      name: file.name,
      description: desc,
      url,
      visibility, // public/private
      channel: CURRENT_USER.channel
    });
  });

  saveVideos();
  renderVideos();
}

function renderVideos(){
  const list=document.getElementById('videoList'); 
  if(!list) return;
  const filter=document.getElementById('filterSearch')?.value.toLowerCase()||'';
  list.innerHTML='';
  DATA.videos
    .filter(v=>v.channel===CURRENT_USER.channel)
    .filter(v=>v.name.toLowerCase().includes(filter)||(v.description||'').toLowerCase().includes(filter)||v.visibility.includes(filter))
    .forEach(v=>{
      const container = document.createElement('div');
      container.innerHTML=`
        <strong>${v.name}</strong> (${v.visibility})<br/>
        ${v.description?`<em>${v.description}</em><br/>`:''}
        <video src="${v.url}" controls></video><br/>
        <button class="deleteBtn">Delete</button>
        <hr/>
      `;
      container.querySelector('.deleteBtn').onclick = ()=>{
        DATA.videos = DATA.videos.filter(x=>x.id!==v.id);
        saveVideos();
        renderVideos();
      };
      list.appendChild(container);
    });
}

function renderSearch(){
  const container=document.getElementById('searchResults'); 
  if(!container) return;
  const query=document.getElementById('searchInput')?.value.toLowerCase()||'';
  container.innerHTML='';
  DATA.videos
    .filter(v=>v.name.toLowerCase().includes(query)||(v.description||'').toLowerCase().includes(query)||v.channel.toLowerCase().includes(query))
    .forEach(v=>{
      const div=document.createElement('div');
      div.innerHTML=`<strong>${v.name}</strong> (${v.channel})<br/>${v.description?`<em>${v.description}</em><br/>`:''}<video src="${v.url}" controls></video><hr/>`;
      container.appendChild(div);
    });
}

// ----------------- Start -----------------
loadData();
if(CURRENT_USER) renderApp();
else renderLogin();

