import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Role } from '@kost/types';
import { Public } from '../../common/auth/decorators/public.decorator';
import { Roles } from '../../common/auth/decorators/roles.decorator';
import { ReservasiService } from './reservasi.service';
import { CheckAvailabilityDto, CreateReservasiDto, UpdateReservasiDto } from './dto/check-availability.dto';

@ApiTags('Reservasi Villa')
@Controller('reservasi')
export class ReservasiController {
  constructor(private readonly reservasi: ReservasiService) {}

  @Get('tersedia')
  @Public()
  @ApiOperation({ summary: 'Cek kamar yang tersedia pada rentang tanggal' })
  available(@Query() query: CheckAvailabilityDto) { return this.reservasi.available(query); }

  @Post()
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Simpan permintaan booking kamar villa' })
  create(@Body() dto: CreateReservasiDto) { return this.reservasi.create(dto); }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Daftar reservasi untuk admin' })
  findAll() { return this.reservasi.findAll(); }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Konfirmasi, batalkan, atau selesaikan reservasi' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReservasiDto) {
    return this.reservasi.updateStatus(id, dto);
  }
}
