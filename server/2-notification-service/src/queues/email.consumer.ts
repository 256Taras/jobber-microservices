import { config } from '@notifications/config';
import { Channel, ConsumeMessage } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '@notifications/queues/connection';
import { IEmailLocals, winstonLogger } from '@256taras/jobber-shared';
import {sendEmail} from '@notifications/mail.transport';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug');

const EXCHANGE_NAME_AUTH = 'jobber-email-notification';
const EXCHANGE_NAME_ORDER = 'jobber-order-notification';
const ROUTING_KEY_AUTH = 'auth-email';
const ROUTING_KEY_ORDER = 'order-email';
const QUEUE_NAME_AUTH = 'auth-email-queue';
const QUEUE_NAME_ORDER = 'order-email-queue';

interface QueueSetupOptions {
  channel: Channel;
  exchangeName: string;
  routingKey: string;
  queueName: string;
}

async function ensureChannel(channel: Channel | null): Promise<Channel> {
  return channel ? channel : await createConnection() as Channel;
}

async function setupQueue(options: QueueSetupOptions): Promise<string> {
  const { channel, exchangeName, routingKey, queueName } = options;
  await channel.assertExchange(exchangeName, 'direct');
  const queue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
  await channel.bindQueue(queue.queue, exchangeName, routingKey);
  return queue.queue;
}

async function consumeAuthEmailMessages(channel: Channel | null): Promise<void> {
  try {
    channel = await ensureChannel(channel);
    const queue = await setupQueue({ channel, exchangeName: EXCHANGE_NAME_AUTH, routingKey: ROUTING_KEY_AUTH, queueName: QUEUE_NAME_AUTH });

    channel.consume(queue, async (msg: ConsumeMessage | null) => {
      if (msg) {
        const { receiverEmail, username, verifyLink, resetLink, template } = JSON.parse(msg.content.toString());
        const locals: IEmailLocals = {
          appLink: `${config.CLIENT_URL}`,
          appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
          username,
          verifyLink,
          resetLink
        };
        await sendEmail(template, receiverEmail, locals);
        channel!.ack(msg);
      }
    });
  } catch (error) {
    log.error('NotificationService EmailConsumer consumeAuthEmailMessages() method error:', error);
  }
}

async function consumeOrderEmailMessages(channel: Channel | null): Promise<void> {
  try {
    channel = await ensureChannel(channel);
    const queue = await setupQueue({ channel, exchangeName: EXCHANGE_NAME_ORDER, routingKey: ROUTING_KEY_ORDER, queueName: QUEUE_NAME_ORDER });

    channel.consume(queue, async (msg: ConsumeMessage | null) => {
      if (msg) {
        const {
          receiverEmail,
          username,
          template,
          sender,
          offerLink,
          amount,
          buyerUsername,
          sellerUsername,
          title,
          description,
          deliveryDays,
          orderId,
          orderDue,
          requirements,
          orderUrl,
          originalDate,
          newDate,
          reason,
          subject,
          header,
          type,
          message,
          serviceFee,
          total
        } = JSON.parse(msg.content.toString());

        const locals: IEmailLocals = {
          appLink: `${config.CLIENT_URL}`,
          appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
          username,
          sender,
          offerLink,
          amount,
          buyerUsername,
          sellerUsername,
          title,
          description,
          deliveryDays,
          orderId,
          orderDue,
          requirements,
          orderUrl,
          originalDate,
          newDate,
          reason,
          subject,
          header,
          type,
          message,
          serviceFee,
          total
        };

        if (template === 'orderPlaced') {
          await sendEmail('orderPlaced', receiverEmail, locals);
          await sendEmail('orderReceipt', receiverEmail, locals);
        } else {
          await sendEmail(template, receiverEmail, locals);
        }

        channel!.ack(msg);
      }
    });
  } catch (error) {
    log.error('NotificationService EmailConsumer consumeOrderEmailMessages() method error:', error);
  }
}

export { consumeAuthEmailMessages, consumeOrderEmailMessages };
