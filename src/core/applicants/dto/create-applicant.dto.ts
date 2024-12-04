import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
  IsISO8601,
  Min,
  Matches,
  IsOptional,
} from 'class-validator';
import { Sex, MaritalStatus, EmploymentStatus } from '@prisma/client';

export class CreateHouseholdMemberDto {
  @ApiProperty()
  @IsString()
  name: string = '';

  @ApiProperty()
  @IsString()
  relationship: string = '';

  @ApiProperty()
  @IsISO8601()
  dateOfBirth: string = new Date().toISOString();

  @ApiProperty({ enum: EmploymentStatus })
  @IsEnum(EmploymentStatus)
  employmentStatus: EmploymentStatus = EmploymentStatus.UNEMPLOYED;

  @ApiProperty({ enum: Sex })
  @IsEnum(Sex)
  sex: Sex = Sex.MALE;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyIncome?: number = 0;
}

export class CreateApplicantDto {
  @ApiProperty()
  @IsString()
  name: string = '';

  @ApiProperty()
  @IsEmail()
  email: string = '';

  @ApiProperty()
  @Matches(/^(\+65|65)?[89]\d{7}$/, {
    message: 'Phone number must be a valid Singapore phone number',
  })
  phone: string = '';

  @ApiProperty()
  @Matches(/^[STFG]\d{7}[A-Z]$/, {
    message: 'NRIC must be in valid Singapore format',
  })
  nric: string = '';

  @ApiProperty()
  @IsISO8601()
  dateOfBirth: string = new Date().toISOString();

  @ApiProperty({ enum: EmploymentStatus })
  @IsEnum(EmploymentStatus)
  employmentStatus: EmploymentStatus = EmploymentStatus.UNEMPLOYED;

  @ApiProperty({ enum: MaritalStatus })
  @IsEnum(MaritalStatus)
  maritalStatus: MaritalStatus = MaritalStatus.SINGLE;

  @ApiProperty({ enum: Sex })
  @IsEnum(Sex)
  sex: Sex = Sex.MALE;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  monthlyIncome: number = 0;

  @ApiProperty({ type: [CreateHouseholdMemberDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHouseholdMemberDto)
  @IsOptional()
  householdMembers?: CreateHouseholdMemberDto[] = [];
}
