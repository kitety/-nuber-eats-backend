import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mailgun = require('mailgun-js');

jest.mock('mailgun-js');
describe('MailService', () => {
  let service: MailService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: 'TEST-apiKey',
            domain: 'TEST-domain',
            fromEmail: 'TEST-fromEmail',
          },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(mailgun).toHaveBeenCalled();
    expect(mailgun).toHaveBeenCalledTimes(1);
    expect(mailgun).toHaveBeenCalledWith({
      apiKey: 'TEST-apiKey',
      domain: 'TEST-domain',
    });
  });

  describe('sendVerifiedEmail', () => {
    it('should call sendEmail', () => {
      // mock function
      //   service.sendEmail = jest.fn(); //后面还要测试，所以不用这种方式
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => {
        console.log('mock spy function');
      });
      const email = 'test@qq.com';
      const code = 'code';
      service.sendVerifiedEmail(email, code);
      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify Your Code',
        '1048444579@qq.com',
        'verify-code',
        [
          { key: 'v:code', value: code },
          { key: 'v:username', value: email },
        ],
      );
    });
  });
});
