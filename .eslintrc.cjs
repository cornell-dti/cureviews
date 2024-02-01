module.exports = {
  root: true,
  env: {browser: true, es2020: true},
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  ignorePatterns: ["dist", "build", "server", "node_modules", ".eslintrc.cjs"],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "react-refresh/only-export-components": [
      "warn",
      {allowConstantExport: true},
    ],
  },
};

// Old .json file & settings:
/* {
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "jest": true,
    "jasmine": true
  },
  "plugins": ["@typescript-eslint"],
  "parser": "@typescript-eslint/parser",
  "extends": ["airbnb", "plugin:@typescript-eslint/recommended", "react-app"],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": 2019,
    "sourceType": "module"
  },
  "rules": {
    "@typescript-eslint/camelcase": "warn",
    "@typescript-eslint/class-name-casing": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-empty-function": "warn",
    "import/prefer-default-export": "off",
    "consistent-return": "warn",
    "guard-for-in": "warn",
    "import/extensions": "off",
    "max-len": ["warn", 160],
    "new-cap": "warn",
    "quotes": "off",
    "no-await-in-loop": "warn",
    "no-continue": "off",
    "no-nested-ternary": "off",
    "no-plusplus": "off",
    "no-prototype-builtins": "warn",
    "no-return-await": "off",
    "no-shadow": "warn",
    "no-underscore-dangle": "off",
    "no-unused-vars": "warn",
    "no-undef": "warn",
    "no-var": "error",
    "object-curly-newline": "off",
    "react/prop-types": "error",
    "react/no-string-refs": "warn",
    "react/no-deprecated": "warn"
  },
  "settings": {
    "react": {
      "version": "detect"
    },
    "import/resolver": {
      "node": {
        "extensions": [".js", ".json", ".ts", ".tsx"]
      }
    }
  }
}
 */
