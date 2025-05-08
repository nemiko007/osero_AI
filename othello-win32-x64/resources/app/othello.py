import numpy as np

class Othello:
    def __init__(self):
        self.board = np.zeros((8, 8), dtype=int)
        self.board[3, 3] = 1
        self.board[4, 4] = 1
        self.board[3, 4] = -1
        self.board[4, 3] = -1
        self.player = 1

    def get_valid_moves(self):
        moves = []
        for i in range(8):
            for j in range(8):
                if self.board[i, j] == 0:
                    if self.is_valid_move(i, j):
                        moves.append((i, j))
        return moves

    def is_valid_move(self, row, col):
        if self.board[row, col] != 0:
            return False
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                if dr == 0 and dc == 0:
                    continue
                r, c = row + dr, col + dc
                if 0 <= r < 8 and 0 <= c < 8 and self.board[r, c] == -self.player:
                    while 0 <= r < 8 and 0 <= c < 8 and self.board[r, c] == -self.player:
                        r += dr
                        c += dc
                    if 0 <= r < 8 and 0 <= c < 8 and self.board[r, c] == self.player:
                        return True
        return False

    def make_move(self, row, col):
        if not self.is_valid_move(row, col):
            return False
        self.board[row, col] = self.player
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                if dr == 0 and dc == 0:
                    continue
                r, c = row + dr, col + dc
                if 0 <= r < 8 and 0 <= c < 8 and self.board[r, c] == -self.player:
                    to_flip = []
                    while 0 <= r < 8 and 0 <= c < 8 and self.board[r, c] == -self.player:
                        to_flip.append((r, c))
                        r += dr
                        c += dc
                    if 0 <= r < 8 and 0 <= c < 8 and self.board[r, c] == self.player:
                        for r, c in to_flip:
                            self.board[r, c] = self.player
        self.player *= -1
        return True

    def is_game_over(self):
        if len(self.get_valid_moves()) > 0:
            return False
        self.player *= -1
        if len(self.get_valid_moves()) > 0:
            self.player *= -1
            return False
        return True

    def get_winner(self):
        black_count = np.sum(self.board == 1)
        white_count = np.sum(self.board == -1)
        if black_count > white_count:
            return 1
        elif white_count > black_count:
            return -1
        else:
            return 0

    def print_board(self):
        for i in range(8):
            print(self.board[i])
