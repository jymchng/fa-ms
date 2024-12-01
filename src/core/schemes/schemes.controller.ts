import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SchemesService } from './schemes.service';

@ApiTags('schemes')
@Controller('api/schemes')
export class SchemesController {
  constructor(private readonly schemesService: SchemesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all schemes' })
  @ApiResponse({ status: 200, description: 'Returns all schemes' })
  async findAll() {
    return this.schemesService.findAll();
  }

  @Get('eligible')
  @ApiOperation({ summary: 'Get eligible schemes for an applicant' })
  @ApiResponse({
    status: 200,
    description: 'Returns eligible schemes for the applicant',
  })
  async findEligible(@Query('applicant') applicantId: string) {
    return this.schemesService.findEligibleSchemes(applicantId);
  }
}
