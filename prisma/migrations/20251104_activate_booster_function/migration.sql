CREATE OR REPLACE FUNCTION activate_booster(user_id UUID, booster_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE "user_booster"
  SET active = TRUE,
      "expiresAt" = NOW() + INTERVAL '1 hour' * (
        SELECT duration FROM "booster" WHERE id = booster_id
      )
  WHERE "userId" = user_id AND "boosterId" = booster_id;
END;
$$ LANGUAGE plpgsql;
