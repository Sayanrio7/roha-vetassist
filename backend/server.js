const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();
require("./database/dbConnection");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/uploads", (req, res, next) => {
  const fileName = path.basename(req.path);

  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const cowRoutes = require("./routes/cowRoutes");
const historyRoutes = require("./routes/historyRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const reportRoutes = require("./routes/reportRoutes");

app.use("/api/cows", cowRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/report", reportRoutes);

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "ROHA VetAssist Backend Running 🚀",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running at http://localhost:${PORT}`);
});
