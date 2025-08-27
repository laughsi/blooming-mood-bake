export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxt/icon',
    '@pinia/nuxt',
  ],
  vite: {
    server: {
      proxy: {
        '^/api/': {
          target: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\//, '/api/'), 
        },
        '/uploads': {
          target: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
  },

  plugins: [
    '~/plugins/auth.ts',
  ],

  css: [
    '~/assets/css/main.scss',
  ],

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: '~/tailwind.config.js',
    exposeConfig: false,
    injectPosition: 'first',
    viewer: true,
  },

  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css',
        }
      ],
    },
  },

  googleFonts: {
    families: {
      'Dancing Script': {
        wght: [400, 700],
      },
      'Noto Sans KR': {
        wght: [300, 400, 500, 700],
      },
    },
    display: 'swap',
  },

  runtimeConfig: {
    googleClientSecret: process.env.NUXT_GOOGLE_CLIENT_SECRET,
    naverClientSecret: process.env.NUXT_NAVER_CLIENT_SECRET,
    kakaoClientSecret: process.env.NUXT_KAKAO_CLIENT_SECRET,

    public: {
      googleClientId: process.env.NUXT_PUBLIC_GOOGLE_CLIENT_ID,
      naverClientId: process.env.NUXT_PUBLIC_NAVER_CLIENT_ID,
      kakaoClientId: process.env.NUXT_PUBLIC_KAKAO_CLIENT_ID,

      googleRedirectUri: process.env.NUXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback/google',
      naverRedirectUri: process.env.NUXT_PUBLIC_NAVER_REDIRECT_URI || 'http://localhost:3000/auth/callback/naver',
      kakaoRedirectUri: process.env.NUXT_PUBLIC_KAKAO_REDIRECT_URI || 'http://localhost:3000/auth/callback/kakao',

      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '/api'
    }
  }
});