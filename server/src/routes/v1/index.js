const express = require('express');
const router = express.Router();
const controller = require('../../controllers/index');

router

    .get('/', controller.baseRoute)
    .get('/users',controller.getAllUsers)
    .post('/users', controller.createUser)


module.exports = router;