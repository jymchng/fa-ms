import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../vendors/prisma/prisma.service';
import { Applicant } from '@prisma/client';
import { SchemeEligibilityCriteria, SchemeResponseDto } from './types/scheme.types';

@Injectable()
export class SchemesService {
  private readonly logger = new Logger(SchemesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<SchemeResponseDto[]> {
    const schemes = await this.prisma.scheme.findMany();
    return schemes.map(scheme => SchemeResponseDto.from(scheme));
  }

  async findEligibleSchemes(
    applicantId: string,
  ): Promise<SchemeResponseDto[]> {
    this.logger.debug(`Finding eligible schemes for applicant ${applicantId}`);

    const applicant = await this.prisma.applicant.findUnique({
      where: { id: applicantId },
      include: {
        householdMembers: true,
      },
    });

    if (!applicant) {
      this.logger.warn(`Applicant with ID ${applicantId} not found`);
      throw new NotFoundException(`Applicant with ID ${applicantId} not found`);
    }

    this.logger.log(`Found applicant: ${applicant.name} (${applicantId})`);

    const schemes = await this.prisma.scheme.findMany();
    const eligibleSchemes = schemes.map(scheme => {
      try {
        const criteria = scheme.criteria as SchemeEligibilityCriteria;
        return SchemeResponseDto.from({
          ...scheme,
          isEligible: this.checkEligibility(applicant, criteria),
        });
      } catch {
        return SchemeResponseDto.from({
          ...scheme,
          isEligible: false,
        });
      }
    });

    this.logger.debug(`Found ${eligibleSchemes.length} eligible schemes`);
    return eligibleSchemes;
  }

  private checkEligibility(
    applicant: Applicant & { householdMembers: any[] },
    criteria: SchemeEligibilityCriteria,
  ): boolean {
    // Check employment status if specified
    if (criteria.employment_status) {
      if (applicant.employmentStatus.toLowerCase() !== criteria.employment_status) {
        return false;
      }
    }

    // Check for children in primary school if specified
    if (criteria.has_children?.school_level === '== primary') {
      const hasChildrenInPrimarySchool = applicant.householdMembers.some(member => {
        const age = this.calculateAge(member.dateOfBirth);
        return age >= 7 && age <= 12; // Primary school age range in Singapore
      });

      if (!hasChildrenInPrimarySchool) {
        return false;
      }
    }

    return true;
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
