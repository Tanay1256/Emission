import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense
from tensorflow.keras.optimizers import Adam
from sklearn.metrics import mean_absolute_error, mean_squared_error

data_path = 'data/historical_emissions.csv'  
df = pd.read_csv(data_path)

X = df[['production_level', 'equipment_usage', 'external_factors']]
y = df['emissions']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = Sequential()
model.add(Dense(32, input_dim=X_train.shape[1], activation='relu')) 
model.add(Dense(16, activation='relu')) 
model.add(Dense(1, activation='linear')) 

model.compile(optimizer=Adam(learning_rate=0.01), loss='mse', metrics=['mae'])

model.fit(X_train_scaled, y_train, epochs=100, batch_size=10, verbose=1)

y_pred = model.predict(X_test_scaled)
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)

print(f"Mean Absolute Error: {mae}")
print(f"Mean Squared Error: {mse}")

model.save('backend/emission_model.h5')
np.save('backend/scaler.npy', scaler.scale_)
np.save('backend/scaler_mean.npy', scaler.mean_)
