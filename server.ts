import app from "@/app.js";
import { env } from "@/configs/environment.js";
import { connectRabbitMQ } from "@/lib/rabbitmq/rabbitmq.connection.js";
import { consumeMessage } from "@/lib/rabbitmq/rabbitmq.consumer.js";
import { setupSocket } from "@/lib/socket/socket.js";
import "dotenv/config";
import http from "http";

const PORT = process.env.PORT;
const server = http.createServer(app);

// Setup Socket.io
setupSocket(server);

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

await connectRabbitMQ();
await consumeMessage("test-queue");
