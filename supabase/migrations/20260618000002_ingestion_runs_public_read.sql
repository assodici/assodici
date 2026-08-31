GRANT SELECT ON ingestion_runs TO anon, authenticated;
GRANT SELECT ON associations TO anon, authenticated;
CREATE POLICY "public read" ON ingestion_runs FOR SELECT USING (true);
