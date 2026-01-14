// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@vueuse/nuxt", "@nuxtjs/tailwindcss"],
  runtimeConfig: {
    public: {
      wsServer: "https://data.elektron.art",
    },
  },
});
