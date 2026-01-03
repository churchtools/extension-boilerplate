import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const { name: projectName, version } = packageJson;

let gitHash = 'no-git';
try {
    gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
} catch (e) {}

const releasesDir = path.join(rootDir, 'releases');
if (!fs.existsSync(releasesDir)) fs.mkdirSync(releasesDir, { recursive: true });

const archiveName = `${projectName}-v${version}-${gitHash}.zip`;
const archivePath = path.join(releasesDir, archiveName);

const distDir = path.join(rootDir, 'dist');

if (!fs.existsSync(distDir)) {
    console.error(`❌ Build-Ordner nicht gefunden: ${distDir}`);
    process.exit(1);
}

const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    const extensionKey = process.env.EXTENSION_KEY;
    const search = /src="([^/][^"]+)"/g;
    const replacement = `src="/ccm/${extensionKey}/$1"`;
    
    html = html.replace(search, replacement);
    html = html.replace(/href="styles.([^"]+)\.css"/g, `href="/ccm/${extensionKey}/styles.$1.css"`);
    
    fs.writeFileSync(indexPath, html);
    console.log('✅ index.html Pfade auf absolut korrigiert.');
}

if (!fs.existsSync(distDir)) {
    console.error(`❌ Dist-Ordner nicht gefunden: ${distDir}`);
    process.exit(1);
}

const output = fs.createWriteStream(archivePath);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
    console.log(`✅ Paket erstellt: ${archiveName} (${(archive.pointer() / 1024 / 1024).toFixed(2)} MB)`);
});

archive.pipe(output);
archive.glob('**/*', { cwd: distDir, ignore: ['**/*.map'] });
archive.finalize();
