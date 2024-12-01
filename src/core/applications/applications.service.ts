import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../vendors/prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

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
    // Check if applicant is eligible for the scheme
    const scheme = await this.prisma.scheme.findUnique({
      where: { id: createApplicationDto.schemeId },
    });

    const applicant = await this.prisma.applicant.findUnique({
      where: { id: createApplicationDto.applicantId },
      include: {
        householdMembers: true,
      },
    });

    if (!scheme || !applicant) {
      throw new BadRequestException('Invalid scheme or applicant ID');
    }

    // Check eligibility criteria
    const criteria = scheme.criteria as any;
    let isEligible = true;

    if (criteria.employment_status && criteria.employment_status !== applicant.employmentStatus) {
      isEligible = false;
    }

    if (criteria.marital_status && criteria.marital_status !== applicant.maritalStatus) {
      isEligible = false;
    }

    if (criteria.has_children) {
      const hasChildrenInPrimarySchool = applicant.householdMembers.some(member => {
        const age = new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear();
        return age >= 6 && age <= 12; // Primary school age range
      });

      if (criteria.has_children.school_level === '== primary' && !hasChildrenInPrimarySchool) {
        isEligible = false;
      }
    }

    if (!isEligible) {
      throw new BadRequestException('Applicant is not eligible for this scheme');
    }

    // Create the application
    return this.prisma.application.create({
      data: {
        applicantId: createApplicationDto.applicantId,
        schemeId: createApplicationDto.schemeId,
        administratorId: createApplicationDto.administratorId,
        status: 'PENDING',
      },
      include: {
        applicant: true,
        scheme: true,
        administrator: true,
      },
    });
  }
}
    return this.prisma.application.create({
      data: {
        applicantId: createApplicationDto.applicantId,
        schemeId: createApplicationDto.schemeId,
        administratorId: createApplicationDto.administratorId,
        status: 'PENDING',
      },
      include: {
        applicant: true,
        scheme: true,
        administrator: true,
      },
    });
  }
}
