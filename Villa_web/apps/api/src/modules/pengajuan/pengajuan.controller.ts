import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@kost/types';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator';
import { Roles } from '../../common/auth/decorators/roles.decorator';
import type { AuthUser } from '../../common/auth/types';
import {
  CreatePengajuanDto,
  QueryPengajuanDto,
  SetujuiPengajuanDto,
  TolakPengajuanDto,
} from './dto/pengajuan.dto';
import { PengajuanService } from './pengajuan.service';

@ApiTags('Pengajuan')
@ApiBearerAuth()
@Controller('pengajuan')
export class PengajuanController {
  constructor(private readonly pengajuanService: PengajuanService) {}

  @Get('saya')
  @Roles(Role.PENGHUNI, Role.ADMIN)
  @ApiOperation({ summary: 'Pengajuan milik pengguna yang sedang login' })
  findMine(@CurrentUser() user: AuthUser, @Query() query: QueryPengajuanDto) {
    return this.pengajuanService.findAll(query, { id_user: user.id_user, role: user.role });
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List semua pengajuan pindah kamar (FR-29)' })
  findAll(@Query() query: QueryPengajuanDto) {
    return this.pengajuanService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu pengajuan' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.pengajuanService.findOne(id, { id_user: user.id_user, role: user.role });
  }

  @Post()
  @Roles(Role.PENGHUNI)
  @ApiOperation({ summary: 'Ajukan pindah kamar — hanya kamar KOSONG (FR-28)' })
  create(@CurrentUser() user: AuthUser, @Body() dto: CreatePengajuanDto) {
    return this.pengajuanService.create(user.id_user, dto);
  }

  @Patch(':id/setujui')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Setujui pengajuan → kamar berpindah dalam satu transaksi (FR-30)' })
  setujui(@Param('id') id: string, @Body() dto: SetujuiPengajuanDto) {
    return this.pengajuanService.setujui(id, dto);
  }

  @Patch(':id/tolak')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tolak pengajuan — catatan admin wajib (FR-31)' })
  tolak(@Param('id') id: string, @Body() dto: TolakPengajuanDto) {
    return this.pengajuanService.tolak(id, dto);
  }
}
