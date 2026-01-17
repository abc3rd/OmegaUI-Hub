// File: routes/index.js

const express = require('express');
const router = express.Router();

const leadsRouter = require('./leads');

router.use('/leads', leadsRouter);

module.exports = router;
