const ROOT = document.getElementById('root');
let DATA = { users: [], videos: [] };
let CURRENT_USER = null;
let CURRENT_VIEW = 'home'; // home, myChannel, search
const API_BASE = 'http://YOUR_VPS_IP:3000/api'; // zameni sa tvojim VPS IP

// ---------------- Load/Save via backend ----------------
async function loadData() {
  try {
    const res = await fetch(`${API_BASE}/data`);
    DATA = await res.json();
  } catch(err) {
    console.error('Cannot load data', err);
    DATA = { users: [], videos: [] };
  }
}

async function saveData() {
  try {
    await fetch(`${API_BASE}/data`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(DATA)
    });
  } catch(err) { console.error('Cannot save data', err); }
}

// ---------------- Login/Register ----------------
function renderLogin() {
  ROOT.innerHTML = `
    <div class="container">
      <h1>Iskra Silent — Login/Register</h1>
      <input id="email" placeholder="Email"/><br/>
      <input id="password" type="password" placeholder="Password"/><br/>
      <input id="channel" placeholder="Channel name (for register)"/><br/>
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
  CURRENT_VIEW = 'home';
  renderApp();
}

function registerUser() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const channel = document.getElementById('channel').value.trim();
  if(!email || !password || !channel) return alert('Fill all fields');
  if(DATA.users.some(u => u.email === email)) return alert('Email exists');
  const newUser = { email, password, channel, avatar:null };
  DATA.users.push(newUser);
  CURRENT_USER = newUser;
  CURRENT_VIEW = 'home';
  renderApp();
  saveData();
}

// ---------------- App Rendering ----------------
function renderApp() {
  let html = `
    <div class="container">
      <h1>${CURRENT_USER?.channel || ''} — Iskra Silent</h1>
      <nav>
        <button onclick="switchView('home')">Home</button>
        <button onclick="switchView('myChannel')">My Channel</button>
        <button onclick="switchView('search')">Search</button>
        <button onclick="logoutUser()">Logout</button>
      </nav>
      <hr/>
  `;

  if(CURRENT_VIEW==='home') html+=`<div id="videoList"></div>`;
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
      <div id="myVideoList"></div>
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
  }
  if(CURRENT_VIEW==='home') renderVideos();
  if(CURRENT_VIEW==='myChannel') renderMyVideos();
  if(CURRENT_VIEW==='search') document.getElementById('searchInput').oninput = renderSearch;
}

// ---------------- Navigation ----------------
function switchView(view){ CURRENT_VIEW=view; renderApp(); }
function logoutUser(){ CURRENT_USER=null; CURRENT_VIEW='home'; renderLogin(); }

// ---------------- Video Functions ----------------
async function addVideo(){
  const files = document.getElementById('videoUpload').files;
  const desc = document.getElementById('videoDesc').value.trim();
  const visibility = document.getElementById('videoVisibility').value;
  if(!files.length) return alert('Select files');

  const uploadPromises = Array.from(files).map(file=>{
    const formData = new FormData();
    formData.append('video', file);
    formData.append('description', desc);
    formData.append('visibility', visibility);
    formData.append('channel', CURRENT_USER.channel);
    return fetch(`${API_BASE}/upload`, { method:'POST', body: formData })
      .then(res=>res.json())
      .then(data=>{
        if(data.success) DATA.videos.push(data.video);
      });
  });

  await Promise.all(uploadPromises);
  renderMyVideos();
  renderVideos();
  saveData();
}

function renderVideos(){
  const container = document.getElementById('videoList');
  if(!container) return;
  container.innerHTML = '';
  DATA.videos.filter(v=>v.visibility==='public').forEach(v=>{
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>${v.name} (${v.channel})</h3>
      ${v.description?`<p>${v.description}</p>`:''}
      <video src="${v.url}" controls width="400"></video><hr/>
    `;
    container.appendChild(div);
  });
}

function renderMyVideos(){
  const container = document.getElementById('myVideoList');
  if(!container) return;
  container.innerHTML = '';
  DATA.videos.filter(v=>v.channel===CURRENT_USER.channel).forEach(v=>{
    const div = document.createElement('div');
    div.innerHTML = `
      <h4>${v.name}</h4>
      ${v.description?`<p>${v.description}</p>`:''}
      <video src="${v.url}" controls width="400"></video>
      <button onclick="deleteVideo(${v.id})">Delete</button>
      <hr/>
    `;
    container.appendChild(div);
  });
}

function deleteVideo(id){
  DATA.videos = DATA.videos.filter(v=>v.id!==id);
  renderMyVideos();
  renderVideos();
  saveData();
}

function renderSearch(){
  const container = document.getElementById('searchResults');
  if(!container) return;
  const query = document.getElementById('searchInput').value.toLowerCase();
  container.innerHTML = '';
  DATA.videos.filter(v=>v.name.toLowerCase().includes(query) || (v.description||'').toLowerCase().includes(query) || v.channel.toLowerCase().includes(query))
    .forEach(v=>{
      const div = document.createElement('div');
      div.innerHTML = `
        <h4>${v.name} (${v.channel})</h4>
        ${v.description?`<p>${v.description}</p>`:''}
        <video src="${v.url}" controls width="400"></video><hr/>
      `;
      container.appendChild(div);
    });
}

// ---------------- Start ----------------
loadData().then(()=>{
  if(CURRENT_USER) renderApp();
  else renderLogin();
});
