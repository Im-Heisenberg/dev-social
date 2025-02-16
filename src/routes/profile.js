const express = require('express');
const { authMiddleware } = require('../utils/validations');
const router = express.Router();

router.get('/view', authMiddleware,async (req, res) => {
    res.send('hi')
})

module.exports={router}