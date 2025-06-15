<script setup>
import { ref, onMounted, watch } from 'vue'

const appointments = ref([])
const schedules = ref([])
const loading = ref(false)
const error = ref('')
const user = localStorage.getItem('email');
console.log('Usuario logueado:', user)
const idUser = localStorage.getItem('userId');
const newAppointment = ref({
  doctorId: '',
  patientId: '',
  specialtyId: '',
  appointmentDate: '',
  startTime: '',
  endTime: '',
  notes: ''
})
const token = localStorage.getItem('token')
const role = localStorage.getItem('role')

const especialidades = ref([])
const newSchedule = ref({
  doctorId: '',
  specialtyIds: [],
  weeklySchedule: [
    {
      dayOfWeek: 1,
      timeSlots: [
        { startTime: '', endTime: '', isAvailable: true }
      ],
      isWorkingDay: true
    }
  ]
})

// Estados para edición
const editingSchedule = ref(null)
const editScheduleData = ref({
  id: '',
  doctorId: '',
  specialtyIds: [],
  weeklySchedule: [
    {
      dayOfWeek: 1,
      timeSlots: [
        { startTime: '', endTime: '', isAvailable: true }
      ],
      isWorkingDay: true
    }
  ]
})

// --- WATCHERS PARA AUTOCALCULAR HORAS ---
let lastChanged = ref('start') // Para evitar bucles infinitos

watch(
  () => newSchedule.value.weeklySchedule[0].timeSlots[0].startTime,
  (newStart) => {
    if (lastChanged.value === 'end') return
    if (newStart && /^\d{1,2}(:\d{2})?$/.test(newStart)) {
      let [h, m] = newStart.split(':')
      h = parseInt(h)
      m = m ? parseInt(m) : 0
      if (!isNaN(h)) {
        let endH = h + 1
        if (endH > 23) endH = 0
        lastChanged.value = 'start'
        newSchedule.value.weeklySchedule[0].timeSlots[0].endTime =
          `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      }
    }
  }
)

watch(
  () => newSchedule.value.weeklySchedule[0].timeSlots[0].endTime,
  (newEnd) => {
    if (lastChanged.value === 'start') {
      lastChanged.value = 'end'
      return
    }
    if (newEnd && /^\d{1,2}(:\d{2})?$/.test(newEnd)) {
      let [h, m] = newEnd.split(':')
      h = parseInt(h)
      m = m ? parseInt(m) : 0
      if (!isNaN(h)) {
        let startH = h - 1
        if (startH < 0) startH = 23
        lastChanged.value = 'end'
        newSchedule.value.weeklySchedule[0].timeSlots[0].startTime =
          `${startH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      }
    }
  }
)

// Watchers para edición (similares a los de creación)
watch(
  () => editScheduleData.value.weeklySchedule[0].timeSlots[0].startTime,
  (newStart) => {
    if (lastChanged.value === 'end') return
    if (newStart && /^\d{1,2}(:\d{2})?$/.test(newStart)) {
      let [h, m] = newStart.split(':')
      h = parseInt(h)
      m = m ? parseInt(m) : 0
      if (!isNaN(h)) {
        let endH = h + 1
        if (endH > 23) endH = 0
        lastChanged.value = 'start'
        editScheduleData.value.weeklySchedule[0].timeSlots[0].endTime =
          `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      }
    }
  }
)

watch(
  () => editScheduleData.value.weeklySchedule[0].timeSlots[0].endTime,
  (newEnd) => {
    if (lastChanged.value === 'start') {
      lastChanged.value = 'end'
      return
    }
    if (newEnd && /^\d{1,2}(:\d{2})?$/.test(newEnd)) {
      let [h, m] = newEnd.split(':')
      h = parseInt(h)
      m = m ? parseInt(m) : 0
      if (!isNaN(h)) {
        let startH = h - 1
        if (startH < 0) startH = 23
        lastChanged.value = 'end'
        editScheduleData.value.weeklySchedule[0].timeSlots[0].startTime =
          `${startH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      }
    }
  }
)

// Función para hacer peticiones GraphQL
async function gqlRequest(query, variables = {}) {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('http://localhost/agenda/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ query, variables })
    })
    const data = await res.json()
    if (data.errors) throw new Error(data.errors[0].message)
    return data.data
  } catch (err) {
    error.value = err.message
    return null
  } finally {
    loading.value = false
  }
}

