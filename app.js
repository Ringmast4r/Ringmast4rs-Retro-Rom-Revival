/* ============================================
   Ringmast4r's Retro Rom Revival - Main App
   Uses File System Access API - No Server Required!
   ============================================ */

// EmulatorJS CDN base URL
const EJS_CDN = 'https://cdn.emulatorjs.org/stable/data/';

// System mappings: extension -> { core, name } (ONLY supported EmulatorJS cores)
const SYSTEM_MAP = {
    // Nintendo
    'nes': { core: 'nes', name: 'NES' },
    'fds': { core: 'fds', name: 'Famicom Disk System' },
    'sfc': { core: 'snes', name: 'SNES' },
    'smc': { core: 'snes', name: 'SNES' },
    'fig': { core: 'snes', name: 'SNES' },
    'bs': { core: 'snes', name: 'Satellaview' },
    'st': { core: 'snes', name: 'Sufami Turbo' },
    'gb': { core: 'gb', name: 'Game Boy' },
    'gbc': { core: 'gb', name: 'Game Boy Color' },
    'gba': { core: 'gba', name: 'GBA' },
    'n64': { core: 'n64', name: 'N64' },
    'z64': { core: 'n64', name: 'N64' },
    'v64': { core: 'n64', name: 'N64' },
    'ndd': { core: 'n64', name: 'N64DD' },
    'nds': { core: 'nds', name: 'Nintendo DS' },
    'vb': { core: 'vb', name: 'Virtual Boy' },
    'min': { core: 'pokemini', name: 'Pokemon Mini' },
    // Sega
    'md': { core: 'segaMD', name: 'Genesis' },
    'gen': { core: 'segaMD', name: 'Genesis' },
    'smd': { core: 'segaMD', name: 'Genesis' },
    '32x': { core: 'sega32x', name: 'Sega 32X' },
    'gg': { core: 'segaGG', name: 'Game Gear' },
    'sms': { core: 'segaMS', name: 'Master System' },
    'sg': { core: 'segaSG', name: 'SG-1000' },
    'sc': { core: 'segaSG', name: 'SG-1000' },
    'cdi': { core: 'segaCD', name: 'Sega CD' },
    'gdi': { core: 'dreamcast', name: 'Dreamcast' },
    // Sony PlayStation
    'cue': { core: 'psx', name: 'PlayStation' },
    'bin': { core: 'psx', name: 'PlayStation' },
    'iso': { core: 'psx', name: 'PlayStation' },
    'img': { core: 'psx', name: 'PlayStation' },
    'mdf': { core: 'psx', name: 'PlayStation' },
    'pbp': { core: 'psp', name: 'PSP' },
    'cso': { core: 'psp', name: 'PSP' },
    'chd': { core: 'psx', name: 'PlayStation' },
    // Atari
    'a26': { core: 'atari2600', name: 'Atari 2600' },
    'a52': { core: 'atari5200', name: 'Atari 5200' },
    'a78': { core: 'atari7800', name: 'Atari 7800' },
    'lnx': { core: 'lynx', name: 'Atari Lynx' },
    'j64': { core: 'jaguar', name: 'Atari Jaguar' },
    'jag': { core: 'jaguar', name: 'Atari Jaguar' },
    // NEC
    'pce': { core: 'pce', name: 'TurboGrafx-16' },
    'sgx': { core: 'pce', name: 'SuperGrafx' },
    'pcfx': { core: 'pcfx', name: 'PC-FX' },
    // SNK
    'ngp': { core: 'ngp', name: 'Neo Geo Pocket' },
    'ngc': { core: 'ngp', name: 'Neo Geo Pocket Color' },
    'neo': { core: 'neogeo', name: 'Neo Geo' },
    // Bandai
    'ws': { core: 'ws', name: 'WonderSwan' },
    'wsc': { core: 'ws', name: 'WonderSwan Color' },
    'pc2': { core: 'ws', name: 'WonderSwan' },
    // Other Classic Systems
    'vec': { core: 'vectrex', name: 'Vectrex' },
    'col': { core: 'coleco', name: 'ColecoVision' },
    'int': { core: 'intellivision', name: 'Intellivision' },
    'o2': { core: 'odyssey2', name: 'Odyssey 2' },
    'chf': { core: 'channelf', name: 'Channel F' },
    'sv': { core: 'supervision', name: 'Supervision' },
    // Computers
    'dsk': { core: 'msx', name: 'MSX' },
    'mx1': { core: 'msx', name: 'MSX' },
    'mx2': { core: 'msx', name: 'MSX2' },
    'rom': { core: 'msx', name: 'MSX' },
    'd64': { core: 'c64', name: 'Commodore 64' },
    't64': { core: 'c64', name: 'Commodore 64' },
    'prg': { core: 'c64', name: 'Commodore 64' },
    'adf': { core: 'amiga', name: 'Amiga' },
    // Arcade
    'fba': { core: 'fbneo', name: 'Arcade' },
    // Misc
    'mgw': { core: 'gw', name: 'Game & Watch' }
};

// ROM extensions to scan for (only supported systems for speed)
const ROM_EXTENSIONS = new Set([
    // Nintendo
    'nes', 'fds', 'unf', 'unif',
    'sfc', 'smc', 'fig', 'bs', 'st',
    'gb', 'gbc', 'gba',
    'n64', 'z64', 'v64', 'ndd',
    'nds',
    'vb', 'min', 'mgw',
    // Sega
    'md', 'gen', 'smd', 'bin',
    '32x', 'gg', 'sms', 'sg', 'sc', 'cue', 'gdi', 'chd', 'cdi', 'iso',
    // Sony
    'pbp', 'cso', 'img', 'mdf',
    // Atari
    'a26', 'a52', 'a78', 'lnx', 'j64', 'jag',
    // NEC
    'pce', 'sgx', 'pcfx',
    // SNK
    'ngp', 'ngc', 'neo',
    // Bandai
    'ws', 'wsc', 'pc2',
    // Other
    'vec', 'col', 'int', 'o2', 'chf', 'sv',
    // Computers
    'dsk', 'mx1', 'mx2', 'd64', 't64', 'prg', 'adf',
    // Arcade
    'fba',
    // Compressed (use folder name for system)
    'zip', '7z'
]);

// Folder name keywords -> core (ONLY supported systems for speed)
const FOLDER_CORE_MAP = {
    // Nintendo
    'nes': 'nes', 'famicom': 'nes',
    'fds': 'fds', 'disk system': 'fds',
    'snes': 'snes', 'super nintendo': 'snes', 'super famicom': 'snes',
    'gba': 'gba', 'game boy advance': 'gba', 'gameboy advance': 'gba',
    'gbc': 'gb', 'game boy color': 'gb', 'gameboy color': 'gb',
    'gameboy': 'gb', 'game boy': 'gb',
    'n64': 'n64', 'nintendo 64': 'n64',
    'nds': 'nds', 'nintendo ds': 'nds',
    'virtual boy': 'vb', 'virtualboy': 'vb',
    'pokemon mini': 'pokemini',
    // Sega
    'genesis': 'segaMD', 'mega drive': 'segaMD', 'megadrive': 'segaMD',
    'master system': 'segaMS', 'sms': 'segaMS',
    'game gear': 'segaGG', 'gamegear': 'segaGG',
    '32x': 'sega32x', 'sega 32x': 'sega32x',
    'sega cd': 'segaCD', 'mega cd': 'segaCD', 'segacd': 'segaCD',
    'sg-1000': 'segaSG', 'sg1000': 'segaSG',
    'dreamcast': 'dreamcast',
    // Sony
    'playstation': 'psx', 'ps1': 'psx', 'psx': 'psx',
    'psp': 'psp', 'playstation portable': 'psp',
    // Atari
    'atari 2600': 'atari2600', '2600': 'atari2600',
    'atari 5200': 'atari5200', '5200': 'atari5200',
    'atari 7800': 'atari7800', '7800': 'atari7800',
    'lynx': 'lynx', 'atari lynx': 'lynx',
    'jaguar': 'jaguar', 'atari jaguar': 'jaguar',
    // NEC
    'turbografx': 'pce', 'pc engine': 'pce', 'pce': 'pce', 'tg16': 'pce',
    'pcfx': 'pcfx', 'pc-fx': 'pcfx',
    // SNK
    'neo geo pocket': 'ngp', 'ngp': 'ngp', 'ngpc': 'ngp',
    'neo geo': 'neogeo', 'neogeo': 'neogeo',
    // Bandai
    'wonderswan': 'ws',
    // Other
    'colecovision': 'coleco', 'coleco': 'coleco',
    'intellivision': 'intellivision',
    'vectrex': 'vectrex',
    'odyssey': 'odyssey2',
    '3do': '3do',
    // Computers
    'msx': 'msx',
    'c64': 'c64', 'commodore 64': 'c64',
    'amiga': 'amiga',
    // Arcade
    'arcade': 'fbneo', 'mame': 'fbneo', 'fba': 'fbneo', 'fbneo': 'fbneo'
};

