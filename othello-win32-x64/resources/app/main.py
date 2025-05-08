from othello import Othello
from othello_ai import OthelloAI

def main():
    game = Othello()
    ai = OthelloAI()

    while not game.is_game_over():
        game.print_board()
        if game.player == 1:
            move = ai.get_best_move(game)
            if move is None:
                game.player *= -1
                continue
            print(f"AI plays {move}")
            game.make_move(move[0], move[1])
        else:
            valid_moves = game.get_valid_moves()
            if not valid_moves:
                game.player *= -1
                continue
            print("Your turn. Valid moves:", valid_moves)
            while True:
                try:
                    row = int(input("Enter row: "))
                    col = int(input("Enter col: "))
                    if (row, col) not in valid_moves:
                        print("Invalid move.")
                        continue
                    break
                except ValueError:
                    print("Invalid input. Please enter a number.")
            game.make_move(row, col)

    game.print_board()
    winner = game.get_winner()
    if winner == 1:
        print("AI wins!")
    elif winner == -1:
        print("You win!")
    else:
        print("It's a tie!")

if __name__ == "__main__":
    main()
