import { PrismaClient } from '@prisma/client';

import { institutions } from './data/institutions';

const prisma = new PrismaClient();

async function main() {
  for (const institution of institutions) {
    await prisma.institution.upsert({
      where: { domain: institution.domain },
      update: {
        name: institution.name,
        isActive: true,
      },
      create: {
        name: institution.name,
        domain: institution.domain,
        isActive: true,
      },
    });
  }

  console.log(`✅ Instituciones sincronizadas: ${institutions.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