// App State
let selectedFile = null;
let selectedSystem = null;
let allRoms = []; // Flat list of all ROMs
let systemsList = []; // List of unique systems found
let displayedSystems = new Set(); // Track which systems have been displayed
let currentView = 'grid'; // 'grid' or 'list'
let currentSort = 'system'; // 'name-asc', 'name-desc', 'system'
let currentFilter = ''; // system filter

// Persistence State (localStorage for small data, IndexedDB for BIOS)
let recentlyPlayed = [];
let favorites = [];
let biosFiles = {}; // Will be loaded from IndexedDB
let userSettings = {
    videoFilter: '',
    screenSize: 'fit',
    volume: 100
};

// IndexedDB for BIOS storage (much larger capacity than localStorage)
let biosDB = null;

function openBiosDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('RetroBiosDB', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            biosDB = request.result;
            resolve(biosDB);
        };
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('bios')) {
                db.createObjectStore('bios', { keyPath: 'core' });
            }
        };
    });
}

async function loadBiosFromDB() {
    try {
        if (!biosDB) await openBiosDB();
        const tx = biosDB.transaction('bios', 'readonly');
        const store = tx.objectStore('bios');
        const request = store.getAll();
        return new Promise((resolve) => {
            request.onsuccess = () => {
                const results = request.result || [];
                results.forEach(item => {
                    biosFiles[item.core] = item;
                });
                resolve();
            };
            request.onerror = () => resolve();
        });
    } catch (e) {
        console.log('[BIOS DB] Error:', e);
    }
}

async function saveBiosToDB(core, data) {
    try {
        if (!biosDB) await openBiosDB();
        const tx = biosDB.transaction('bios', 'readwrite');
        const store = tx.objectStore('bios');
        store.put({ core, ...data });
    } catch (e) {
        console.log('[BIOS DB] Save error:', e);
    }
}

// Load persisted data
function loadPersistedData() {
    try {
        recentlyPlayed = JSON.parse(localStorage.getItem('retro_recents')) || [];
        favorites = JSON.parse(localStorage.getItem('retro_favorites')) || [];
        userSettings = JSON.parse(localStorage.getItem('retro_settings')) || userSettings;
        // BIOS loaded separately from IndexedDB
    } catch (e) {
        console.log('[Storage] Error loading data:', e);
    }
}

function saveRecentlyPlayed() {
    try {
        localStorage.setItem('retro_recents', JSON.stringify(recentlyPlayed.slice(0, 50)));
    } catch (e) {
        console.log('[Storage] Recents save error:', e);
    }
}

function saveFavorites() {
    try {
        localStorage.setItem('retro_favorites', JSON.stringify(favorites));
    } catch (e) {
        console.log('[Storage] Favorites save error:', e);
    }
}

function saveBiosFiles() {
    // Now handled by IndexedDB - this function kept for compatibility
    // Individual BIOS saves happen in saveBiosToDB
}

function saveSettings() {
    try {
        localStorage.setItem('retro_settings', JSON.stringify(userSettings));
    } catch (e) {
        console.log('[Storage] Settings save error:', e);
    }
}

// Add to recently played
function addToRecents(rom) {
    const entry = {
        name: rom.name,
        fileName: rom.fileName,
        system: rom.system,
        core: rom.core,
        timestamp: Date.now()
    };
    // Remove if already exists
    recentlyPlayed = recentlyPlayed.filter(r => r.fileName !== rom.fileName);
    // Add to front
    recentlyPlayed.unshift(entry);
    // Keep only 50
    recentlyPlayed = recentlyPlayed.slice(0, 50);
    saveRecentlyPlayed();
    updateRecentsDisplay();
}

// Toggle favorite
function toggleFavorite(rom) {
    const index = favorites.findIndex(f => f.fileName === rom.fileName);
    if (index >= 0) {
        favorites.splice(index, 1);
    } else {
        favorites.push({
            name: rom.name,
            fileName: rom.fileName,
            system: rom.system,
            core: rom.core
        });
    }
    saveFavorites();
    updateRecentsDisplay();
}

function isFavorite(fileName) {
    return favorites.some(f => f.fileName === fileName);
}

// Initialize on load
loadPersistedData();

// Load BIOS from IndexedDB (async)
(async () => {
    await loadBiosFromDB();
    updateBiosStatus();
    // Clear old localStorage BIOS to free up space
    try { localStorage.removeItem('retro_bios'); } catch(e) {}
})();

// Scan state
let scanFileCount = 0;
let scanFolderCount = 0;
let scanCurrentFolder = '';
let lastDisplayUpdate = 0;
let displayedRomCount = 0;
const MAX_LIVE_DISPLAY = 200;

// DOM Elements
const dropzone = document.getElementById('dropzone');
const romInput = document.getElementById('rom-input');
const selectedRomDiv = document.getElementById('selected-rom');
const romNameEl = document.querySelector('.rom-name');
const romSystemEl = document.querySelector('.rom-system');
const playBtn = document.getElementById('play-btn');
const gameContainer = document.getElementById('game-container');
const gameDiv = document.getElementById('game');
const nowPlaying = document.getElementById('now-playing');
const backBtn = document.getElementById('back-btn');
const launcher = document.getElementById('launcher');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const browseBtn = document.getElementById('browse-btn');
const selectedFolderEl = document.getElementById('selected-folder');
const libraryMessage = document.getElementById('library-message');
const romList = document.getElementById('rom-list');
const romGrid = document.getElementById('rom-grid');
const romSearch = document.getElementById('rom-search');
const visibleCount = document.getElementById('visible-count');
const totalCount = document.getElementById('total-count');
const systemFilter = document.getElementById('system-filter');
const sortSelect = document.getElementById('sort-select');
const viewGridBtn = document.getElementById('view-grid');
const viewListBtn = document.getElementById('view-list');
const alphabetBar = document.getElementById('alphabet-bar');
const browserWarning = document.getElementById('browser-warning');
const dismissWarning = document.getElementById('dismiss-warning');
const favoritesList = document.getElementById('favorites-list');
const recentList = document.getElementById('recent-list');
const biosInput = document.getElementById('bios-input');
const masterVolume = document.getElementById('master-volume');
const volumeDisplay = document.getElementById('volume-display');
const videoFilter = document.getElementById('video-filter');
const screenSize = document.getElementById('screen-size');

// ============================================
// Tab Switching
// ============================================
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`${tabId}-tab`).classList.add('active');
    });
});

// ============================================
// Drag & Drop
// ============================================
dropzone.addEventListener('click', () => romInput.click());
dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handleFileSelect(e.dataTransfer.files[0]);
});
romInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFileSelect(e.target.files[0]);
});

function handleFileSelect(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const system = SYSTEM_MAP[ext];
    if (!system) {
        alert(`Unsupported format: .${ext}`);
        return;
    }
    selectedFile = file;
    selectedSystem = system;
    romNameEl.textContent = file.name;
    romSystemEl.textContent = system.name;
    selectedRomDiv.classList.remove('hidden');
}

