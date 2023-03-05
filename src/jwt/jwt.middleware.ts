import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from 'src/jwt/jwt.service';
import { UserService } from './../users/users.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      try {
        // verify may error,need catch
        const decode = this.jwtService.verify(token.toString());
        if (typeof decode === 'object' && 'id' in decode) {
          const id = decode['id'] as number;
          const user = await this.userService.findById(id);
          // 添加user到req
          req['user'] = user;
        }
      } catch (error) {}
    }
    next();
  }
}

// function middleware
// function test(req: Request, res: Response, next: NextFunction) {
//   console.log(req.headers);
//   next();
// }
