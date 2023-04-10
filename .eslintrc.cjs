module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ["xo", "prettier"],
  overrides: [
    {
      extends: ["xo-typescript", "prettier"],
      files: ["*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/consistent-type-definitions": [
          "error",
          "interface",
        ],
        "@typescript-eslint/naming-convention": "off",
        "@typescript-eslint/consistent-type-assertions": "off",
        "@typescript-eslint/ban-types": ["error", { types: { "{}": false } }],
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-implicit-coercion": "off",
    "new-cap": ["error", { capIsNewExceptions: ["Router"] }],
    "max-nested-callbacks": "off",
  },
};
