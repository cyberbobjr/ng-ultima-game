<script setup lang="ts">
import PhaserGame from './components/PhaserGame.vue'
</script>

<template>
  <div class="app-container">
    <header>
      <h1>🎮 Ultima Game - Migration Vue.js + Phaser</h1>
      <p class="status">Phase 1 : Projet initialisé avec succès ✅</p>
    </header>

    <main>
      <PhaserGame />
    </main>

    <footer>
      <p>
        <strong>Technologies:</strong> Vue.js 3 + TypeScript + Phaser 3 + Pinia + Vite
      </p>
      <p class="info">
        Le canvas Phaser devrait s'afficher ci-dessus avec une grille de tuiles de test
      </p>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #ffffff;
}

header {
  text-align: center;
  padding: 2rem 1rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid #444;
}

header h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
  color: #00ff00;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
}

.status {
  margin: 0;
  font-size: 1.1rem;
  color: #ffcc00;
}

main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem 1rem;
}

footer {
  text-align: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-top: 2px solid #444;
  font-size: 0.9rem;
}

footer p {
  margin: 0.5rem 0;
}

.info {
  color: #aaa;
  font-style: italic;
}
</style>

<style>
/* Styles globaux */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  overflow-x: hidden;
}
</style>
