import { UpdateRestaurantDto } from './dtos/update-restaurant.dto';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurants.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }

  createRestaurant(
    createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    const newRestaurants = this.restaurants.create(createRestaurantDto);
    return this.restaurants.save(newRestaurants);
  }
  updateRestaurant(updateRestaurantDto: UpdateRestaurantDto) {
    const { id, data } = updateRestaurantDto;
    return this.restaurants.update(id, data);
  }
}
