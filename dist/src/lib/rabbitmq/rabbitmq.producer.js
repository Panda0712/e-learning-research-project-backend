import { getChannel } from "./rabbitmq.connection.js";
export const publishMessage = async (queue, message) => {
    const channel = getChannel();
    await channel.assertQueue(queue);
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
};
//# sourceMappingURL=rabbitmq.producer.js.map