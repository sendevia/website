#!/bin/bash

# 获取当前提交数
COMMIT_COUNT=$(git rev-list --count HEAD)

# 计算最终提交数
NEXT_COMMIT_COUNT=$((COMMIT_COUNT + 1))

# 获取当前日期 YY.M.D
YEAR=$(date +%y)
MONTH=$(date +%-m)
DAY=$(date +%-d)

NEW_VERSION="${YEAR}.${MONTH}.${DAY}(${NEXT_COMMIT_COUNT})"

# 使用 sed 更新 package.json 中的版本号
# 匹配 "version": "..." 模式
sed -i "s/\"version\": \".*\"/\"version\": \"${NEW_VERSION}\"/" package.json

echo "Version updated to: ${NEW_VERSION}"

# Git 操作
git add package.json
git commit -m "chore(package): update to version ${NEW_VERSION}"
echo "Committed: chore(package): update to version ${NEW_VERSION}"

git tag "${NEW_VERSION}"
echo "Tagged: ${NEW_VERSION}"
