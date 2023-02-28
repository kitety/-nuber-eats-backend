import { Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurants.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private restaurantService: RestaurantService) {}
  @Query(() => [Restaurant])
  restaurants(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }
}
