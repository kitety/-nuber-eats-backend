import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => Boolean)
  hi() {
    return true;
  }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    console.log('createAccountInput: ', createAccountInput);
    try {
      const { ok, error } = await this.userService.createAccount(
        createAccountInput,
      );
      return { ok, error };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      return this.userService.login(loginInput);
    } catch (error) {
      return { ok: false, error };
    }
  }
  @Query(() => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() user: User) {
    return user;
  }
}
