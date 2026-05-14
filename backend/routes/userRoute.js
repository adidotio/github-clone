const express = require('express');
const router = express.Router();
const {register, login, refresh} = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

// Handles the verification part so if not authenticated you cannot use the routes
router.use(verifyToken);

router.post("/register", register);

router.post("/login", login);

router.post("/refresh", refresh);

module.exports = router;