// ============================================
// EmulatorJS Launch (using iframe for clean exit)
// ============================================
let currentGameUrl = null;

function launchEmulator(romBlob, fileName, core) {
    // Create blob URL for the ROM
    currentGameUrl = URL.createObjectURL(romBlob);

    // Check for BIOS
    const biosData = biosFiles[core];
    const biosUrl = biosData ? biosData.data : '';

    // Get settings
    const volume = userSettings.volume / 100;

    // Build the emulator HTML to load in iframe
    const emulatorHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; background: #000; }
        #game { width: 100%; height: 100vh; }
    </style>
</head>
<body>
    <div id="game"></div>
    <script>
        EJS_player = '#game';
        EJS_core = '${core}';
        EJS_gameUrl = '${currentGameUrl}';
        EJS_gameName = '${fileName.replace(/'/g, "\\'")}';
        EJS_pathtodata = '${EJS_CDN}';
        EJS_startOnLoaded = true;
        EJS_color = '#00ffff';
        EJS_gameID = '${fileName.replace(/'/g, "\\'")}';
        EJS_volume = ${volume};
        ${biosUrl ? `EJS_biosUrl = '${biosUrl}';` : ''}
        EJS_Buttons = {
            playPause: true, restart: true, mute: true, settings: true,
            fullscreen: true, saveState: true, loadState: true,
            gamepad: true, cheat: true, volume: true,
            saveSavFiles: true, loadSavFiles: true,
            quickSave: true, quickLoad: true, screenshot: true
        };
    <\/script>
    <script src="${EJS_CDN}loader.js"><\/script>
