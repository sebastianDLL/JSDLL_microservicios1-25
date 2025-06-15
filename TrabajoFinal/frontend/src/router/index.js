import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/Login.vue";
import Register from "../components/Register.vue";
import Notifications from "../components/Notifications.vue";
import Agenda from "../components/Agenda.vue";
import Especialidades from "../components/Especialidades/Especialidades.vue";
import Pacientes from "../components/Pacientes.vue";

const routes = [
  {
    path: "/",
    component: () => import("../components/Home.vue"),
    meta: { requiresAuth: true },
  },
  { path: "/agenda", component: Agenda, meta: { requiresAuth: true } },
  {
    path: "/notificaciones",
    component: Notifications,
    meta: { requiresAuth: true },
  },
  { path: "/login", component: Login },
  { path: "/register", component: Register, meta: { requiresAuth: true } },
  {
    path: "/perfil",
    component: () => import("../components/Perfil.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/especialidades",
    component: Especialidades,
    meta: { requiresAuth: true },
  },
  { path: "/pacientes", component: Pacientes, meta: { requiresAuth: true } },
  {
    path: "/citas",
    component: () => import("../components/Reservas.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/doctores",
    component: () => import("../components/Doctores.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Protección de rutas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else {
    next();
  }
});

export default router;
