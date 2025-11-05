<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUIStore } from '@/stores/useUIStore'
import { useMapStore } from '@/stores/useMapStore'

const uiStore = useUIStore()
const mapStore = useMapStore()

// Game logs (will be populated by game events)
const logs = computed(() => uiStore.informationMessages.map(msg => `[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.text}`))

// Current map info
const currentMap = computed(() => mapStore.currentMap)
const mapName = computed(() => currentMap.value?.mapMetaData?.fname?.replace('.map', '') || 'Unknown')
const mapSize = computed(() => {
  if (!currentMap.value) return '0x0'
  return `${currentMap.value.width}x${currentMap.value.height}`
})

// Add a test log for demonstration
const addTestLog = () => {
  uiStore.addLogInformation(`Test log entry at ${new Date().toLocaleTimeString()}`)
}
</script>

<template>
  <div class="info-panel-content">
    <h2 class="panel-title">📜 Game Log</h2>

    <!-- Map Info -->
    <div class="map-info">
      <h3 class="section-title">🗺️ Location</h3>
      <div class="info-row">
        <span class="label">Map:</span>
        <span class="value">{{ mapName }}</span>
      </div>
      <div class="info-row">
        <span class="label">Size:</span>
        <span class="value">{{ mapSize }}</span>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Controls Info -->
    <div class="controls-info">
      <h3 class="section-title">🎮 Controls</h3>
      <div class="control-item">
        <kbd>↑ ↓ ← →</kbd> <span>Move</span>
      </div>
      <div class="control-item">
        <kbd>E</kbd> <span>Enter</span>
      </div>
      <div class="control-item">
        <kbd>O</kbd> <span>Open</span>
      </div>
      <div class="control-item">
        <kbd>T</kbd> <span>Talk</span>
      </div>
      <div class="control-item">
        <kbd>K</kbd> <span>Klimb</span>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Game Logs -->
    <div class="logs">
      <h3 class="section-title">📝 Activity</h3>
      <div class="log-container">
        <div v-if="logs.length === 0" class="placeholder">
          No activity yet. Use arrow keys to move!
        </div>
        <div v-for="(log, index) in logs" :key="index" class="log-entry">
          {{ log }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-panel-content {
  color: #ffffff;
}

.panel-title {
  font-size: 1.3rem;
  margin: 0 0 1rem;
  color: #00ccff;
  text-shadow: 0 0 10px rgba(0, 204, 255, 0.5);
  border-bottom: 2px solid #00ccff;
  padding-bottom: 0.5rem;
}

.section-title {
  font-size: 1.1rem;
  margin: 0 0 0.75rem;
  color: #ffcc00;
}

.map-info {
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

.divider {
  height: 1px;
  background: #444;
  margin: 1rem 0;
}

.controls-info {
  margin-bottom: 1rem;
}

.control-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.control-item kbd {
  background: #333;
  border: 1px solid #555;
  border-radius: 3px;
  padding: 0.25rem 0.5rem;
  margin-right: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #ffcc00;
  min-width: 30px;
  text-align: center;
}

.control-item span {
  color: #ccc;
}

.logs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.log-container {
  background: #0a0a0a;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.log-entry {
  color: #00ff00;
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
  border-left: 2px solid #00ff00;
}

.log-entry:last-child {
  margin-bottom: 0;
}

.placeholder {
  color: #666;
  font-style: italic;
  text-align: center;
}

/* Custom scrollbar */
.log-container::-webkit-scrollbar {
  width: 8px;
}

.log-container::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.log-container::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}

.log-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
