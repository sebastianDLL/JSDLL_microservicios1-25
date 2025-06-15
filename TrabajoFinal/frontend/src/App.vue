<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import { useRouter } from 'vue-router'
import { ref, watchEffect } from 'vue'

const router = useRouter()
const token = ref(localStorage.getItem('token'))

// Mantén el token sincronizado con localStorage
watchEffect(() => {
  if (token.value) {
    localStorage.setItem('token', token.value)
  } else {
    localStorage.removeItem('token')
  }
})

// Escucha eventos de login/logout si los emites desde Login.vue
function onLogin(newToken) {
  token.value = newToken
  router.push('/agenda')
}

function logout() {
  token.value = null
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('role')
  localStorage.removeItem('email')
  router.push('/login')
}
</script>

<template>
  <div class="app-container">
    <Header :token="token" @logout="logout" />
    <main class="main-content">
      <router-view @login="onLogin" :token="token" :user />
    </main>
    <Footer />
  </div>
</template>

<style>
.app-container {
  min-height: 98vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>