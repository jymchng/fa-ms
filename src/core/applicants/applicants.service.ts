import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../vendors/prisma/prisma.service';
import { CreateApplicantDto } from './dto/create-applicant.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ApplicantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.applicant.findMany({
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
  }

  async findOne(id: string) {
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
      throw new NotFoundException(`Applicant with ID ${id} not found`);
    }

    return applicant;
  }

  async create(createApplicantDto: CreateApplicantDto) {
    const { householdMembers, ...applicantData } = createApplicantDto;

    // Validate NRIC format (assuming Singapore NRIC)
    if (!this.isValidNRIC(applicantData.nric)) {
      throw new BadRequestException('Invalid NRIC format');
    }

    // Validate email format
    if (!this.isValidEmail(applicantData.email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Validate phone number (assuming Singapore phone number)
    if (!this.isValidPhone(applicantData.phone)) {
      throw new BadRequestException('Invalid phone number format');
    }

    // Validate date of birth
    if (!this.isValidDate(applicantData.dateOfBirth)) {
      throw new BadRequestException('Invalid date of birth');
    }

    // Validate monthly income
    if (applicantData.monthlyIncome < 0) {
      throw new BadRequestException('Monthly income cannot be negative');
    }

    try {
      return await this.prisma.applicant.create({
        data: {
          name: applicantData.name,
          dateOfBirth: new Date(applicantData.dateOfBirth),
          maritalStatus: applicantData.maritalStatus,
          employmentStatus: applicantData.employmentStatus,
          sex: applicantData.sex,
          householdMembers: {
            create: householdMembers?.map(member => ({
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
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
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
