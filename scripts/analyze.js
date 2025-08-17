import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");

console.log("🔍 Analyzing bundle size...");

try {
  const distContentPath = resolve(projectRoot, "dist", "content.js");
  const stats = readFileSync(distContentPath, "utf8");
  const sizeInBytes = Buffer.byteLength(stats, "utf8");
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);

  console.log(`📦 Bundle size: ${sizeInKB} KB (${sizeInBytes} bytes)`);

  // 모듈별 대략적인 라인 수 추정
  const lines = stats.split("\n").length;
  console.log(`📄 Total lines: ${lines}`);

  // 압축률 체크 (원본 소스와 비교)
  const srcFiles = [
    "src/main.js",
    "src/core/FilterManager.js",
    "src/core/DOMObserver.js",
    "src/ui/FilterPanel.js",
    "src/ui/StatusIndicator.js",
    "src/ui/NotificationManager.js",
    "src/filters/BaseFilter.js",
    "src/filters/FloorFilter.js",
    "src/filters/FilterRegistry.js",
    "src/storage/StorageManager.js",
    "src/utils/Constants.js",
    "src/utils/DOMUtils.js",
  ];

  let totalSrcSize = 0;
  srcFiles.forEach((file) => {
    try {
      const content = readFileSync(resolve(projectRoot, file), "utf8");
      totalSrcSize += Buffer.byteLength(content, "utf8");
    } catch (e) {
      // 파일이 없는 경우 무시
    }
  });

  const srcSizeInKB = (totalSrcSize / 1024).toFixed(2);
  const compressionRatio = ((1 - sizeInBytes / totalSrcSize) * 100).toFixed(1);

  console.log(`📁 Source size: ${srcSizeInKB} KB`);
  console.log(`📊 Bundle efficiency: ${compressionRatio}% size change`);
} catch (error) {
  console.log("⚠️  Error analyzing bundle:", error.message);
}
