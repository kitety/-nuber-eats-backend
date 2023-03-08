import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';

export const AuthUser = createParamDecorator(
  (data, context: ExecutionContext): User => {
    const graphqlContext = GqlExecutionContext.create(context).getContext();
    const user = graphqlContext['user'];
    return user;
  },
);
