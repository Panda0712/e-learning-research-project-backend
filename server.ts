import { env } from "@/configs/environment.js";
import { server } from "@/socket/index.js";
import "dotenv/config";

const PORT = process.env.PORT;

if (env.BUILD_MODE === "production") {
  server.listen(PORT, () => {
    console.log(`Production: Hello, I am running at PORT: ${PORT}/`);
  });
  // const PORT = process.env.PORT || 3000;
  // const HOST = "0.0.0.0"; // Bắt buộc trên cloud
  // server.listen(PORT, HOST, () => {
  //   console.log(`Production: Hello ${env.AUTHOR}, running at PORT: ${PORT}`);
  // });
} else {
  const devPort: number | undefined = env.APP_PORT
    ? parseInt(env.APP_PORT, 10)
    : undefined;
  server.listen(devPort, env.APP_HOST, () => {
    console.log(
      `Local DEV: Hello, I am running at http://${env.APP_HOST}:${env.APP_PORT}/`,
    );
  });
}

process.on("SIGINT", () => {
  server.close(() => console.log("Exit express server!"));
});
