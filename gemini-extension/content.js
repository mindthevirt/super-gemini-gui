// GHOST SCRAPER V8 - STABLE & ROBUST

let hasInitialized = false;
let state = {
  folders: [],
  searchTerm: '',
  nativeChats: [],
  activeChatId: null,
  starred: [],
  hiddenChats: [],
  expandedFolders: [] // Track which folders are open
};

// Debounce helper to prevent infinite loops and performance crashes
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 1. SYNC: Scrape without crashing
async function sync() {
  try {
    const data = await chrome.storage.local.get(['folders', 'starred', 'hiddenChats', 'cachedChats', 'expandedFolders']);
    state.folders = data.folders || [];
    state.starred = data.starred || [];
    state.hiddenChats = data.hiddenChats || [];
    state.expandedFolders = data.expandedFolders || [];
    
    // Use cached chats initially so the sidebar isn't empty while Google loads
    if (state.nativeChats.length === 0 && data.cachedChats) {
      state.nativeChats = data.cachedChats;
      render(); 
    }
  } catch (error) {
    console.warn("Super Gemini: Storage context lost. Please refresh the page.", error);
    return; // Stop execution if context is lost
  }

  const allLinks = Array.from(document.querySelectorAll('a[data-test-id="history-item"], a[href*="/app/"], a[href*="/g/"], a[href*="/gem/"]'));
  const chatsMap = new Map();
  allLinks.forEach(el => {
    const text = el.innerText.trim();
    // Exclude "New chat", buttons, and empty icons
    if (text.length > 1 && !text.toLowerCase().includes('new chat') && !el.querySelector('svg:only-child')) {
      const lines = text.split('\n').map(l => l.trim());
      const title = lines[0];
      const id = el.href.split('/').pop();

      const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
      const rawHtml = el.innerHTML.toLowerCase();

      // Heuristic: Check aria-label, innerHTML, title, URL, or parent text for Deep Research
      const isDeepResearch = title.toLowerCase().includes('research') || 
                             ariaLabel.includes('deep research') ||
                             rawHtml.includes('deep research') ||
                             el.href.toLowerCase().includes('research') ||
                             (el.parentElement && el.parentElement.innerText.toLowerCase().includes('deep research'));

      // Heuristic: Check for Gems via URL, aria-label, or title
      const isGem = el.href.includes('/g/') || 
                    el.href.includes('/gem/') || 
                    title.toLowerCase().includes('gem:') || 
                    ariaLabel.includes('gem ') ||
                    rawHtml.includes('gem');

      if (!chatsMap.has(id)) {
        chatsMap.set(id, {
          title,
          id,
          url: el.href,
          isDeepResearch,
          isGem,
          el: el
        });
      }
    }
  });
  
  const newChats = Array.from(chatsMap.values());
  if (newChats.length > 0) {
     state.nativeChats = newChats;
     // Update cache asynchronously
     chrome.storage.local.set({ cachedChats: state.nativeChats }).catch(() => {});
  }
  
  // Determine active chat
  const match = window.location.href.match(/app\/([a-zA-Z0-9]+)/);
  if (match) {
    state.activeChatId = match[1];
  } else {
    state.activeChatId = null;
  }
}