// Listar especialidades
async function cargarEspecialidades() {
  const query = `
    query {
      specialties {
        id
        name
        description
        isActive
        createdAt
        updatedAt
      }
    }
  `
  const data = await gqlRequest(query)
  if (data) especialidades.value = data.specialties
}

async function cargarSchedules() {
  const query = `
    query {
      doctorSchedules {
        id
        doctorId
        specialties { id name }
        weeklySchedule { 
          dayOfWeek 
          timeSlots { 
            startTime 
            endTime 
            isAvailable 
          } 
          isWorkingDay 
        }
        isActive
        createdAt
        updatedAt
      }
    }
  `
  const doctorId = localStorage.getItem('userId')
  const data = await gqlRequest(query)
  if (data) {
    schedules.value = doctorId
      ? data.doctorSchedules.filter(s => s.doctorId === doctorId)
      : data.doctorSchedules
  }
}

// Listar citas
async function loadAppointments() {
  const query = `
    query {
      appointments {
        id
        doctorId
        patientId
        specialty { id name }
        appointmentDate
        startTime
        endTime
        status
        notes
      }
    }
  `
  const data = await gqlRequest(query)
  if (data) appointments.value = data.appointments
}

// Actualizar estado de cita
async function updateStatus(id, status) {
  const mutation = `
    mutation($id: ID!, $status: String!) {
      updateAppointmentStatus(id: $id, status: $status) {
        id
        status
      }
    }
  `
  const data = await gqlRequest(mutation, { id, status })
  if (data) {
    const apt = appointments.value.find(a => a.id === id)
    if (apt) apt.status = data.updateAppointmentStatus.status
  }
}

// Cancelar cita
async function cancelAppointment(id) {
  const reason = prompt('Motivo de la cancelación:')
  if (!reason) return
  const mutation = `
    mutation($id: ID!, $reason: String) {
      cancelAppointment(id: $id, reason: $reason) {
        id
        status
        notes
      }
    }
  `
  const data = await gqlRequest(mutation, { id, reason })
  if (data) {
    const apt = appointments.value.find(a => a.id === id)
    if (apt) {
      apt.status = data.cancelAppointment.status
      apt.notes = data.cancelAppointment.notes
    }
  }
}

// Crear horario
async function createSchedule() {
  if (typeof newSchedule.value.specialtyIds === 'string') {
    newSchedule.value.specialtyIds = [newSchedule.value.specialtyIds]
  }

  newSchedule.value.doctorId = idUser

  // Asegurar que todos los campos estén correctamente formateados
  newSchedule.value.weeklySchedule[0] = {
    dayOfWeek: parseInt(newSchedule.value.weeklySchedule[0].dayOfWeek),
    timeSlots: [
      {
        startTime: newSchedule.value.weeklySchedule[0].timeSlots[0].startTime,
        endTime: newSchedule.value.weeklySchedule[0].timeSlots[0].endTime,
        isAvailable: true
      }
    ],
    isWorkingDay: true
  }

  const mutation = `
    mutation($input: DoctorScheduleInput!) {
      createDoctorSchedule(input: $input) {
        id
        doctorId
        specialties { id name }
        weeklySchedule { 
          dayOfWeek 
          timeSlots { 
            startTime 
            endTime 
            isAvailable 
          } 
          isWorkingDay 
        }
        isActive
        createdAt
        updatedAt
      }
    }
  `
  const data = await gqlRequest(mutation, { input: newSchedule.value })
  if (data) {
    // Reset form
    Object.assign(newSchedule.value, {
      doctorId: '',
      specialtyIds: [],
      weeklySchedule: [
        {
          dayOfWeek: 1,
          timeSlots: [{ startTime: '', endTime: '', isAvailable: true }],
          isWorkingDay: true
        }
      ]
    })
    await cargarSchedules() // Recargar la lista
  }
}

// Iniciar edición de horario
function startEditSchedule(schedule) {
  editingSchedule.value = schedule.id
  editScheduleData.value = {
    id: schedule.id,
    doctorId: schedule.doctorId,
    specialtyIds: schedule.specialties.map(s => s.id),
    weeklySchedule: [
      {
        dayOfWeek: schedule.weeklySchedule[0].dayOfWeek,
        timeSlots: [
          {
            startTime: schedule.weeklySchedule[0].timeSlots[0].startTime,
            endTime: schedule.weeklySchedule[0].timeSlots[0].endTime,
            isAvailable: schedule.weeklySchedule[0].timeSlots[0].isAvailable !== undefined
              ? schedule.weeklySchedule[0].timeSlots[0].isAvailable
              : true
          }
        ],
        isWorkingDay: schedule.weeklySchedule[0].isWorkingDay
      }
    ]
  }
}

