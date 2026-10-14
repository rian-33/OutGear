import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@kost/types';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator';
import { Roles } from '../../common/auth/decorators/roles.decorator';
import type { AuthUser } from '../../common/auth/types';
import { CreateTagihanManualDto, QueryTagihanDto } from './dto/tagihan.dto';
import { TagihanService } from './tagihan.service';

@ApiTags('Tagihan')
@ApiBearerAuth()
@Controller('tagihan')
export class TagihanController {
  constructor(private readonly tagihanService: TagihanService) {}

  @Get('saya')
  @Roles(Role.PENGHUNI, Role.ADMIN)
  @ApiOperation({ summary: 'Tagihan milik pengguna yang sedang login (FR-19)' })
  findMine(@CurrentUser() user: AuthUser, @Query() query: QueryTagihanDto) {
    return this.tagihanService.findAll(query, user.id_user, user.role);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List semua tagihan + filter status/periode (FR-18)' })
  findAll(@Query() query: QueryTagihanDto) {
    return this.tagihanService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.PENGHUNI)
  @ApiOperation({ summary: 'Detail tagihan — penghuni hanya boleh melihat miliknya' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.tagihanService.findOne(id, { id_user: user.id_user, role: user.role });
  }

  @Post('manual')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Buat tagihan manual untuk satu penghuni (FR-17)' })
  createManual(@Body() dto: CreateTagihanManualDto) {
    return this.tagihanService.createManual(dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete tagihan — ditolak bila sudah ada pembayaran (FR-21)' })
  remove(@Param('id') id: string) {
    return this.tagihanService.remove(id);
  }
}
