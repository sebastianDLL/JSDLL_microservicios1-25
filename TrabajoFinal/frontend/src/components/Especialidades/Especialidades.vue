<script setup>
import { ref, computed } from 'vue'
import EspecialidadesLista from './EspecialidadesLista.vue'
import EspecialidadesCrear from './EspecialidadesCrear.vue'

const listaRef = ref(null)

// Recuperar el rol del localStorage
const rol = localStorage.getItem('role')
console.log(`Rol recuperado: ${rol}`);


// Computed para saber si es cliente
const esCliente = computed(() => rol === 'Paciente' || rol === 'Cliente')

// Manejar cuando se crea una nueva especialidad
function handleEspecialidadCreada(nuevaEspecialidad) {
  if (listaRef.value) {
    listaRef.value.cargarEspecialidades()
  }
}
</script>

<template>
  <div>
    <h2>Gestión de Especialidades</h2>

    <!-- Solo mostrar el formulario de crear si NO es cliente -->
    <EspecialidadesCrear v-if="!esCliente" @especialidad-creada="handleEspecialidadCreada" />

    <hr style="margin: 2em 0; border: none; border-top: 1px solid #ddd;" />

    <!-- Siempre mostrar la lista -->
    <EspecialidadesLista ref="listaRef" />
  </div>
</template>

<style scoped>
/* Estilos generales del contenedor principal */
</style>