import numpy as np
from othello import Othello
from othello_ai import OthelloAI

def generate_game_data(num_games):
    boards = []
    targets = []
    for _ in range(num_games):
        game = Othello()
        ai = OthelloAI(depth=2)
        game_history = []
        while not game.is_game_over():
            move = ai.get_best_move(game)
            if move is None:
                game.player *= -1
                continue
            game_history.append(game.board.copy())
            game.make_move(move[0], move[1])
        winner = game.get_winner()
        for board in game_history:
            target = np.zeros((8, 8))
            if winner == 1:
                target[board == 1] = 1
            elif winner == -1:
                target[board == -1] = 1
            boards.append(board.flatten())
            targets.append(target.flatten())
    return np.array(boards), np.array(targets)

if __name__ == "__main__":
    num_games = 100
    boards, targets = generate_game_data(num_games)
    np.savez('othello_data.npz', boards=boards, targets=targets)
    print(f"Generated {num_games} games and saved to othello_data.npz")
