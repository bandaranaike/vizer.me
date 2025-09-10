-- CreateTable
CREATE TABLE "public"."jobs" (
    "id" SERIAL NOT NULL,
    "companyName" TEXT NOT NULL,
    "location" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "salary" TEXT,
    "postedDate" TIMESTAMP(3),
    "expireDate" TIMESTAMP(3),
    "url" TEXT NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jobs_url_key" ON "public"."jobs"("url");
