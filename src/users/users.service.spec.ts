import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './users.service';

const mokeRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});
const mokeJWTService = {
  sign: jest.fn(),
  verify: jest.fn(),
};
const mokeMailService = {
  sendEmail: jest.fn(),
  sendVerifiedEmail: jest.fn(),
};
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
describe('UserService', () => {
  let service: UserService;
  let usersRepository: MockRepository<User>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mokeRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mokeRepository(),
        },
        {
          provide: JwtService,
          useValue: mokeJWTService,
        },
        {
          provide: MailService,
          useValue: mokeMailService,
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    usersRepository = module.get(getRepositoryToken(User));
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('createAccount', () => {
    const createAccountArgument = {
      email: '',
      password: '',
      role: 0,
    };
    it('should fail if user exists', async () => {
      // fake value
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'abc@qq.com',
      });
      const result = await service.createAccount(createAccountArgument);
      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });
    it('should create a new user', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgument);
      await service.createAccount(createAccountArgument);
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(
        createAccountArgument,
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      // create的返回值，需要比较就需要mock返回值
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgument);
    });
  });

  it.todo('login');
  it.todo('findById');
  it.todo('editProfile');
  it.todo('verifyEmail');
});
