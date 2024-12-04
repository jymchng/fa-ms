import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../vendors/prisma/prisma.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ApplicantsService {
  private readonly logger = new Logger(ApplicantsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    this.logger.log('Fetching all applicants');

    try {
      const applicants = await this.prisma.applicant.findMany({
        include: {
          householdMembers: true,
          applications: {
            include: {
              scheme: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      this.logger.debug(`Found ${applicants.length} applicants`);
      applicants.forEach(applicant => {
        this.logger.verbose(`Applicant: ${JSON.stringify({
          id: applicant.id,
          name: applicant.name,
          householdSize: applicant.householdMembers.length,
          applicationCount: applicant.applications.length,
        })}`);
      });

      return applicants;
    } catch (error) {
      const err = error as Error;
      this.logger.error('Failed to fetch applicants', err.stack);
      throw error;
    }
  }

  async findOne(id: string) {
    this.logger.log(`Finding applicant with ID: ${id}`);

    try {
      const applicant = await this.prisma.applicant.findUnique({
        where: { id },
        include: {
          householdMembers: true,
          applications: {
            include: {
              scheme: true,
            },
          },
        },
      });

      if (!applicant) {
        this.logger.warn(`Applicant not found: ${id}`);
        throw new NotFoundException(`Applicant with ID ${id} not found`);
      }

      this.logger.debug(`Found applicant: ${JSON.stringify({
        id: applicant.id,
        name: applicant.name,
        householdSize: applicant.householdMembers.length,
        applicationCount: applicant.applications.length,
      })}`);

      return applicant;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to fetch applicant ${id}`, err.stack);
      throw error;
    }
  }

  async create(createApplicantDto: CreateApplicantDto) {
    this.logger.log('Creating new applicant');
    this.logger.verbose(`Applicant data: ${JSON.stringify(createApplicantDto)}`);

    const { householdMembers, ...applicantData } = createApplicantDto;

    // Validate NRIC format (assuming Singapore NRIC)
    if (!this.isValidNRIC(applicantData.nric)) {
      this.logger.error('Invalid NRIC format');
      throw new BadRequestException('Invalid NRIC format');
    }

    // Validate email format
    if (!this.isValidEmail(applicantData.email)) {
      this.logger.error('Invalid email format');
      throw new BadRequestException('Invalid email format');
    }

    // Validate phone number (assuming Singapore phone number)
    if (!this.isValidPhone(applicantData.phone)) {
      this.logger.error('Invalid phone number format');
      throw new BadRequestException('Invalid phone number format');
    }

    // Validate date of birth
    if (!this.isValidDate(applicantData.dateOfBirth)) {
      this.logger.error('Invalid date of birth');
      throw new BadRequestException('Invalid date of birth');
    }

    // Validate monthly income
    if (applicantData.monthlyIncome < 0) {
      this.logger.error('Monthly income cannot be negative');
      throw new BadRequestException('Monthly income cannot be negative');
    }

    try {
      const applicant = await this.prisma.applicant.create({
        data: {
          name: applicantData.name,
          dateOfBirth: new Date(applicantData.dateOfBirth),
          maritalStatus: applicantData.maritalStatus,
          employmentStatus: applicantData.employmentStatus,
          sex: applicantData.sex,
          householdMembers: {
            create: householdMembers?.map((member) => ({
              name: member.name,
              dateOfBirth: new Date(member.dateOfBirth),
              employmentStatus: member.employmentStatus,
              sex: member.sex,
              relationship: member.relationship,
              monthlyIncome: member.monthlyIncome || 0,
            })),
          },
        },
        include: {
          householdMembers: true,
          applications: {
            include: {
              scheme: true,
            },
          },
        },
      });

      this.logger.log(`Successfully created applicant with ID: ${applicant.id}`);
      this.logger.debug(`Applicant details: ${JSON.stringify({
        id: applicant.id,
        name: applicant.name,
        householdSize: applicant.householdMembers.length,
        employmentStatus: applicant.employmentStatus,
      })}`);

      return applicant;
    } catch (error) {
      const err = error as Error;
      this.logger.error('Failed to create applicant', err.stack);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.error('NRIC already exists');
          throw new BadRequestException('NRIC already exists');
        }
      }
      throw error;
    }
  }

  private isValidNRIC(nric: string): boolean {
    // Singapore NRIC format: S/T/F/G + 7 digits + checksum letter
    const nricRegex = /^[STFG]\d{7}[A-Z]$/;
    return nricRegex.test(nric);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Singapore phone number format: +65 XXXX XXXX or 8/9XXXXXXX
    const phoneRegex = /^(\+65|65)?[89]\d{7}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  private isValidDate(date: string): boolean {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  }
}