// 2. RENDER: Clean UI Update
function render() {
  const sb = document.getElementById('super-gemini-sidebar');
  if (!sb) return;

  const filtered = state.nativeChats.filter(c => 
    c.title.toLowerCase().includes(state.searchTerm.toLowerCase())
  );

  // Group by folders
  const folderChatIds = new Set();
  state.folders.forEach(f => f.chats.forEach(c => folderChatIds.add(c.id)));
  
  const starredIds = new Set(state.starred);
  const hiddenIds = new Set(state.hiddenChats);
  
  const term = state.searchTerm.toLowerCase();
  const recentChats = filtered.filter(c => !folderChatIds.has(c.id) && !starredIds.has(c.id) && !hiddenIds.has(c.id));
  const starredChats = state.nativeChats.filter(c => 
    starredIds.has(c.id) && 
    !hiddenIds.has(c.id) && 
    c.title.toLowerCase().includes(term)
  );

  const getIcon = (c) => {
    if (c.isDeepResearch) return `<svg class="sb-icon research" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
    if (c.isGem) return `<svg class="sb-icon gem" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 3h12l4 6-10 13L2 9Z"/></svg>`;
    return `<svg class="sb-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
  };

  sb.innerHTML = `
    <div class="sb-header">
      <div class="sb-brand sb-brand-container">
        SUPER GEMINI GUI
        <span id="super-settings" class="sb-settings-icon" title="Backup/Restore Workspace">⚙️</span>
      </div>
      <button class="sb-new-chat" id="super-new">＋ New Chat</button>
      <input class="sb-search" id="super-search" placeholder="Search chats..." value="${state.searchTerm}" autocomplete="off" />
    </div>
    
    <div class="sb-nav">
      ${starredChats.length > 0 ? `
      <section id="super-section-pinned">
        <div class="sb-section">PINNED</div>
        <div id="starred-list">
          ${starredChats.map(c => `
            <div class="sb-item ${state.activeChatId === c.id ? 'active-chat' : ''}" data-chat-id="${c.id}" data-title="${c.title.replace(/"/g, '&quot;')}">
               <span class="toggle-star active star-icon" data-chat-id="${c.id}">★</span>
               <span class="sb-item-content">
                 ${getIcon(c)} ${c.title}
                 ${c.isDeepResearch ? '<span class="research-badge">DEEP RESEARCH</span>' : ''}
                 ${c.isGem ? '<span class="gem-badge">GEM</span>' : ''}
               </span>
               <span class="hide-chat-btn" data-chat-id="${c.id}">✕</span>
            </div>
          `).join('')}
        </div>
      </section>
      ` : ''}

      <section id="super-section-workspaces">
        <div class="sb-section">
          WORKSPACES
          <span id="super-add-ws" class="sb-add-ws-btn">＋</span>
        </div>
        <div id="ws-list">
          ${state.folders.map(f => {
            const visibleChats = f.chats.filter(c => !hiddenIds.has(c.id) && c.title.toLowerCase().includes(term));
            const isExpanded = state.expandedFolders.includes(f.id);
            const shouldHideFolder = term && visibleChats.length === 0;

            return `
            <div class="workspace-folder ${isExpanded ? 'is-expanded' : ''}" data-folder-id="${f.id}" ${shouldHideFolder ? 'style="display:none;"' : ''}>
              <div class="sb-item folder-header">
                <span><span class="folder-arrow">▶</span> 📁 ${f.name}</span>
                <span class="delete-folder hide-chat-btn" data-folder-id="${f.id}">✕</span>
              </div>
              <div class="folder-contents">
                ${visibleChats.map(chat => `
                  <div class="sb-item ${state.activeChatId === chat.id ? 'active-chat' : ''}" data-chat-id="${chat.id}" data-title="${chat.title.replace(/"/g, '&quot;')}">
                    <span class="sb-item-content">
                      ${getIcon(chat)} ${chat.title} 
                      ${chat.isDeepResearch ? '<span class="research-badge">DEEP RESEARCH</span>' : ''}
                      ${chat.isGem ? '<span class="gem-badge">GEM</span>' : ''}
                    </span>
                    <span class="remove-from-folder" data-folder-id="${f.id}" data-chat-id="${chat.id}">✕</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `}).join('')}
        </div>
      </section>

      <section id="super-section-recent">
        <div class="sb-section">RECENT ACTIVITY</div>
        <div id="chat-list">
          ${recentChats.map(c => `
            <div class="sb-item ${state.activeChatId === c.id ? 'active-chat' : ''}" draggable="true" data-chat-id="${c.id}" data-title="${c.title.replace(/"/g, '&quot;')}">
              <span class="toggle-star star-icon inactive" data-chat-id="${c.id}">☆</span>
              <span class="sb-item-content">
                ${getIcon(c)} ${c.title}
                ${c.isDeepResearch ? '<span class="research-badge">DEEP RESEARCH</span>' : ''}
                ${c.isGem ? '<span class="gem-badge">GEM</span>' : ''}
              </span>
              <span class="hide-chat-btn" data-chat-id="${c.id}">✕</span>
            </div>
          `).join('')}
        </div>
      </section>
    </div>
  `;

  attachListeners();
}

