from flask import Flask, request, jsonify
import numpy as np
from tensorflow.keras.models import load_model
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)

model = load_model('backend/emission_model.h5')
scaler_scale = np.load('backend/scaler.npy')
scaler_mean = np.load('backend/scaler_mean.npy')
scaler = StandardScaler()
scaler.scale_ = scaler_scale
scaler.mean_ = scaler_mean

@app.route('/predict_emission', methods=['POST'])
def predict_emission():
    data = request.json

    input_data = np.array([
        data['production_level'],
        data['equipment_usage'],
        data['external_factors']
    ]).reshape(1, -1)

    input_data_scaled = scaler.transform(input_data)

    prediction = model.predict(input_data_scaled)
    result = prediction[0][0] 

    return jsonify({'predicted_emissions': result})

if __name__ == '__main__':
    app.run(debug=True)
