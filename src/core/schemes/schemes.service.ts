import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Applicant } from '@prisma/client';
import {
  SchemeEligibilityCriteria,
  SchemeResponseDto,
} from './types/scheme.types';

@Injectable()
export class SchemesService {
  private readonly logger = new Logger(SchemesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<SchemeResponseDto[]> {
    this.logger.log('Fetching all schemes');
    try {
      const schemes = await this.prisma.scheme.findMany();
      this.logger.debug(`Found ${schemes.length} schemes`);
      const response = schemes.map((scheme) => {
        this.logger.verbose(`Processing scheme: ${scheme.name} (${scheme.id})`);
        return SchemeResponseDto.from(scheme);
      });
      this.logger.log('Successfully retrieved all schemes');
      return response;
    } catch (error) {
      const err = error as Error;
      this.logger.error('Failed to fetch schemes', err.stack);
      throw error;
    }
  }

  async findEligibleSchemes(applicantId: string): Promise<SchemeResponseDto[]> {
    this.logger.log(`Finding eligible schemes for applicant ${applicantId}`);

    try {
      const applicant = await this.prisma.applicant.findUnique({
        where: { id: applicantId },
        include: {
          householdMembers: true,
        },
      });

      if (!applicant) {
        this.logger.warn(`Applicant with ID ${applicantId} not found`);
        throw new NotFoundException(
          `Applicant with ID ${applicantId} not found`,
        );
      }

      this.logger.debug(`Found applicant: ${applicant.name} (${applicantId})`);
      this.logger.verbose(
        `Applicant details: ${JSON.stringify({
          employmentStatus: applicant.employmentStatus,
          householdSize: applicant.householdMembers.length,
        })}`,
      );

      const schemes = await this.prisma.scheme.findMany();
      this.logger.debug(`Found ${schemes.length} schemes to evaluate`);

      const eligibleSchemes = schemes.map((scheme) => {
        this.logger.verbose(`Evaluating scheme: ${scheme.name} (${scheme.id})`);
        try {
          const criteria = scheme.criteria as SchemeEligibilityCriteria;
          const isEligible = this.checkEligibility(applicant, criteria);
          this.logger.debug(
            `Eligibility result for scheme ${scheme.name}: ${isEligible}`,
          );
          return SchemeResponseDto.from({
            ...scheme,
            isEligible,
          });
        } catch (error) {
          const err = error as Error;
          this.logger.warn(
            `Failed to evaluate scheme ${scheme.name}: ${err.message}`,
          );
          return SchemeResponseDto.from({
            ...scheme,
            isEligible: false,
          });
        }
      });

      const eligibleCount = eligibleSchemes.filter((s) => s.isEligible).length;
      this.logger.log(
        `Found ${eligibleCount} eligible schemes out of ${schemes.length} total schemes`,
      );
      return eligibleSchemes;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error processing eligibility for applicant ${applicantId}`,
        err.stack,
      );
      throw error;
    }
  }

  private checkEligibility(
    applicant: Applicant & { householdMembers: any[] },
    criteria: SchemeEligibilityCriteria,
  ): boolean {
    this.logger.debug('Checking eligibility criteria');

    // Check employment status if specified
    if (criteria.employment_status) {
      this.logger.verbose(
        `Checking employment status: required=${criteria.employment_status}, actual=${applicant.employmentStatus}`,
      );
      if (
        applicant.employmentStatus.toLowerCase() !== criteria.employment_status
      ) {
        this.logger.debug('Employment status check failed');
        return false;
      }
    }

    // Check for children in primary school if specified
    if (criteria.has_children?.school_level === '== primary') {
      this.logger.verbose('Checking for children in primary school');
      const hasChildrenInPrimarySchool = applicant.householdMembers.some(
        (member) => {
          const age = this.calculateAge(member.dateOfBirth);
          this.logger.verbose(`Household member age: ${age}`);
          return age >= 7 && age <= 12; // Primary school age range in Singapore
        },
      );

      if (!hasChildrenInPrimarySchool) {
        this.logger.debug('No children in primary school found');
        return false;
      }
      this.logger.debug('Found children in primary school');
    }

    this.logger.debug('All eligibility criteria passed');
    return true;
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}
