import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwt: JwtService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    // check new user
    try {
      const exists = await this.users.findOne({ where: { email } });
      if (exists) {
        // make error
        return { ok: false, error: 'There is a user with that email already' };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      // generate verification code
      await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );

      return { ok: true };
    } catch (e) {
      // make error
      return { ok: false, error: 'Could not create account' };
    }
  }
  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    //find the user with the email
    try {
      const user = await this.users.findOne({
        where: { email },
        select: ['password', 'id'],
      });

      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      // error password
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      const token = this.jwt.sign({ id: user.id });
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
  async findById(id: number): Promise<User> {
    return this.users.findOne({ where: { id } });
  }

  async editProfile(userId: number, { email, password }: EditProfileInput) {
    const user = await this.findById(userId);
    if (email) {
      user.email = email;
      user.verified = false;
      // generate verification code
      await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );
    }
    if (password) {
      user.password = password;
    }
    return await this.users.save(user);
  }

  async verifyEmail(code: string): Promise<boolean> {
    try {
      const verification = await this.verifications.findOne({
        where: { code },
        relations: ['user'],
      });
      if (verification) {
        console.log('verification: ', verification);
        verification.user.verified = true;
        await this.users.save(verification.user);
        return true;
      }
      throw new Error();
    } catch (error) {
      return false;
    }
  }
}
