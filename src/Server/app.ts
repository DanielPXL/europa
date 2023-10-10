import express from "express";
import path from "path";

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.listen(8081, () => {
  console.log("Server running on port 8081");
});