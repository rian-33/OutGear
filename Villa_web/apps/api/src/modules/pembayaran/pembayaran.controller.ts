import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role } from '@kost/types';
import type { Response } from 'express';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator';
import { Roles } from '../../common/auth/decorators/roles.decorator';
import type { AuthUser } from '../../common/auth/types';
import { MAX_UPLOAD_BYTES } from '../storage/storage.service';
import {
  CreatePembayaranDto,
  KonfirmasiPembayaranDto,
  QueryPembayaranDto,
  TolakPembayaranDto,
} from './dto/pembayaran.dto';
import { PembayaranService } from './pembayaran.service';

@ApiTags('Pembayaran')
@ApiBearerAuth()
@Controller('pembayaran')
export class PembayaranController {
  constructor(private readonly pembayaranService: PembayaranService) {}

  @Get('saya')
  @Roles(Role.PENGHUNI, Role.ADMIN)
  @ApiOperation({ summary: 'Riwayat pembayaran pengguna yang sedang login (FR-23)' })
  findMine(@CurrentUser() user: AuthUser, @Query() query: QueryPembayaranDto) {
    return this.pembayaranService.findMine(user.id_user, query);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List pembayaran + filter status (FR-24)' })
  findAll(@Query() query: QueryPembayaranDto) {
    return this.pembayaranService.findAll(query);
  }

  @Get(':id/bukti')
  @ApiOperation({ summary: 'Lihat bukti bayar (private, URL bertanda tangan singkat)' })
  async bukti(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.pembayaranService.buktiUrl(id, {
      id_user: user.id_user,
      role: user.role,
    });
  }

  @Get(':id/bukti/unduh')
  @ApiOperation({ summary: 'Ambil isi bukti bayar (dipakai mode penyimpanan lokal)' })
  @ApiOkResponse({ description: 'Berkas bukti bayar' })
  async unduhBukti(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Res() response: Response
  ): Promise<void> {
    const { buffer, mime } = await this.pembayaranService.bacaBukti(id, {
      id_user: user.id_user,
      role: user.role,
    });
    const ekstensi = mime === 'application/pdf' ? '.pdf' : mime === 'image/png' ? '.png' : '.jpg';
    response.setHeader('Content-Type', mime);
    response.setHeader('Content-Disposition', `inline; filename="bukti-${id}${ekstensi}"`);
    response.setHeader('Cache-Control', 'private, no-store');
    response.send(buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail satu pembayaran' })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.pembayaranService.findOne(id, {
      id_user: user.id_user,
      role: user.role,
    });
  }

  @Post()
  @Roles(Role.PENGHUNI)
  @UseInterceptors(
    FileInterceptor('bukti', {
      limits: { fileSize: MAX_UPLOAD_BYTES },
      fileFilter: (_req, file, callback) => {
        const boleh = ['image/jpeg', 'image/png', 'application/pdf'];
        callback(null, boleh.includes(file.mimetype));
      },
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['id_tagihan', 'jumlah_bayar', 'metode', 'bukti'],
      properties: {
        id_tagihan: { type: 'string', example: 'cm123abc456' },
        jumlah_bayar: { type: 'number', example: 750000 },
        metode: { type: 'string', enum: ['TRANSFER_BANK', 'CASH', 'EWALLET'] },
        catatan: { type: 'string', example: 'BCA-123-20260929' },
        bukti: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Kirim pembayaran + unggah bukti transfer (FR-22)' })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreatePembayaranDto,
    @UploadedFile() file: Express.Multer.File | undefined
  ) {
    return this.pembayaranService.create(user.id_user, dto, file);
  }

  @Patch(':id/konfirmasi')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Setujui pembayaran → tagihan menjadi LUNAS (FR-25)' })
  konfirmasi(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: KonfirmasiPembayaranDto
  ) {
    return this.pembayaranService.konfirmasi(id, user.id_user, dto);
  }

  @Patch(':id/tolak')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Tolak pembayaran — alasan_tolak wajib diisi (FR-26)' })
  tolak(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: TolakPembayaranDto) {
    return this.pembayaranService.tolak(id, user.id_user, dto);
  }
}
