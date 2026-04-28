import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { MetricsService } from "./metrics.service";
import { MetricsAuthGuard } from "./metrics-auth.guard";

@Controller("metrics")
@UseGuards(MetricsAuthGuard)
export class MetricsController {
  constructor(private readonly service: MetricsService) {}

  @Get()
  async getMetrics(@Res() res: Response) {
    res.setHeader("Content-Type", "text/plain");
    res.send(await this.service.getMetrics());
  }
}
