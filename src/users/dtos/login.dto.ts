import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class LoginOutput extends MutationOutput {
  @Field(() => String, { nullable: true })
  token?: string;
}

@InputType()
export class LoginInput extends PickType(User, ['email', 'password']) {}
