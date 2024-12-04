import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../vendors/prisma/prisma.service';
import { SchemeWithEligibility } from './types/scheme.types';

@Injectable()
export class SchemesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.scheme.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findEligibleSchemes(applicantId: string): Promise<SchemeWithEligibility[]> {
    // First, get the applicant with their household members
    const applicant = await this.prisma.applicant.findUnique({
      where: { id: applicantId },
      include: {
        householdMembers: true,
      },
    });

    if (!applicant) {
      throw new NotFoundException(`Applicant with ID ${applicantId} not found`);
    }

    // Get all schemes
    const schemes = await this.prisma.scheme.findMany();

    // Check eligibility for each scheme
    const eligibleSchemes = schemes.map((scheme) => {
      const isEligible = this.checkEligibility(applicant, scheme);
      return {
        ...scheme,
        isEligible,
      };
    });

    return eligibleSchemes;
  }

  private checkEligibility(
    applicant: any,
    scheme: any,
  ): boolean {
    // Get total household income
    const householdIncome = applicant.householdMembers.reduce(
      (total: number, member: any) => total + (member.monthlyIncome || 0),
      0
    );

    // Basic eligibility checks
    const ageInYears = this.calculateAge(applicant.dateOfBirth);
    const meetsAgeRequirement = ageInYears >= scheme.minAge && ageInYears <= scheme.maxAge;
    const meetsIncomeRequirement = householdIncome <= scheme.maxHouseholdIncome;
    const meetsEmploymentRequirement = scheme.eligibleEmploymentStatuses.includes(
      applicant.employmentStatus
    );
    const meetsMaritalRequirement = scheme.eligibleMaritalStatuses.includes(
      applicant.maritalStatus
    );

    return (
      meetsAgeRequirement &&
      meetsIncomeRequirement &&
      meetsEmploymentRequirement &&
      meetsMaritalRequirement
    );
  }

  private calculateAge(dateOfBirth: Date): number {
    const age = new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
    return age;
  }
}
