# Ultima IV Assets Backend Server

A lightweight FastAPI backend server that serves game assets (tiles, maps, NPCs) to the Vue.js frontend.

## Why This Backend?

The Vue.js frontend needs access to static assets (PNG tiles, JSON data, map files). When using `npm run build`, these files aren't accessible without a server. This FastAPI backend solves that problem by:

- ✅ Serving all assets from `vue-ultima-game/public/`
- ✅ Providing CORS support for cross-origin requests
- ✅ Fast and lightweight (Python + FastAPI)
- ✅ Easy to deploy and run

## Quick Start

### 1. Create Virtual Environment (Recommended)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Server

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at **http://localhost:8000**

### 4. Verify It's Working

Open your browser to:
- **Health Check**: http://localhost:8000/health
- **API Docs**: http://localhost:8000/docs (interactive Swagger UI)
- **Test Asset**: http://localhost:8000/assets/tiles.json

## API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check with basic info |
| `/health` | GET | Detailed health check with asset counts |
| `/docs` | GET | Interactive API documentation (Swagger UI) |
| `/assets/{file_path}` | GET | Serve any asset file |

### Asset Listing Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/tiles` | GET | List all available tile PNG files |
| `/api/maps` | GET | List all available map files |
| `/api/npcs` | GET | List all available NPC JSON files |

### Examples

**Get tiles.json:**
```
GET http://localhost:8000/assets/tiles.json
```

**Get a tile image:**
```
GET http://localhost:8000/assets/tiles/tile_grass.png
```

**Get a map file:**
```
GET http://localhost:8000/assets/maps/world.map
```

**Get NPC dialogue:**
```
GET http://localhost:8000/assets/npcs/britain.json
```

**List all tiles:**
```
GET http://localhost:8000/api/tiles
```

## Configure Frontend

To use this backend with the Vue.js frontend, update the asset URLs to point to `http://localhost:8000/assets/`:

**In LoadingScene.ts:**
```typescript
// Change from:
this.load.json('tiles', '/tiles.json')

// To:
this.load.json('tiles', 'http://localhost:8000/assets/tiles.json')
```

**In useMapStore.ts:**
```typescript
// Change from:
const response = await fetch('/assets/maps.json')

// To:
const response = await fetch('http://localhost:8000/assets/maps.json')
```

## Features

### CORS Support
The server includes CORS middleware configured to allow all origins. In production, update `allow_origins` to specify your frontend URL.

### Caching
Assets are served with a 1-hour cache header for better performance:
```
Cache-Control: public, max-age=3600
```

### Security
- Path traversal protection (prevents accessing files outside assets directory)
- File existence validation
- Proper error handling with HTTP status codes

### Logging
The server logs all asset requests for debugging:
```
✅ Serving: tiles/tile_grass.png (image/png)
✅ Serving: tiles.json (application/json)
```

## Development

### Project Structure

```
backend/
├── main.py              # FastAPI application
├── requirements.txt     # Python dependencies
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

### Running in Development Mode

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The `--reload` flag enables auto-reload on code changes.

### Changing the Port

To run on a different port (e.g., 3000):

```bash
python main.py  # Edit main.py to change port
# Or:
uvicorn main:app --port 3000
```

## Production Deployment

### Using Gunicorn (Recommended)

```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Using Docker

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t ultima-assets-api .
docker run -p 8000:8000 -v $(pwd)/../vue-ultima-game/public:/app/assets ultima-assets-api
```

### Environment Variables

You can configure the server using environment variables:

```bash
export ASSETS_DIR=/path/to/custom/assets
export PORT=8000
export HOST=0.0.0.0
```

## Troubleshooting

### Assets Directory Not Found

If you see: `Assets directory not found: /path/to/vue-ultima-game/public`

**Solution**: Make sure the backend is running from the correct location:
```bash
cd /home/user/ng-ultima-game/backend
python main.py
```

### CORS Errors

If the frontend shows CORS errors:

**Solution**: The backend already includes CORS middleware. Make sure:
1. Backend is running
2. Frontend is making requests to `http://localhost:8000`
3. Check browser console for actual error messages

### Port Already in Use

If port 8000 is already in use:

**Solution**: Use a different port:
```bash
uvicorn main:app --port 8001
```

## Testing

### Manual Testing

1. Start the server
2. Open http://localhost:8000/health
3. You should see:
```json
{
  "status": "healthy",
  "directories": {
    "assets": true,
    "tiles": true,
    "maps": true,
    "npcs": true
  },
  "file_counts": {
    "tiles": 140,
    "maps": 17,
    "npcs": 18
  }
}
```

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Get tiles.json
curl http://localhost:8000/assets/tiles.json

# List all tiles
curl http://localhost:8000/api/tiles

# Download a tile image
curl http://localhost:8000/assets/tiles/tile_grass.png --output grass.png
```

### Using Python requests

```python
import requests

# Health check
response = requests.get("http://localhost:8000/health")
print(response.json())

# Get asset
response = requests.get("http://localhost:8000/assets/tiles.json")
print(response.json())
```

## Performance

- **FastAPI** is one of the fastest Python frameworks
- **Uvicorn** provides high-performance ASGI serving
- Static file serving is optimized with proper caching headers
- Typical response time: < 5ms for static files

## Dependencies

- **fastapi**: Modern, fast web framework
- **uvicorn**: Lightning-fast ASGI server
- **python-multipart**: Form data support (optional)

All dependencies are pinned to specific versions for reproducibility.

## License

Same as the main project (Ultima IV Vue Game).

## Support

For issues related to:
- **Backend server**: Check this README and server logs
- **Frontend integration**: See `vue-ultima-game/README.md`
- **Game assets**: Verify files exist in `vue-ultima-game/public/`

---

**Server Status**: 🟢 Ready to serve Ultima IV assets!
