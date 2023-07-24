import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "edf320c6-faf8-46ac-9695-6f6a06d2db67",

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },

  env: {
    username: "don-t-search-it-here",
    password: "",
    some: "or-here",
    secret: "",
    levi: "neither-here",
    secretlevi: "",
//    backendUrl: "http://localhost:8000/",
    backendUrl: "https://goadmin-stage.ifrc.org/",
  },

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
