#!/bin/bash

set -e

# 远程仓库配置
REMOTE="${1:-origin}"
BRANCH="${2:-master}"

echo "🚀 开始版本更新流程..."
echo "远程: ${REMOTE}/${BRANCH}"
echo "::>------------------------"

# 获取当前提交数
COMMIT_COUNT=$(git rev-list --count HEAD)

# 计算最终提交数
NEXT_COMMIT_COUNT=$((COMMIT_COUNT + 1))

# 获取当前日期 YY.M.D
YEAR=$(date +%y)
MONTH=$(date +%-m)
DAY=$(date +%-d)

NEW_VERSION="${YEAR}.${MONTH}.${DAY}(${NEXT_COMMIT_COUNT})"

echo "📝 更新版本号..."
# 使用 sed 更新 package.json 中的版本号
# 匹配 "version": "..." 模式
sed -i "s/\"version\": \".*\"/\"version\": \"${NEW_VERSION}\"/" package.json
echo "版本将更新到: ${NEW_VERSION}"
echo "::>------------------------"

# Git 操作
echo "📦 提交更改..."
git add package.json
git commit -m "chore(package): update to version ${NEW_VERSION}"
echo "已提交: chore(package): update to version ${NEW_VERSION}"
echo "::>------------------------"

echo "🏷️ 创建标签..."
git tag "${NEW_VERSION}"
echo "已创建标签: ${NEW_VERSION}"
echo "::>------------------------"

echo "🌐 推送更改..."
git push "${REMOTE}" "${BRANCH}"
echo "已推送提交到 ${REMOTE}/${BRANCH}"
echo "::>------------------------"

echo "🌐 推送标签..."
git push "${REMOTE}" "${NEW_VERSION}"
echo "已推送标签: ${NEW_VERSION}"
echo "::>------------------------"

echo "==========================="
echo "✅ 版本更新完成！"
echo "新版本: ${NEW_VERSION}"
echo "==========================="
