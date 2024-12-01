import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsISO8601,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MaritalStatus, EmploymentStatus, Sex } from '@prisma/client';

export class CreateHouseholdMemberDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsISO8601()
  dateOfBirth!: string;

  @ApiProperty({ enum: Sex })
  @IsEnum(Sex)
  sex!: Sex;

  @ApiProperty({ enum: EmploymentStatus })
  @IsEnum(EmploymentStatus)
  employmentStatus!: EmploymentStatus;

  @ApiProperty()
  @IsString()
  relationship!: string;
}

export class CreateApplicantDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsISO8601()
  dateOfBirth!: string;

  @ApiProperty({ enum: MaritalStatus })
  @IsEnum(MaritalStatus)
  maritalStatus!: MaritalStatus;

  @ApiProperty({ enum: EmploymentStatus })
  @IsEnum(EmploymentStatus)
  employmentStatus!: EmploymentStatus;

  @ApiProperty({ enum: Sex })
  @IsEnum(Sex)
  sex!: Sex;

  @ApiProperty({ type: [CreateHouseholdMemberDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateHouseholdMemberDto)
  householdMembers!: CreateHouseholdMemberDto[];
}
