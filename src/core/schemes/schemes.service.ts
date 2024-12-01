import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../vendors/prisma/prisma.service';

@Injectable()
export class SchemesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.scheme.findMany();
  }

  async findEligibleSchemes(applicantId: string) {
    // First, get the applicant with their household members
    const applicant = await this.prisma.applicant.findUnique({
      where: { id: applicantId },
      include: {
        householdMembers: true,
      },
    });

    if (!applicant) {
      return [];
    }

    // Get all schemes
    const schemes = await this.prisma.scheme.findMany();

    // Filter schemes based on eligibility criteria
    const eligibleSchemes = schemes.filter(scheme => {
      const criteria = scheme.criteria as any;
      
      // Check employment status criteria
      if (criteria.employment_status && criteria.employment_status !== applicant.employmentStatus) {
        return false;
      }

      // Check marital status criteria
      if (criteria.marital_status && criteria.marital_status !== applicant.maritalStatus) {
        return false;
      }

      // Check household criteria
      if (criteria.has_children) {
        const hasChildrenInPrimarySchool = applicant.householdMembers.some(member => {
          const age = new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear();
          return age >= 6 && age <= 12; // Primary school age range
        });

        if (criteria.has_children.school_level === '== primary' && !hasChildrenInPrimarySchool) {
          return false;
        }
      }

      return true;
    });

    return eligibleSchemes;
  }
}
