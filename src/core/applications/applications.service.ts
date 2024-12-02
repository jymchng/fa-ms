import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../vendors/prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.application.findMany({
      include: {
        applicant: true,
        scheme: true,
        administrator: true,
      },
    });
  }

  async create(createApplicationDto: CreateApplicationDto) {
    // Check if applicant exists
    const applicant = await this.prisma.applicant.findUnique({
      where: { id: createApplicationDto.applicantId },
      include: { householdMembers: true },
    });

    if (!applicant) {
      throw new BadRequestException('Applicant not found');
    }

    // Check if scheme exists
    const scheme = await this.prisma.scheme.findUnique({
      where: { id: createApplicationDto.schemeId },
    });

    if (!scheme) {
      throw new BadRequestException('Scheme not found');
    }

    // Check eligibility criteria
    const criteria = scheme.criteria as any;
    let isEligible = true;

    if (
      criteria.employment_status &&
      criteria.employment_status !== applicant.employmentStatus
    ) {
      isEligible = false;
    }

    if (
      criteria.marital_status &&
      criteria.marital_status !== applicant.maritalStatus
    ) {
      isEligible = false;
    }

    if (criteria.has_children) {
      const hasChildrenInPrimarySchool = applicant.householdMembers.some(
        (member) => {
          const age =
            new Date().getFullYear() -
            new Date(member.dateOfBirth).getFullYear();
          return age >= 6 && age <= 12; // Primary school age range
        },
      );

      if (!hasChildrenInPrimarySchool) {
        isEligible = false;
      }
    }

    if (!isEligible) {
      throw new BadRequestException(
        'Applicant does not meet eligibility criteria',
      );
    }

    // First find or create a default administrator if none provided
    const administratorId =
      createApplicationDto.administratorId ||
      (await this.getDefaultAdministrator());

    // Create application using unchecked create
    const createData: Prisma.ApplicationUncheckedCreateInput = {
      status: 'PENDING',
      applicantId: createApplicationDto.applicantId,
      schemeId: createApplicationDto.schemeId,
      administratorId,
    };

    return this.prisma.application.create({
      data: createData,
      include: {
        applicant: true,
        scheme: true,
        administrator: true,
      },
    });
  }

  private async getDefaultAdministrator(): Promise<string> {
    const defaultAdmin = await this.prisma.administrator.findFirst({
      where: {
        email: 'admin@default.com',
      },
    });

    if (defaultAdmin) {
      return defaultAdmin.id;
    }

    // Create a default administrator if none exists
    const newAdmin = await this.prisma.administrator.create({
      data: {
        email: 'admin@default.com',
        name: 'Default Administrator',
      },
    });

    return newAdmin.id;
  }
}
