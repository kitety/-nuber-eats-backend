import { InputType, ObjectType, PartialType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class EditProfileOutput extends CoreOutput {}

// email pwd 都可选
@InputType()
export class EditProfileInput extends PartialType(
  PickType(User, ['email', 'password']),
) {}
