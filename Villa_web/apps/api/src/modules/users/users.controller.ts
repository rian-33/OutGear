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
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator';
import { Roles } from '../../common/auth/decorators/roles.decorator';
import type { AuthUser } from '../../common/auth/types';
import { UsersService } from './users.service';
import { QueryUsersDto } from './dto/query-users.dto';
import {
  AssignKamarDto,
  CreatePenghuniDto,
  UpdatePenghuniDto,
  UpdateProfilDto,
} from './dto/users.dto';

@ApiTags('Penghuni')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Profil pengguna yang sedang login beserta kamar & masa sewa' })
  me(@CurrentUser() user: AuthUser) {
    return this.usersService.me(user.id_user);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Perbarui profil sendiri (nama & nomor HP)' })
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfilDto) {
    return this.usersService.updateProfil(user.id_user, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List penghuni + search nama/username/email (FR-12)' })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Detail satu penghuni' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tambah penghuni baru + assign kamar dalam satu transaksi (FR-11)' })
  create(@Body() dto: CreatePenghuniDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Ubah data penghuni (FR-13)' })
  update(@Param('id') id: string, @Body() dto: UpdatePenghuniDto) {
    return this.usersService.update(id, dto);
  }

  @Post(':id/assign-kamar')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Pindahkan penghuni ke kamar kosong lain (FR-15)' })
  assignKamar(@Param('id') id: string, @Body() dto: AssignKamarDto) {
    return this.usersService.assignKamar(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Nonaktifkan penghuni + lepas kamar (FR-14)' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
