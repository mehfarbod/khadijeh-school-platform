import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(path, "utf8");

test("phase 2 migration is additive and preserves legacy top students", () => {
  const migration = read("prisma/migrations/20261127010000_add_phase2_public_recognition/migration.sql");
  assert.match(migration, /ADD COLUMN "className" TEXT/);
  assert.match(migration, /ADD COLUMN "rank" INTEGER/);
  assert.doesNotMatch(migration, /DROP|TRUNCATE|DELETE FROM|UPDATE "TopStudent"/i);
});

test("phase 2 writes reuse existing permissions", () => {
  for (const path of [
    "src/app/api/scientific-groups/route.ts",
    "src/app/api/scientific-groups/[id]/route.ts",
    "src/app/api/scientific-groups/[id]/minutes/route.ts",
    "src/app/api/scientific-group-minutes/[id]/route.ts",
  ]) assert.match(read(path), /requirePermission\("programs\.manage"\)/, path);
  for (const path of [
    "src/app/api/graduates/route.ts",
    "src/app/api/graduates/[id]/route.ts",
    "src/app/api/outstanding-students/route.ts",
    "src/app/api/outstanding-students/[id]/route.ts",
  ]) assert.match(read(path), /requirePermission\("top_students\.manage"\)/, path);
  assert.doesNotMatch(read("src/lib/auth/permissions.ts"), /scientific_groups|graduates\.manage|outstanding_students/);
});

test("admin CRUD handlers cover create, edit, publish, and delete", () => {
  const scientificCreate = read("src/app/api/scientific-groups/route.ts");
  const scientificUpdate = read("src/app/api/scientific-groups/[id]/route.ts");
  const minuteCreate = read("src/app/api/scientific-groups/[id]/minutes/route.ts");
  const minuteUpdate = read("src/app/api/scientific-group-minutes/[id]/route.ts");
  const graduatesCreate = read("src/app/api/graduates/route.ts");
  const graduatesUpdate = read("src/app/api/graduates/[id]/route.ts");
  const outstandingCreate = read("src/app/api/outstanding-students/route.ts");
  const outstandingUpdate = read("src/app/api/outstanding-students/[id]/route.ts");
  for (const source of [scientificCreate, minuteCreate, graduatesCreate, outstandingCreate]) assert.match(source, /export async function POST/);
  for (const source of [scientificUpdate, minuteUpdate, graduatesUpdate, outstandingUpdate]) {
    assert.match(source, /export async function PATCH/);
    assert.match(source, /export async function DELETE/);
  }
  for (const source of [scientificCreate, minuteCreate, graduatesCreate, outstandingCreate]) assert.match(source, /isPublished/);
});

test("public recognition pages use narrow student projections", () => {
  for (const path of ["src/app/graduates/page.tsx", "src/app/outstanding-students/page.tsx", "src/app/scientific-groups/[id]/page.tsx"]) {
    const source = read(path);
    assert.doesNotMatch(source, /nationalId|mobile|father|mother|address|birthday|passwordHash/, path);
  }
  assert.match(read("src/app/graduates/page.tsx"), /firstName: true, lastName: true, entranceExamYear: true, major: true, university: true/);
  assert.match(read("src/app/outstanding-students/page.tsx"), /student: \{ select: \{ firstName: true, lastName: true \} \}/);
});

test("top student carousel uses explicit ranks and responsive page sizes", () => {
  const source = read("src/components/sections/TopStudents.tsx");
  assert.match(source, /rankStyles/);
  assert.match(source, /\/3\)\]/);
  assert.match(source, /\/6\)\]/);
  assert.match(read("src/app/api/top-students/route.ts"), /rank: z\.number\(\)\.int\(\)\.min\(1\)\.max\(3\)/);
});

test("both announcement areas share the stronger sky background", () => {
  assert.match(read("src/components/announcements/AnnouncementCard.tsx"), /bg-\[#DCEFFF\]/);
  assert.match(read("src/components/sections/AnnouncementsPreview.tsx"), /bg-\[#DCEFFF\]/);
});
