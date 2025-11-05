<script setup lang="ts">
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/usePlayerStore'
import { usePartyStore } from '@/stores/usePartyStore'

const playerStore = usePlayerStore()
const partyStore = usePartyStore()

// Simplified player data (TODO: Add these properties to player entity in future phases)
const playerName = computed(() => playerStore.player?.name || 'Hero')
const playerClass = computed(() => 'Fighter') // TODO: Add vocation property
const playerLevel = computed(() => 1) // TODO: Add level property
const playerHP = computed(() => 100) // TODO: Add hitPoints property
const playerMaxHP = computed(() => 100) // TODO: Add maxHitPoints property
const playerXP = computed(() => 0) // TODO: Add experience property
const playerGold = computed(() => 0) // TODO: Add gold to party
const playerFood = computed(() => 100) // TODO: Add food to party
</script>

<template>
  <div class="character-sheet">
    <h2 class="panel-title">⚔️ Character</h2>

    <div class="character-info">
      <div class="info-row">
        <span class="label">Name:</span>
        <span class="value">{{ playerName }}</span>
      </div>

      <div class="info-row">
        <span class="label">Class:</span>
        <span class="value">{{ playerClass }}</span>
      </div>

      <div class="info-row">
        <span class="label">Level:</span>
        <span class="value">{{ playerLevel }}</span>
      </div>

      <div class="info-row">
        <span class="label">HP:</span>
        <span class="value hp">{{ playerHP }} / {{ playerMaxHP }}</span>
      </div>

      <div class="hp-bar">
        <div class="hp-fill" :style="{ width: `${(playerHP / playerMaxHP) * 100}%` }"></div>
      </div>

      <div class="info-row">
        <span class="label">XP:</span>
        <span class="value">{{ playerXP }}</span>
      </div>
    </div>

    <div class="divider"></div>

    <h3 class="section-title">🎒 Party</h3>
    <div class="party-info">
      <div class="info-row">
        <span class="label">Gold:</span>
        <span class="value gold">{{ playerGold }}g</span>
      </div>

      <div class="info-row">
        <span class="label">Food:</span>
        <span class="value">{{ playerFood }}</span>
      </div>
    </div>

    <div class="divider"></div>

    <h3 class="section-title">🗡️ Equipment</h3>
    <div class="equipment">
      <p class="placeholder">Coming soon...</p>
    </div>

    <div class="divider"></div>

    <h3 class="section-title">📦 Inventory</h3>
    <div class="inventory">
      <p class="placeholder">Coming soon...</p>
    </div>
  </div>
</template>

<style scoped>
.character-sheet {
  color: #ffffff;
}

.panel-title {
  font-size: 1.3rem;
  margin: 0 0 1rem;
  color: #00ff00;
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  border-bottom: 2px solid #00ff00;
  padding-bottom: 0.5rem;
}

.section-title {
  font-size: 1.1rem;
  margin: 0 0 0.75rem;
  color: #ffcc00;
}

.character-info,
.party-info {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.label {
  color: #aaa;
  font-weight: 600;
}

.value {
  color: #fff;
  font-family: 'Courier New', monospace;
}

.value.hp {
  color: #ff4444;
  font-weight: bold;
}

.value.gold {
  color: #ffcc00;
  font-weight: bold;
}

.hp-bar {
  width: 100%;
  height: 10px;
  background: #333;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0.75rem;
  border: 1px solid #555;
}

.hp-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff4444, #ff6666);
  transition: width 0.3s ease;
}

.divider {
  height: 1px;
  background: #444;
  margin: 1rem 0;
}

.equipment,
.inventory {
  min-height: 60px;
}

.placeholder {
  color: #666;
  font-style: italic;
  font-size: 0.85rem;
  text-align: center;
  margin: 1rem 0;
}
</style>