</body>
</html>`;

    // Create iframe with emulator
    const iframe = document.createElement('iframe');
    iframe.id = 'emulator-frame';
    iframe.style.cssText = 'width:100%;height:100%;border:none;';
    iframe.srcdoc = emulatorHtml;

    gameDiv.innerHTML = '';
    gameDiv.appendChild(iframe);

    nowPlaying.textContent = `Now Playing: ${fileName}`;
    launcher.classList.add('hidden');
    gameContainer.classList.remove('hidden');
}

playBtn.addEventListener('click', () => {
    if (selectedFile && selectedSystem) {
        launchEmulator(selectedFile, selectedFile.name, selectedSystem.core);
    }
});

backBtn.addEventListener('click', () => {
    // Remove iframe - this cleanly destroys EmulatorJS without page reload!
    gameDiv.innerHTML = '';

    // Clean up blob URL
    if (currentGameUrl) {
        URL.revokeObjectURL(currentGameUrl);
        currentGameUrl = null;
    }

    // Show launcher, hide game
    gameContainer.classList.add('hidden');
    launcher.classList.remove('hidden');
});

// ============================================
// Library Scanning (Optimized)
// ============================================
browseBtn.addEventListener('click', async () => {
    if (!('showDirectoryPicker' in window)) {
        alert('Use Chrome or Edge for folder selection.');
        return;
    }

    try {
        console.log('%c[SCAN] Opening folder picker...', 'color: #00ffff');
        const dirHandle = await window.showDirectoryPicker({ mode: 'read' });

        const startTime = performance.now();
        console.log('%c[SCAN] Starting scan: ' + dirHandle.name, 'color: #00ff88; font-weight: bold');

        browseBtn.disabled = true;
        browseBtn.textContent = 'Scanning...';
        selectedFolderEl.textContent = `Selected: ${dirHandle.name}`;
        selectedFolderEl.classList.remove('hidden');
        libraryMessage.innerHTML = '<span style="color:#00ff88">Scanning...</span>';
        romList.classList.add('hidden');

        allRoms = [];
        systemsList = [];
        const systemsSet = new Set();
        scanFileCount = 0;
        scanFolderCount = 0;
        scanCurrentFolder = '';
        lastDisplayUpdate = 0;
        displayedRomCount = 0;
        displayedSystems = new Set();
        foundBiosFiles = []; // Reset BIOS findings
        romGrid.innerHTML = ''; // Clear grid for live updates

        // Collect top-level folders
        const folders = [];
        for await (const entry of dirHandle.values()) {
            if (entry.kind === 'directory') folders.push(entry);
        }

        console.log(`[SCAN] Found ${folders.length} folders`);

        // Start UI update interval (updates every 500ms during scan)
        let lastRomCount = 0;
        const uiUpdateInterval = setInterval(() => {
            // Only update DOM if we have new ROMs (batch updates)
            if (allRoms.length > lastRomCount + 100 || allRoms.length === lastRomCount) {
                updateLiveDisplay();
                lastRomCount = allRoms.length;
            }
            libraryMessage.innerHTML = `<span style="color:#00ff88">Scanning ${scanCurrentFolder}...</span><br><span style="color:#00ffff; font-size:1.2em">${allRoms.length.toLocaleString()}</span> <span style="color:#888">ROMs found</span>`;
        }, 500);

        // Scan each folder at full speed
        for (let i = 0; i < folders.length; i++) {
            const folder = folders[i];
            const folderLower = folder.name.toLowerCase();

            // Skip known non-ROM top-level folders
            if (SKIP_FOLDERS.has(folderLower) || folderLower.startsWith('.')) {
                console.log(`[SCAN] [${i + 1}/${folders.length}] SKIP: ${folder.name}`);
                continue;
            }

            scanCurrentFolder = folder.name;
            console.log(`%c[SCAN] [${i + 1}/${folders.length}] ${folder.name}`, 'color: #ffff00');

            const romsInFolder = [];
            await scanFolder(folder, romsInFolder);

            if (romsInFolder.length > 0) {
                console.log(`[SCAN]   ✓ ${romsInFolder.length} ROMs (total: ${allRoms.length})`);
            }

            // Yield every folder to keep UI responsive
            await new Promise(r => setTimeout(r, 1));

            // Extra yield every 5 folders to prevent stalling
            if (i % 5 === 0) {
                await new Promise(r => setTimeout(r, 10));
            }
        }

        // Stop UI update interval
        clearInterval(uiUpdateInterval);

        // Collect unique systems found
        allRoms.forEach(rom => systemsSet.add(rom.system));

        systemsList = Array.from(systemsSet).sort();
        const scanTime = ((performance.now() - startTime) / 1000).toFixed(2);

        console.log(`%c[SCAN] DONE: ${allRoms.length} ROMs in ${displayedSystems.size} systems (${scanTime}s)`, 'color: #00ff88; font-weight: bold');

        // Auto-load any BIOS files found
        if (foundBiosFiles.length > 0) {
            await autoLoadBiosFiles();
        }

        if (allRoms.length === 0) {
            libraryMessage.innerHTML = '<strong>No ROMs found.</strong> Check folder structure.';
            libraryMessage.className = 'error';
        } else {
            const biosCount = Object.keys(biosFiles).filter(k => biosFiles[k]?.autoDetected).length;
            const biosMsg = biosCount > 0 ? ` | <span style="color:#ff00ff">${biosCount} BIOS auto-loaded</span>` : '';
            libraryMessage.innerHTML = `<strong style="color:#00ff88">✓ Scan Complete!</strong> ${allRoms.length.toLocaleString()} ROMs in ${displayedSystems.size} systems <span style="color:#888">(${scanTime}s)</span>${biosMsg}`;
            // Final update
            visibleCount.textContent = allRoms.length.toLocaleString();
            totalCount.textContent = displayedSystems.size.toLocaleString();
            // Build alphabet bar and system filter
            buildAlphabetBar();
            updateSystemFilter();
        }

    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error('[SCAN] Error:', err);
            libraryMessage.innerHTML = `<strong>Error:</strong> ${err.message}`;
            libraryMessage.className = 'error';
        }
    } finally {
        browseBtn.disabled = false;
        browseBtn.textContent = '📂 Browse for ROMs Folder';
    }
});

// Folders to skip (only system folders that definitely don't have ROMs)
const SKIP_FOLDERS = new Set([
    '$recycle.bin', 'system volume information', 'windows', 'program files',
    'programdata', 'appdata', 'node_modules', '.git', '.svn', '__pycache__',
    'cache', 'temp', 'tmp', '.thumb', 'thumbs', '.ds_store', '.trash'
]);

// BIOS folders to specifically scan
const BIOS_FOLDERS = new Set(['bios', 'bioses', 'system']);

// Known BIOS files -> core mapping (comprehensive list)
const BIOS_FILE_MAP = {
    // ========== PlayStation (PSX) ==========
    'scph1001.bin': 'psx', 'scph1000.bin': 'psx', 'scph1002.bin': 'psx',
    'scph3000.bin': 'psx', 'scph3500.bin': 'psx', 'scph5000.bin': 'psx',
    'scph5500.bin': 'psx', 'scph5501.bin': 'psx', 'scph5502.bin': 'psx', 'scph5503.bin': 'psx',
    'scph7000.bin': 'psx', 'scph7001.bin': 'psx', 'scph7002.bin': 'psx', 'scph7003.bin': 'psx',
    'scph7500.bin': 'psx', 'scph7501.bin': 'psx', 'scph7502.bin': 'psx', 'scph7503.bin': 'psx',
    'scph9000.bin': 'psx', 'scph9001.bin': 'psx', 'scph9002.bin': 'psx',
    'scph100.bin': 'psx', 'scph101.bin': 'psx', 'scph102.bin': 'psx',
    'psxonpsp660.bin': 'psx', 'ps1_rom.bin': 'psx', 'psx.bin': 'psx',
    'ps-30a.bin': 'psx', 'ps-30e.bin': 'psx', 'ps-30j.bin': 'psx',
    'openbios.bin': 'psx', 'psx_bios.bin': 'psx', 'playstation.bin': 'psx',

    // ========== PlayStation 2 (PS2) ==========
    'ps2-0220a-20060210.bin': 'ps2', 'ps2-0220e-20060210.bin': 'ps2',
    'ps2-0220j-20060210.bin': 'ps2', 'scph10000.bin': 'ps2', 'scph30004r.bin': 'ps2',
    'scph39001.bin': 'ps2', 'scph70012.bin': 'ps2', 'scph77008.bin': 'ps2',
    'ps2_bios.bin': 'ps2', 'rom1.bin': 'ps2',

    // ========== PSP ==========
    'psp_bios.bin': 'psp', 'psp.bin': 'psp',

    // ========== Game Boy Advance ==========
    'gba_bios.bin': 'gba', 'gba.bin': 'gba', 'bios_gba.bin': 'gba',
    'gba_bios.rom': 'gba', 'agb_bios.bin': 'gba', 'agb.bin': 'gba',
    'gbabios.bin': 'gba', 'gbasp_bios.bin': 'gba', 'open_gba_bios.bin': 'gba',

    // ========== Game Boy / Game Boy Color ==========
    'gb_bios.bin': 'gb', 'gbc_bios.bin': 'gb', 'sgb_bios.bin': 'gb',
    'dmg_boot.bin': 'gb', 'cgb_boot.bin': 'gb', 'sgb_boot.bin': 'gb',
    'sgb2_boot.bin': 'gb', 'agb_boot.bin': 'gb',

    // ========== Nintendo DS ==========
    'bios7.bin': 'nds', 'bios9.bin': 'nds', 'firmware.bin': 'nds',
    'nds_bios_arm7.bin': 'nds', 'nds_bios_arm9.bin': 'nds',
    'nds7.bin': 'nds', 'nds9.bin': 'nds', 'nds_firmware.bin': 'nds',
    'biosnds7.rom': 'nds', 'biosnds9.rom': 'nds', 'dsi_bios_arm7.bin': 'nds',
    'dsi_bios_arm9.bin': 'nds', 'dsi_firmware.bin': 'nds',

    // ========== Sega CD / Mega CD ==========
    'bios_cd_u.bin': 'segaCD', 'bios_cd_e.bin': 'segaCD', 'bios_cd_j.bin': 'segaCD',
    'us_scd1_9210.bin': 'segaCD', 'us_scd2_9306.bin': 'segaCD',
    'eu_mcd1_9210.bin': 'segaCD', 'eu_mcd2_9303.bin': 'segaCD', 'eu_mcd2_9306.bin': 'segaCD',
    'jp_mcd1_9111.bin': 'segaCD', 'jp_mcd1_9112.bin': 'segaCD', 'jp_mcd2_921222.bin': 'segaCD',
    'sega_cd_bios.bin': 'segaCD', 'segacd_bios.bin': 'segaCD', 'mega_cd_bios.bin': 'segaCD',
    'megacd_bios.bin': 'segaCD', 'scd_bios.bin': 'segaCD', 'mcd_bios.bin': 'segaCD',

    // ========== Sega Saturn ==========
    'saturn_bios.bin': 'saturn', 'saturn.bin': 'saturn',
    'sega_101.bin': 'saturn', 'sega_100.bin': 'saturn', 'sega_100a.bin': 'saturn',
    'mpr-17933.bin': 'saturn', 'mpr-17941.bin': 'saturn', 'mpr-17942.bin': 'saturn',
    'mpr-17940.bin': 'saturn', 'mpr-18811-mx.bin': 'saturn', 'mpr-19367-mx.bin': 'saturn',
    'saturn_bios_us.bin': 'saturn', 'saturn_bios_eu.bin': 'saturn', 'saturn_bios_jp.bin': 'saturn',

    // ========== Sega Dreamcast ==========
    'dc_boot.bin': 'dreamcast', 'dc_flash.bin': 'dreamcast', 'dc.bin': 'dreamcast',
    'dc_bios.bin': 'dreamcast', 'dreamcast.bin': 'dreamcast', 'dcboot.bin': 'dreamcast',
    'dcflash.bin': 'dreamcast', 'naomi.zip': 'dreamcast',

    // ========== Atari Lynx ==========
    'lynxboot.img': 'lynx', 'lynx.bin': 'lynx', 'lynx_boot.img': 'lynx',
    'lynxos.img': 'lynx', 'lynxboot.bin': 'lynx',

    // ========== Atari Jaguar ==========
    'jagboot.rom': 'jaguar', 'jaguar.bin': 'jaguar', 'jaguarboot.rom': 'jaguar',
    'jaguar_bios.bin': 'jaguar', 'jagcd.bin': 'jaguar',

    // ========== Atari 5200 ==========
    '5200.bin': 'atari5200', 'atari5200.bin': 'atari5200', 'atari5200.rom': 'atari5200',
    '5200bios.bin': 'atari5200', 'atarixl.rom': 'atari5200',

    // ========== Atari 7800 ==========
    '7800.bin': 'atari7800', 'atari7800.bin': 'atari7800', 'atari7800.rom': 'atari7800',
    '7800bios_u.bin': 'atari7800', '7800bios_e.bin': 'atari7800',

    // ========== PC Engine / TurboGrafx-16 CD ==========
    'syscard3.pce': 'pce', 'syscard2.pce': 'pce', 'syscard1.pce': 'pce',
    'syscard.pce': 'pce', 'gexpress.pce': 'pce', 'gecard.pce': 'pce',
    'syscard3u.pce': 'pce', 'syscard3j.pce': 'pce',
    'pce_cd.bin': 'pce', 'pce_cd_bios.bin': 'pce', 'tgcd.bin': 'pce',
    'super system card 3.pce': 'pce', 'games express.pce': 'pce',

    // ========== PC-FX ==========
    'pcfx.bin': 'pcfx', 'pcfx_bios.bin': 'pcfx', 'pcfxbios.bin': 'pcfx',
    'fx-scsi.rom': 'pcfx', 'pcfxv101.bin': 'pcfx',

    // ========== Neo Geo ==========
    'neogeo.zip': 'neogeo', 'neogeo.bin': 'neogeo', 'neo-geo.rom': 'neogeo',
    'aes.bin': 'neogeo', 'ng_aes.zip': 'neogeo', 'neocd.bin': 'neogeo',
    'neocdz.zip': 'neogeo', 'neocd_z.zip': 'neogeo', 'front-sp1.bin': 'neogeo',

    // ========== Neo Geo Pocket / Color ==========
    'ngp_bios.bin': 'ngp', 'ngp.bin': 'ngp', 'ngc_bios.bin': 'ngp',

    // ========== ColecoVision ==========
    'colecovision.rom': 'coleco', 'coleco.rom': 'coleco', 'coleco.bin': 'coleco',
    'colecovision.bin': 'coleco', 'cv_bios.bin': 'coleco',

    // ========== Intellivision ==========
    'exec.bin': 'intellivision', 'grom.bin': 'intellivision',
    'ivoice.bin': 'intellivision', 'ecs.bin': 'intellivision',

    // ========== Odyssey 2 ==========
    'o2rom.bin': 'odyssey2', 'odyssey2.bin': 'odyssey2', 'videopac.bin': 'odyssey2',
    'c52.bin': 'odyssey2', 'g7400.bin': 'odyssey2', 'jopac.bin': 'odyssey2',

    // ========== Vectrex ==========
    'vectrex.bin': 'vectrex', 'vectrex_bios.bin': 'vectrex', 'system.bin': 'vectrex',

    // ========== MSX ==========
    'cbios_main_msx1.rom': 'msx', 'cbios_main_msx2.rom': 'msx', 'cbios_main_msx2+.rom': 'msx',
    'cbios_logo_msx1.rom': 'msx', 'cbios_logo_msx2.rom': 'msx',
    'cbios_sub.rom': 'msx', 'msx.rom': 'msx', 'msx2.rom': 'msx', 'msx2p.rom': 'msx',

    // ========== 3DO ==========
    'panafz10.bin': '3do', 'panafz1.bin': '3do', 'panafz10e.bin': '3do',
    'panafz10-norsa.bin': '3do', 'goldstar.bin': '3do', 'sanyo.bin': '3do',
    '3do_bios.bin': '3do', 'sanyotry.bin': '3do', 'goldstar_gdo101m.bin': '3do',

    // ========== Fairchild Channel F ==========
    'sl31253.bin': 'channelf', 'sl31254.bin': 'channelf', 'sl90025.bin': 'channelf',
    'channelf.bin': 'channelf',

    // ========== WonderSwan ==========
    'ws_bios.bin': 'ws', 'wsc_bios.bin': 'ws', 'wonderswan.bin': 'ws',

    // ========== Pokemon Mini ==========
    'pokemini.min': 'pokemini', 'pokemini_bios.min': 'pokemini',
    'bios.min': 'pokemini', 'pm_bios.bin': 'pokemini',

    // ========== Virtual Boy ==========
    'vb_bios.bin': 'vb', 'virtualboy.bin': 'vb',
};

// Track found BIOS files
let foundBiosFiles = [];

// Scanning now continues in background while playing

// ONLY cores that EmulatorJS actually supports (playable in browser)
const SUPPORTED_CORES = new Set([
    'nes', 'fds', 'snes', 'gb', 'gba', 'n64', 'nds', 'vb',
    'segaMD', 'segaMS', 'segaGG', 'sega32x', 'segaCD', 'segaSG',
    'psx', 'psp', 'dreamcast',
    'atari2600', 'atari5200', 'atari7800', 'lynx', 'jaguar',
    'pce', 'pcfx', 'ngp', 'ws',
    'coleco', 'msx', 'arcade', 'fbneo', '3do', 'pokemini'
]);

// Core to display name mapping
const CORE_NAMES = {
    'nes': 'NES', 'fds': 'Famicom Disk System', 'snes': 'SNES',
    'gb': 'Game Boy', 'gba': 'GBA',
    'n64': 'N64', 'nds': 'Nintendo DS', 'vb': 'Virtual Boy',
    'pokemini': 'Pokemon Mini',
    'segaMD': 'Genesis', 'segaMS': 'Master System', 'segaGG': 'Game Gear',
    'sega32x': 'Sega 32X', 'segaCD': 'Sega CD', 'segaSG': 'SG-1000',
    'dreamcast': 'Dreamcast',
    'psx': 'PlayStation', 'psp': 'PSP',
    'atari2600': 'Atari 2600', 'atari5200': 'Atari 5200', 'atari7800': 'Atari 7800',
    'lynx': 'Atari Lynx', 'jaguar': 'Atari Jaguar',
    'pce': 'TurboGrafx-16', 'pcfx': 'PC-FX',
    'ngp': 'Neo Geo Pocket', 'neogeo': 'Neo Geo', 'ws': 'WonderSwan',
    'coleco': 'ColecoVision', 'msx': 'MSX', 'c64': 'Commodore 64', 'amiga': 'Amiga',
    'fbneo': 'Arcade', 'arcade': 'Arcade', '3do': '3DO',
    'vectrex': 'Vectrex', 'intellivision': 'Intellivision', 'odyssey2': 'Odyssey 2',
    'channelf': 'Channel F', 'supervision': 'Supervision', 'gw': 'Game & Watch'
};

// Detect system from folder path (only returns SUPPORTED cores for speed)
function detectSystemFromPath(folderPath) {
    const pathLower = folderPath.toLowerCase();
    for (const [keyword, core] of Object.entries(FOLDER_CORE_MAP)) {
        if (pathLower.includes(keyword) && SUPPORTED_CORES.has(core)) {
            const name = CORE_NAMES[core] || core;
            return { core: core, name: name };
        }
    }
    return null;
}

async function scanFolder(dirHandle, roms, depth = 0, folderPath = '', isBiosFolder = false) {
    // No depth limit - scan everything!
    if (depth > 20) return; // Safety limit only

    const currentPath = folderPath ? `${folderPath}/${dirHandle.name}` : dirHandle.name;
    const folderNameLower = dirHandle.name.toLowerCase();

    // Verbose logging for deep scans
    if (depth <= 3) {
        console.log(`%c[SCAN] ${'>'.repeat(depth + 1)} ${currentPath}`, 'color: #00ffff');
    }

    // Check if this is a BIOS folder
    const scanningForBios = isBiosFolder || BIOS_FOLDERS.has(folderNameLower);

    let fileCount = 0;
    try {
        for await (const entry of dirHandle.values()) {
            // Yield every 50 files to prevent browser freeze
            fileCount++;
            if (fileCount % 50 === 0) {
                await new Promise(r => setTimeout(r, 0));
            }

            if (entry.kind === 'file') {
                scanFileCount++;
                const fileNameLower = entry.name.toLowerCase();
                const ext = entry.name.split('.').pop().toLowerCase();

                // Check for BIOS files
                if (BIOS_FILE_MAP[fileNameLower]) {
                    const core = BIOS_FILE_MAP[fileNameLower];
                    // Only auto-load if we don't already have this BIOS
                    if (!biosFiles[core]) {
                        foundBiosFiles.push({
                            name: entry.name,
                            handle: entry,
                            core: core
                        });
                        console.log(`%c[BIOS] Found: ${entry.name} for ${core}`, 'color: #ff00ff');
                    }
                }

                // Skip ROM scanning if we're in a BIOS-only folder
                if (scanningForBios && !ROM_EXTENSIONS.has(ext)) continue;

                if (ROM_EXTENSIONS.has(ext)) {
                    // Detect system from file extension first
                    let systemInfo = SYSTEM_MAP[ext];

                    // For ambiguous extensions, use folder name
                    if (!systemInfo || ext === 'zip' || ext === '7z' || ext === 'bin' || ext === 'iso' || ext === 'cue' || ext === 'chd') {
                        const folderSystem = detectSystemFromPath(currentPath);
                        if (folderSystem) {
                            systemInfo = folderSystem;
                        }
                    }

                    const core = systemInfo ? systemInfo.core : null;

                    // ONLY include supported EmulatorJS cores (skip unsupported for speed)
                    if (!core || !SUPPORTED_CORES.has(core)) continue;

                    const systemName = CORE_NAMES[core] || core;

                    roms.push({
                        name: entry.name.replace(/\.[^/.]+$/, ''),
                        fileName: entry.name,
                        ext: ext,
                        handle: entry,
                        system: systemName,
                        core: core
                    });
                    allRoms.push(roms[roms.length - 1]);
                }
            } else if (entry.kind === 'directory') {
                const subFolderLower = entry.name.toLowerCase();

                // Always scan BIOS folders for BIOS files
                if (BIOS_FOLDERS.has(subFolderLower)) {
                    scanFolderCount++;
                    await scanFolder(entry, roms, depth + 1, currentPath, true);
                    continue;
                }

                // Skip non-ROM folders
                if (SKIP_FOLDERS.has(subFolderLower) || subFolderLower.startsWith('.')) {
                    continue;
                }
                scanFolderCount++;
                await scanFolder(entry, roms, depth + 1, currentPath, false);
            }
        }
    } catch (e) {
        // Skip inaccessible
    }
}

// Auto-load found BIOS files
async function autoLoadBiosFiles() {
    if (foundBiosFiles.length === 0) return;

    console.log(`%c[BIOS] Auto-loading ${foundBiosFiles.length} BIOS files...`, 'color: #ff00ff; font-weight: bold');

    for (const bios of foundBiosFiles) {
        try {
            const file = await bios.handle.getFile();
            const reader = new FileReader();

            await new Promise((resolve, reject) => {
                reader.onload = async () => {
                    const biosData = {
                        name: bios.name,
                        data: reader.result,
                        size: file.size,
                        autoDetected: true
                    };
                    biosFiles[bios.core] = biosData;
                    await saveBiosToDB(bios.core, biosData);
                    console.log(`[BIOS] Loaded: ${bios.name} for ${bios.core}`);
                    resolve();
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        } catch (e) {
            console.error(`[BIOS] Failed to load ${bios.name}:`, e);
        }
    }

    updateBiosStatus();
    foundBiosFiles = []; // Clear for next scan
}

function updateLiveDisplay() {
    libraryMessage.innerHTML = `<span style="color:#00ff88">Scanning ${scanCurrentFolder}...</span><br><span style="color:#00ffff; font-size:1.2em">${allRoms.length.toLocaleString()}</span> <span style="color:#888">ROMs found</span>`;

    // Show the ROM list immediately
    if (allRoms.length > 0 && romList.classList.contains('hidden')) {
        romList.classList.remove('hidden');
    }

    // Update counts (ROMs and systems)
    visibleCount.textContent = allRoms.length.toLocaleString();
    totalCount.textContent = displayedSystems.size.toLocaleString();

    // Update display organized by console
    updateConsoleDisplay();
}

function updateConsoleDisplay() {
    // Group ROMs by system
    const romsBySystem = {};
    for (const rom of allRoms) {
        if (!romsBySystem[rom.system]) {
            romsBySystem[rom.system] = [];
        }
        romsBySystem[rom.system].push(rom);
    }

    // Sort systems alphabetically, but put "Unknown Console" at the end
    const sortedSystems = Object.keys(romsBySystem).sort((a, b) => {
        if (a === 'Unknown Console') return 1;
        if (b === 'Unknown Console') return -1;
        return a.localeCompare(b);
    });

    // Add/update each system section
    for (const system of sortedSystems) {
        const roms = romsBySystem[system];
        const sectionId = `system-${system.replace(/[^a-zA-Z0-9]/g, '-')}`;
        let section = document.getElementById(sectionId);

        if (!section) {
            // Create new section for this system - START COLLAPSED
            section = document.createElement('div');
            section.id = sectionId;
            section.className = 'system-section collapsed';
            section.dataset.system = system; // Store system name for sorting
            section.innerHTML = `
                <div class="system-header" onclick="toggleSection('${sectionId}')">
                    <div class="system-header-left">
                        <span class="system-toggle">▶</span>
                        <span class="system-name">${system}</span>
                    </div>
                    <span class="system-count">${roms.length} ROMs</span>
                </div>
                <div class="system-roms"></div>
            `;
            romGrid.appendChild(section);
            displayedSystems.add(system);
        }

        // Update count
        section.querySelector('.system-count').textContent = `${roms.length} ROMs`;
    }

    // Re-sort sections alphabetically in the DOM
    const sections = [...romGrid.querySelectorAll('.system-section')];
    sections.sort((a, b) => {
        const nameA = a.dataset.system || '';
        const nameB = b.dataset.system || '';
        if (nameA === 'Unknown Console') return 1;
        if (nameB === 'Unknown Console') return -1;
        return nameA.localeCompare(nameB);
    });
    sections.forEach(section => romGrid.appendChild(section));
}

// Lazy load ROM cards when section is expanded
function loadSectionRoms(sectionId, system) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const romsContainer = section.querySelector('.system-roms');
    if (romsContainer.children.length > 0) return; // Already loaded

    const roms = allRoms.filter(r => r.system === system);

    // Use document fragment for faster DOM insertion
    const fragment = document.createDocumentFragment();

    for (const rom of roms) {
        const card = document.createElement('div');
        card.className = 'rom-card';
        const isFav = isFavorite(rom.fileName);
        card.innerHTML = `
            <button class="favorite-btn ${isFav ? 'active' : ''}" title="Toggle Favorite">★</button>
            <div class="rom-card-title" title="${rom.name}">${rom.name}</div>
            <div class="rom-card-meta">
                <button class="rom-card-play">▶ PLAY</button>
            </div>
        `;
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('favorite-btn')) {
                e.stopPropagation();
                toggleFavorite(rom);
                e.target.classList.toggle('active');
                return;
            }
            loadRom(rom);
        });
        fragment.appendChild(card);
    }

    romsContainer.appendChild(fragment);
}

// Toggle section collapse - make it global so onclick can access it
window.toggleSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const wasCollapsed = section.classList.contains('collapsed');
    section.classList.toggle('collapsed');
    const toggle = section.querySelector('.system-toggle');
    toggle.textContent = section.classList.contains('collapsed') ? '▶' : '▼';

    // Lazy load ROMs when expanding
    if (wasCollapsed) {
        const systemName = section.querySelector('.system-name').textContent;
        loadSectionRoms(sectionId, systemName);
    }
}

// Expand/Collapse All buttons
document.getElementById('expand-all').addEventListener('click', async () => {
    const sections = document.querySelectorAll('.system-section');

    // Warn if there are many ROMs
    if (allRoms.length > 5000) {
        if (!confirm(`Loading ${allRoms.length.toLocaleString()} ROM cards may be slow. Continue?`)) {
            return;
        }
    }

    for (const section of sections) {
        section.classList.remove('collapsed');
        section.querySelector('.system-toggle').textContent = '▼';
        const systemName = section.querySelector('.system-name').textContent;
        loadSectionRoms(section.id, systemName);
        // Yield between sections for large collections
        await new Promise(r => setTimeout(r, 0));
    }
});

document.getElementById('collapse-all').addEventListener('click', () => {
    document.querySelectorAll('.system-section').forEach(section => {
        section.classList.add('collapsed');
        section.querySelector('.system-toggle').textContent = '▶';
    });
});

function detectCore(ext, systemName) {
    // First try by extension
    if (SYSTEM_MAP[ext]) return SYSTEM_MAP[ext].core;

    // Then try by folder name
    const lower = systemName.toLowerCase();
    for (const [key, core] of Object.entries(FOLDER_CORE_MAP)) {
        if (lower.includes(key)) return core;
    }
    return null;
}

async function loadRom(rom) {
    try {
        // Show loading immediately
        nowPlaying.textContent = `Loading: ${rom.name}...`;
        launcher.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        gameDiv.innerHTML = '<div style="color:#00ffff;text-align:center;padding:2rem;font-size:1.5rem;">Loading game...</div>';

        if (!rom.core) {
            alert('Cannot determine emulator for this ROM.');
            gameContainer.classList.add('hidden');
            launcher.classList.remove('hidden');
            return;
        }

        // Add to recently played
        addToRecents(rom);

        const file = await rom.handle.getFile();
        launchEmulator(file, rom.fileName, rom.core);
    } catch (err) {
        console.error('Load error:', err);
        alert('Error loading ROM: ' + err.message);
        gameContainer.classList.add('hidden');
        launcher.classList.remove('hidden');
    }
}

// Fast search with minimal DOM operations
let searchTimeout;
romSearch.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const query = romSearch.value.toLowerCase().trim();
        const sections = document.querySelectorAll('.system-section');

        sections.forEach(section => {
            const cards = section.querySelectorAll('.rom-card');
            let visibleInSection = 0;

            // Use CSS class instead of style for faster toggling
            cards.forEach(card => {
                const title = card.querySelector('.rom-card-title').textContent.toLowerCase();
                const match = !query || title.includes(query);
                card.classList.toggle('search-hidden', !match);
                if (match) visibleInSection++;
            });

            // Update count
            const countEl = section.querySelector('.system-count');
            countEl.textContent = query ? `${visibleInSection}/${cards.length} ROMs` : `${cards.length} ROMs`;

            // Hide empty sections
            section.classList.toggle('search-hidden', query && visibleInSection === 0);
        });
    }, 50); // 50ms debounce for instant feel
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !gameContainer.classList.contains('hidden')) backBtn.click();
    if ((e.ctrlKey && e.key === 'f') || e.key === '/') {
        if (!romList.classList.contains('hidden')) { e.preventDefault(); romSearch.focus(); }
    }
});

// ============================================
// System Filter
// ============================================
function updateSystemFilter() {
    const systems = [...displayedSystems].sort();
    systemFilter.innerHTML = '<option value="">All Systems</option>';
    systems.forEach(system => {
        const option = document.createElement('option');
        option.value = system;
        option.textContent = system;
        systemFilter.appendChild(option);
    });
}

systemFilter.addEventListener('change', () => {
    currentFilter = systemFilter.value;
    applyFiltersAndSort();
});

// ============================================
// Sort Functionality
// ============================================
sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    applyFiltersAndSort();
});

function applyFiltersAndSort() {
    const sections = document.querySelectorAll('.system-section');

    if (currentSort === 'system') {
        // Show system sections, filter by selected system
        sections.forEach(section => {
            const systemName = section.querySelector('.system-name').textContent;
            if (!currentFilter || systemName === currentFilter) {
                section.classList.remove('search-hidden');
            } else {
                section.classList.add('search-hidden');
            }
        });
    } else {
        // For name sorting, we'd need to rebuild the grid flat
        // For now, just filter
        sections.forEach(section => {
            const systemName = section.querySelector('.system-name').textContent;
            if (!currentFilter || systemName === currentFilter) {
                section.classList.remove('search-hidden');
            } else {
                section.classList.add('search-hidden');
            }
        });
    }
}

// ============================================
// View Toggle (Grid/List)
// ============================================
viewGridBtn.addEventListener('click', () => {
    currentView = 'grid';
    viewGridBtn.classList.add('active');
    viewListBtn.classList.remove('active');
    romGrid.classList.remove('list-view');
    romGrid.classList.add('grid-view');
});

viewListBtn.addEventListener('click', () => {
    currentView = 'list';
    viewListBtn.classList.add('active');
    viewGridBtn.classList.remove('active');
    romGrid.classList.remove('grid-view');
    romGrid.classList.add('list-view');
});

// ============================================
// Alphabet Bar
// ============================================
function buildAlphabetBar() {
    alphabetBar.innerHTML = '';
    const letters = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    // Count ROMs starting with each letter
    const letterCounts = {};
    allRoms.forEach(rom => {
        const firstChar = rom.name.charAt(0).toUpperCase();
        const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';
        letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    });

    letters.forEach(letter => {
        const btn = document.createElement('button');
        btn.textContent = letter;
        btn.title = `${letterCounts[letter] || 0} ROMs`;
        if (letterCounts[letter]) {
            btn.classList.add('has-roms');
        }
        btn.addEventListener('click', () => {
            // Filter to show only ROMs starting with this letter
            document.querySelectorAll('.alphabet-bar button').forEach(b => b.classList.remove('active'));

            if (btn.classList.contains('active')) {
                btn.classList.remove('active');
                clearAlphabetFilter();
            } else {
                btn.classList.add('active');
                filterByLetter(letter);
            }
        });
        alphabetBar.appendChild(btn);
    });
}

function filterByLetter(letter) {
    const cards = document.querySelectorAll('.rom-card');
    cards.forEach(card => {
        const title = card.querySelector('.rom-card-title').textContent;
        const firstChar = title.charAt(0).toUpperCase();
        const cardLetter = /[A-Z]/.test(firstChar) ? firstChar : '#';

        if (cardLetter === letter) {
            card.classList.remove('search-hidden');
        } else {
            card.classList.add('search-hidden');
        }
    });

    // Update section visibility
    document.querySelectorAll('.system-section').forEach(section => {
        const visibleCards = section.querySelectorAll('.rom-card:not(.search-hidden)');
        section.classList.toggle('search-hidden', visibleCards.length === 0);
    });
}

function clearAlphabetFilter() {
    document.querySelectorAll('.rom-card').forEach(card => {
        card.classList.remove('search-hidden');
    });
    document.querySelectorAll('.system-section').forEach(section => {
        section.classList.remove('search-hidden');
    });
    document.querySelectorAll('#alphabet-bar button').forEach(btn => {
        btn.classList.remove('active');
    });
}

// ============================================
// Recents & Favorites Display
// ============================================
function updateRecentsDisplay() {
    // Update favorites
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<p class="empty-message">No favorites yet. Click ★ on any game to add it!</p>';
    } else {
        favoritesList.innerHTML = '';
        favorites.forEach(fav => {
            const card = createRecentCard(fav, true);
            favoritesList.appendChild(card);
        });
    }

    // Update recents
    if (recentlyPlayed.length === 0) {
        recentList.innerHTML = '<p class="empty-message">No recently played games.</p>';
    } else {
        recentList.innerHTML = '';
        recentlyPlayed.slice(0, 20).forEach(recent => {
            const card = createRecentCard(recent, false);
            recentList.appendChild(card);
        });
    }
}

function createRecentCard(rom, showRemove) {
    const card = document.createElement('div');
    card.className = 'recent-card';

    const timeAgo = rom.timestamp ? getTimeAgo(rom.timestamp) : '';

    card.innerHTML = `
        <button class="favorite-btn ${isFavorite(rom.fileName) ? 'active' : ''}" title="Toggle Favorite">★</button>
        <div class="card-title" title="${rom.name}">${rom.name}</div>
        <div class="card-system">${rom.system}</div>
        ${timeAgo ? `<div class="card-time">${timeAgo}</div>` : ''}
    `;

    // Click to play (need to find the ROM in allRoms or handle stored ROMs)
    card.addEventListener('click', (e) => {
        if (e.target.classList.contains('favorite-btn')) {
            e.stopPropagation();
            toggleFavorite(rom);
            e.target.classList.toggle('active');
            return;
        }
        // Try to find in current allRoms
        const foundRom = allRoms.find(r => r.fileName === rom.fileName);
        if (foundRom) {
            loadRom(foundRom);
        } else {
            alert('ROM not found in current library. Please rescan your ROMs folder.');
        }
    });

    return card;
}

function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
}

// Initialize recents display
updateRecentsDisplay();

// ============================================
// BIOS Management
// ============================================
let currentBiosTarget = null;

document.querySelectorAll('.bios-upload-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentBiosTarget = btn.dataset.bios;
        biosInput.click();
    });
});

biosInput.addEventListener('change', async (e) => {
    if (!currentBiosTarget || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async () => {
        // Store in IndexedDB
        const biosData = {
            name: file.name,
            data: reader.result,
            size: file.size
        };
        biosFiles[currentBiosTarget] = biosData;
        await saveBiosToDB(currentBiosTarget, biosData);
        updateBiosStatus();
    };

    reader.readAsDataURL(file);
});

function updateBiosStatus() {
    document.querySelectorAll('.bios-status').forEach(status => {
        const core = status.dataset.bios;
        if (biosFiles[core]) {
            const autoTag = biosFiles[core].autoDetected ? ' (Auto)' : '';
            status.textContent = `✓ ${biosFiles[core].name}${autoTag}`;
            status.classList.add('loaded');
        } else {
            status.textContent = 'Not loaded';
            status.classList.remove('loaded');
        }
    });
}

// Initialize BIOS status
updateBiosStatus();

// ============================================
// Settings
// ============================================
// Volume control
masterVolume.value = userSettings.volume;
volumeDisplay.textContent = `${userSettings.volume}%`;

masterVolume.addEventListener('input', () => {
    userSettings.volume = parseInt(masterVolume.value);
    volumeDisplay.textContent = `${userSettings.volume}%`;
    saveSettings();
});

// Video filter
videoFilter.value = userSettings.videoFilter;
videoFilter.addEventListener('change', () => {
    userSettings.videoFilter = videoFilter.value;
    saveSettings();
});

// Screen size
screenSize.value = userSettings.screenSize;
screenSize.addEventListener('change', () => {
    userSettings.screenSize = screenSize.value;
    saveSettings();
});

// Clear buttons
document.getElementById('clear-recents').addEventListener('click', () => {
    if (confirm('Clear all recently played history?')) {
        recentlyPlayed = [];
        saveRecentlyPlayed();
        updateRecentsDisplay();
    }
});

document.getElementById('clear-favorites').addEventListener('click', () => {
    if (confirm('Clear all favorites?')) {
        favorites = [];
        saveFavorites();
        updateRecentsDisplay();
    }
});

document.getElementById('export-data').addEventListener('click', () => {
    const data = {
        favorites: favorites,
        recentlyPlayed: recentlyPlayed,
        settings: userSettings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'retro-revival-data.json';
    a.click();
    URL.revokeObjectURL(url);
});

// ============================================
// Browser Compatibility Check
// ============================================
function checkBrowserCompatibility() {
    if (!('showDirectoryPicker' in window)) {
        browserWarning.classList.remove('hidden');
        browseBtn.disabled = true;
        browseBtn.textContent = '📂 Not Supported in This Browser';
    }
}

dismissWarning.addEventListener('click', () => {
    browserWarning.classList.add('hidden');
});

// Check on load
checkBrowserCompatibility();

// ============================================
// Gamepad Support for Menu Navigation
// ============================================
let gamepadIndex = null;
let lastGamepadInput = 0;
let selectedRomIndex = 0;
let selectedSystemIndex = 0;
let gamepadConnected = false;

// Detect gamepad connection
window.addEventListener('gamepadconnected', (e) => {
    gamepadIndex = e.gamepad.index;
    gamepadConnected = true;
    console.log(`%c[GAMEPAD] Connected: ${e.gamepad.id}`, 'color: #00ff88; font-weight: bold');
    showGamepadNotification(`Controller connected: ${e.gamepad.id.split('(')[0].trim()}`);
});

window.addEventListener('gamepaddisconnected', (e) => {
    if (e.gamepad.index === gamepadIndex) {
        gamepadIndex = null;
        gamepadConnected = false;
        console.log('[GAMEPAD] Disconnected');
    }
});

function showGamepadNotification(message) {
    // Create temporary notification
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: linear-gradient(135deg, #00ffff, #ff00ff); color: #000;
        padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600;
        z-index: 9999; animation: fadeInOut 3s forwards;
    `;
    notif.textContent = message;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// Gamepad polling loop
