<script setup>
import { ref, onMounted } from 'vue'

const especialidades = ref([])
const loading = ref(false)
const error = ref('')
const token = localStorage.getItem('token')

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
  console.log("Especialidades obtenidas", data)
  if (data) especialidades.value = data.specialties
}

// Eliminar especialidad
async function eliminarEspecialidad(id) {
  if (!confirm('¿Desactivar esta especialidad?')) return
  const mutation = `
        mutation($id: ID!) {
            deactivateSpecialty(id: $id) {
                id
                name
                isActive
            }
        }
    `
  const data = await gqlRequest(mutation, { id })
  if (data && data.deactivateSpecialty) {
    // Opcional: recargar la lista o actualizar el estado localmente
    await cargarEspecialidades()
  }
}

// Exponer función para recargar desde componente padre
defineExpose({
  cargarEspecialidades
})

onMounted(cargarEspecialidades)
</script>

<template>
  <div>
    <h3>Lista de Especialidades</h3>
    <div v-if="error" style="color:red">{{ error }}</div>
    <div v-if="loading">Cargando...</div>

    <!-- Listado de especialidades -->
    <table border="1" cellpadding="5">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Activo</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="esp in especialidades" :key="esp.id">
          <td>{{ esp.name }}</td>
          <td>{{ esp.description }}</td>
          <td>{{ esp.isActive ? 'Sí' : 'No' }}</td>
          <td>
            <button @click="eliminarEspecialidad(esp.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1em;
}

th,
td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}

td button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}

td button:hover {
  background-color: #d32f2f;
}

td button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

td button:disabled:hover {
  background-color: #ccc;
}
</style>