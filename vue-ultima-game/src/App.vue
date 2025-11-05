<script setup lang="ts">
import PhaserGame from './components/PhaserGame.vue'
import CharacterSheet from './components/CharacterSheet.vue'
import InfoPanel from './components/InfoPanel.vue'
</script>

<template>
  <div class="game-layout">
    <!-- Left Panel: Character Sheet -->
    <aside class="character-panel">
      <CharacterSheet />
    </aside>

    <!-- Center: Game Canvas -->
    <main class="game-main">
      <PhaserGame />
    </main>

    <!-- Right Panel: Info/Log -->
    <aside class="info-panel">
      <InfoPanel />
    </aside>
  </div>
</template>

<style scoped>
.game-layout {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  height: 100vh;
  background: #000000;
  color: #ffffff;
  gap: 2px;
  overflow: hidden;
}

.character-panel {
  background: #1a1a1a;
  border-right: 2px solid #444;
  overflow-y: auto;
  padding: 1rem;
}

.game-main {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0a0a0a;
  position: relative;
}

.info-panel {
  background: #1a1a1a;
  border-left: 2px solid #444;
  overflow-y: auto;
  padding: 1rem;
}

/* Responsive: Stack vertically on small screens */
@media (max-width: 1024px) {
  .game-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }

  .character-panel,
  .info-panel {
    border: none;
    border-bottom: 2px solid #444;
  }
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
