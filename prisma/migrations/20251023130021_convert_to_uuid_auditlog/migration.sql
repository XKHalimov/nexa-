-- CreateTable
CREATE TABLE "audit_logs" (
    "id" BIGSERIAL NOT NULL,
    "table_name" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "row_id" UUID,
    "actor_id" UUID,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "before" JSONB,
    "after" JSONB,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
