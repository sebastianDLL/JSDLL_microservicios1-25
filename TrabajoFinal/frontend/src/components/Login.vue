<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login'])
const email = ref('')
const password = ref('')
const error = ref('')
const token = ref('')

async function handleLogin() {
  error.value = ''
  token.value = ''
  const res = await fetch('http://localhost/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.value, password: password.value })
  })
  const data = await res.json()
  console.log('Respuesta del servidor:', data)
  if (data.token) {
    token.value = data.token
    emit('login', data.token)
  } else {
    error.value = data.message || 'Error al iniciar sesión'
  }
  if (data.token) {
    console.log(data.token)
    console.log('Token recibido:', data.token)
    localStorage.setItem('token', data.token)
    emit('login', data.token)
    // dentro del token esta informacion como el rol del usuario lo guardamos en localStorage
    localStorage.setItem('userId', data.user.id)
    localStorage.setItem('role', data.user.role)
    localStorage.setItem('email', data.user.email)
  } else {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
  }
  // Redirige al home si el login es exitoso
  if (data.token) {


    window.location.href = '/' // Redirige al home
  }
}
</script>

<template>
  <form @submit.prevent="handleLogin">
    <h2>Login</h2>
    <input v-model="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <button type="submit">Entrar</button>
    <div v-if="error" style="color:red">{{ error }}</div>
    <div v-if="token" style="word-break:break-all">
      <strong>Token JWT:</strong>
      <div>{{ token }}</div>
    </div>
  </form>
</template>

<style scoped>
form {
  max-width: 450px;
  margin: 100px auto;
  padding: 32px 28px 24px 28px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.10), 0 1.5px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

h2 {
  text-align: center;
  margin-bottom: 12px;
  font-size: 2rem;
  color: #222;
  letter-spacing: 1px;
  font-weight: 700;
}

input {
  width: 90%;
  padding: 12px 14px;
  margin: 0;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  background: #f8f9fa;
  font-size: 1rem;
  transition: border-color 0.2s;
  outline: none;
}

input:focus {
  border-color: #4f8cff;
  background: #fff;
}

button {
  width: 97%;
  padding: 12px;
  background: linear-gradient(90deg, #4f8cff 0%, #38c6d9 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(79, 140, 255, 0.10);
  transition: background 0.2s, transform 0.1s;
}

button:hover {
  background: linear-gradient(90deg, #357ae8 0%, #2bb3c0 100%);
  transform: translateY(-2px) scale(1.01);
}

div[style*="color:red"] {
  color: #e74c3c !important;
  background: #fdecea;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.98rem;
  margin-top: 0;
  text-align: center;
}

div[style*="word-break:break-all"] {
  background: #f3f8ff;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 0.95rem;
  color: #333;
  margin-top: 0;
  word-break: break-all;
}

div strong {
  color: #4f8cff;
  margin-bottom: 4px;
  font-size: 1rem;
  font-weight: 600;
  display: block;
}
</style>
|