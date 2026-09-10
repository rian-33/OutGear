import eslint from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";

export default [
  { ignores: ["node_modules/", "dist/", "coverage/"] },
  eslint.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser },
    },
    plugins: {
      react: reactPlugin,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-undef": "off",
      "react/jsx-uses-vars": "error",
    },
  },
];