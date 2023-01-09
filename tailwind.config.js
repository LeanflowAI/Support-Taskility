module.exports = {
  important: true,
  purge: ['./components/**/*.*', './pages/**/*.*'],
  theme: {
    // defaults: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
    extend: {
      colors: {
        primary: '#0085ff',
        secondary: '#ebf0f5',
        shade: '#003eb6',
        dark: '#000000',
        dark2: '#6f7174',
        dark3: '#b8b9ba',
        text2: '#4a4a4a',
        gradient: '#4accf2',
        shadow: 'rgba(18, 65, 128, 0.67)',
        shadow2: 'rgba(235, 240, 245, 0.2)',

        info: '#0489ff',
        success: '#2Eca75',
        warning: '#FFD25F',
        error: '#FE5858',

        tkyBlue: {
          darkest: '#1e2437',
          navyDark: '#162a50',
          dark: '#003EB6',
          DEFAULT: '#0085ff',
          light: '#4ACCF2',
          lightest: '#00d4ff',
          navDark: '#0839be',
          navMedium: '#0d68f9',
          navLight: '#0a4ed9',

        },

        tkyWhite: '#ffffff',
        tkyGrey: {
          dark: '#333333',
          DEFAULT: '#6f7174',
          light: '#ebf0f5',
        },
        tkyBlack: '#3b3b3b',
        tkyGreen: '#53cf8c',
        tkyRed: '#f97474',
        tkyYellow: '#f5c723',
      },
    },
  },
  variants: {
    extend: { backgroundColor: ['responsive', 'hover', 'focus', 'active', 'odd'] },
  },
  fill: { current: 'currentColor' },
  corePlugins: {},
  plugins: [],
}
