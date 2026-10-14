import { PartialType } from '@nestjs/swagger';
import { CreateKamarDto } from './create-kamar.dto';

/** Semua field opsional untuk update parsial. `no_kamar` sengaja tidak dapat diubah. */
export class UpdateKamarDto extends PartialType(CreateKamarDto) {}
