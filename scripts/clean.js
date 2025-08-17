import { rmSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, "..");
const distDir = resolve(projectRoot, "dist");

console.log("🧹 Cleaning dist folder...");

try {
  rmSync(distDir, { recursive: true, force: true });
  console.log("✅ Dist folder cleaned successfully");
} catch (error) {
  console.log("⚠️  Error cleaning dist folder:", error.message);
}