// 3. LISTENERS: Robust Event Handling
function attachListeners() {
  // Search
  const searchInput = document.getElementById('super-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchTerm = e.target.value;
      const term = state.searchTerm.toLowerCase();
      
      // 1. Filter all chat items across all lists (Pinned, Workspaces, Recent)
      document.querySelectorAll('.sb-item[data-chat-id]').forEach(item => {
        const title = (item.getAttribute('data-title') || '').toLowerCase();
        item.hidden = !title.includes(term);
      });

      // 2. Filter workspace folders: hide folder container if no chats match search
      document.querySelectorAll('.workspace-folder').forEach(folder => {
        const hasVisibleChats = folder.querySelector('.folder-contents .sb-item:not([hidden])');
        folder.hidden = term && !hasVisibleChats;
      });

      // 3. Filter sections (Pinned, Workspaces, Recent): hide section if no chats match
      ['pinned', 'workspaces', 'recent'].forEach(sectionId => {
        const section = document.getElementById(`super-section-${sectionId}`);
        if (!section) return;
        const hasVisibleChats = section.querySelector('.sb-item[data-chat-id]:not([hidden])');
        section.hidden = term && !hasVisibleChats;
      });
    });
  }

  // New Chat
  document.getElementById('super-new')?.addEventListener('click', () => {
    window.location.href = 'https://gemini.google.com/app';
  });

  // Add Workspace
  document.getElementById('super-add-ws')?.addEventListener('click', showModal);

  // Settings / Backup
  document.getElementById('super-settings')?.addEventListener('click', showSettingsModal);

  // Delete folder
  document.querySelectorAll('.delete-folder').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = el.getAttribute('data-folder-id');
      const folder = state.folders.find(f => f.id === id);
      
      if (confirm(`Are you sure you want to delete the Workspace "${folder.name}"? The chats will be returned to your Recent Activity.`)) {
        state.folders = state.folders.filter(f => f.id !== id);
        state.expandedFolders = state.expandedFolders.filter(fid => fid !== id);
        await chrome.storage.local.set({ folders: state.folders, expandedFolders: state.expandedFolders });
        render();
      }
    });
  });

  // Toggle Folder Expansion
  document.querySelectorAll('.folder-header').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.stopPropagation();
      const folderEl = el.closest('.workspace-folder');
      const folderId = folderEl.getAttribute('data-folder-id');
      
      const idx = state.expandedFolders.indexOf(folderId);
      if (idx > -1) {
        state.expandedFolders.splice(idx, 1);
      } else {
        state.expandedFolders.push(folderId);
      }
      
      await chrome.storage.local.set({ expandedFolders: state.expandedFolders });
      render();
    });
  });

  // Remove from folder
  document.querySelectorAll('.remove-from-folder').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.stopPropagation();
      const folderId = el.getAttribute('data-folder-id');
      const chatId = el.getAttribute('data-chat-id');
      const folder = state.folders.find(f => f.id === folderId);
      if (folder) {
        folder.chats = folder.chats.filter(c => c.id !== chatId);
        await chrome.storage.local.set({ folders: state.folders });
        render();
      }
    });
  });

  // Toggle Star
  document.querySelectorAll('.toggle-star').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.stopPropagation();
      const chatId = el.getAttribute('data-chat-id');
      
      const idx = state.starred.indexOf(chatId);
      let becomingPinned = false;
      if (idx > -1) {
        state.starred.splice(idx, 1);
      } else {
        state.starred.push(chatId);
        becomingPinned = true;
      }
      
      if (becomingPinned) {
        el.classList.add('just-pinned');
        setTimeout(async () => {
          await chrome.storage.local.set({ starred: state.starred });
          render();
        }, 400); // Match animation duration
      } else {
        await chrome.storage.local.set({ starred: state.starred });
        render();
      }
    });
  });

  // Hide/Delete Chat
  document.querySelectorAll('.hide-chat-btn').forEach(el => {
    el.addEventListener('click', async (e) => {
      e.stopPropagation();
      const chatId = el.getAttribute('data-chat-id');
      
      if (confirm("Hide this chat from your Workspace? (To permanently delete it from Google, use the chat's options menu).")) {
        state.hiddenChats.push(chatId);
        await chrome.storage.local.set({ hiddenChats: state.hiddenChats });
        render();
      }
    });
  });

  // Click chat
  document.querySelectorAll('.sb-item[data-chat-id]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-from-folder') || e.target.classList.contains('hide-chat-btn') || e.target.classList.contains('toggle-star')) return;
      
      const chatId = el.getAttribute('data-chat-id');
      const chat = state.nativeChats.find(c => c.id === chatId);
      
      // Update UI instantly
      document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active-chat'));
      el.classList.add('active-chat');

      if (chat && chat.el && document.body.contains(chat.el)) {
        chat.el.click();
      } else {
        window.location.href = `https://gemini.google.com/app/${chatId}`;
      }
    });
  });

  // Drag & Drop
  document.querySelectorAll('#chat-list .sb-item').forEach(el => {
    el.addEventListener('dragstart', (e) => {
      el.classList.add('is-dragging');
      e.dataTransfer.setData('text/plain', JSON.stringify({
        id: el.getAttribute('data-chat-id'),
        title: el.getAttribute('data-title')
      }));
    });
    el.addEventListener('dragend', () => {
      el.classList.remove('is-dragging');
    });
  });

  document.querySelectorAll('.workspace-folder').forEach(folderEl => {
    folderEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      folderEl.classList.add('drag-over');
    });
    folderEl.addEventListener('dragleave', (e) => {
      folderEl.classList.remove('drag-over');
    });
    folderEl.addEventListener('drop', async (e) => {
      e.preventDefault();
      folderEl.classList.remove('drag-over');
      
      try {
        const data = e.dataTransfer.getData('text/plain');
        if (!data) return;
        const chatData = JSON.parse(data);
        const folderId = folderEl.getAttribute('data-folder-id');
        
        const folder = state.folders.find(f => f.id === folderId);
        if (folder && !folder.chats.find(c => c.id === chatData.id)) {
          folder.chats.push(chatData);
          await chrome.storage.local.set({ folders: state.folders });
          render();
        }
      } catch (err) {
        console.error("Drop error", err);
      }
    });
  });
}

