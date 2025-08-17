import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const distDir = resolve(projectRoot, 'dist');

// 복사할 파일들 정의
const filesToCopy = [
  'manifest.json',
  'background.js',
  'popup.html',
  'popup.js',
  'styles.css',
];

// icons 폴더가 있다면 복사
const iconsDir = resolve(projectRoot, 'icons');
if (existsSync(iconsDir)) {
  filesToCopy.push('icons');
}

console.log('📁 Copying extension assets to dist folder...');

filesToCopy.forEach((file) => {
  const srcPath = resolve(projectRoot, file);
  const destPath = resolve(distDir, file);

  try {
    if (file === 'icons') {
      // icons 폴더 복사
      mkdirSync(destPath, { recursive: true });
      const files = readdirSync(srcPath);
      files.forEach((iconFile) => {
        copyFileSync(resolve(srcPath, iconFile), resolve(destPath, iconFile));
      });
      console.log(`✅ ${file}/ folder copied`);
    } else {
      copyFileSync(srcPath, destPath);
      console.log(`✅ ${file} copied`);
    }
  } catch (error) {
    console.log(`⚠️  ${file} not found or error copying: ${error.message}`);
  }
});

console.log('🎉 Extension build complete! Load the dist/ folder in Chrome.');
console.log(
  '   Chrome > Extensions > Developer mode > Load unpacked > Select dist folder'
);
