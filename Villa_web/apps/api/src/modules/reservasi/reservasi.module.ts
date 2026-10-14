import { Module } from '@nestjs/common';
import { ReservasiController } from './reservasi.controller';
import { ReservasiService } from './reservasi.service';

@Module({ controllers: [ReservasiController], providers: [ReservasiService] })
export class ReservasiModule {}
