import fs from "node:fs";
import { execSync } from "node:child_process";

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));

// 获取提交数
const commitCount = parseInt(execSync("git rev-list --count HEAD").toString().trim(), 10);
const nextCommitCount = commitCount + 1;

// 获取当前日期
const now = new Date();
const year = now.getFullYear().toString().slice(-2);
const month = now.getMonth() + 1;
const date = now.getDate();

const newVersion = `${year}.${month}.${date}(${nextCommitCount})`;

pkg.version = newVersion;

fs.writeFileSync("./package.json", JSON.stringify(pkg, null, 2) + "\n");
console.log(`Version updated to: ${newVersion}`);
