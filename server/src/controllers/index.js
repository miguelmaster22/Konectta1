const service = require('../services/index.js');

const baseRoute = (req, res) => {
    res.status(200).json({ status: "OK", message: 'Welcome to the API' });
};

const getNonce = async (req, res) => {
    // Logic to get nonce
    const nonce = await service.getNonce();
    if (!nonce) {
        return res.status(500).json({ status: "ERROR", message: 'Failed to retrieve nonce'});
    }
    res.status(200).json({ status: "OK", message: 'Nonce retrieved successfully', data: nonce });
}

const updateNonce = async (req, res) => {
    // Logic to update nonce
    const { body } = req;
    if (!body || !body.nonce) {
        return res.status(400).json({ status: "ERROR", message: 'Invalid nonce data' });
    }

    const updatedNonce = await service.updateNonce(body.nonce);
    if (!updatedNonce) {
        return res.status(500).json({ status: "ERROR", message: 'Failed to update nonce'});
    }
    res.status(200).json({ status: "OK", message: 'Nonce updated successfully', data: updatedNonce });
}

const getAllUsers = async (req, res) => {
    // Logic to get all users
    const users = await service.getAllUsers();
    if (!users) {
        return res.status(500).json({ status: "ERROR", message: 'Failed to retrieve users'});
    }
    res.status(200).json({ status: "OK", message: 'All users retrieved successfully', data: users  });
}

const createUser = async(req, res) => {
    // Logic to create a user
    const { body } = req;
    if (!body || !body.wallet ) {
        return res.status(400).json({ status: "ERROR", message: 'Invalid user data' });
    }

    const createdUser = await service.createNewUser(body);
    if (!createdUser) {
        return res.status(500).json({ status: "ERROR", message: 'Failed to create user already exist' });
    }

    res.status(201).json({ status: "OK", message: 'User created successfully' });
};

const deleteUser = async(req, res) => {
    // Logic to delete a user
    const { wallet } = req.body;
    if (!wallet) {
        return res.status(400).json({ status: "ERROR", message: 'Invalid wallet address' });
    }

    const deletedUser = await service.deleteUser(wallet);
    if (!deletedUser) {
        return res.status(500).json({ status: "ERROR", message: 'Failed to delete user' });
    }

    res.status(200).json({ status: "OK", message: 'User deleted successfully' });
};

const getUserByWallet = async(req, res) => {
    // Logic to get a user by wallet address
    const { wallet } = req.params;
    if (!wallet) {
        return res.status(400).json({ status: "ERROR", message: 'Invalid wallet address' });
    }

    const user = await service.getUserByWallet(wallet);
    if (!user) {
        return res.status(404).json({ status: "ERROR", message: 'User not found' });
    }

    res.status(200).json({ status: "OK", message: 'User retrieved successfully', data: user });
}


module.exports = {
    baseRoute,
    getNonce,
    updateNonce,
    getAllUsers,
    getUserByWallet,
    createUser,
    deleteUser,
}