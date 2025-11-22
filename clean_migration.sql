-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "domain" VARCHAR(100),
    "allowedDomains" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elections" (
    "id" TEXT NOT NULL,
    "school_id" TEXT,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "elections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "election_id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "picture_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voters" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "election_id" TEXT NOT NULL,
    "school_id" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "election_id" TEXT NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vote_records" (
    "id" TEXT NOT NULL,
    "voter_email" VARCHAR(255) NOT NULL,
    "election_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "candidate_id" TEXT NOT NULL,
    "vote_hash" VARCHAR(64) NOT NULL,
    "block_hash" VARCHAR(64),
    "block_index" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vote_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_blocks" (
    "id" TEXT NOT NULL,
    "election_id" TEXT NOT NULL,
    "block_index" INTEGER NOT NULL,
    "previous_hash" VARCHAR(64) NOT NULL,
    "hash" VARCHAR(64) NOT NULL,
    "nonce" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "transactions" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blockchain_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schools_domain_key" ON "schools"("domain");

-- CreateIndex
CREATE INDEX "schools_domain_idx" ON "schools"("domain");

-- CreateIndex
CREATE INDEX "elections_school_id_idx" ON "elections"("school_id");

-- CreateIndex
CREATE INDEX "elections_is_active_idx" ON "elections"("is_active");

-- CreateIndex
CREATE INDEX "elections_start_date_end_date_idx" ON "elections"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "positions_election_id_idx" ON "positions"("election_id");

-- CreateIndex
CREATE INDEX "positions_election_id_display_order_idx" ON "positions"("election_id", "display_order");

-- CreateIndex
CREATE INDEX "candidates_position_id_idx" ON "candidates"("position_id");

-- CreateIndex
CREATE INDEX "voters_school_id_idx" ON "voters"("school_id");

-- CreateIndex
CREATE INDEX "voters_is_verified_idx" ON "voters"("is_verified");

-- CreateIndex
CREATE UNIQUE INDEX "voters_email_election_id_key" ON "voters"("email", "election_id");

-- CreateIndex
CREATE INDEX "verification_codes_email_election_id_idx" ON "verification_codes"("email", "election_id");

-- CreateIndex
CREATE INDEX "verification_codes_expires_at_idx" ON "verification_codes"("expires_at");

-- CreateIndex
CREATE INDEX "vote_records_election_id_idx" ON "vote_records"("election_id");

-- CreateIndex
CREATE INDEX "vote_records_candidate_id_idx" ON "vote_records"("candidate_id");

-- CreateIndex
CREATE INDEX "vote_records_block_hash_idx" ON "vote_records"("block_hash");

-- CreateIndex
CREATE UNIQUE INDEX "vote_records_voter_email_position_id_key" ON "vote_records"("voter_email", "position_id");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_blocks_hash_key" ON "blockchain_blocks"("hash");

-- CreateIndex
CREATE INDEX "blockchain_blocks_hash_idx" ON "blockchain_blocks"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "blockchain_blocks_election_id_block_index_key" ON "blockchain_blocks"("election_id", "block_index");

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voters" ADD CONSTRAINT "voters_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voters" ADD CONSTRAINT "voters_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_records" ADD CONSTRAINT "vote_records_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_records" ADD CONSTRAINT "vote_records_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vote_records" ADD CONSTRAINT "vote_records_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

