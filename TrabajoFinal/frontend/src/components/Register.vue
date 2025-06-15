
<template>
  <form @submit.prevent="handleRegister">
    <h2>Register</h2>
    <input v-model="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <button type="submit">Registrar</button>
    <div v-if="msg">{{ msg }}</div>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const msg = ref('')

async function handleRegister() {
  msg.value = ''
  const res = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.value, password: password.value })
  })
  const data = await res.json()
  msg.value = data.message || 'Registrado'
}
</script>