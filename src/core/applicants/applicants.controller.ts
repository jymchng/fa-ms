import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApplicantsService } from './applicants.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';

@ApiTags('applicants')
@Controller('api/applicants')
export class ApplicantsController {
  constructor(private readonly applicantsService: ApplicantsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all applicants' })
  @ApiResponse({ status: 200, description: 'Returns all applicants' })
  async findAll() {
    return this.applicantsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new applicant' })
  @ApiResponse({
    status: 201,
    description: 'The applicant has been successfully created',
  })
  async create(@Body() createApplicantDto: CreateApplicantDto) {
    return this.applicantsService.create(createApplicantDto);
  }
}
