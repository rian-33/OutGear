import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Role } from '@kost/types';
import type { Response } from 'express';
import { Roles } from '../../common/auth/decorators/roles.decorator';
import { LaporanQueryDto } from './dto/laporan.dto';
import { LaporanService } from './laporan.service';

@ApiTags('Laporan')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('laporan')
export class LaporanController {
  constructor(private readonly laporanService: LaporanService) {}

  @Get('pemasukan')
  @ApiOperation({ summary: 'Rekap pemasukan per periode (FR-34)' })
  rekap(@Query() query: LaporanQueryDto) {
    return this.laporanService.rekap(query);
  }

  @Get('export')
  @ApiProduces('text/csv')
  @ApiOperation({ summary: 'Export rekap pembayaran terkonfirmasi ke CSV (FR-35)' })
  async export(@Query() query: LaporanQueryDto, @Res() response: Response): Promise<void> {
    const csv = await this.laporanService.csv(query);
    const nama = `laporan-pemasukan-${query.dari}_sd_${query.sampai}.csv`;

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename="${nama}"`);
    // BOM agar Microsoft Excel membaca karakter non-ASCII dengan benar.
    response.send(`﻿${csv}`);
  }
}
