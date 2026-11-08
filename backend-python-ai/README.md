# QueryX Python AI Backend (Backend 3)

Stateless AI intelligence service powering the **QueryX Regional AI-Powered Delivery Exception Investigation and Customer Response System**.

## 1. Capabilities
1. **Complaint Classification & Urgency Detection:** Analyzes customer complaint subjects and messages to detect delivery exception categories (`DELIVERY_DELAY`, `DAMAGED_GOODS`, `MISSING_PACKAGE`, `WRONG_DELIVERY`, `DELIVERY_NOT_UPDATED`, `OTHER`) and operational urgency (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
2. **Order & Tracking Identifier Extraction:** Uses regular expressions with boundary protection to extract canonical QueryX order numbers (`QX-YYYY-XXXXX`, `TN-XXXXXXXX`) and tracking IDs (`QXT-XX-YYYYMMDD-XXX`, `LGC-TN-XXXXXXXX`).
3. **Regional Event Correlation:** Calculates Haversine spherical distance between shipment checkpoints and regional disruptions (floods, weather, road closures), evaluating timeline windows, proximity decay, and severity weights.
4. **AI Investigation Reasoning Engine:** Combines complaint signals, telemetry, tracking checkpoints, and regional incidents into an explainable investigation dossier separating verified facts from inferred conclusions.
5. **Customer Response Generation:** Generates empathetic, professionally drafted customer responses tailored to investigation findings and support resolution protocols.

---

## 2. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status check |
| `GET` | `/` | Root service descriptor and docs pointer |
| `POST` | `/api/ai/classify-complaint` | Classifies complaint category and urgency |
| `POST` | `/api/ai/extract-order` | Extracts order numbers and tracking IDs |
| `POST` | `/api/ai/correlate-events` | Evaluates regional disruption impact on shipments |
| `POST` | `/api/ai/investigate` | Synthesizes full delivery exception investigation |
| `POST` | `/api/ai/generate-response` | Drafts personalized customer response email |

Interactive Swagger documentation is available at `http://localhost:8000/docs`.

---

## 3. Local Development

### Prerequisites
- Python 3.11+
- Virtual environment (`venv`)

### Installation & Run
```powershell
# Navigate to directory
cd D:\QueryX\backend-python-ai

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run FastAPI with auto-reload
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Running Tests
```powershell
.\venv\Scripts\pytest.exe -v
```
All 34 automated unit and integration tests will execute.

---

## 4. Deployment on Render (Native Python)

Render supports native Python services without requiring Docker:

1. **Service Type:** Web Service
2. **Environment:** Python 3
3. **Root Directory:** `backend-python-ai`
4. **Build Command:**
   ```bash
   pip install --upgrade pip && pip install -r requirements.txt
   ```
5. **Start Command:**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
6. **Environment Variables:**
   - `PORT`: `10000` (Render default or assigned automatically)
   - `APP_ENV`: `production`
   - `DEBUG`: `false`
