// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@vuetify/nuxt'],
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
              secondary: '#333333',
              error: '#ffc107',
              'on-background': '#000000',
              'on-surface': '#000000'
            }
          },
          night: {
            dark: true,
            colors: {
              background: '#000000',
              surface: '#1a1a1a',
              primary: '#00ff00',
              secondary: '#cccccc',
              error: '#ffc107',
              'on-background': '#ffffff',
              'on-surface': '#ffffff'
            }
          },
          highContrastDay: {
            dark: true,
            colors: {
              background: '#000000',
              surface: '#ffffff',
              primary: '#00ff00',
              secondary: '#000000',
              error: '#ffc107',
              'on-background': '#ffffff',
              'on-surface': '#000000'
            }
          },
          highContrastNight: {
            dark: true,
            colors: {
              background: '#000000',
              surface: '#1a1a1a',
              primary: '#00ff00',
              secondary: '#ffffff',
              error: '#ffc107',
              'on-background': '#ffffff',
              'on-surface': '#ffffff'
            }
          }
        }
      }
    }
  }
})
