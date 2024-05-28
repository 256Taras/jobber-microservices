import { config } from '@notifications/config';
import { Logger } from 'winston';
import {IEmailLocals, winstonLogger} from '@256taras/jobber-shared';
import {emailTemplates} from '@notifications/helper';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mailTransport', 'debug');

async function sendEmail(template: string, receiverEmail: string, locals: IEmailLocals): Promise<void> {
  try {
    await emailTemplates(template, receiverEmail, locals);
    log.info('Email sent successfully.');
  } catch (error) {
    log.log('error', 'NotificationService MailTransport sendEmail() method error:', error);
  }
}

export { sendEmail };