// Cancelar edición
function cancelEdit() {
  editingSchedule.value = null
  editScheduleData.value = {
    id: '',
    doctorId: '',
    specialtyIds: [],
    weeklySchedule: [
      {
        dayOfWeek: 1,
        timeSlots: [{ startTime: '', endTime: '', isAvailable: true }],
        isWorkingDay: true
      }
    ]
  }
}

// Guardar edición
async function saveEditSchedule() {
  if (typeof editScheduleData.value.specialtyIds === 'string') {
    editScheduleData.value.specialtyIds = [editScheduleData.value.specialtyIds]
  }

  editScheduleData.value.weeklySchedule[0] = {
    dayOfWeek: parseInt(editScheduleData.value.weeklySchedule[0].dayOfWeek),
    timeSlots: [
      {
        startTime: editScheduleData.value.weeklySchedule[0].timeSlots[0].startTime,
        endTime: editScheduleData.value.weeklySchedule[0].timeSlots[0].endTime,
        isAvailable: true
      }
    ],
    isWorkingDay: true
  }

  const mutation = `
    mutation($doctorId: String!, $input: DoctorScheduleInput!) {
      updateDoctorSchedule(doctorId: $doctorId, input: $input) {
        id
        doctorId
        specialties { id name }
        weeklySchedule { 
          dayOfWeek 
          timeSlots { 
            startTime 
            endTime 
            isAvailable 
          } 
          isWorkingDay 
        }
        isActive
        createdAt
        updatedAt
      }
    }
  `
  const data = await gqlRequest(mutation, {
    doctorId: editScheduleData.value.doctorId,
    input: {
      doctorId: editScheduleData.value.doctorId,
      specialtyIds: editScheduleData.value.specialtyIds,
      weeklySchedule: editScheduleData.value.weeklySchedule
    }
  })
  if (data) {
    cancelEdit()
    await cargarSchedules() // Recargar la lista
  }
}

// Eliminar horario
async function deleteSchedule(doctorId) {
  if (!confirm('¿Estás seguro de que quieres eliminar este horario?')) {
    return
  }

  const mutation = `
    mutation($doctorId: String!) {
      deleteDoctorSchedule(doctorId: $doctorId) {
        id
      }
    }
  `
  const data = await gqlRequest(mutation, { doctorId })
  if (data) {
    await cargarSchedules() // Recargar la lista
  }
}

// Función para obtener el nombre del día
function getDayName(dayNumber) {
  const days = {
    0: 'Domingo', // Ajustado para coincidir con el estándar JavaScript (0=Domingo)
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
  }
  return days[dayNumber] || 'Desconocido'
}

onMounted(() => {
  document.title = 'Agenda App - Horarios'
  loadAppointments()
  console.log('Token JWT:', token)
  console.log('Rol del usuario:', role)
  cargarEspecialidades()
  cargarSchedules()
})
</script>

