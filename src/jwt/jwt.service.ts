import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from './jsw.constants';
import { JWTModuleOptions } from './jwt.interfaces';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JWTModuleOptions,
  ) {}
  sign(payload: object): string {
    return jwt.sign(payload, this.options.privateKey);
  }
}
