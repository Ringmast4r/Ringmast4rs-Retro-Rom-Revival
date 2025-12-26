/**
 * Libretro Thumbnails Downloader - Ordered by Year (Oldest First)
 * Matches YOUR D:\ROMS folder structure exactly
 *
 * RUN: node download-libretro-thumbnails.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Where to save box art (inside your ROMS folder structure)
const OUTPUT_DIR = 'D:\\BoxArt';

// YOUR consoles ordered by year (oldest first) - matched to libretro repos
const SYSTEMS = [
    // 1972
    { folder: '1972 - Magnavox - Odyssey', repo: 'Magnavox_-_Odyssey' },

    // 1976
    { folder: '1976 - Fairchild - Channel F', repo: 'Fairchild_-_Channel_F' },

    // 1977
    { folder: '1977 - Atari - 2600', repo: 'Atari_-_2600' },
    { folder: '1977 - Bally - Astrocade', repo: 'Bally_-_Astrocade' },
    { folder: '1977 - RCA - Studio II', repo: 'RCA_-_Studio_II' },

    // 1978
    { folder: '1978 - Magnavox - Odyssey 2', repo: 'Magnavox_-_Odyssey2' },
    { folder: '1978 - Interton - VC 4000', repo: 'Interton_-_VC_4000' },

    // 1979
    { folder: '1979 - Mattel - Intellivision', repo: 'Mattel_-_Intellivision' },
    { folder: '1979 - Milton Bradley - Microvision', repo: 'Milton_Bradley_-_Microvision' },

    // 1980
    { folder: '1980 - Nintendo - Game & Watch', repo: 'Nintendo_-_Game_and_Watch' },

    // 1981
    { folder: '1981 - IBM - DOS', repo: 'DOS' },

    // 1982
    { folder: '1982 - Atari - 5200', repo: 'Atari_-_5200' },
    { folder: '1982 - Coleco - ColecoVision', repo: 'Coleco_-_ColecoVision' },
    { folder: '1982 - Emerson - Arcadia 2001', repo: 'Emerson_-_Arcadia_2001' },
    { folder: '1982 - GCE - Vectrex', repo: 'GCE_-_Vectrex' },
    { folder: '1982 - Sega - SG-1000', repo: 'Sega_-_SG-1000' },

    // 1983
    { folder: '1983 - Nintendo - NES', repo: 'Nintendo_-_Nintendo_Entertainment_System' },
    { folder: '1983 - Nintendo - Famicom Disk System', repo: 'Nintendo_-_Family_Computer_Disk_System' },
    { folder: '1983 - Casio - PV-1000', repo: 'Casio_-_PV-1000' },

    // 1984
    { folder: '1984 - Epoch - Super Cassette Vision', repo: 'Epoch_-_Super_Cassette_Vision' },

    // 1985
    { folder: '1985 - Sega - Master System', repo: 'Sega_-_Master_System_-_Mark_III' },

    // 1986
    { folder: '1986 - Atari - 7800', repo: 'Atari_-_7800' },

    // 1987
    { folder: '1987 - NEC - TurboGrafx-16', repo: 'NEC_-_PC_Engine_-_TurboGrafx_16' },

    // 1988
    { folder: '1988 - NEC - TurboGrafx-CD', repo: 'NEC_-_PC_Engine_CD_-_TurboGrafx-CD' },
    { folder: '1988 - Sega - Genesis', repo: 'Sega_-_Mega_Drive_-_Genesis' },

    // 1989
    { folder: '1989 - Atari - Lynx', repo: 'Atari_-_Lynx' },
    { folder: '1989 - NEC - PC Engine SuperGrafx', repo: 'NEC_-_PC_Engine_SuperGrafx' },
    { folder: '1989 - Nintendo - Game Boy', repo: 'Nintendo_-_Game_Boy' },

    // 1990
    { folder: '1990 - Nintendo - SNES', repo: 'Nintendo_-_Super_Nintendo_Entertainment_System' },
    { folder: '1990 - SNK - Neo Geo', repo: 'SNK_-_Neo_Geo' },
    { folder: '1990 - Hartung - Game Master', repo: 'Hartung_-_Game_Master' },

    // 1991
    { folder: '1991 - Philips - CD-i', repo: 'Philips_-_CDi' },
    { folder: '1991 - Sega - CD', repo: 'Sega_-_Mega-CD_-_Sega_CD' },
    { folder: '1991 - Sega - Game Gear', repo: 'Sega_-_Game_Gear' },

    // 1992
    { folder: '1992 - Watara - Supervision', repo: 'Watara_-_Supervision' },

    // 1993
    { folder: '1993 - Atari - Jaguar', repo: 'Atari_-_Jaguar' },
    { folder: '1993 - Commodore - Amiga CD32', repo: 'Commodore_-_Amiga_CD32' },
    { folder: '1993 - Panasonic - 3DO', repo: 'The_3DO_Company_-_3DO' },
    { folder: '1993 - Welback - Mega Duck', repo: 'Welback_Holdings_-_Mega_Duck' },

    // 1994
    { folder: '1994 - Sega - 32X', repo: 'Sega_-_32X' },
    { folder: '1994 - Sega - Saturn', repo: 'Sega_-_Saturn' },
    { folder: '1994 - Sony - PlayStation', repo: 'Sony_-_PlayStation' },

    // 1995
    { folder: '1995 - Casio - Loopy', repo: 'Casio_-_Loopy' },
    { folder: '1995 - Nintendo - Virtual Boy', repo: 'Nintendo_-_Virtual_Boy' },

    // 1996
    { folder: '1996 - Nintendo - 64', repo: 'Nintendo_-_Nintendo_64' },

    // 1997
    { folder: '1997 - Tiger - Game.com', repo: 'Tiger_-_Game.com' },

    // 1998
    { folder: '1998 - Nintendo - Game Boy Color', repo: 'Nintendo_-_Game_Boy_Color' },
    { folder: '1998 - Sega - Dreamcast', repo: 'Sega_-_Dreamcast' },
    { folder: '1998 - SNK - Neo Geo Pocket', repo: 'SNK_-_Neo_Geo_Pocket' },

    // 1999
    { folder: '1999 - Bandai - WonderSwan', repo: 'Bandai_-_WonderSwan' },
    { folder: '1999 - Nintendo - 64DD', repo: 'Nintendo_-_Nintendo_64DD' },
    { folder: '1999 - SNK - Neo Geo Pocket Color', repo: 'SNK_-_Neo_Geo_Pocket_Color' },

    // 2000
    { folder: '2000 - Bandai - WonderSwan Color', repo: 'Bandai_-_WonderSwan_Color' },
    { folder: '2000 - Sony - PlayStation 2', repo: 'Sony_-_PlayStation_2' },
    { folder: '2000 - VM Labs - NUON', repo: 'VM_Labs_-_NUON' },

    // 2001
    { folder: '2001 - Microsoft - Xbox', repo: 'Microsoft_-_Xbox' },
    { folder: '2001 - Nintendo - Game Boy Advance', repo: 'Nintendo_-_Game_Boy_Advance' },
    { folder: '2001 - Nintendo - GameCube', repo: 'Nintendo_-_GameCube' },
    { folder: '2001 - Nintendo - Pokemon Mini', repo: 'Nintendo_-_Pokemon_Mini' },
    { folder: '2001 - GamePark - GP32', repo: 'GamePark_-_GP32' },

    // 2003
    { folder: '2003 - Nokia - N-Gage', repo: 'Nokia_-_N-Gage' },

    // 2004
    { folder: '2004 - Nintendo - DS', repo: 'Nintendo_-_Nintendo_DS' },
    { folder: '2004 - Sony - PSP', repo: 'Sony_-_PlayStation_Portable' },

    // 2005
    { folder: '2005 - Microsoft - Xbox 360', repo: 'Microsoft_-_Xbox_360' },

    // 2006
    { folder: '2006 - Nintendo - Wii', repo: 'Nintendo_-_Wii' },
    { folder: '2006 - Sony - PlayStation 3', repo: 'Sony_-_PlayStation_3' },

    // 2011
    { folder: '2011 - Nintendo - 3DS', repo: 'Nintendo_-_Nintendo_3DS' },
    { folder: '2011 - Sony - PlayStation Vita', repo: 'Sony_-_PlayStation_Vita' },

    // Arcade
    { folder: '2000 - Arcade - PC-based', repo: 'MAME' },
];

// GitHub URL
const GITHUB_ZIP_URL = 'https://github.com/libretro-thumbnails';

let stats = { downloaded: 0, failed: 0, skipped: 0 };

// Download file
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const request = (url) => {
            https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
                if (res.statusCode === 301 || res.statusCode === 302) {
                    request(res.headers.location);
                    return;
                }
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}`));
                    return;
                }
                res.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
            }).on('error', reject);
        };
        request(url);
    });
}

// Extract ZIP
function extractZip(zipPath, destDir) {
    try {
        execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`, { stdio: 'pipe' });
        return true;
    } catch (e) {
        return false;
    }
}

// Process system
async function processSystem(system, index, total) {
    const zipUrl = `${GITHUB_ZIP_URL}/${system.repo}/archive/refs/heads/master.zip`;
    const destFolder = path.join(OUTPUT_DIR, system.folder);
    const tempZip = path.join(OUTPUT_DIR, '_temp.zip');

    console.log(`\n[${index}/${total}] ${system.folder}`);

    // Skip if exists
    if (fs.existsSync(destFolder)) {
        try {
            const files = fs.readdirSync(destFolder);
            if (files.length > 5) {
                console.log(`  SKIP - Already have ${files.length} images`);
                stats.skipped++;
                return;
            }
        } catch (e) {}
    }

    try {
        console.log(`  Downloading...`);
        await downloadFile(zipUrl, tempZip);

        const size = (fs.statSync(tempZip).size / 1024 / 1024).toFixed(1);
        console.log(`  Downloaded ${size} MB`);

        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
        }

        console.log(`  Extracting...`);
        const tempDir = path.join(OUTPUT_DIR, '_temp_extract');
        if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });

        if (!extractZip(tempZip, tempDir)) throw new Error('Extract failed');

        // Find boxart
        const extracted = fs.readdirSync(tempDir)[0];
        const boxartSrc = path.join(tempDir, extracted, 'Named_Boxarts');

        if (fs.existsSync(boxartSrc)) {
            const files = fs.readdirSync(boxartSrc);
            console.log(`  Copying ${files.length} images...`);
            for (const f of files) {
                fs.copyFileSync(path.join(boxartSrc, f), path.join(destFolder, f));
            }
            console.log(`  ✓ Done!`);
            stats.downloaded++;
        } else {
            console.log(`  No boxart found in repo`);
            stats.failed++;
        }

        // Cleanup
        fs.rmSync(tempDir, { recursive: true });
        fs.unlinkSync(tempZip);

    } catch (e) {
        console.log(`  FAILED: ${e.message}`);
        stats.failed++;
        try { fs.unlinkSync(tempZip); } catch (x) {}
    }
}

// Main
async function main() {
    console.log('='.repeat(60));
    console.log('  LIBRETRO THUMBNAILS DOWNLOADER');
    console.log('  Ordered by Year (Oldest First)');
    console.log('='.repeat(60));
    console.log(`\nOutput: ${OUTPUT_DIR}`);
    console.log(`Systems: ${SYSTEMS.length}`);
    console.log(`\nStarting from oldest consoles...\n`);

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const start = Date.now();

    for (let i = 0; i < SYSTEMS.length; i++) {
        await processSystem(SYSTEMS[i], i + 1, SYSTEMS.length);
    }

    const mins = ((Date.now() - start) / 60000).toFixed(1);

    console.log('\n' + '='.repeat(60));
    console.log('  COMPLETE!');
    console.log('='.repeat(60));
    console.log(`  Downloaded: ${stats.downloaded}`);
    console.log(`  Skipped:    ${stats.skipped}`);
    console.log(`  Failed:     ${stats.failed}`);
    console.log(`  Time:       ${mins} minutes`);
    console.log(`  Location:   ${OUTPUT_DIR}`);
    console.log('='.repeat(60));
}

main().catch(console.error);
