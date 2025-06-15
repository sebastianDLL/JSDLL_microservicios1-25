<script setup>
import { ref, onMounted, computed } from 'vue'

const doctores = ref([])
const especialidades = ref([])
const filtroEspecialidad = ref('')
const error = ref('')
const loading = ref(true)
const token = localStorage.getItem('token')
const rol = localStorage.getItem('role')

// Formulario de registro
const email = ref('')
const password = ref('')
const regLoading = ref(false)
const regError = ref('')
const regSuccess = ref('')

// Modal
const showModal = ref(false)

// Traer especialidades
async function fetchEspecialidades() {
  try {
    const res = await fetch('http://localhost/agenda/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `query { specialties { id name } }` })
    })
    const data = await res.json()
    console.log('Especialidades recibidas:', data)
    especialidades.value = data.data.specialties
  } catch (err) {
    console.log('Error al obtener especialidades:', err)
    // No es crítico
  }
}

// Traer agendas de doctores (con especialidades)
async function fetchDoctorSchedules() {
  const res = await fetch('http://localhost/agenda/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query {
          doctorSchedules {
            doctorId
            specialties { id name }
          }
        }
      `
    })
  })
  const data = await res.json()
  console.log('Doctor schedules recibidos:', data)
  return data.data.doctorSchedules
}

// Traer usuarios doctores
async function fetchDoctores() {
  try {
    const res = await fetch('http://localhost/doctores', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    if (!res.ok) {
      throw new Error('Error al obtener los doctores')
    }
    const data = await res.json()
    // Traer agendas y agrupar especialidades por doctorId
    const doctorSchedules = await fetchDoctorSchedules()
    // Agrupar especialidades por doctorId
    const especialidadesPorDoctor = {}
    doctorSchedules.forEach(sch => {
      if (!especialidadesPorDoctor[sch.doctorId]) {
        especialidadesPorDoctor[sch.doctorId] = []
      }
      sch.specialties.forEach(esp => {
        // Evitar duplicados
        if (!especialidadesPorDoctor[sch.doctorId].some(e => e.id === esp.id)) {
          especialidadesPorDoctor[sch.doctorId].push(esp)
        }
      })
    })
    // Combinar con los datos de usuario
    doctores.value = (data.medicos || []).map(doc => {
      return {
        ...doc,
        especialidades: especialidadesPorDoctor[doc.id] || []
      }
    })
    loading.value = false
  } catch (err) {
    error.value = 'Error al obtener los doctores'
    loading.value = false
  }
}

async function registrarDoctor() {
  regError.value = ''
  regSuccess.value = ''
  regLoading.value = true
  try {
    const res = await fetch('http://localhost/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        role: 'Medico'
      })
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.message || 'Error al registrar doctor')
    }
    regSuccess.value = 'Doctor registrado exitosamente'
    email.value = ''
    password.value = ''
    fetchDoctores()
    showModal.value = false
  } catch (err) {
    regError.value = err.message
  } finally {
    regLoading.value = false
  }
}

function openModal() {
  regError.value = ''
  regSuccess.value = ''
  email.value = ''
  password.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

const doctoresFiltrados = computed(() => {
  if (!filtroEspecialidad.value) return doctores.value
  return doctores.value.filter(doc =>
    doc.especialidades.some(esp => esp.id === filtroEspecialidad.value)
  )
})

onMounted(async () => {
  await fetchEspecialidades()
  await fetchDoctores()
})
</script>

<template>
  <div>
    <h1>Doctores</h1>
    <div v-if="loading">Cargando doctores...</div>
    <div v-if="error" style="color: red">{{ error }}</div>
    <template v-if="!error">
      <div v-if="!doctores || doctores.length === 0" style="color: #888;">
        No hay doctores registrados.
      </div>
      <div v-else class="cards-container">
        <div v-for="doctor in doctoresFiltrados" :key="doctor.id" class="paciente-card">
          <div class="paciente-avatar">
            <span>{{ doctor.nombre ? doctor.nombre.charAt(0).toUpperCase() : doctor.email.charAt(0).toUpperCase()
            }}</span>
          </div>
          <div class="paciente-info">
            <div class="paciente-id">ID: {{ doctor.id }}</div>
            <div class="paciente-email">{{ doctor.email }}</div>
            <div class="paciente-especialidad">
              Especialidades:
              <ul>
                <li v-for="esp in doctor.especialidades" :key="esp.id">{{ esp.name }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </template>
    <button v-if="rol === 'admin'" @click="openModal" style="margin-top:2em;">Registrar Doctor</button>
  </div>
  <!-- Modal -->
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <button class="modal-close" @click="closeModal">&times;</button>
      <h3>Registrar Doctor</h3>
      <form @submit.prevent="registrarDoctor">
        <div>
          <label>Email:</label>
          <input v-model="email" type="email" required />
        </div>
        <div>
          <label>Contraseña:</label>
          <input v-model="password" type="password" required />
        </div>
        <button type="submit" :disabled="regLoading">Registrar</button>
      </form>
      <div v-if="regLoading">Registrando...</div>
      <div v-if="regError" style="color: red">{{ regError }}</div>
      <div v-if="regSuccess" style="color: green">{{ regSuccess }}</div>
    </div>
  </div>
</template>

<style scoped>
.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2em;
  margin-top: 2em;
  justify-content: flex-start;
}

.paciente-card {
  background: linear-gradient(135deg, #f8fafc 60%, #e3f0ff 100%);
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(0, 123, 255, 0.10), 0 1.5px 8px rgba(0, 0, 0, 0.04);
  padding: 1.7em 1.5em 1.3em 1.5em;
  min-width: 250px;
  max-width: 300px;
  display: flex;
  align-items: flex-start;
  transition: box-shadow 0.2s, transform 0.15s;
  border: 1.5px solid #e3eafc;
  position: relative;
}

.paciente-card:hover {
  box-shadow: 0 8px 32px rgba(0, 123, 255, 0.18), 0 2px 12px rgba(0, 0, 0, 0.06);
  border-color: #007bff55;
  transform: translateY(-4px) scale(1.025);
}

.paciente-avatar {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #007bff33 60%, #6ec1e4 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.1em;
  color: #007bff;
  font-weight: bold;
  margin-right: 1.2em;
  flex-shrink: 0;
  box-shadow: 0 2px 8px #007bff22;
}

.paciente-info {
  display: flex;
  flex-direction: column;
  gap: 0.4em;
  flex: 1;
}

.paciente-id {
  font-size: 0.98em;
  color: #7a7a7a;
  margin-bottom: 0.1em;
}

.paciente-email {
  font-size: 1.13em;
  color: #222;
  font-weight: 600;
  margin-bottom: 0.2em;
  word-break: break-all;
}

.paciente-especialidad {
  font-size: 1em;
  color: #444;
  margin-top: 0.5em;
}

.paciente-especialidad ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
  margin: 0.3em 0 0 0;
  padding: 0;
  list-style: none;
}

.paciente-especialidad li {
  background: linear-gradient(90deg, #007bff 60%, #6ec1e4 100%);
  color: #fff;
  border-radius: 16px;
  padding: 0.35em 1em;
  font-size: 0.97em;
  font-weight: 500;
  margin: 0;
  border: none;
  transition: background 0.2s;
  box-shadow: 0 1px 4px #007bff22;
  letter-spacing: 0.01em;
}

.paciente-especialidad li:hover {
  background: linear-gradient(90deg, #0056b3 60%, #007bff 100%);
  color: #fff;
}

h1 {
  color: #2a2a2a;
  font-weight: 700;
  letter-spacing: 0.01em;
  margin-bottom: 0.5em;
}

button {
  margin: 0.5em;
  padding: 0.6em 1.2em;
  background: linear-gradient(90deg, #007bff 70%, #6ec1e4 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1em;
  box-shadow: 0 2px 8px #007bff22;
  transition: background 0.2s, box-shadow 0.2s;
}

button:disabled {
  background: #aaa;
  box-shadow: none;
}

/* Modal styles (igual que antes) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  padding: 2em;
  border-radius: 8px;
  min-width: 320px;
  max-width: 90vw;
  position: relative;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
}

.modal-close {
  position: absolute;
  top: 0.5em;
  right: 0.7em;
  background: none;
  border: none;
  font-size: 2em;
  color: #888;
  cursor: pointer;
}

form {
  max-width: 400px;
  margin: 1em auto 0 auto;
  padding: 1em 0 0 0;
  border: none;
  border-radius: 8px;
  background: none;
}

label {
  display: block;
  margin-bottom: 0.5em;
  color: #333;
}

input {
  width: 100%;
  padding: 0.5em;
  margin-bottom: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
