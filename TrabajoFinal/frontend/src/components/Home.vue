<script setup>

import { ref } from 'vue';
import { onMounted } from 'vue';

onMounted(() => {
    document.title = 'Agenda App - Home';
    console.log(localStorage.getItem('token') ? 'Usuario autenticado' : 'Usuario no autenticado');
    console.log('Token JWT:', localStorage.getItem('token'));
    console.log('Rol del usuario:', localStorage.getItem('role'));
});
</script>

<template>

    <div class="home-container">
        <h1>Bienvenido a la Aplicación de Agenda</h1>
        <p>Esta es una aplicación de ejemplo para gestionar citas médicas.</p>
        <p>Utiliza el menú para navegar entre las diferentes secciones.</p>
    </div>

</template>

<style scoped>

h1 {
    color: #333;
    font-size: 2em;
    margin-bottom: 0.5em;
}
p {
    color: #666;
    font-size: 1.2em;
    margin-bottom: 1em;
}

h2 {
    color: #444;
    font-size: 1.5em;
    margin-top: 1em;
}

.home-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    text-align: center;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}   

</style>