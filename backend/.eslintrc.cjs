module.exports = {
  env: {
    node: true,
    es2022: true
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'no-console': 'off',
    semi: ['error', 'always'],
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }]
  }
};

