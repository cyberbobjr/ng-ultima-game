"""
FastAPI Backend Server for Ultima IV Vue Game
Serves static assets (tiles, maps, NPCs) to the frontend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Ultima IV Assets API",
    description="Backend server for serving Ultima IV game assets",
    version="1.0.0"
)

# Configure CORS - Allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to assets (vue-ultima-game/public)
ASSETS_DIR = Path(__file__).parent.parent / "vue-ultima-game" / "public"

# Verify assets directory exists
if not ASSETS_DIR.exists():
    logger.error(f"Assets directory not found: {ASSETS_DIR}")
    raise RuntimeError(f"Assets directory not found: {ASSETS_DIR}")

logger.info(f"📂 Assets directory: {ASSETS_DIR}")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Ultima IV Assets API",
        "version": "1.0.0",
        "assets_path": str(ASSETS_DIR)
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    tiles_dir = ASSETS_DIR / "tiles"
    maps_dir = ASSETS_DIR / "maps"
    npcs_dir = ASSETS_DIR / "npcs"

    return {
        "status": "healthy",
        "directories": {
            "assets": ASSETS_DIR.exists(),
            "tiles": tiles_dir.exists(),
            "maps": maps_dir.exists(),
            "npcs": npcs_dir.exists()
        },
        "file_counts": {
            "tiles": len(list(tiles_dir.glob("*.png"))) if tiles_dir.exists() else 0,
            "maps": len(list(maps_dir.glob("*.map"))) if maps_dir.exists() else 0,
            "npcs": len(list(npcs_dir.glob("*.json"))) if npcs_dir.exists() else 0
        }
    }


@app.get("/assets/{file_path:path}")
async def serve_asset(file_path: str):
    """
    Serve any asset file from the public directory
    Supports: JSON files, PNG tiles, MAP files, etc.
    """
    asset_path = ASSETS_DIR / file_path

    # Security check: prevent directory traversal
    try:
        asset_path = asset_path.resolve()
        ASSETS_DIR.resolve()
        if not str(asset_path).startswith(str(ASSETS_DIR.resolve())):
            raise HTTPException(status_code=403, detail="Access denied")
    except Exception as e:
        logger.error(f"Path resolution error: {e}")
        raise HTTPException(status_code=403, detail="Invalid path")

    # Check if file exists
    if not asset_path.exists() or not asset_path.is_file():
        logger.warning(f"Asset not found: {file_path}")
        raise HTTPException(status_code=404, detail=f"Asset not found: {file_path}")

    # Determine media type based on file extension
    media_type = None
    suffix = asset_path.suffix.lower()

    if suffix == ".json":
        media_type = "application/json"
    elif suffix == ".png":
        media_type = "image/png"
    elif suffix == ".map":
        media_type = "application/json"  # .map files contain JSON data
    elif suffix == ".jpg" or suffix == ".jpeg":
        media_type = "image/jpeg"

    logger.info(f"✅ Serving: {file_path} ({media_type})")

    return FileResponse(
        path=asset_path,
        media_type=media_type,
        headers={
            "Cache-Control": "public, max-age=3600",  # Cache for 1 hour
            "Access-Control-Allow-Origin": "*"
        }
    )


# Mount static files as backup (alternative approach)
# This allows accessing files directly without the /assets prefix if needed
app.mount("/static", StaticFiles(directory=str(ASSETS_DIR)), name="static")


@app.get("/api/tiles")
async def list_tiles():
    """List all available tile PNG files"""
    tiles_dir = ASSETS_DIR / "tiles"
    if not tiles_dir.exists():
        return {"tiles": []}

    tiles = [f.name for f in tiles_dir.glob("*.png")]
    return {"count": len(tiles), "tiles": sorted(tiles)}


@app.get("/api/maps")
async def list_maps():
    """List all available map files"""
    maps_dir = ASSETS_DIR / "maps"
    if not maps_dir.exists():
        return {"maps": []}

    maps = [f.name for f in maps_dir.glob("*.map")]
    return {"count": len(maps), "maps": sorted(maps)}


@app.get("/api/npcs")
async def list_npcs():
    """List all available NPC JSON files"""
    npcs_dir = ASSETS_DIR / "npcs"
    if not npcs_dir.exists():
        return {"npcs": []}

    npcs = [f.name for f in npcs_dir.glob("*.json")]
    return {"count": len(npcs), "npcs": sorted(npcs)}


if __name__ == "__main__":
    import uvicorn

    logger.info("🚀 Starting Ultima IV Assets Server...")
    logger.info(f"📂 Serving assets from: {ASSETS_DIR}")
    logger.info("🌐 Server will be available at: http://localhost:8000")
    logger.info("📖 API docs at: http://localhost:8000/docs")

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
