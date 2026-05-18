require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const session = require("express-session");

const connectDB = require("./lib/db.js");
const volunteersRoutes = require("./src/routes/volunteerRoutes.js");
const eventRoutes = require("./src/routes/eventRoutes.js");
const shiftRoutes = require("./src/routes/shiftRoutes.js");
const { clerkMiddleware } = require("@clerk/nextjs/server");
// uncomment below when implemented
// const authRoutes = require("./routes/authRoutes.js");
// const adminRoutes = require("./routes/adminRoutes.js");
// const volunteersRoutes = require("./routes/volunteerRoutes.js");

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(clerkMiddleware());

app.use(
  session({
    secret: process.env.TOKEN_SECRET_KEY || "dev-fallback-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  }),
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE, PUT");
  next();
});

// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use("/volunteers", volunteersRoutes);
app.use("/events", eventRoutes);
app.use("/shifts", shiftRoutes);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes (uncomment below when implemented)
// app.use("/api/auth", authRoutes);
// app.use("/api/admin", adminRoutes);
// app.use("/api/volunteers", volunteersRoutes);
// app.use("/api/events", eventRoutes);
// app.use("/api/Admin", adminRoutes);
// app.use("/api/Volunteers", volunteersRoutes);
// app.use("/api/Events", eventRoutes);

app.get("/", (req, res) => {
  console.log("Hello World, I am here");
  res.status(200).send("Much Hope Root");
});

// Only start server (and connect to DB) outside of tests
if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

module.exports = app;
