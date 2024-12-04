import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SchemesService } from './schemes.service';
import { TypedQuery, TypedRoute } from '@nestia/core';
import { SchemeResponseDto, EligibleQueryParamsDto } from './types/scheme.types';

@ApiTags('schemes')
@Controller('api/schemes')
export class SchemesController {
  private readonly logger = new Logger(SchemesController.name);

  constructor(private readonly schemesService: SchemesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all schemes' })
  @ApiResponse({
    status: 200,
    description: 'Returns all schemes',
    type: [SchemeResponseDto]
  })
  async findAll(): Promise<SchemeResponseDto[]> {
    const schemes = await this.schemesService.findAll();
    return schemes.map(scheme => ({
      ...scheme,
      isEligible: false
    }));
  }

  /**
   * Find eligible schemes for an applicant
   * 
   * @param query Query parameters containing applicant ID
   * @returns List of schemes with eligibility status
   */
  @TypedRoute.Get('eligible')
  @ApiOperation({ 
    summary: 'Get eligible schemes for an applicant',
    description: 'Returns a list of all schemes with their eligibility status for the specified applicant'
  })
  @ApiQuery({
    name: 'applicantId',
    required: true,
    type: String,
    description: 'UUID of the applicant',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({
    status: 200,
    description: 'Returns eligible schemes for the applicant',
    type: [SchemeResponseDto]
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid applicant ID format - must be a valid UUID'
  })
  @ApiResponse({
    status: 404,
    description: 'Applicant not found in the system'
  })
  async findEligible(
    @TypedQuery() query: EligibleQueryParamsDto,
  ): Promise<SchemeResponseDto[]> {
    this.logger.log(`Received request for applicant ID: ${query.applicantId}`);
    const schemes = await this.schemesService.findEligibleSchemes(query.applicantId);
    return schemes;
  }
}


