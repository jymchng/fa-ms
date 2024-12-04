import { Scheme } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export interface SchemeEligibilityCriteria {
  [key: string]: any;
  employment_status?: string;
  has_children?: {
    school_level: '== primary';
  };
}

export type SchemeWithEligibility = Omit<Scheme, 'criteria' | 'benefits'> & {
  criteria: SchemeEligibilityCriteria;
  benefits: string[];
  isEligible: boolean;
};

export class SchemeResponseDto {
  @ApiProperty({ description: 'Unique identifier of the scheme' })
  id!: string;

  @ApiProperty({ description: 'Name of the scheme' })
  name!: string;

  @ApiProperty({ description: 'Description of the scheme' })
  description!: string;

  @ApiProperty({ 
    description: 'Benefits provided by the scheme',
    type: [String]
  })
  benefits!: string[];

  @ApiProperty({ 
    description: 'Eligibility criteria for the scheme',
    type: 'object'
  })
  criteria!: SchemeEligibilityCriteria;

  @ApiProperty({ description: 'Date when the scheme was created' })
  createdAt!: Date;

  @ApiProperty({ description: 'Date when the scheme was last updated' })
  updatedAt!: Date;

  @ApiProperty({ description: 'Whether the applicant is eligible for this scheme' })
  isEligible!: boolean;

  static from(scheme: Partial<Scheme> & { isEligible?: boolean }): SchemeResponseDto {
    const dto = new SchemeResponseDto();
    dto.id = scheme.id!;
    dto.name = scheme.name!;
    dto.description = scheme.description!;
    dto.benefits = Array.isArray(scheme.benefits) ? scheme.benefits.map(String) : [""];
    dto.criteria = scheme.criteria as SchemeEligibilityCriteria;
    dto.createdAt = scheme.createdAt!;
    dto.updatedAt = scheme.updatedAt!;
    dto.isEligible = scheme.isEligible ?? false;
    return dto;
  }
}

/**
 * Query parameters for finding eligible schemes
 */
export type IEligibleQueryParams = {
  /**
   * UUID of the applicant
   * @format uuid-v4
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  applicantId: string;
};

export class EligibleQueryParamsDto {
  /**
   * UUID of the applicant
   * @format uuid-v4
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @ApiProperty({
    description: 'UUID of the applicant',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  applicantId!: string;
}