<template>
  <div>
    <h2>Gestión de Horarios</h2>
    <div>
      <form @submit.prevent="createSchedule">
        <label>Especialidad:
          <select v-model="newSchedule.specialtyIds" required>
            <option disabled value="">Seleccione una</option>
            <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">{{ esp.name }}</option>
          </select>
        </label>
        <label>Día de la semana:
          <select v-model="newSchedule.weeklySchedule[0].dayOfWeek" required>
            <option v-for="n in 7" :key="n - 1" :value="n - 1">{{ getDayName(n - 1) }}</option>
          </select>
        </label>
        <label>Hora inicio:
          <input type="time" v-model="newSchedule.weeklySchedule[0].timeSlots[0].startTime" required>
        </label>
        <label>Hora fin:
          <input type="time" v-model="newSchedule.weeklySchedule[0].timeSlots[0].endTime" required>
        </label>
        <button type="submit">Crear horario</button>
      </form>
    </div>

    <table>
      <thead>
        <tr>
          <th>Especialidad</th>
          <th>Día</th>
          <th>Hora inicio</th>
          <th>Hora fin</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sch in schedules" :key="sch.id">
          <template v-if="editingSchedule === sch.id">
            <td>
              <select v-model="editScheduleData.specialtyIds" required>
                <option v-for="esp in especialidades" :key="esp.id" :value="esp.id">{{ esp.name }}</option>
              </select>
            </td>
            <td>
              <select v-model="editScheduleData.weeklySchedule[0].dayOfWeek" required>
                <option v-for="n in 7" :key="n - 1" :value="n - 1">{{ getDayName(n - 1) }}</option>
              </select>
            </td>
            <td>
              <input type="time" v-model="editScheduleData.weeklySchedule[0].timeSlots[0].startTime" required>
            </td>
            <td>
              <input type="time" v-model="editScheduleData.weeklySchedule[0].timeSlots[0].endTime" required>
            </td>
            <td>
              <button class="btn-save" @click="saveEditSchedule">Guardar</button>
              <button class="btn-cancel" @click="cancelEdit">Cancelar</button>
            </td>
          </template>
          <template v-else>
            <td>{{sch.specialties.map(s => s.name).join(', ')}}</td>
            <td>{{ getDayName(sch.weeklySchedule[0].dayOfWeek) }}</td>
            <td>{{ sch.weeklySchedule[0].timeSlots[0].startTime }}</td>
            <td>{{ sch.weeklySchedule[0].timeSlots[0].endTime }}</td>
            <td>
              <button class="btn-edit" @click="startEditSchedule(sch)">Editar</button>
              <button class="btn-delete" @click="deleteSchedule(sch.doctorId)">Eliminar</button>
            </td>
          </template>
        </tr>
      </tbody>
    </table>

    <h2>Citas</h2>
    <table>
      <thead>
        <tr>
          <th>Especialidad</th>
          <th>Fecha</th>
          <th>Hora inicio</th>
          <th>Hora fin</th>
          <th>Estado</th>
          <th>Notas</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="apt in appointments" :key="apt.id">
          <td>{{ apt.specialty?.name }}</td>
          <td>{{ apt.appointmentDate }}</td>
          <td>{{ apt.startTime }}</td>
          <td>{{ apt.endTime }}</td>
          <td>{{ apt.status }}</td>
          <td>{{ apt.notes }}</td>
          <td>
            <button v-if="apt.status !== 'CANCELADA'" @click="cancelAppointment(apt.id)">Cancelar</button>
            <button v-if="apt.status === 'PENDIENTE'" @click="updateStatus(apt.id, 'CONFIRMADA')">Confirmar</button>
            <button v-if="apt.status === 'CONFIRMADA'" @click="updateStatus(apt.id, 'FINALIZADA')">Finalizar</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="loading">Cargando...</div>
    <div v-if="error" style="color: red;">{{ error }}</div>
  </div>
</template>

<style scoped>
h2 {
  color: #333;
  font-size: 1.5em;
  margin-bottom: 0.5em;
}

p {
  color: #666;
  font-size: 1.2em;
  margin-bottom: 1em;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1em;
}

th,
td {
  padding: 0.5em;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5em 1em;
  cursor: pointer;
  margin-right: 0.5em;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:disabled:hover {
  background-color: #ccc;
}

button:focus {
  outline: none;
}

button:active {
  background-color: #0056b3;
}

/* Botones específicos */
.btn-edit {
  background-color: #28a745;
}

.btn-edit:hover {
  background-color: #218838;
}

.btn-delete {
  background-color: #dc3545;
}

.btn-delete:hover {
  background-color: #c82333;
}

.btn-save {
  background-color: #007bff;
}

.btn-save:hover {
  background-color: #0056b3;
}

.btn-cancel {
  background-color: #6c757d;
}

.btn-cancel:hover {
  background-color: #5a6268;
}

input,
select {
  padding: 0.5em;
  margin: 0.5em 0;
  width: calc(100% - 1em);
  box-sizing: border-box;
}

input[type="date"],
input[type="time"] {
  width: auto;
}

input[type="date"] {
  padding: 0.5em;
  width: 150px;
}

input[type="time"] {
  width: 100px;
}

input[type="text"],
input[type="number"],
input[type="email"],
input[type="password"],
input[type="search"],
input[type="tel"],
input[type="url"],
input[type="datetime-local"],
input[type="month"],
input[type="week"],
input[type="time"] {
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

input:focus,
select:focus {
  border-color: #007bff;
  outline: none;
}

/* Estilos para inputs en modo edición */
td input {
  width: auto;
  margin: 0;
  padding: 0.3em;
}

td select {
  width: auto;
  margin: 0;
  padding: 0.3em;
}
</style>