import tsPlugin from "typescript-eslint";
import vuePlugin from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";
import prettierPlugin from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default tsPlugin.config(
  // 1) 全局忽略
  {
    ignores: [
      "**/dist/**",
      "**/cache/**",
      "**/node_modules/**",
      "public/**",
      "**/*.json",
      ".pnpm-store/**",
    ],
  },

  // 2) TS 推荐规则（TypeScript 项目禁用 no-undef，由 TS 自身处理）
  ...tsPlugin.configs.recommended,

  // 3) Vue 文件专用配置
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsPlugin.parser,
        sourceType: "module",
      },
    },
    plugins: { vue: vuePlugin },
    rules: {
      ...vuePlugin.configs["flat/recommended"].rules,
      "vue/multi-word-component-names": "off",
    },
  },

  // 4) 通用 JS / TS 文件
  {
    files: ["**/*.{js,ts,tsx}"],
  },

  // 5) Prettier 集成
  eslintConfigPrettier,
  {
    plugins: { prettier: prettierPlugin },
    rules: {
      "prettier/prettier": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE"],
        },
        {
          selector: "function",
          format: ["camelCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
    },
  },
);
