from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from scholarly import scholarly
import time
import uvicorn
from datetime import datetime
from typing import Dict, List, Any

app = FastAPI()

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory cache for citation data
# Key: scholar_id, Value: {"timestamp": float, "data": Dict[int, int]}
citation_cache: Dict[str, Dict[str, Any]] = {}
CACHE_EXPIRATION_SECONDS = 12*3600  # 12 hours

@app.get("/citations/{scholar_id}")
async def get_citations(scholar_id: str):
    if scholar_id == "None":
        raise HTTPException(status_code=400, detail="Invalid Scholar ID")
    
    current_time = time.time()
    readable = datetime.fromtimestamp(current_time).isoformat(sep=' ', timespec='seconds')
    # Check if data is already in cache and not expired
    if scholar_id in citation_cache:
        cached_entry = citation_cache[scholar_id]
        if current_time - cached_entry["timestamp"] < CACHE_EXPIRATION_SECONDS:
            
            print(f"{readable}: Returning cached data for {scholar_id} (last fetch: {int(current_time - cached_entry['timestamp'])}s ago)")
            return cached_entry["data"]
        else:
            print(f"{readable}: Cache expired for {scholar_id}, fetching fresh data...")
    
    try:
        print(f"{readable}: Fetching fresh data for {scholar_id} from Google Scholar...")
        # Search for the author by ID
        author = scholarly.search_author_id(scholar_id)
        # Fill the author object with citation data
        author = scholarly.fill(author, sections=['counts'])
        
        # Extract cites_per_year
        # It's a dict like {year: count}
        citations = author.get("cites_per_year", {})
        
        # Store in cache with current timestamp
        citation_cache[scholar_id] = {
            "timestamp": current_time,
            "data": citations
        }
        
        return citations
    except Exception as e:
        print(f"{readable}: Error fetching data for {scholar_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
