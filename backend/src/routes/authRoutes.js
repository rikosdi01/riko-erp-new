const express = require("express");
const { login, refreshToken, logout, setUserRole, getUserRole } = require("../controllers/authController");
const checkAccessToken = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// Hanya user yang memiliki accessToken yang valid yang bisa mengakses ini
router.post("/setRole", checkAccessToken, setUserRole);
router.get("/getRole/:uid", checkAccessToken, getUserRole);

module.exports = router;
