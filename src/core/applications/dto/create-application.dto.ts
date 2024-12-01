import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty()
  @IsUUID()
  applicantId!: string;

  @ApiProperty()
  @IsUUID()
  schemeId!: string;

  @ApiProperty()
  @IsUUID()
  administratorId!: string;
}
