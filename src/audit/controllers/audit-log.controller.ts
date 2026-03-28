import { Controller, Get, Query, Param, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AuditTrailService } from '../services/audit-trail.service';
import { AuditLog, AuditActionType, AuditEntityType } from '../entities/audit-log.entity';

@ApiTags('audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditTrailService: AuditTrailService) {}

  /**
   * Get all audit logs with optional filters
   * GET /audit?entityType=CLAIM&actionType=CLAIM_CREATED&userId=xxx&limit=50&offset=0
   */
  @Get()
  async getAuditLogs(
    @Query('entityType') entityType?: AuditEntityType,
    @Query('actionType') actionType?: AuditActionType,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const parsedLimit = limit ? Math.min(parseInt(limit, 10), 500) : 100;
    const parsedOffset = offset ? Math.max(parseInt(offset, 10), 0) : 0;

    return this.auditTrailService.getAuditLogs(
      entityType,
      actionType,
      userId,
      parsedLimit,
      parsedOffset,
    );
  }

  /**
   * Get audit logs for a specific entity
   * GET /audit/entity/CLAIM/claim-id-123
   */
  @Get('entity/:entityType/:entityId')
  async getEntityAuditLogs(
    @Param('entityType') entityType: AuditEntityType,
    @Param('entityId') entityId: string,
  ): Promise<AuditLog[]> {
    return this.auditTrailService.getEntityAuditLogs(entityType, entityId);
  }

  /**
   * Get audit logs for a specific user
   * GET /audit/user/user-id-123?limit=50
   */
  @Get('user/:userId')
  async getUserAuditLogs(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const parsedLimit = limit ? Math.min(parseInt(limit, 10), 500) : 100;
    const parsedOffset = offset ? Math.max(parseInt(offset, 10), 0) : 0;

    return this.auditTrailService.getUserAuditLogs(
      userId,
      parsedLimit,
      parsedOffset,
    );
  }

  /**
   * Get audit logs for a specific action type
   * GET /audit/action/CLAIM_CREATED?limit=50
   */
  @Get('action/:actionType')
  async getActionAuditLogs(
    @Param('actionType') actionType: AuditActionType,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const parsedLimit = limit ? Math.min(parseInt(limit, 10), 500) : 100;
    const parsedOffset = offset ? Math.max(parseInt(offset, 10), 0) : 0;

    return this.auditTrailService.getActionAuditLogs(
      actionType,
      parsedLimit,
      parsedOffset,
    );
  }

  /**
   * Get change history for a specific entity
   * GET /audit/changes/CLAIM/claim-id-123
   */
  @Get('changes/:entityType/:entityId')
  async getChangeHistory(
    @Param('entityType') entityType: AuditEntityType,
    @Param('entityId') entityId: string,
  ): Promise<
    Array<{
      timestamp: Date;
      action: AuditActionType;
      userId: string;
      changes: Record<string, { before: any; after: any }>;
    }>
  > {
    return this.auditTrailService.getChangeHistory(entityType, entityId);
  }

  /**
   * Get audit summary for a specific entity type
   * GET /audit/summary?entityType=CLAIM&days=7
   */
  @Get('summary')
  async getAuditSummary(
    @Query('entityType') entityType?: AuditEntityType,
    @Query('days') days?: string,
  ): Promise<Record<string, number>> {
    const parsedDays = days ? Math.max(parseInt(days, 10), 1) : 7;
    return this.auditTrailService.getAuditSummary(entityType, parsedDays);
  }
}
