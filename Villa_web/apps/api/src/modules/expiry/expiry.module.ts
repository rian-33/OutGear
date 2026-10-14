import { Module } from '@nestjs/common';
import { UsersService } from '../users/users.service';

/** Only the scheduled expiry cleanup remains from the former tenant workflow. */
@Module({ providers: [UsersService] })
export class ExpiryModule {}
