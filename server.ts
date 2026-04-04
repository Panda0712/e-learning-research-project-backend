import { env } from "@/configs/environment.js";
import { PayosProvider } from "@/providers/PayosProvider.js";
import { ragIngestionService } from "@/services/ragIngestionService.js";
import { server, setupSocket } from "@/socket/index.js";
import "dotenv/config";

const PORT = process.env.PORT;

// Setup Socket.io
setupSocket(server);

const registerPayosWebhook = async () => {
  try {
    const webhookUrl = env.PAYOS_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn("PAYOS_WEBHOOK_URL is empty, skip webhook confirmation");
      return;
    }

    const result = await PayosProvider.confirmWebhook(webhookUrl);
    console.log("PayOS webhook confirmed:", result?.webhookUrl || webhookUrl);
  } catch (error: any) {
    console.error("Failed to confirm PayOS webhook:", error?.message || error);
  }
};

if (env.BUILD_MODE === "production") {
  server.listen(PORT, () => {
    console.log(`Production: Hello, I am running at PORT: ${PORT}/`);
    void registerPayosWebhook();
    void ragIngestionService.runStartupIngestion();
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
    void registerPayosWebhook();
    void ragIngestionService.runStartupIngestion();
  });
}

process.on("SIGINT", () => {
  server.close(() => {
    console.log("Exit express server!");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Exit express server!");
    process.exit(0);
  });
});
