import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@kost/types';
import { Roles } from '../../common/auth/decorators/roles.decorator';
import { KamarService } from './kamar.service';
import { CreateKamarDto } from './dto/create-kamar.dto';
import { QueryKamarDto } from './dto/query-kamar.dto';
import { UpdateKamarDto } from './dto/update-kamar.dto';
import { UpdateStatusKamarDto } from './dto/update-status.dto';

@ApiTags('Kamar')
@ApiBearerAuth()
@Controller('kamar')
export class KamarController {
  constructor(private readonly kamarService: KamarService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List inventaris kamar villa' })
  findAll(@Query() query: QueryKamarDto) {
    return this.kamarService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Detail satu kamar' })
  findOne(@Param('id') id: string) {
    return this.kamarService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tambah unit villa' })
  create(@Body() dto: CreateKamarDto) {
    return this.kamarService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Ubah harga per malam dan fasilitas unit villa' })
  update(@Param('id') id: string, @Body() dto: UpdateKamarDto) {
    return this.kamarService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Atur unit villa tersedia atau dalam perawatan' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusKamarDto) {
    return this.kamarService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Arsipkan unit yang tidak memiliki reservasi aktif' })
  remove(@Param('id') id: string) {
    return this.kamarService.remove(id);
  }
}
