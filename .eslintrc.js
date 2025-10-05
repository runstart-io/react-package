module.exports = {
  env: {
    browser: true,
  },
  parserOptions: {
    jsx: true,
  },
  extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
  overrides: [
    {
      rules: {
        'react/prop-types': 'off',
      },
    },
  ],
};
