-- AddForeignKey
ALTER TABLE "Affiliation" ADD CONSTRAINT "Affiliation_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Guild"("id") ON DELETE SET NULL ON UPDATE CASCADE;
