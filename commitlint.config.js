// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow scopes like US-01, ci, hooks, etc.
    'scope-case': [0],
  },
};
