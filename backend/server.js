
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");

// import your middleware **before** using it
const auth = require("./middleware/authMiddleware");
const authorizeRoles = require("./middleware/roleMiddleware");

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
});

// Public auth routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("✅ API up"));


// Security middleware
app.use(helmet());

// app.use(cors());
app.use(cors({
  origin: "http://localhost:3000", // allow React
  methods: ["GET", "POST"],
  credentials: false // if not using cookies
}));
app.use(express.json());


app.use(limiter);



// Protected routes must come **after** you’ve defined `auth`
app.get("/api/secure", auth, (req, res) => {
  res.json({ msg: "You have access", user: req.user });
});

app.get(
  "/api/admin-dashboard",
  auth,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ msg: "Welcome Admin!" });
  }
);

// anywhere before mongoose.connect & app.listen
app.get("/", (req, res) => {
  res.send("api is up and running")
})

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
