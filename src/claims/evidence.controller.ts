import { Controller, Post, Param, Body, Get, Query, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EvidenceFlagService } from './evidence-flag.service';

class CreateFlagDto {
  reason: string;
  flaggedBy?: string;
}

@ApiTags('evidence')
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly flagService: EvidenceFlagService) {}

  // POST /evidence/:id/flag
  @Post(':id/flag')
  async flagEvidence(@Param('id') id: string, @Body() body: CreateFlagDto) {
    if (!body || !body.reason) {
      throw new BadRequestException('reason is required');
    }

    // Allow moderator/admin to flag evidence. `flaggedBy` is optional.
    return this.flagService.createFlag(id, body.reason, body.flaggedBy);
  }

  // GET /evidence/:id/flags?admin=true
  @Get(':id/flags')
  async getFlags(@Param('id') id: string, @Query('admin') admin?: string) {
    // Admin visibility supported via explicit query param 'admin=true'.
    // No auth system available here; require admin=true to return flags.
    if (!admin || admin !== 'true') {
      // For non-admins, do not expose flags — return 403 to indicate restricted access.
      throw new ForbiddenException('Flags are restricted to admins');
    }

    return this.flagService.getFlagsForEvidence(id);
  }
}
