<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import Phaser from 'phaser'
import { phaserConfig } from '@/game/phaser/config'

/**
 * Composant PhaserGame - Conteneur du canvas Phaser
 * Gère le cycle de vie de l'instance Phaser (création/destruction)
 */

const gameInstance = ref<Phaser.Game | null>(null)

onMounted(() => {
  // Créer l'instance Phaser quand le composant est monté
  console.log('Initialisation de Phaser...')
  gameInstance.value = new Phaser.Game(phaserConfig)

  console.log('Phaser initialisé avec succès!')
})

onUnmounted(() => {
  // Nettoyer l'instance Phaser quand le composant est démonté
  if (gameInstance.value) {
    console.log('Destruction de l\'instance Phaser...')
    gameInstance.value.destroy(true)
    gameInstance.value = null
  }
})
</script>

<template>
  <div class="phaser-game-container">
    <div id="phaser-game"></div>
  </div>
</template>

<style scoped>
.phaser-game-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  padding: 1rem;
}

#phaser-game {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
}

/* Style pour le canvas lui-même (appliqué par Phaser) */
:deep(canvas) {
  display: block;
  margin: 0 auto;
  border: 2px solid #444;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  max-width: 100% !important;
  max-height: 100% !important;
  width: auto !important;
  height: auto !important;
}
</style>
