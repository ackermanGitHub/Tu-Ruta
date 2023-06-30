/** @type {import("eslint").Linter.Config} */
const config = {
  root: true,
  extends: ["@acme/eslint-config"], // uses the config in `packages/config/eslint`
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    tsconfigRootDir: __dirname,
    project: [
      "./tsconfig.json",
      "./apps/expo/tsconfig.json",
      "./apps/nextjs/tsconfig.json",
      "./packages/api/tsconfig.json",
      "./packages/db/tsconfig.json",
    ],
  },
  settings: {
    next: {
      rootDir: ["apps/nextjs"],
    },
  },
};

module.exports = config;
