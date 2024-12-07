module.exports = {
  content: [
    './views/**/*.ejs',  
    './public/**/*.html'
  ],
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui')
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["cupcake"],  
  },
}
