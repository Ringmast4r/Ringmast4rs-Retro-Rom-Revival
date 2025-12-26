/**
 * Download Missing Box Art
 * Only the 2 systems that actually exist on libretro-thumbnails
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const OUTPUT_DIR = 'D:\\BoxArt';
const MISSING = [
    { folder: '1980 - Nintendo - Game & Watch', repo: 'Handheld_Electronic_Game' },
    { folder: '1991 - Philips - CD-i', repo: 'Philips_-_CD-i' }
];

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
                    reject(new Error('HTTP ' + res.statusCode));
                    return;
                }
                res.pipe(file);
                file.on('finish', () => { file.close(); resolve(); });
            }).on('error', reject);
        };
        request(url);
    });
}

async function processSystem(system) {
    const zipUrl = 'https://github.com/libretro-thumbnails/' + system.repo + '/archive/refs/heads/master.zip';
    const destFolder = path.join(OUTPUT_DIR, system.folder);
    const tempZip = path.join(OUTPUT_DIR, '_temp_fix.zip');
    const tempDir = path.join(OUTPUT_DIR, '_temp_fix_extract');

    console.log('\nProcessing: ' + system.folder);
    console.log('  Repo: ' + system.repo);

    try {
        console.log('  Downloading...');
        await downloadFile(zipUrl, tempZip);
        const size = (fs.statSync(tempZip).size / 1024 / 1024).toFixed(1);
        console.log('  Downloaded ' + size + ' MB');

        if (!fs.existsSync(destFolder)) fs.mkdirSync(destFolder, { recursive: true });
        if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });

        console.log('  Extracting...');
        execSync(`powershell -Command "Expand-Archive -Path '${tempZip}' -DestinationPath '${tempDir}' -Force"`, { stdio: 'pipe' });

        const extracted = fs.readdirSync(tempDir)[0];
        const boxartSrc = path.join(tempDir, extracted, 'Named_Boxarts');

        if (fs.existsSync(boxartSrc)) {
            const files = fs.readdirSync(boxartSrc);
            console.log('  Copying ' + files.length + ' images...');
            let copied = 0;
            for (const f of files) {
                const srcPath = path.join(boxartSrc, f);
                if (!fs.statSync(srcPath).isDirectory()) {
                    fs.copyFileSync(srcPath, path.join(destFolder, f));
                    copied++;
                }
            }
            console.log('  ✓ Copied ' + copied + ' images!');
        } else {
            console.log('  No Named_Boxarts folder found');
        }

        fs.rmSync(tempDir, { recursive: true });
        fs.unlinkSync(tempZip);
    } catch (e) {
        console.log('  FAILED: ' + e.message);
        try { fs.unlinkSync(tempZip); } catch(x) {}
    }
}

async function main() {
    console.log('='.repeat(50));
    console.log('  DOWNLOADING MISSING BOX ART');
    console.log('='.repeat(50));

    for (const sys of MISSING) {
        await processSystem(sys);
    }

    console.log('\n' + '='.repeat(50));
    console.log('  COMPLETE!');
    console.log('='.repeat(50));
}

main().catch(console.error);
