import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../vendors/prisma/prisma.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';

@Injectable()
export class ApplicantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.applicant.findMany({
      include: {
        householdMembers: true,
        applications: true,
      },
    });
  }

  async create(createApplicantDto: CreateApplicantDto) {
    const { householdMembers, ...applicantData } = createApplicantDto;

    return this.prisma.applicant.create({
      data: {
        ...applicantData,
        householdMembers: {
          create: householdMembers,
        },
      },
      include: {
        householdMembers: true,
      },
    });
  }
}
