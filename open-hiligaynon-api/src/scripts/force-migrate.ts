import "dotenv/config";
import { ensureDatabaseSchema, pool, prisma } from "../lib/prisma.js";

async function main() {
  console.log("🔧 Starting forced Hiligaynon Engine database migration...");
  await ensureDatabaseSchema();
  console.log("✅ Forced migration and schema verification completed.");
}

main()
  .catch((error) => {
    console.error("❌ Forced migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
