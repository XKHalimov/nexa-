import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common'; 
const prisma = new PrismaClient();
const logger = new Logger('XPSetup');

async function setupXpTrigger() {
  try {
    const createFunction = `
    CREATE OR REPLACE FUNCTION add_xp_on_message()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO "xp_logs" ("userId", "action", "xpAmount", "createdAt")
      VALUES (NEW."senderId", 'send_message', 10, NOW());
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    `;

    const dropTrigger = `DROP TRIGGER IF EXISTS message_xp_trigger ON "messages";`;

    const createTrigger = `
    CREATE TRIGGER message_xp_trigger
    AFTER INSERT ON "messages"
    FOR EACH ROW
    EXECUTE FUNCTION add_xp_on_message();
    `;

    const isDev = process.env.NODE_ENV !== 'production';

    if (isDev) console.log('1/3 - Creating function...');
    await prisma.$executeRawUnsafe(createFunction);
    if (isDev) console.log(' ✅ Function created.');

    if (isDev) console.log('2/3 - Dropping existing trigger if any...');
    await prisma.$executeRawUnsafe(dropTrigger);
    if (isDev) console.log(' ✅ Existing trigger dropped (if existed).');

    if (isDev) console.log('3/3 - Creating trigger...');
    await prisma.$executeRawUnsafe(createTrigger);
    if (isDev) console.log(' ✅ Trigger created. Messages will now generate XP logs.');

    if (!isDev) logger.log('XP trigger successfully (re)created.');
  } catch (err: any) {
    logger.error('Trigger yaratishda xato:', err?.message ?? err);
  } finally {
    await prisma.$disconnect();
    if (process.env.NODE_ENV !== 'production') console.log('🔌 DB connection closed.');
  }
}

setupXpTrigger();
