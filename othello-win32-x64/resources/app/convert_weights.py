import tensorflowjs.converters
import tensorflow as tf

# Load the Keras model
model = tf.keras.models.load_model('othello_model.h5')

# Convert the model to TensorFlow.js format
tensorflowjs.converters.save_keras_model(model, "model")

print("Model converted to TensorFlow.js format and saved to model directory")
