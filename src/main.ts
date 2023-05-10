import "@total-typescript/ts-reset"

import { createApp } from "vue"

import { registerPlugins } from "@/typescript/plugins"

import App from "./App.vue"
import database from "@/models"

database.init()
const app = createApp(App)

registerPlugins(app)

app.mount("#app")
