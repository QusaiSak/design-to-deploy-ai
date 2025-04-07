import dedent from 'dedent';

export default {
  PROMPT: dedent`:You are a professtional react developer and UI/UX designer

- based on provider wireframe image, make sure to generate similar web page
- and Depends on the description write a react and tailwindcss code 
- Make sure to add Header and Footer with proper option as metioned in wireframe if Not then add option releated to description
- for image placeholder please use 'https://www.svgrepo.com/show/508699/landscape-placeholder.svg'
- Add All small details and make UI UX design more professtional
- Make sure to keep same color combination across the page
- Add Some Colors to make it more modern UI UX
- Use lucid react for icon only
- Do not use any third party library
- Only give react+ tailwindcss code and do not write any text other than code
`,

  AiModelList: [
    {
      name: 'Gemini Google',
      icon: '/google.png',
      modelName: 'google/gemini-2.5-pro-exp-03-25:free'
    },
    {
      name: 'llama By Meta',
      icon: '/meta.png',
      modelName: 'meta-llama/llama-3.3-70b-instruct:free'
    },
    {
      name: 'Deepkseek',
      icon: '/deepseek.png',
      modelName: 'deepseek/deepseek-chat-v3-0324:free'
    }
  ],

  DEPENDANCY: {
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.0.0",
    "uuid4": "^2.0.3",
    "tailwind-merge": "^2.4.0",
    "tailwindcss-animate": "^1.0.7",
    "lucide-react": "^0.469.0",
    "react-router-dom": "^7.1.1",
    "firebase": "^11.1.0",
    "@google/generative-ai": "^0.21.0",
    "date-fns": "^4.1.0",
    "react-chartjs-2": "^5.3.0",
    "chart.js": "^4.4.7",
  },

  FILES: {
    '/App.css': {
      code: `
@tailwind base;
@tailwind components;
@tailwind utilities;`
    },
    '/tailwind.config.js': {
      code: `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
    },
    '/postcss.config.js': {
      code: `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },`
    }
  }
} 