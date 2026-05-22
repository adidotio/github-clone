const express = require('express');
const router = express.Router();
const push = require("../controllers/pushController");
const verifyToken = require('../middleware/verifyToken');

router.use(verifyToken);

router.post("/:name/push", push);

module.exports = router;