import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../vendors/prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from '../common/services/password.service';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
  ) {}

  async findAll() {
    this.logger.log('Fetching all applications');
    
    try {
      const applications = await this.prisma.application.findMany({
        include: {
          applicant: true,
          scheme: true,
          administrator: true,
        },
      });

      this.logger.debug(`Found ${applications.length} applications`);
      applications.forEach(app => {
        this.logger.verbose(`Application: ${JSON.stringify({
          id: app.id,
          applicantName: app.applicant.name,
          schemeName: app.scheme.name,
          status: app.status,
        })}`);
      });

      return applications;
    } catch (error) {
      const err = error as Error;
      this.logger.error('Failed to fetch applications', err.stack);
      throw error;
    }
  }

  async create(createApplicationDto: CreateApplicationDto) {
    this.logger.log('Creating new application');
    this.logger.verbose(`Application data: ${JSON.stringify(createApplicationDto)}`);

    try {
      // Check if applicant exists
      const applicant = await this.prisma.applicant.findUnique({
        where: { id: createApplicationDto.applicantId },
        include: { householdMembers: true },
      });

      if (!applicant) {
        this.logger.warn(`Applicant not found: ${createApplicationDto.applicantId}`);
        throw new NotFoundException(`Applicant with ID ${createApplicationDto.applicantId} not found`);
      }
      this.logger.debug(`Found applicant: ${applicant.name}`);

      // Check if scheme exists
      const scheme = await this.prisma.scheme.findUnique({
        where: { id: createApplicationDto.schemeId },
      });

      if (!scheme) {
        this.logger.warn(`Scheme not found: ${createApplicationDto.schemeId}`);
        throw new NotFoundException(`Scheme with ID ${createApplicationDto.schemeId} not found`);
      }
      this.logger.debug(`Found scheme: ${scheme.name}`);

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
        this.logger.warn('Applicant does not meet eligibility criteria');
        throw new BadRequestException('Applicant does not meet eligibility criteria');
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

      const application = await this.prisma.application.create({
        data: createData,
        include: {
          applicant: true,
          scheme: true,
          administrator: true,
        },
      });

      this.logger.log(`Successfully created application with ID: ${application.id}`);
      this.logger.debug(`Application details: ${JSON.stringify({
        id: application.id,
        applicantName: application.applicant.name,
        schemeName: application.scheme.name,
        status: application.status,
      })}`);

      return application;
    } catch (error) {
      const err = error as Error;
      this.logger.error('Failed to create application', err.stack);
      throw error;
    }
  }

  private async getDefaultAdministrator(): Promise<string> {
    this.logger.log('Getting default administrator');

    try {
      const defaultEmail =
        this.configService.get<string>('admin.defaultEmail') ??
        'admin@default.com';
      const defaultName =
        this.configService.get<string>('admin.defaultName') ??
        'Default Administrator';
      const defaultPassword = this.configService.get<string>(
        'admin.defaultPassword',
      );

      const defaultAdmin = await this.prisma.administrator.findFirst({
        where: {
          email: defaultEmail,
        },
      });

      if (defaultAdmin) {
        this.logger.debug(`Found default administrator: ${defaultAdmin.name}`);
        return defaultAdmin.id;
      }

      // Create a default administrator if none exists
      const password =
        defaultPassword ?? (await this.passwordService.generateSecurePassword());
      const hashedPassword = await this.passwordService.hash(password);

      const newAdmin = await this.prisma.administrator.create({
        data: {
          email: defaultEmail,
          name: defaultName,
          password: hashedPassword,
        },
      });

      this.logger.log(`Created default administrator: ${newAdmin.name}`);
      return newAdmin.id;
    } catch (error) {
      const err = error as Error;
      this.logger.error('Failed to get default administrator', err.stack);
      throw error;
    }
  }
}
