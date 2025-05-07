import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, Flatten, Dense

class OthelloNN:
    def __init__(self, input_shape=(8, 8, 1)):
        self.model = Sequential([
            Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
            Conv2D(64, (3, 3), activation='relu'),
            Flatten(),
            Dense(128, activation='relu'),
            Dense(64, activation='relu'),
            Dense(8 * 8, activation='linear')  # Output for each position on the board
        ])
        self.model.compile(optimizer='adam', loss='mean_squared_error')

    def predict(self, board):
        board = np.expand_dims(board, axis=0)
        board = np.expand_dims(board, axis=-1)  # Add channel dimension
        return self.model.predict(board).reshape(8, 8)

    def train(self, boards, targets):
        boards = np.array(boards).reshape(-1, 8, 8, 1)
        targets = np.array(targets)
        self.model.fit(boards, targets, epochs=10)
