import fs from "node:fs";
import { execSync } from "node:child_process";

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));

// 获取提交数
const commitCount = parseInt(execSync("git rev-list --count HEAD").toString().trim(), 10);
// 检查是否有暂存的更改
const hasStagedChanges = execSync("git diff --cached --quiet || echo 'changed'").toString().trim() === "changed";
// 版本号中的提交数 = 当前提交数 + 1 (即将进行的提交) + (如果有暂存更改则额外+1)
const nextCommitCount = commitCount + 1 + (hasStagedChanges ? 1 : 0);

// 获取当前日期
const now = new Date();
const year = now.getFullYear().toString().slice(-2);
const month = now.getMonth() + 1;
const date = now.getDate();

const newVersion = `${year}.${month}.${date}(${nextCommitCount})`;

pkg.version = newVersion;

fs.writeFileSync("./package.json", JSON.stringify(pkg, null, 2) + "\n");
console.log(`Version updated to: ${newVersion}`);

// 自动执行 git add 和 git commit
try {
  execSync("git add package.json");
  execSync(`git commit -m "chore(package): update to version ${newVersion}"`);
  console.log(`Committed: chore(package): update to version ${newVersion}`);
} catch (error) {
  console.error("Failed to commit version update:", error.message);
}
