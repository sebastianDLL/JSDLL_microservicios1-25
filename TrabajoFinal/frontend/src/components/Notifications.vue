<template>
  <div>
    <h2>Notificaciones</h2>
    <ul>
      <li v-for="(n, i) in notifications" :key="i">{{ n.message || n }}</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
const props = defineProps(['token'])
const notifications = ref([])

async function load() {
  if (!props.token) return
  const res = await fetch('/notificaciones/', {
    headers: { Authorization: `Bearer ${props.token}` }
  })
  notifications.value = await res.json()
}
watch(() => props.token, load)
onMounted(load)
</script>