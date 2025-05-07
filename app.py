from flask import Flask, jsonify
from flask_cors import CORS
from othello import Othello
from othello_ai import OthelloAI

app = Flask(__name__, static_url_path='', static_folder='.')
CORS(app)

game = Othello()
ai = OthelloAI()

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/get_board')
def get_board():
    board = game.board.tolist()
    message = ""
    if game.is_game_over():
        winner = game.get_winner()
        if winner == 1:
            message = "AI wins!"
        elif winner == -1:
            message = "You win!"
        else:
            message = "It's a tie!"
    else:
        if game.player == 1:
            message = "AI's turn"
        else:
            message = "Your turn"
    return jsonify({'board': board, 'message': message})

@app.route('/make_move/<int:row>/<int:col>')
def make_move(row, col):
    if game.player == 1:
        move = ai.get_best_move(game, timeout=2)
        if move is not None:
            game.make_move(move[0], move[1])
    else:
        game.make_move(row, col)
    if not game.is_game_over() and game.player == 1:
        move = ai.get_best_move(game, timeout=2)
        if move is not None:
            game.make_move(move[0], move[1])
    return jsonify({'board': game.board.tolist(), 'message': ""})

@app.route('/reset_game')
def reset_game():
    global game
    game = Othello()
    return jsonify({'board': game.board.tolist(), 'message': ""})

if __name__ == '__main__':
    app.run(debug=True)
