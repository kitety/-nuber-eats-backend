import { Global, Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailVariable } from './mail.interface';
import { MailModuleOptions } from './main.interface';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mailgun = require('mailgun-js');

@Injectable()
export class MailService {
  private mg: any;
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    this.mg = mailgun({ apiKey: options.apiKey, domain: options.domain });
  }

  async sendEmail(
    subject: string,
    to: string,
    template: string,
    emailVariables: MailVariable[],
  ) {
    const data = {
      from: `Excited User <me@${this.options.domain}>`,
      to,
      subject,
      template,
    };
    emailVariables.forEach((variable) => [
      (data[variable.key] = variable.value),
    ]);
    return new Promise((resolve, reject) => {
      this.mg.messages().send(data, function (error, body) {
        if (error) {
          console.log('error: ', error);
          reject(error);
          return;
        }
        resolve(body);
      });
    });
  }
  async sendVerifiedEmail(email: string, code: string) {
    await this.sendEmail(
      'Verify Your Code',
      '1048444579@qq.com',
      'verify-code',
      [
        { key: 'v:code', value: code },
        { key: 'v:username', value: email },
      ],
    );
  }
}
