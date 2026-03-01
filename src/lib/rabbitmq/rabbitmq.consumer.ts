import { getChannel } from "./rabbitmq.connection.js";

export const consumeMessage = async (queue: string) => {
  const channel = getChannel();
  await channel.assertQueue(queue);

  channel.consume(queue, (msg) => {
    if (msg) {
      const data = JSON.parse(msg.content.toString());
      console.log("Received:", data);
      channel.ack(msg);
    }
  });
};
