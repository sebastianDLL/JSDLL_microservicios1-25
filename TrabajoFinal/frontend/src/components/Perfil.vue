<script setup>
import { ref, onMounted } from 'vue'

const user = ref({})
const error = ref('')
const loading = ref(true)

async function fetchPerfil() {
    try {
        const res = await fetch('http://localhost/profile', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        if (!res.ok) {
            throw new Error('Error al obtener el perfil')
        }
        const data = await res.json()
        console.log('Perfil recibido:', data)
        user.value = data.usuario || data.user || data
    } catch (err) {
        console.error('Error al obtener el perfil:', err)
        error.value = 'Error al obtener el perfil'
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchPerfil()
})
</script>
<template>
    <div class="perfil-container" v-if="!loading">
        <div v-if="error" class="error">{{ error }}</div>
        <div v-else>
            <div class="perfil-card">
                <img src="https://randomuser.me/api/portraits/lego/1.jpg" alt="Foto de perfil" class="perfil-foto" />
                <div class="perfil-info">
                    <p><strong>ID:</strong> {{ user.id }}</p>
                    <p><strong>Email:</strong> {{ user.email }}</p>
                    <p><strong>Rol:</strong> {{ user.role }}</p>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="loading">Cargando perfil...</div>
</template>

<style scoped>
.perfil-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
}

.perfil-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    display: flex;
    align-items: center;
    gap: 2rem;
}

.perfil-foto {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
}

.perfil-info p {
    margin: 0.5rem 0;
}

.error {
    color: #c00;
}

.loading {
    text-align: center;
    font-size: 1.2rem;
}
</style>
