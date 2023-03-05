import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
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
      // hash password
      const newUser = await this.users.create({ email, password, role });
      await this.users.save(newUser);
      return { ok: true };
    } catch (e) {
      // make error
      return { ok: false, error: 'Could not create account' };
    }
  }
  async login({ email, password }: LoginInput): Promise<{
    ok: boolean;
    error?: string;
    token?: string;
  }> {
    //find the user with the email
    try {
      const user = await this.users.findOne({ where: { email } });
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
    //check if the password is correct
    //make a JWT and give it to the user
  }
  async findById(id: number): Promise<User> {
    return this.users.findOne({ where: { id } });
  }
}
