<script setup>
import { ref, computed, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const pestañas = ref([
  { nombre: 'Inicio', ruta: '/', oculto: false },
  { nombre: 'Agenda', ruta: '/agenda', oculto: false },
  { nombre: 'Pacientes', ruta: '/pacientes', oculto: false },
  { nombre: 'Doctores', ruta: '/doctores', oculto: false },
  { nombre: 'Especialidades', ruta: '/especialidades', oculto: false },
  { nombre: 'Reservas', ruta: '/citas', oculto: false },
])

const rol = computed(() => localStorage.getItem('role'))

// Computed property para filtrar pestañas visibles
const pestañasVisibles = computed(() => {
  return pestañas.value.filter(pestaña => {
    const rolActual = rol.value

    switch (pestaña.nombre) {
      case 'Especialidades':
        // Solo admin puede ver Especialidades
        return rolActual === 'admin'

      case 'Agenda':
        // Solo Medico puede ver Agenda
        return rolActual === 'Medico'

      case 'Reservas':
        // Solo cliente puede ver Reservas
        return rolActual === 'cliente'

      case 'Doctores':
        // Todos pueden ver Doctores por especialidad
        return true

      case 'Pacientes':
        // Admin y Medico pueden ver Pacientes
        return rolActual === 'admin'

      case 'Inicio':
        // Todos pueden ver Inicio
        return true

      default:
        return true
    }
  })
})

console.log('Rol actual:', rol.value)
console.log('Pestañas visibles:', pestañasVisibles.value)

const pestañaActiva = ref('/')
const cambiarPestaña = (ruta) => {
  pestañaActiva.value = ruta
  router.push(ruta)
}

const props = defineProps({
  token: String
})

const emit = defineEmits(['logout'])
function handleLogout() {
  emit('logout')
}
</script>

<template>
  <header v-if="token">
    <nav>
      <!-- Enlaces de navegación alineados a la izquierda -->
      <ul>
        <li v-for="pestaña in pestañasVisibles" :key="pestaña.ruta">
          <a href="#" :class="{ 'active': pestañaActiva === pestaña.ruta }"
            @click.prevent="cambiarPestaña(pestaña.ruta)">
            {{ pestaña.nombre }}
          </a>
        </li>
      </ul>

      <!-- Botones de perfil y cerrar sesión alineados a la derecha -->
      <div class="nav-right">
        <a v-if="token" href="#" @click.prevent="cambiarPestaña('/perfil')" class="nav-link">
          Ver perfil
        </a>
        <button v-if="token" @click="handleLogout">
          Cerrar sesión
        </button>
      </div>
    </nav>
  </header>
</template>

<style scoped>
header {
  background: linear-gradient(90deg, #4f8cff 0%, #235390 100%);
  color: #fff;
  padding: 1em 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1em;
}

nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 1.5em;
}

nav li {
  margin: 0;
}

nav a {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.08em;
  padding: 0.5em 1.1em;
  border-radius: 6px;
  transition: background 0.18s, color 0.18s;
  display: inline-block;
}

nav a:hover,
nav a.active {
  background: rgba(255, 255, 255, 0.18);
  color: #ffe082;
  text-decoration: none;
}

/* Contenedor para los elementos del lado derecho */
.nav-right {
  display: flex;
  align-items: center;
  gap: 1.5em;
}

/* Estilo específico para el enlace "Ver perfil" */
.nav-right .nav-link {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.08em;
  padding: 0.5em 1.1em;
  border-radius: 6px;
  transition: background 0.18s, color 0.18s;
  display: inline-block;
}

.nav-right .nav-link:hover {
  background: rgba(255, 255, 255, 0.18);
  color: #ffe082;
  text-decoration: none;
}

nav button {
  background: linear-gradient(90deg, #ff5e62 0%, #ff9966 100%);
  color: #fff;
  border: none;
  padding: 0.6em 1.5em;
  border-radius: 6px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(255, 94, 98, 0.08);
  transition: background 0.18s, box-shadow 0.18s;
}

nav button:hover {
  background: linear-gradient(90deg, #ff9966 0%, #ff5e62 100%);
  box-shadow: 0 4px 16px rgba(255, 94, 98, 0.16);
}

nav button:focus {
  outline: 2px solid #ffe082;
}

nav button:active {
  background: #ff5e62;
}

nav button:disabled {
  background: #bbb;
  cursor: not-allowed;
  color: #eee;
  box-shadow: none;
}
</style>