import { Scheme } from '@prisma/client';

export interface SchemeWithEligibility extends Scheme {
  isEligible: boolean;
}
