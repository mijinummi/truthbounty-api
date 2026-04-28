import {
  Controller,
  Post,
  Param,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { IdentityService } from '../services/identity.service';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@Controller('identity/users')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  /**
   * 🔐 SECURED: Only account owner can verify
   */
  @Post(':id/verify-worldcoin')
  @UseGuards(JwtAuthGuard)
  async verifyWorldcoin(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    // ✅ Ownership enforcement
    if (!user || user.id !== id) {
      throw new ForbiddenException(
        'You can only verify your own account',
      );
    }

    const result = await this.identityService.verifyWorldcoin(id);

    return {
      success: true,
      data: result,
    };
  }
}