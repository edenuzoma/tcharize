import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Tcharize",
    description: "Read the web in Nigerian languages.",
    permissions: ["activeTab", "storage", "scripting"],
    host_permissions: [
      "http://localhost:4000/*",
      "https://tcharizeapi-production.up.railway.app/*",
    ],
    action: { default_title: "Tcharize this page" },
    icons: { 128: "icon.png" },
  },
});

