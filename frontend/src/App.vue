<template>
  <div class="app-root">
    <!-- Unauthenticated / Login layout -->
    <template v-if="isGuestLayout">
      <router-view />
    </template>

    <!-- Authenticated App Layout -->
    <template v-else>
      <div class="app-container">
        <main class="main-content">
          <router-view />
        </main>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './store/auth';

const route = useRoute();
const auth = useAuthStore();

const isGuestLayout = computed(() => {
  return route.name === 'Login' || !auth.isAuthenticated.value;
});
</script>

<style>
.app-root {
  min-height: 100vh;
}
</style>
