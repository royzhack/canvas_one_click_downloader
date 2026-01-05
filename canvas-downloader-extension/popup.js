
// State
let STATE = {
  token: null,
  courseId: null,
  courseName: null,
  courseCode: null,
  tree: {}, // maps categoryId -> { loaded: bool, items: [] }
  fileMap: new Map() // maps fileId -> { size, display_name, ... }
};

const UI = {
  auth: document.getElementById('auth'),
  main: document.getElementById('main'),
  tree: document.getElementById('tree'),
  courseName: document.getElementById('courseName'),
  tokenInput: document.getElementById('token'),
  downloadBtn: document.getElementById('downloadBtn'),
  stats: document.getElementById('stats'),
  selectAll: document.getElementById('selectAll')
};

function formatSize(bytes) {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return "0 B";
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// --- API Helpers ---
const API = {
  get: async (path) => {
    const res = await fetch(`https://canvas.nus.edu.sg/api/v1${path}`, {
      headers: { Authorization: `Bearer ${STATE.token}` }
    });
    if (res.status === 401) {
      // Token expired or invalid
      alert("Your Canvas Token is invalid or expired. Please reset it.");
      await chrome.storage.local.remove("canvasToken");
      location.reload();
      throw new Error("Invalid Token");
    }
    if (!res.ok) throw new Error("API Error");
    return res.json();
  },

  // Paged fetch
  getAll: async (endpoint) => {
    const sep = endpoint.includes("?") ? "&" : "?";
    let url = `https://canvas.nus.edu.sg/api/v1${endpoint}${sep}per_page=100`;
    let items = [];
    while (url) {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${STATE.token}` } });
      if (!res.ok) break;
      const data = await res.json();
      items.push(...data);
      const link = res.headers.get("link");
      url = null;
      if (link) {
        const next = link.split(",").find(l => l.includes('rel="next"'));
        if (next) url = next.match(/<([^>]+)>/)[1];
      }
    }
    return items;
  }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
  const { canvasToken } = await chrome.storage.local.get("canvasToken");

  if (!canvasToken) {
    showAuth();
  } else {
    STATE.token = canvasToken;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const match = tab.url ? tab.url.match(/\/courses\/(\d+)/) : null;

    if (match) {
      STATE.courseId = match[1];
      showMain();
    } else {
      document.body.innerHTML = "<p style='padding:10px'>Open a Canvas Course page first.</p>";
    }
  }
});

document.getElementById('saveToken').onclick = async () => {
  const t = UI.tokenInput.value.trim();
  if (t) {
    const btn = document.getElementById('saveToken');
    const originalText = btn.textContent;
    btn.textContent = "Verifying...";
    btn.disabled = true;

    try {
      // Validate Token
      const res = await fetch('https://canvas.nus.edu.sg/api/v1/users/self', {
        headers: { Authorization: `Bearer ${t}` }
      });

      if (res.ok) {
        await chrome.storage.local.set({ canvasToken: t });
        location.reload();
      } else {
        const text = await res.text();
        alert(`Validation Failed!\nStatus: ${res.status} ${res.statusText}\nResponse: ${text.substring(0, 100)}\n\nPlease ensure you copied the long 'Token' string (starts with integer~...), not the name.`);
        btn.textContent = originalText;
        btn.disabled = false;
      }
    } catch (e) {
      alert("Network/Verification Error:\n" + e.message + "\n\nCheck your internet connection.");
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }
};

function showAuth() {
  UI.auth.style.display = 'block';
  UI.main.style.display = 'none';
}

async function showMain() {
  UI.auth.style.display = 'none';
  UI.main.style.display = 'block';

  // Get Course Name
  try {
    const course = await API.get(`/courses/${STATE.courseId}`);
    STATE.courseName = course.name;
    STATE.courseCode = course.course_code;
    UI.courseName.textContent = `${course.course_code} - ${course.name}`;
  } catch (e) {
    UI.courseName.textContent = "Canvas Course " + STATE.courseId;
  }

  // Pre-fetch files metadata for size mapping (lightweight usually)
  try {
    const files = await API.getAll(`/courses/${STATE.courseId}/files`);
    files.forEach(f => STATE.fileMap.set(f.id, f));
  } catch (e) {
    console.warn("Failed to pre-fetch files for size mapping", e);
  }

  // Enable Select All
  UI.selectAll.disabled = false;
  UI.selectAll.onclick = toggleSelectAll;

  // Load Tabs (Categories)
  loadCategories();
}

function toggleSelectAll() {
  const checked = UI.selectAll.checked;
  // Toggle all categories
  document.querySelectorAll('.cat-cb').forEach(cb => {
    cb.checked = checked;
    // Trigger toggle logic for children if category expanded/loaded
    // We need to act as if user clicked it
    const catId = cb.closest('.node').querySelector('.children').id.replace('cat-', '');
    // We don't await here because we want parallel fetching for speed
    toggleCategory(catId, checked);
  });
  updateStats();
}

async function loadCategories() {
  const categories = [
    { id: 'modules', label: 'Modules' },
    { id: 'files', label: 'Files' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'pages', label: 'Pages' },
    { id: 'discussions', label: 'Discussions' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'syllabus', label: 'Syllabus' },
    { id: 'grades', label: 'Grades' },
    { id: 'home', label: 'Home Page' }
  ];

  // We could filter this by API tabs, but showing all is safer for "download what you want"
  // Just render them
  categories.forEach(cat => renderCategory(cat));
}

function renderCategory(cat) {
  const li = document.createElement('li');
  li.className = 'node';

  // Header Row
  const row = document.createElement('div');
  row.className = 'cat-row';

  const arrow = document.createElement('div');
  arrow.className = 'arrow';

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'cat-cb';
  cb.checked = ['modules', 'files'].includes(cat.id); // Default checked
  cb.onclick = (e) => {
    e.stopPropagation();
    toggleCategory(cat.id, cb.checked);
  };

  const label = document.createElement('span');
  label.className = 'cat-label';
  label.textContent = cat.label;

  row.append(arrow, cb, label);

  // Children Container
  const kids = document.createElement('div');
  kids.className = 'children';
  kids.id = `cat-${cat.id}`;

  // Expand/Collapse Click
  row.onclick = async () => {
    const output = row.classList.toggle('expanded');
    if (output && !STATE.tree[cat.id]) {
      // First expand: load items
      console.log("Loading", cat.id);
      kids.innerHTML = '<div class="loading-text">Loading items...</div>';
      await fetchCategoryItems(cat.id, kids);
    }
  };

  li.append(row, kids);
  UI.tree.appendChild(li);
}

// --- Fetch Items ---
async function fetchCategoryItems(catId, container) {
  try {
    let items = [];

    // Different logic per category
    switch (catId) {
      case 'files':
        items = await API.getAll(`/courses/${STATE.courseId}/files`);
        // Standardize
        items = items.map(f => ({
          id: f.id,
          name: f.display_name,
          size: f.size,
          type: 'file',
          orig: f
        }));
        break;

      case 'modules':
        const mods = await API.getAll(`/courses/${STATE.courseId}/modules?include[]=items`);
        // Modules are special: nested structure.
        // We flatten simply for "selection" generally, or better:
        // Render Module -> Items
        renderModules(mods, container);
        STATE.tree[catId] = { loaded: true, complex: true };
        return; // Special render

      case 'assignments':
        const asses = await API.getAll(`/courses/${STATE.courseId}/assignments`);
        items = asses.map(a => ({ id: a.id, name: a.name, type: 'assignment' }));
        break;

      case 'pages':
        const pgs = await API.getAll(`/courses/${STATE.courseId}/pages`);
        items = pgs.map(p => ({ id: p.url, name: p.title, type: 'page' }));
        break;

      case 'quizzes':
        const qzs = await API.getAll(`/courses/${STATE.courseId}/quizzes`);
        items = qzs.map(q => ({ id: q.id, name: q.title, type: 'quiz' }));
        break;

      case 'discussions':
        const discs = await API.getAll(`/courses/${STATE.courseId}/discussion_topics`);
        items = discs.map(d => ({ id: d.id, name: d.title, type: 'discussion' }));
        break;

      case 'announcements':
        const anns = await API.getAll(`/courses/${STATE.courseId}/discussion_topics?only_announcements=true`);
        items = anns.map(a => ({ id: a.id, name: a.title, type: 'announcement' }));
        break;

      // Single items
      case 'grades': items = [{ id: 'grades_summary', name: 'Grades Summary', type: 'special' }]; break;
      case 'home': items = [{ id: 'home_page', name: 'Home Page', type: 'special' }]; break;
      case 'syllabus': items = [{ id: 'syllabus_body', name: 'Syllabus HTML', type: 'special' }]; break;
    }

    STATE.tree[catId] = { loaded: true, items: items };
    renderItems(items, container, catId);

  } catch (e) {
    container.innerHTML = `<div style="color:red">Error: ${e.message}</div>`;
  }
}

function renderItems(items, container, catId) {
  container.innerHTML = "";
  if (items.length === 0) {
    container.innerHTML = '<div class="loading-text">No items found.</div>';
    return;
  }

  // Check if parent category is checked?
  // Doing "naive" inheritance for now
  const parentCB = document.querySelector(`.children#cat-${catId}`).previousElementSibling.querySelector('.cat-cb');
  const inherit = parentCB.checked;

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item-row';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = `item-cb item-${catId}`;
    cb.value = item.id;
    cb.checked = inherit;
    cb.dataset.meta = JSON.stringify(item); // Store metadata for download
    cb.onclick = updateStats;

    const label = document.createElement('span');
    label.className = 'item-label';
    label.textContent = item.name;

    div.append(cb, label);

    if (item.size) {
      const meta = document.createElement('span');
      meta.className = 'item-meta';
      meta.textContent = formatSize(item.size);
      div.append(meta);
    }

    container.append(div);
  });
  updateStats();
}

// Special Module Renderer
function renderModules(modules, container) {
  container.innerHTML = "";
  const parentCB = document.querySelector(`.children#cat-modules`).previousElementSibling.querySelector('.cat-cb');

  if (modules.length === 0) {
    container.innerHTML = '<div class="loading-text">No modules found.</div>';
    return;
  }

  modules.forEach(mod => {
    // Module Header
    const mRow = document.createElement('div');
    mRow.style.padding = "5px 0";
    mRow.style.fontWeight = "bold";
    mRow.style.background = "#fafafa";
    mRow.textContent = mod.name;
    container.appendChild(mRow);

    if (!mod.items || mod.items.length === 0) {
      const empty = document.createElement('div');
      empty.className = "loading-text";
      empty.textContent = "Empty module";
      container.appendChild(empty);
      return;
    }

    // Module Items
    mod.items.forEach(item => {
      if (item.type !== 'File' && item.type !== 'Page' && item.type !== 'Assignment') return; // Only downloadable stuff

      const div = document.createElement('div');
      div.className = 'item-row';
      div.style.paddingLeft = "10px";

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.className = `item-cb item-modules`;
      cb.value = item.id; // Item ID
      cb.checked = parentCB.checked;

      // For modules, we need type info to know how to download
      cb.dataset.meta = JSON.stringify({
        id: item.content_id || item.id, // Content ID for files
        name: item.title,
        type: item.type, // 'File', 'Page'
        url: item.url, // API url
        moduleName: mod.name // To organize folders
      });

      // Try to find size from pre-fetched fileMap
      if (item.type === 'File' && item.content_id) {
        // loose equality check for map? Map is strict. Try both.
        const fInfo = STATE.fileMap.get(item.content_id) || STATE.fileMap.get(Number(item.content_id)) || STATE.fileMap.get(String(item.content_id));
        if (fInfo) {
          const meta = JSON.parse(cb.dataset.meta);
          meta.size = fInfo.size;
          cb.dataset.meta = JSON.stringify(meta);
        }
      }

      cb.onclick = updateStats;

      const label = document.createElement('span');
      label.className = 'item-label';
      label.textContent = item.title;

      div.append(cb, label);

      // Size display for modules
      if (item.type === 'File' && item.content_id) {
        const fInfo = STATE.fileMap.get(item.content_id) || STATE.fileMap.get(Number(item.content_id)) || STATE.fileMap.get(String(item.content_id));
        if (fInfo) {
          const metaSpan = document.createElement('span');
          metaSpan.className = 'item-meta';
          metaSpan.textContent = formatSize(fInfo.size);
          div.append(metaSpan);
        }
      }
      container.append(div);
    });
  });
  updateStats();
}

async function toggleCategory(catId, checked) {
  const container = document.getElementById(`cat-${catId}`);

  // If we are checking the category, but it's not loaded, we MUST load it to get the items/sizes
  if (checked && !STATE.tree[catId]) {
    console.log("Deep fetching for stats:", catId);
    container.innerHTML = '<div class="loading-text">Loading items...</div>';
    // Expand it so user sees it loading? Or keep it collapsed?
    // User requests "Select All" -> better to just load invisibly if collapsed?
    // But we need to render the checkboxes to count them.
    // fetchCategoryItems renders them.
    await fetchCategoryItems(catId, container);
  }

  // If loaded (or just loaded above), check/uncheck all visible children
  // (Items might still be loading async if we didn't await, but we should await)
  // fetchCategoryItems is async and returns when done.

  // Note: if fetch failed, tree[catId] might be false?
  // Our fetchCategoryItems sets tree[catId] = true.

  if (STATE.tree[catId]) {
    const boxes = container.querySelectorAll('input[type=checkbox]');
    boxes.forEach(b => b.checked = checked);
  }

  updateStats();
}

function updateStats() {
  const all = document.querySelectorAll('.item-cb:checked');
  let size = 0;
  let count = 0;

  all.forEach(cb => {
    count++;
    try {
      const meta = JSON.parse(cb.dataset.meta || '{}');
      if (meta.size) size += meta.size;
    } catch (e) { }
  });

  UI.stats.textContent = `${count} items selected (${formatSize(size)})`;
  UI.downloadBtn.textContent = `Download (${count})`;
}

// --- Download Action ---
UI.downloadBtn.onclick = () => {
  // Gather all selected
  // Note: If a category is NOT expanded, we might just "trust" the category check?
  // OR: We force expand? 
  // CURRENT LOGIC: Only downloads what is *rendered* and *checked*.
  // Users must expand to see items? 
  // BETTER UX: If category is checked but empty/unloaded, we treat it as "ALL".
  // But that complicates the granular logic. 
  // Let's assume for this version: "Select Categories" implies "All in category".

  const payload = {};
  const categories = ['modules', 'files', 'assignments', 'pages', 'quizzes', 'discussions', 'announcements', 'grades', 'home', 'syllabus'];

  categories.forEach(cat => {
    const catCB = document.querySelector(`.children#cat-${cat}`).previousElementSibling.querySelector('.cat-cb');
    const container = document.getElementById(`cat-${cat}`);
    const loaded = STATE.tree[cat];

    if (catCB.checked && !loaded) {
      // Category checked but NOT expanded/loaded -> Download ALL
      payload[cat] = { mode: 'ALL' };
    } else if (loaded) {
      // Loaded, check specific checkboxes
      const checked = Array.from(container.querySelectorAll('.item-cb:checked'));
      if (checked.length > 0) {
        // Map items
        const items = checked.map(c => JSON.parse(c.dataset.meta));
        payload[cat] = { mode: 'SELECT', items: items };
      }
    }
  });

  if (Object.keys(payload).length === 0) return alert("Select at least one item.");

  chrome.runtime.sendMessage({
    action: "DOWNLOAD_GRANULAR",
    courseId: STATE.courseId,
    courseCode: STATE.courseCode,
    payload: payload
  });

  window.close();
}
