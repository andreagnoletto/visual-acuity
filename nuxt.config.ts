// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@vuetify/nuxt'],
  css: ['@mdi/font/css/materialdesignicons.css', 'vuetify/styles'],
  vuetify: {
    vuetifyOptions: {
      theme: {
        defaultTheme: 'day',
        themes: {
          day: {
            dark: false,
            colors: {
              background: '#ffffff',
              surface: '#f5f5f5',
              primary: '#0066cc',
              secondary: '#0052a3',
              warning: '#ffc107',
              error: '#ff5252',
              success: '#00c853',
              info: '#2196f3'
            }
          },
          night: {
            dark: true,
            colors: {
              background: '#000000',
              surface: '#1a1a1a',
              primary: '#00ff00',
              secondary: '#00cc00',
              warning: '#ffc107',
              error: '#ff5252',
              success: '#00c853',
              info: '#90caf9'
            }
          }
        }
      }
    }
  }
})
