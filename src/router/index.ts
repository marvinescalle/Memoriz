// Composables
import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "index",
      component: () => import("@/views/Index.vue"),
    },
    {
      path: "/quizz",
      name: "Quizz",
      component: () => import("@/views/Quizz.vue"),
    },
    {
      path: "/cartes",
      name: "cartes",
      component: () => import("@/views/Cartes.vue"),
    },
  ],
})

export default router
