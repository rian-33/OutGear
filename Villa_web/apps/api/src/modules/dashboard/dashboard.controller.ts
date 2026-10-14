import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@kost/types';
import { CurrentUser } from '../../common/auth/decorators/current-user.decorator';
import { Roles } from '../../common/auth/decorators/roles.decorator';
import type { AuthUser } from '../../common/auth/types';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Statistik dashboard admin (FR-32)' })
  admin() {
    return this.dashboardService.admin();
  }

  @Get('penghuni')
  @Roles(Role.PENGHUNI, Role.ADMIN)
  @ApiOperation({ summary: 'Ringkasan dashboard penghuni (FR-33)' })
  penghuni(@CurrentUser() user: AuthUser) {
    return this.dashboardService.penghuni(user.id_user);
  }
}
