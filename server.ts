require("dotenv").config();
import app from "./src/app";

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server is now running on port: ${PORT}`);
});

process.on("SIGINT", () => {
  server.close(() => console.log("Exit express server!"));
});
