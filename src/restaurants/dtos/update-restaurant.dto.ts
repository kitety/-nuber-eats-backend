import { ArgsType, Field, InputType, PartialType } from '@nestjs/graphql';
import { CreateRestaurantDto } from './create-restaurant.dto';

@InputType()
export class UpdateRestaurantInputType extends PartialType(
  CreateRestaurantDto,
) {}

export class UpdateRestaurantDto {
  // 添加id
  @Field(() => Number)
  id: number;

  @Field(() => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
