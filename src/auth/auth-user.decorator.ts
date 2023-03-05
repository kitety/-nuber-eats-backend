import {
  createParamDecorator,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';

// @Injectable()
export const AuthUser = createParamDecorator(
  (data, context: ExecutionContext): User => {
    const graphqlContext = GqlExecutionContext.create(context).getContext();
    const user = graphqlContext['user'];
    return user;
  },
);