function showModal() {
  const modal = document.createElement('div');
  modal.id = 'super-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-title">New Workspace</div>
      <div class="modal-subtitle">Group your chats by topic or project.</div>
      <input type="text" id="ws-name" class="sb-search modal-input-full" placeholder="e.g., Python Projects">
      <div class="modal-actions">
        <button id="ws-cancel" class="modal-btn-secondary">Cancel</button>
        <button id="ws-save" class="sb-new-chat modal-btn-primary-flex">Create</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  document.getElementById('ws-name').focus();

  document.getElementById('ws-cancel').onclick = () => modal.remove();
  document.getElementById('ws-save').onclick = async () => {
    const name = document.getElementById('ws-name').value.trim();
    if (name) {
      state.folders.push({ id: Date.now().toString(), name, chats: [] });
      await chrome.storage.local.set({ folders: state.folders });
      modal.remove();
      render();
    }
  };
}

function showSettingsModal() {
  const modal = document.createElement('div');
  modal.id = 'super-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-title">Workspace Backup</div>
      <div class="modal-subtitle">Export your folders and pinned chats to a file, or restore them.</div>
      
      <button id="ws-export" class="sb-new-chat modal-btn-export">Export to File</button>
      
      <div class="modal-file-upload-container">
        <input type="file" id="ws-import-file" accept=".json" class="modal-file-input-hidden">
        <button class="modal-file-dropzone">Restore from File</button>
      </div>

      <div class="modal-center-actions">
        <button id="ws-cancel-settings" class="modal-btn-close">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('ws-cancel-settings').onclick = () => modal.remove();

  document.getElementById('ws-export').onclick = async () => {
    const data = await chrome.storage.local.get(['folders', 'starred', 'hiddenChats']);
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini_workspace_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  document.getElementById('ws-import-file').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.folders) {
          state.folders = data.folders;
          state.starred = data.starred || [];
          state.hiddenChats = data.hiddenChats || [];
          await chrome.storage.local.set(data);
          modal.remove();
          render();
          alert('Workspace restored successfully!');
        } else {
          alert('Invalid backup file.');
        }
      } catch (err) {
        alert('Error reading backup file.');
      }
    };
    reader.readAsText(file);
  };
}

// 4. INIT & OBSERVER (Debounced to prevent freezing)
const performSync = debounce(async () => {
  await sync();
  render();
}, 400);

async function init() {
  if (hasInitialized) return;
  const sidebar = document.createElement('div');
  sidebar.id = 'super-gemini-sidebar';
  document.body.appendChild(sidebar);

  // INSTANT RENDER: Draw cached folders immediately so the user doesn't wait
  try {
    const data = await chrome.storage.local.get(['folders', 'starred', 'hiddenChats', 'expandedFolders']);
    state.folders = data.folders || [];
    state.starred = data.starred || [];
    state.hiddenChats = data.hiddenChats || [];
    state.expandedFolders = data.expandedFolders || [];
    render();
  } catch (error) {
    console.warn("Super Gemini GUI: Extension context invalidated. Please refresh the page.");
    return;
  }

  // Then start the heavy scraping
  performSync();

  // Watch for DOM changes, BUT IGNORE OUR OWN SIDEBAR TO PREVENT INFINITE LOOPS!
  const observer = new MutationObserver((mutations) => {
    let shouldSync = false;
    for (let m of mutations) {
      if (m.target && m.target.nodeType === Node.ELEMENT_NODE) {
        if (m.target.id === 'super-gemini-sidebar' || m.target.closest('#super-gemini-sidebar')) {
          continue; // Ignore changes inside our UI
        }
      }
      shouldSync = true;
      break;
    }
    if (shouldSync) {
      performSync();
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });

  hasInitialized = true;
}

// Start when main content is ready
const check = setInterval(() => {
  if (document.querySelector('main') || document.querySelector('.chat-container') || document.querySelector('chat-app') || document.body) {
    init();
    clearInterval(check);
  }
}, 50);
