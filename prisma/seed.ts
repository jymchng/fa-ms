import { PrismaClient, EmploymentStatus, Sex, MaritalStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDatabase() {
  // Delete in reverse order of dependencies
  await prisma.householdMember.deleteMany();
  await prisma.application.deleteMany();
  await prisma.applicant.deleteMany();
  await prisma.scheme.deleteMany();
  console.log('Database cleaned');
}

async function main() {
  console.log('Starting seed...');
  
  // Clean existing data
  await cleanDatabase();

  // Create Schemes
  await prisma.scheme.upsert({
    where: { id: '01913b89-9a43-7163-8757-01cc254783f3' },
    update: {},
    create: {
      id: '01913b89-9a43-7163-8757-01cc254783f3',
      name: 'Retrenchment Assistance Scheme',
      description: 'Assistance for unemployed individuals',
      criteria: {
        employment_status: 'unemployed'
      },
      benefits: {
        credits: [
          {
            id: '01913b8b-9b12-7d2c-a1fa-ea613b802ebc',
            name: 'SkillsFuture Credits',
            amount: 500.00
          }
        ]
      }
    }
  });

  await prisma.scheme.upsert({
    where: { id: '01913b89-befc-7ae3-bb37-3079aa7f1be0' },
    update: {},
    create: {
      id: '01913b89-befc-7ae3-bb37-3079aa7f1be0',
      name: 'Retrenchment Assistance Scheme (families)',
      description: 'Assistance for unemployed individuals with primary school children',
      criteria: {
        employment_status: 'unemployed',
        has_children: {
          school_level: '== primary'
        }
      },
      benefits: {
        credits: []
      }
    }
  });

  // Create James
  await prisma.applicant.upsert({
    where: { id: '01913b7a-4493-74b2-93f8-e684c4ca935c' },
    update: {},
    create: {
      id: '01913b7a-4493-74b2-93f8-e684c4ca935c',
      name: 'James',
      employmentStatus: EmploymentStatus.UNEMPLOYED,
      sex: Sex.MALE,
      dateOfBirth: new Date('1990-07-01'),
      maritalStatus: MaritalStatus.SINGLE,
    },
  });

  // Create Mary and her household
  await prisma.applicant.upsert({
    where: { id: '01913b80-2c04-7f9d-86a4-497ef68cb3a0' },
    update: {
      householdMembers: {
        deleteMany: {},
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
    create: {
      id: '01913b80-2c04-7f9d-86a4-497ef68cb3a0',
      name: 'Mary',
      employmentStatus: EmploymentStatus.UNEMPLOYED,
      sex: Sex.FEMALE,
      dateOfBirth: new Date('1984-10-06'),
      maritalStatus: MaritalStatus.SINGLE,
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

  console.log('Seed data has been inserted');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
