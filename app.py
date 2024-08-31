from flask import Flask, request, jsonify
import numpy as np
from sklearn.linear_model import LinearRegression

app = Flask(__name__)

# Mock model for demonstration purposes
# Replace with your actual model loading logic
def load_model():
    # Normally, you'd load a trained model from disk
    # For example: model = joblib.load('model.pkl')
    # Here, we are just creating a simple linear model for demonstration
    model = LinearRegression()
    model.coef_ = np.array([0.5, 0.2])  # Mock coefficients
    model.intercept_ = 10.0  # Mock intercept
    return model

model = load_model()

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Parse input features from the JSON request body
        data = request.get_json()
        feature1 = data.get('feature1')
        feature2 = data.get('feature2')

        # Check for missing values
        if feature1 is None or feature2 is None:
            return jsonify({'error': 'Missing input features'}), 400

        # Prepare the input for prediction
        features = np.array([[feature1, feature2]])
        
        # Make the prediction
        prediction = model.predict(features)[0]

        # Return the prediction as JSON
        return jsonify({'prediction': prediction})

    except Exception as e:
        # Log the error
        print(f"Error during prediction: {e}")
        return jsonify({'error': 'An error occurred during prediction'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
python app.py
