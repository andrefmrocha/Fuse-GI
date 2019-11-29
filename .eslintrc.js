module.exports = {
  extends: ['prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'comma-dangle': ['error', 'never'],
    'import/no-extraneous-dependencies': 'off',
    'max-len': ['error', { code: 120 }],
    'prefer-destructuring': 'off'
  },
  env: {
    browser: true,
    es6: true
  }
};
