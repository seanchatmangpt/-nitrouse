// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  nitro: {
    experimental: {
      tasks: true,
    },
    scheduledTasks: {
      // Run `cms:update` task every minute
      "* * * * *": ["db:flow"],
    },
  },
  runtimeConfig: {
    NUXT_UI_PRO_LICENSE: process.env.NUXT_UI_PRO_LICENSE,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  },
});
