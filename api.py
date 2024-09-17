from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
import joblib
import numpy as np
from database import create_engine_mysql
from datetime import date, time

# Charger le modèle entraîné
model = joblib.load('./models/best_model.pkl')

# Initialiser FastAPI
app = FastAPI()

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (POST, GET, etc.)
    allow_headers=["*"],  # Allows all headers
)
# Définir les caractéristiques attendues par le modèle
class EnergyPredictionRequest(BaseModel):
    Date: date
    Heures: time
    Meteo_Irradience: float
    PR_Total_Compteurs: float
    Ensoleillement: float
    PR_Reference: float
    Nombre_Panneau: int
    Nombre_Onduleur: int

elements = [
    'Date',
    'Heures',
    'Meteo_Irradience',
    'PR_Total_Compteurs',
    'Ensoleillement',
    'PR_Reference',
    'Nombre_Panneau',
    'Nombre_Onduleur'
]

# Point d'entrée pour prédire l'énergie horaire
@app.post("/predict/")
def predict_energy(data: EnergyPredictionRequest):
    # Transformer les données d'entrée en un tableau NumPy 2D avec une seule ligne
    input_data = np.array([[getattr(data, element) for element in elements]])
    input_data = pd.DataFrame(input_data, columns=elements)
    heure = int(str(input_data['Heures'].iloc[0]).split(":")[0])
    
    # Faire une prédiction
    prediction = model.predict(input_data)
    
    # Appliquer la transformation inverse pour obtenir les valeurs originales
    predicted_energy = np.expm1(prediction[0])  # np.expm1(x) = exp(x) - 1
    
    # Retourner la prédiction
    return JSONResponse(content={"predicted_energy": predicted_energy,
                                 "Time": heure})


# Point d'entrée pour vérifier l'état du service
@app.get("/")
def read_root():
    return {"message": "Energy prediction API is up and running"}

# # Point d'entrée pour obtenir des données depuis la base de données
# @app.get("/data/{record_id}")
# def get_data(record_id: int):
#     cursor = connection.cursor(dictionary=True)
#     query = f"SELECT * FROM your_table_name WHERE id = {record_id}"
#     cursor.execute(query)
#     record = cursor.fetchone()
#     if not record:
#         raise HTTPException(status_code=404, detail="Record not found")
#     return record

# # Point d'entrée pour prédire l'énergie horaire à partir de la base de données
# @app.post("/predict_from_db/{record_id}")
# def predict_from_db(record_id: int):
#     cursor = connection.cursor(dictionary=True)
#     query = f"SELECT * FROM your_table_name WHERE id = {record_id}"
#     cursor.execute(query)
#     record = cursor.fetchone()
#     if not record:
#         raise HTTPException(status_code=404, detail="Record not found")
    
#     # Extraire les caractéristiques du record
#     input_data = pd.DataFrame([{
#         "Meteo_Irradience": record["Meteo_Irradience"],
#         "Ensoleillement": record["Ensoleillement"],
#         # Ajoutez ici les autres caractéristiques que votre modèle utilise
#     }])
    
#     # Faire une prédiction
#     prediction = model.predict(input_data)
    
#     # Appliquer la transformation inverse pour obtenir les valeurs originales
#     predicted_energy = np.expm1(prediction[0])  # np.expm1(x) = exp(x) - 1
    
#     # Retourner la prédiction
#     return {"predicted_energy": predicted_energy}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host='127.0.0.1', port=8000)