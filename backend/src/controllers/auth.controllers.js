const { registerUser, loginUser } = require("../services/auth.service");

const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const { userId } = await registerUser({
      email,
      password,
      name,
    });
    res.status(201).json({ message: "User Created", userId });
  } catch (err) {
    console.error("Register error:", err.message);

    if (err.code === "P2002") {
      return res.status(400).json({ error: "Email already in use" });
    }
    res.status(500).json({ error: "Registration failed: " + err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await loginUser({
      email,
      password,
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error during login" });
  }
};

module.exports = { register, login };
