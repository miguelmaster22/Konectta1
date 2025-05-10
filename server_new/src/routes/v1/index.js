const express = require('express');
const router = express.Router();
const controller = require('../../controllers/index');

router

    .get('/', controller.baseRoute)
    .get('/nonce', controller.getNonce)
    .post('/nonce', controller.updateNonce)
    .get('/users/:wallet', controller.getUserByWallet)
    .delete('/users', controller.deleteUser)
    .get('/users',controller.getAllUsers)
    .post('/users', controller.createUser)
    


module.exports = router;