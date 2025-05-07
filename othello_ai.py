import numpy as np
from othello import Othello
from tensorflow.keras.models import load_model
import threading

class OthelloAI:
    def __init__(self, model_path='othello_model.h5'):
        self.model = load_model(model_path)

    def get_best_move(self, game, timeout=5):
        valid_moves = game.get_valid_moves()
        if not valid_moves:
            return None

        best_move = None
        best_score = -np.inf
        result = None

        def calculate_move():
            nonlocal best_move, best_score, result
            try:
                for move in valid_moves:
                    row, col = move
                    board_copy = game.board.copy()
                    board_copy[row, col] = game.player
                    # Predict the value of the board after making the move
                    predicted_board = self.model.predict(np.expand_dims(board_copy.reshape(8, 8, 1), axis=0)).reshape(8, 8)
                    score = np.sum(predicted_board)  # Sum of the predicted board values
                    if score > best_score:
                        best_score = score
                        best_move = move
                result = best_move
            except Exception as e:
                print(f"Error during move calculation: {e}")
                result = None

        timer = threading.Timer(timeout, lambda: None)
        thread = threading.Thread(target=calculate_move)
        thread.start()
        timer.start()

        thread.join(timeout=timeout)
        timer.cancel()

        return result
