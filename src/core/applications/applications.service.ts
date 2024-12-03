import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../vendors/prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from '../common/services/password.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
  ) {}

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
    const defaultEmail = this.configService.get<string>('admin.defaultEmail') ?? 'admin@default.com';
    const defaultName = this.configService.get<string>('admin.defaultName') ?? 'Default Administrator';
    const defaultPassword = this.configService.get<string>('admin.defaultPassword');

    const defaultAdmin = await this.prisma.administrator.findFirst({
      where: {
        email: defaultEmail,
      },
    });

    if (defaultAdmin) {
      return defaultAdmin.id;
    }

    // Create a default administrator if none exists
    const password = defaultPassword ?? await this.passwordService.generateSecurePassword();
    const hashedPassword = await this.passwordService.hash(password);

    const newAdmin = await this.prisma.administrator.create({
      data: {
        email: defaultEmail,
        name: defaultName,
        password: hashedPassword,
      },
    });

    return newAdmin.id;
  }
}
