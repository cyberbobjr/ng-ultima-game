/**
 * Game Constants
 * Centralized constants for consistent game behavior
 */

/**
 * Tile size in pixels
 * Change this value to scale the entire game
 * Examples:
 * - 16: Original Ultima IV size (small, retro)
 * - 32: 2x scale (medium)
 * - 48: 3x scale (large)
 * - 64: 4x scale (very large)
 */
export const TILE_SIZE = 32

/**
 * Half tile size (for centering sprites)
 */
export const HALF_TILE = TILE_SIZE / 2

/**
 * Viewport size in tiles
 */
export const VIEWPORT_TILES_WIDTH = 20
export const VIEWPORT_TILES_HEIGHT = 15

/**
 * Camera follow smoothing
 */
export const CAMERA_LERP = 0.1

/**
 * Spritesheet frame dimensions
 * Original tile assets are 32x32 pixels per frame
 * Tilesets for animations can have multiple frames (e.g. 32x64 for 2 frames)
 */
export const FRAME_WIDTH = 32
export const FRAME_HEIGHT = 32
