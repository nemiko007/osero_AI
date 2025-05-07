import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model

model = load_model('othello_model.h5')

# Convert the model to JSON format
model_json = model.to_json()

# Save the model JSON
with open("model/model.json", "w") as json_file:
    json_file.write(model_json)

# Save the weights
model.save_weights("model/model.weights.h5")

print("Model converted to JSON and weights saved")