function pollGamepad() {
    if (!gamepadConnected || gameContainer.classList.contains('hidden') === false) {
        // Don't poll when in-game (EmulatorJS handles it)
        requestAnimationFrame(pollGamepad);
        return;
    }

    const gamepads = navigator.getGamepads();
    const gp = gamepads[gamepadIndex];

    if (!gp) {
        requestAnimationFrame(pollGamepad);
        return;
    }

    const now = Date.now();
    if (now - lastGamepadInput < 150) { // Debounce 150ms
        requestAnimationFrame(pollGamepad);
        return;
    }

    // D-pad or left stick
    const up = gp.buttons[12]?.pressed || gp.axes[1] < -0.5;
    const down = gp.buttons[13]?.pressed || gp.axes[1] > 0.5;
    const left = gp.buttons[14]?.pressed || gp.axes[0] < -0.5;
    const right = gp.buttons[15]?.pressed || gp.axes[0] > 0.5;

    // Buttons (A/X = confirm, B/O = back, shoulder buttons = tabs)
    const confirm = gp.buttons[0]?.pressed; // A (Xbox) / X (PS)
    const back = gp.buttons[1]?.pressed;    // B (Xbox) / O (PS)
    const lb = gp.buttons[4]?.pressed;      // LB/L1
    const rb = gp.buttons[5]?.pressed;      // RB/R1

    if (up || down || left || right || confirm || back || lb || rb) {
        lastGamepadInput = now;

        // Tab switching with shoulder buttons
        if (lb || rb) {
            const activeTabs = [...document.querySelectorAll('.tab')];
            const activeIndex = activeTabs.findIndex(t => t.classList.contains('active'));
            let newIndex = activeIndex;

            if (rb) newIndex = (activeIndex + 1) % activeTabs.length;
            if (lb) newIndex = (activeIndex - 1 + activeTabs.length) % activeTabs.length;

            activeTabs[newIndex].click();
            selectedSystemIndex = 0;
            selectedRomIndex = 0;
        }

        // Navigate ROM list
        const visibleSections = [...document.querySelectorAll('.system-section:not(.search-hidden):not(.collapsed)')];
        const visibleCards = [...document.querySelectorAll('.rom-card:not(.search-hidden)')];

        if (visibleCards.length > 0) {
            // Remove previous highlight
            document.querySelectorAll('.rom-card.gamepad-selected').forEach(c => c.classList.remove('gamepad-selected'));

            if (up) selectedRomIndex = Math.max(0, selectedRomIndex - 1);
            if (down) selectedRomIndex = Math.min(visibleCards.length - 1, selectedRomIndex + 1);
            if (left) selectedRomIndex = Math.max(0, selectedRomIndex - 4); // Jump by row
            if (right) selectedRomIndex = Math.min(visibleCards.length - 1, selectedRomIndex + 4);

            // Highlight selected
            const selectedCard = visibleCards[selectedRomIndex];
            if (selectedCard) {
                selectedCard.classList.add('gamepad-selected');
                selectedCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            // Confirm = launch game
            if (confirm && selectedCard) {
                selectedCard.click();
            }
        }

        // Expand/collapse sections with confirm when no cards visible
        if (confirm && visibleCards.length === 0) {
            const sections = [...document.querySelectorAll('.system-section:not(.search-hidden)')];
            if (sections[selectedSystemIndex]) {
                sections[selectedSystemIndex].querySelector('.system-header').click();
            }
        }

        // Navigate collapsed sections
        const collapsedSections = [...document.querySelectorAll('.system-section.collapsed:not(.search-hidden)')];
        if (collapsedSections.length > 0 && visibleCards.length === 0) {
            document.querySelectorAll('.system-section.gamepad-selected').forEach(s => s.classList.remove('gamepad-selected'));

            if (up) selectedSystemIndex = Math.max(0, selectedSystemIndex - 1);
            if (down) selectedSystemIndex = Math.min(collapsedSections.length - 1, selectedSystemIndex + 1);

            const selectedSection = collapsedSections[selectedSystemIndex];
            if (selectedSection) {
                selectedSection.classList.add('gamepad-selected');
                selectedSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        // Back button - collapse section or go back
        if (back) {
            const expandedSections = document.querySelectorAll('.system-section:not(.collapsed)');
            if (expandedSections.length > 0) {
                document.getElementById('collapse-all').click();
            }
        }
    }

    requestAnimationFrame(pollGamepad);
}

// Start polling
requestAnimationFrame(pollGamepad);

// ============================================
// Service Worker Registration (only works with http server)
// ============================================
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('[SW] Registered:', registration.scope);
            })
            .catch((error) => {
                console.log('[SW] Registration failed:', error);
            });
    });
}

console.log("Ringmast4r's Retro Rom Revival loaded!");
