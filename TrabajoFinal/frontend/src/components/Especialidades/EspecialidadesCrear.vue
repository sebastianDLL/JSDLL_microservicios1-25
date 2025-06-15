<script setup>
import { ref } from 'vue'

const loading = ref(false)
const error = ref('')
const nuevaEspecialidad = ref({
  name: '',
  description: ''
})
const token = localStorage.getItem('token')

// Emitir evento cuando se crea una especialidad
const emit = defineEmits(['especialidad-creada'])

// Función para peticiones GraphQL
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

// Crear especialidad
async function crearEspecialidad() {
  const mutation = `
    mutation($input: SpecialtyInput!) {
      createSpecialty(input: $input) {
        id
        name
        description
        isActive
      }
    }
  `
  const data = await gqlRequest(mutation, { input: nuevaEspecialidad.value })
  if (data) {
    // Limpiar formulario
    nuevaEspecialidad.value.name = ''
    nuevaEspecialidad.value.description = ''

    // Emitir evento al componente padre
    emit('especialidad-creada', data.createSpecialty)
  }
}
</script>

<template>
  <div>
    <h3>Nueva Especialidad</h3>
    <div v-if="error" style="color:red">{{ error }}</div>
    <div v-if="loading">Creando...</div>

    <!-- Formulario para crear nueva especialidad -->
    <form @submit.prevent="crearEspecialidad" style="margin-bottom:2em">
      <div style="margin-bottom: 1em">
        <input v-model="nuevaEspecialidad.name" placeholder="Nombre de la especialidad" required />
      </div>
      <div style="margin-bottom: 1em">
        <textarea v-model="nuevaEspecialidad.description" placeholder="Descripción de la especialidad" rows="4"
          required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Creando...' : 'Crear Especialidad' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
input,
textarea {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

input:focus,
textarea:focus {
  border-color: #007bff;
  outline: none;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
}

button:hover {
  background-color: #0056b3;
}

button:focus {
  outline: none;
}

button:active {
  background-color: #004494;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

button:disabled:hover {
  background-color: #ccc;
}
</style>