import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const jwt = request.cookies['jwt'];
      const { scope } = this.jwtService.verify(jwt);

      const is_ambassador =
        request.path.toString().indexOf(`api/ambassador`) >= 0;
      return (
        (is_ambassador && scope === 'ambassador') ||
        (!is_ambassador && scope === 'admin')
      );
    } catch (err) {
      return false;
    }
  }
}
