import tensorflow as tf

# Load the Keras model
model = tf.keras.models.load_model('othello_model.h5')

# Convert the model to TensorFlow Lite format
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

# Save the TensorFlow Lite model
with open('model/model.tflite', 'wb') as f:
  f.write(tflite_model)

print("Model converted to TensorFlow Lite format and saved to model directory")
