import numpy as np
from othello_nn import OthelloNN

if __name__ == "__main__":
    data = np.load('othello_data.npz')
    boards = data['boards']
    targets = data['targets']
    nn = OthelloNN()
    nn.train(boards, targets)
    nn.model.save('othello_model.h5')
    print("Trained neural network and saved to othello_model.h5")
