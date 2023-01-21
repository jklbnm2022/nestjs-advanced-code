import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const TransactionQueryRunner = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.queryRunner;
  },
);
