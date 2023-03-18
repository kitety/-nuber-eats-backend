import { Test } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from 'src/jwt/jwt.service';

const TEST_KEY = 'testKey';
const id = 1;
// mock jsonwebtoken npm package
jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => 'TOKEN'),
    verify: jest.fn(() => ({ id })),
  };
});
describe('JwtService', () => {
  let service: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            privateKey: TEST_KEY,
          },
        },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('sign', () => {
    it('should return a sign token', async () => {
      const token = service.sign({ id });
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith({ id }, TEST_KEY);
      expect(typeof token).toBe('string');
      expect(token).toBeDefined();
    });
  });
  describe('verify', () => {
    it('should return the decoded token', async () => {
      const token = 'Token';
      const decodedToken = service.verify(token);
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(token, TEST_KEY);

      expect(decodedToken).toEqual({ id });
    });
  });
});
