import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  findOneOrFail: jest.fn(),
});
const mockJWTService = () => ({
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn(),
});
const mockMailService = () => ({
  sendVerifiedEmail: jest.fn(),
});
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
describe('UserService', () => {
  let service: UserService;
  let usersRepository: MockRepository<User>;
  let verificationsRepository: MockRepository<Verification>;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJWTService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();
    service = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationsRepository = module.get(getRepositoryToken(Verification));
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
      usersRepository.save.mockResolvedValue(createAccountArgument);
      verificationsRepository.create.mockReturnValue({
        user: createAccountArgument,
      });
      verificationsRepository.save.mockResolvedValue({
        code: 'code',
      });

      const result = await service.createAccount(createAccountArgument);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(
        createAccountArgument,
      );

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      // create的返回值，需要比较就需要mock返回值
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgument);

      expect(verificationsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.create).toHaveBeenCalledWith({
        user: createAccountArgument,
      });

      expect(verificationsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.save).toHaveBeenCalledWith({
        user: createAccountArgument,
      });

      expect(mailService.sendVerifiedEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerifiedEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgument);
      expect(result).toEqual({
        ok: false,
        error: 'Could not create account',
      });
    });
  });
  describe('login', () => {
    it('should fail if user does not exist', async () => {
      const loginArgs = {
        email: '',
        password: '',
      };
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArgs);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({
        ok: false,
        error: 'User not found',
      });
    });
    it('should fail if the password is wrong', async () => {
      const loginArgs = {
        email: '',
        password: '',
      };
      const mockedUser = {
        checkPassword: jest.fn().mockResolvedValue(false),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        error: 'Wrong password',
      });
    });
    it('should return token if password correct', async () => {
      const loginArgs = {
        email: '',
        password: '',
      };
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn().mockResolvedValue(true),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({
        ok: true,
        token: 'signed-token',
      });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };
    it('should find an existing user', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });
    it('should fail if no user is found', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({
        ok: false,
        error: 'User Not Found',
      });
    });
  });

  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'test@qq.com',
        verified: true,
      };
      const editProfileArgs = {
        userId: 1,
        input: {
          email: 'test2@qq.com',
        },
      };
      const newUser = {
        user: { verified: false, email: editProfileArgs.input.email },
      };
      const newVerification = {
        code: 'code',
      };
      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationsRepository.create.mockReturnValue(newVerification);
      verificationsRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);

      expect(verificationsRepository.create).toHaveBeenCalledWith(newUser);
      expect(verificationsRepository.save).toHaveBeenCalledWith(
        newVerification,
      );
      expect(mailService.sendVerifiedEmail).toHaveBeenCalledWith(
        newUser.user.email,
        newVerification.code,
      );
    });
    it('should change password', async () => {
      const editProfileArgs = {
        userId: 1,
        input: {
          password: 'newPassword',
        },
      };
      usersRepository.findOne.mockResolvedValue({ password: 'oldPassword' });
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
      expect(result).toEqual({ ok: true });
    });
    it('should fail on exception', async () => {
      const editProfileArgs = {
        userId: 1,
        input: {
          password: 'newPassword',
        },
      };
      usersRepository.findOne.mockRejectedValue({ password: 'oldPassword' });
      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );
      expect(result).toEqual({ ok: false, error: 'Could not update profile.' });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const mockVerification = {
        user: {
          verified: false,
        },
        id: 1,
      };
      verificationsRepository.findOne.mockResolvedValue(mockVerification);
      const result = await service.verifyEmail('code');
      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
      );

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });

      expect(verificationsRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationsRepository.delete).toHaveBeenCalledWith(
        mockVerification.id,
      );

      expect(result).toEqual({ ok: true });
    });
    it('should fail on verification not found', async () => {
      verificationsRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail('code');
      expect(result).toEqual({ ok: false, error: 'Verification not found.' });
      expect(verificationsRepository.findOne).toHaveBeenCalledTimes(1);
    });
    it('should fail on exception', async () => {
      verificationsRepository.findOne.mockRejectedValue(new Error());
      const result = await service.verifyEmail('code');
      expect(result).toEqual({ ok: false, error: 'Could not verify email' });
    });
  });
});
