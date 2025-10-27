import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runSQL() {
  const queries = [
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,

    `
    ALTER TABLE "translation_outbox"
    ALTER COLUMN "translationId" TYPE uuid USING "translationId"::uuid;
    `,

    `
    CREATE TABLE IF NOT EXISTS audit_logs (
      id bigserial PRIMARY KEY,
      table_name text NOT NULL,
      operation text NOT NULL,
      row_id uuid,
      actor_id uuid,
      changed_at timestamptz DEFAULT now(),
      before jsonb,
      after jsonb
    );
    `,

    `ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "conversation_members" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "translations" ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE "translation_outbox" ENABLE ROW LEVEL SECURITY;`,


    `DROP POLICY IF EXISTS users_select ON "users";`,
    `
    CREATE POLICY users_select ON "users"
    USING (
      current_setting('app.current_user_role', true) = 'admin'
      OR id = (current_setting('app.current_user_id', true))::uuid
    );
    `,
    `DROP POLICY IF EXISTS users_insert ON "users";`,
    `
    CREATE POLICY users_insert ON "users"
    FOR INSERT
    WITH CHECK (true);
    `,
    `DROP POLICY IF EXISTS users_update ON "users";`,
    `
    CREATE POLICY users_update ON "users"
    FOR UPDATE
    USING (id = (current_setting('app.current_user_id', true))::uuid);
    `,

    `DROP POLICY IF EXISTS profiles_select ON "profiles";`,
    `
    CREATE POLICY profiles_select ON "profiles"
    USING (
      current_setting('app.current_user_role', true) = 'admin'
      OR "userId" = (current_setting('app.current_user_id', true))::uuid
    );
    `,
    `DROP POLICY IF EXISTS profiles_update ON "profiles";`,
    `
    CREATE POLICY profiles_update ON "profiles"
    FOR UPDATE
    USING ("userId" = (current_setting('app.current_user_id', true))::uuid);
    `,

    `DROP POLICY IF EXISTS conversations_select ON "conversations";`,
    `
    CREATE POLICY conversations_select ON "conversations"
    USING (
      current_setting('app.current_user_role', true) = 'admin'
      OR "createdById" = (current_setting('app.current_user_id', true))::uuid
      OR EXISTS (
        SELECT 1 FROM "conversation_members" m
        WHERE m."conversationId" = "conversations"."id"
          AND m."userId" = (current_setting('app.current_user_id', true))::uuid
      )
    );
    `,
    `DROP POLICY IF EXISTS conversations_insert ON "conversations";`,
    `
    CREATE POLICY conversations_insert ON "conversations"
    FOR INSERT
    WITH CHECK (
      "createdById" = (current_setting('app.current_user_id', true))::uuid
      OR current_setting('app.current_user_role', true) = 'admin'
    );
    `,

    `DROP POLICY IF EXISTS conversation_members_select ON "conversation_members";`,
    `
    CREATE POLICY conversation_members_select ON "conversation_members"
    USING (
      current_setting('app.current_user_role', true) = 'admin'
      OR "userId" = (current_setting('app.current_user_id', true))::uuid
      OR EXISTS (
        SELECT 1 FROM "conversation_members" mm
        WHERE mm."conversationId" = "conversation_members"."conversationId"
          AND mm."userId" = (current_setting('app.current_user_id', true))::uuid
      )
    );
    `,
    `DROP POLICY IF EXISTS conversation_members_insert ON "conversation_members";`,
    `
    CREATE POLICY conversation_members_insert ON "conversation_members"
    FOR INSERT
    WITH CHECK (
      current_setting('app.current_user_role', true) = 'admin'
      OR EXISTS (
        SELECT 1 FROM "conversations" c
        WHERE c."id" = "conversation_members"."conversationId"
          AND c."createdById" = (current_setting('app.current_user_id', true))::uuid
      )
    );
    `,

    `DROP POLICY IF EXISTS messages_select ON "messages";`,
    `
    CREATE POLICY messages_select ON "messages"
    USING (
      current_setting('app.current_user_role', true) = 'admin'
      OR "senderId" = (current_setting('app.current_user_id', true))::uuid
      OR EXISTS (
        SELECT 1 FROM "conversation_members" m
        WHERE m."conversationId" = "messages"."conversationId"
          AND m."userId" = (current_setting('app.current_user_id', true))::uuid
      )
    );
    `,
    `DROP POLICY IF EXISTS messages_insert ON "messages";`,
    `
    CREATE POLICY messages_insert ON "messages"
    FOR INSERT
    WITH CHECK (
      "senderId" = (current_setting('app.current_user_id', true))::uuid
      AND EXISTS (
        SELECT 1 FROM "conversation_members" m
        WHERE m."conversationId" = "messages"."conversationId"
          AND m."userId" = (current_setting('app.current_user_id', true))::uuid
      )
    );
    `,

    `DROP POLICY IF EXISTS translations_select ON "translations";`,
    `
    CREATE POLICY translations_select ON "translations"
    USING (
      current_setting('app.current_user_role', true) = 'admin'
      OR EXISTS (
        SELECT 1 FROM "messages" msg
        WHERE msg."id" = "translations"."messageId"
          AND (
            msg."senderId" = (current_setting('app.current_user_id', true))::uuid
            OR EXISTS (
              SELECT 1 FROM "conversation_members" m
              WHERE m."conversationId" = msg."conversationId"
                AND m."userId" = (current_setting('app.current_user_id', true))::uuid
            )
          )
      )
    );
    `,
    `DROP POLICY IF EXISTS translations_insert ON "translations";`,
    `
    CREATE POLICY translations_insert ON "translations"
    FOR INSERT
    WITH CHECK (
      current_setting('app.current_user_role', true) = 'admin'
      OR EXISTS (
        SELECT 1 FROM "messages" msg
        JOIN "conversation_members" m ON m."conversationId" = msg."conversationId"
        WHERE msg."id" = "translations"."messageId"
          AND m."userId" = (current_setting('app.current_user_id', true))::uuid
      )
    );
    `,

    `DROP POLICY IF EXISTS translation_outbox_select ON "translation_outbox";`,
    `
    CREATE POLICY translation_outbox_select ON "translation_outbox"
    USING (true);
    `,
    `DROP POLICY IF EXISTS translation_outbox_insert ON "translation_outbox";`,
    `
    CREATE POLICY translation_outbox_insert ON "translation_outbox"
    FOR INSERT
    WITH CHECK (
      current_setting('app.current_user_role', true) = 'admin'
      OR (current_setting('app.current_user_id', true))::uuid = '00000000-0000-0000-0000-000000000000'::uuid
    );
    `,

    `
    CREATE OR REPLACE FUNCTION audit_trigger_fn() RETURNS TRIGGER AS $$
    DECLARE
      rec_before jsonb;
      rec_after jsonb;
      rowid uuid;
      actor_id uuid;
    BEGIN
      actor_id := NULLIF(current_setting('app.current_user_id', true), '')::uuid;

      IF (TG_OP = 'DELETE') THEN
        rec_before := to_jsonb(OLD);
        rec_after := NULL;
        rowid := OLD.id::uuid;
      ELSIF (TG_OP = 'UPDATE') THEN
        rec_before := to_jsonb(OLD);
        rec_after := to_jsonb(NEW);
        rowid := NEW.id::uuid;
      ELSIF (TG_OP = 'INSERT') THEN
        rec_before := NULL;
        rec_after := to_jsonb(NEW);
        rowid := NEW.id::uuid;
      END IF;

      INSERT INTO audit_logs(table_name, operation, row_id, actor_id, before, after)
      VALUES (TG_TABLE_NAME, TG_OP, rowid, actor_id, rec_before, rec_after);

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    `,

    `CREATE TRIGGER audit_conversations AFTER INSERT OR UPDATE OR DELETE ON "conversations" FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();`,
    `CREATE TRIGGER audit_members AFTER INSERT OR UPDATE OR DELETE ON "conversation_members" FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();`,
    `CREATE TRIGGER audit_messages AFTER INSERT OR UPDATE OR DELETE ON "messages" FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();`,
    `CREATE TRIGGER audit_translations AFTER INSERT OR UPDATE OR DELETE ON "translations" FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();`,
    `CREATE TRIGGER audit_outbox AFTER INSERT OR UPDATE OR DELETE ON "translation_outbox" FOR EACH ROW EXECUTE FUNCTION audit_trigger_fn();`,
  ];

  try {
    for (const [i, q] of queries.entries()) {
      console.log(`\n[${i + 1}/${queries.length}] Running query...`);
      await prisma.$executeRawUnsafe(q);
      console.log(` Query ${i + 1} bajarildi.`);
    }
    console.log('\n Barcha SQL querylar muvaffaqiyatli bajarildi!');
  } catch (err) {
    console.error(
      `\n Xatolik yuz berdi:\nQuery: ${err?.query || 'Unknown'}\nCode: ${err?.meta?.code || err?.code || 'N/A'}\nMessage:\n${err?.meta?.message || err?.message}`,
    );
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection yopildi.');
  }
}

runSQL();
