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
  width: 100%;
  height: 100%;
  background-color: #0a0a0a;
  position: relative;
}

#phaser-game {
  width: 100%;
  height: 100%;
}

/* Style pour le canvas lui-même (appliqué par Phaser) */
:deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  display: block;
  border: none;
}
</style>
