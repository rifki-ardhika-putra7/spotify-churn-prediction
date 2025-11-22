import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from fastapi.middleware.cors import CORSMiddleware # <-- UDAH DITAMBAH

print("Mencoba memuat model v2...")
try:
    model = joblib.load("model_spotify_churn2.pkl")
    print("Model 'model_spotify_churn_v2.pkl' berhasil di-load.")
except Exception as e:
    print(f"Error pas load model: {e}")
    model = None

app = FastAPI(title="API Prediksi Churn Spotify v2")

# --- INI DIA FIX-NYA ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -------------------------

# Bikin 'Data Model' (Pydantic)
class DataPelanggan(BaseModel):
    avg_daily_minutes: float
    number_of_playlists: int
    skips_per_day: int
    support_tickets: int
    days_since_last_login: int
    subscription_type: str
    country: str
    top_genre: str

@app.post("/predict_churn")
def predict_churn(data: DataPelanggan):
    
    if model is None:
        return {"error": "Model tidak siap, cek log server."}

    data_input_df = pd.DataFrame([data.dict()])
    
    print("\nData mentah diterima:")
    print(data_input_df)

    try:
        prediksi_label = model.predict(data_input_df)
        prediksi_proba = model.predict_proba(data_input_df)
        
        label_hasil = int(prediksi_label[0])
        skor_keyakinan = float(prediksi_proba[0][label_hasil])

        if label_hasil == 1:
            status = "Potensi Churn"
        else:
            status = "Aman (Setia)"

        print(f"Hasil Prediksi: {status} (Skor: {skor_keyakinan:.2f})")

        return {
            "prediksi": status,
            "label": label_hasil,
            "skor_keyakinan": skor_keyakinan
        }
        
    except Exception as e:
        print(f"Error pas prediksi: {e}")
        return {"error": f"Error pas prediksi: {e}"}

@app.get("/")
def read_root():
    return {"message": "API Prediksi Churn Spotify v2.0"}

# (Opsional) Biar bisa dijalankan dengan `python main_churn_v2.py`
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)