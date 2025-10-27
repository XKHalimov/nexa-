import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@nexa.ai' },
    update: {},
    create: {
      email: 'admin@nexa.ai',
      password,
      firstName: 'Xursanali',
      lastName: 'Xalimov',
      role: 'admin',
    },
  });

  console.log('Default admin created: admin@nexa.ai / admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
