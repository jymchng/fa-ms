import { PrismaClient, EmploymentStatus, Sex, MaritalStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create James
  await prisma.applicant.create({
    data: {
      id: '01913b7a-4493-74b2-93f8-e684c4ca935c',
      name: 'James',
      employmentStatus: EmploymentStatus.UNEMPLOYED,
      sex: Sex.MALE,
      dateOfBirth: new Date('1990-07-01'),
      maritalStatus: MaritalStatus.SINGLE, // Assuming single as not specified
    },
  });

  // Create Mary and her household
  await prisma.applicant.create({
    data: {
      id: '01913b80-2c04-7f9d-86a4-497ef68cb3a0',
      name: 'Mary',
      employmentStatus: EmploymentStatus.UNEMPLOYED,
      sex: Sex.FEMALE,
      dateOfBirth: new Date('1984-10-06'),
      maritalStatus: MaritalStatus.SINGLE, // Assuming single as not specified
      householdMembers: {
        create: [
          {
            id: '01913b88-1d4d-7152-a7ce-75796a2e8ecf',
            name: 'Gwen',
            employmentStatus: EmploymentStatus.UNEMPLOYED,
            sex: Sex.FEMALE,
            dateOfBirth: new Date('2016-02-01'),
            relationship: 'daughter',
          },
          {
            id: '01913b88-65c6-7255-820f-9c4dd1e5ce79',
            name: 'Jayden',
            employmentStatus: EmploymentStatus.UNEMPLOYED,
            sex: Sex.MALE,
            dateOfBirth: new Date('2018-03-15'),
            relationship: 'son',
          },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
