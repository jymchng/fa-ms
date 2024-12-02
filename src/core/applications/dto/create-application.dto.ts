import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({
    description: 'The ID of the applicant applying for assistance',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  applicantId!: string;

  @ApiProperty({
    description: 'The ID of the financial assistance scheme being applied for',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsNotEmpty()
  schemeId!: string;

  @ApiProperty({
    description: 'The ID of the administrator processing the application',
    example: '123e4567-e89b-12d3-a456-426614174002',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  administratorId?: string;

  @ApiProperty({
    description: 'Additional notes or comments for the application',
    example: 'Urgent case, please process ASAP',
    required: false,
  })
  @IsOptional()
  notes?: string;
}
