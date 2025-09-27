// Simple statički site sa JSON storage
const ROOT = document.getElementById('root');
let DATA = { users: [], videos: [] };
let CURRENT_USER = null;

// Helper: save JSON (download)
function saveJSON() {
  const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'iskraSilentData.json';
  a.click();
}

// Helper: load JSON
function loadJSON(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      DATA = JSON.parse(e.target.result);
      alert('JSON loaded!');
      renderApp();
    } catch(err) {
      alert('Invalid JSON file');
    }
  };
  reader.readAsText(file);
}

// Render login / register
function renderLogin() {
  ROOT.innerHTML = `
    <div class="container">
      <h1>Iskra Silent — Login/Register</h1>
      <input id="email" placeholder="Email" /><br/>
      <input id="password" placeholder="Password" type="password"/><br/>
      <input id="channel" placeholder="Channel name (for register)"/><br/>
      <input id="avatar" type="file" accept="image/*"/><br/>
      <button id="loginBtn">Login</button>
      <button id="registerBtn">Register</button>
      <hr/>
      <input type="file" id="importJSON" accept=".json"/>
      <button id="exportJSON">Download JSON</button>
    </div>
  `;

  document.getElementById('loginBtn').onclick = loginUser;
  document.getElementById('registerBtn').onclick = registerUser;
  document.getElementById('exportJSON').onclick = saveJSON;
  document.getElementById('importJSON').onchange = e => loadJSON(e.target.files[0]);
}

// Login
function loginUser() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const user = DATA.users.find(u => u.email === email && u.password === password);
  if(!user) return alert('Invalid credentials');
  CURRENT_USER = user;
  renderApp();
}

// Register
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
      DATA.users.push({ email, password, channel, avatar });
      CURRENT_USER = DATA.users[DATA.users.length-1];
      renderApp();
    };
    reader.readAsDataURL(avatarInput.files[0]);
  } else {
    DATA.users.push({ email, password, channel, avatar });
    CURRENT_USER = DATA.users[DATA.users.length-1];
    renderApp();
  }
}

// Render main app
function renderApp() {
  ROOT.innerHTML = `
    <div class="container">
      <h1>
        ${CURRENT_USER.avatar ? `<img src="${CURRENT_USER.avatar}" class="avatar"/>` : ''}
        ${CURRENT_USER.channel} — Iskra Silent
      </h1>
      <button id="logoutBtn">Logout</button>
      <hr/>
      <h2>Upload Video</h2>
      <input type="file" id="videoUpload" multiple accept="video/*"/>
      <input id="videoDesc" placeholder="Description"/><br/>
      <button id="addVideoBtn">Add Video</button>
      <h2>Videos</h2>
      <div id="videoList"></div>
      <hr/>
      <button id="exportJSONBtn">Download JSON</button>
      <input type="file" id="importJSONFile" accept=".json"/>
    </div>
  `;

  document.getElementById('logoutBtn').onclick = () => { CURRENT_USER = null; renderLogin(); };
  document.getElementById('addVideoBtn').onclick = addVideo;
  document.getElementById('exportJSONBtn').onclick = saveJSON;
  document.getElementById('importJSONFile').onchange = e => loadJSON(e.target.files[0]);

  renderVideos();
}

// Add video
function addVideo() {
  const files = document.getElementById('videoUpload').files;
  const desc = document.getElementById('videoDesc').value.trim();
  if(!files.length) return alert('Select files');

  Array.from(files).forEach(file => {
    const url = URL.createObjectURL(file);
    DATA.videos.push({
      id: Date.now() + Math.random(),
      name: file.name,
      description: desc,
      url,
      private: true,
      channel: CURRENT_USER.channel
    });
  });

  renderVideos();
}

// Render videos
function renderVideos() {
  const videoList = document.getElementById('videoList');
  videoList.innerHTML = '';
  DATA.videos.filter(v => v.channel === CURRENT_USER.channel).forEach(v => {
    const container = document.createElement('div');
    container.innerHTML = `
      <strong>${v.name}</strong> (${v.private ? 'Private' : 'Public'})<br/>
      ${v.description ? `<em>${v.description}</em><br/>` : ''}
      <video src="${v.url}" controls></video><br/>
      <button class="deleteBtn">Delete</button>
      <hr/>
    `;
    container.querySelector('.deleteBtn').onclick = () => {
      DATA.videos = DATA.videos.filter(x => x.id !== v.id);
      renderVideos();
    };
    videoList.appendChild(container);
  });
}

// Start
renderLogin();
