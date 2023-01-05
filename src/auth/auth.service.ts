import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async user(request: Request) {
    const cookies = request.cookies['jwt'];
    const { id } = await this.jwtService.verifyAsync(cookies);
    return await this.userService.findOne({ where: id });
  }
}
