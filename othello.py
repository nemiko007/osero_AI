import numpy as np

class Othello:
    def __init__(self):
        self.board_size = 8
        self.board = np.zeros((self.board_size, self.board_size), dtype=int)
        self.board[3][3] = 1
        self.board[4][4] = 1
        self.board[3][4] = -1
        self.board[4][3] = -1
        self.current_player = 1

    def get_board(self):
        return self.board

    def get_current_player(self):
        return self.current_player

    def is_valid_move(self, row, col):
        if self.board[row][col] != 0:
            return False
        
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1)]
        
        for dr, dc in directions:
            r, c = row + dr, col + dc
            if 0 <= r < self.board_size and 0 <= c < self.board_size and self.board[r][c] == -self.current_player:
                while 0 <= r < self.board_size and 0 <= c < self.board_size and self.board[r][c] == -self.current_player:
                    r += dr
                    c += dc
                if 0 <= r < self.board_size and 0 <= c < self.board_size and self.board[r][c] == self.current_player:
                    return True
        
        return False

    def get_legal_moves(self):
        legal_moves = []
        for row in range(self.board_size):
            for col in range(self.board_size):
                if self.is_valid_move(row, col):
                    legal_moves.append((row, col))
        return legal_moves

    def make_move(self, row, col):
        if not self.is_valid_move(row, col):
            return False
        
        self.board[row][col] = self.current_player
        
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1)]
        
        for dr, dc in directions:
            r, c = row + dr, col + dc
            if 0 <= r < self.board_size and 0 <= c < self.board_size and self.board[r][c] == -self.current_player:
                cells_to_flip = []
                while 0 <= r < self.board_size and 0 <= c < self.board_size and self.board[r][c] == -self.current_player:
                    cells_to_flip.append((r, c))
                    r += dr
                    c += dc
                if 0 <= r < self.board_size and 0 <= c < self.board_size and self.board[r][c] == self.current_player:
                    for fr, fc in cells_to_flip:
                        self.board[fr][fc] = self.current_player
        
        self.current_player *= -1
        return True

    def is_game_over(self):
        if len(self.get_legal_moves()) == 0:
            self.current_player *= -1
            if len(self.get_legal_moves()) == 0:
                return True
            else:
                self.current_player *= -1
                return False
        else:
            return False

    def get_winner(self):
        black_count = np.sum(self.board == 1)
        white_count = np.sum(self.board == -1)
        if black_count > white_count:
            return 1
        elif white_count > black_count:
            return -1
        else:
            return 0

def get_legal_moves(board, player):
    legal_moves = []
    for i in range(8):
        for j in range(8):
            if is_valid_move(board, player, i, j):
                legal_moves.append((i, j))
    return legal_moves

def is_valid_move(board, player, x, y):
    if board[x][y] != 0:
        return False

    for dx in range(-1, 2):
        for dy in range(-1, 2):
            if dx == 0 and dy == 0:
                continue

            nx, ny = x + dx, y + dy
            if 0 <= nx < 8 and 0 <= ny < 8 and board[nx][ny] == -player:
                # 相手の石がある
                while 0 <= nx < 8 and 0 <= ny < 8 and board[nx][ny] == -player:
                    nx += dx
                    ny += dy

                if 0 <= nx < 8 and 0 <= ny < 8 and board[nx][ny] == player:
                    # 自分の石がある
                    return True

    return False
