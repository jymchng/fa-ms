import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApplicantsService } from './applicants.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { JwtAuthGuard } from '../../../src/core/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../src/core/auth/guards/roles.guard';
import { Roles } from '../../../src/core/auth/decorators/roles.decorator';
import { Role } from '../../../src/core/auth/enums/role.enum';

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new applicant' })
  @ApiResponse({
    status: 201,
    description: 'The applicant has been successfully created',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User does not have administrator privileges',
  })
  async create(@Body() createApplicantDto: CreateApplicantDto) {
    return this.applicantsService.create(createApplicantDto);
  }
}
