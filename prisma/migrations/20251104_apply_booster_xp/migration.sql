CREATE OR REPLACE FUNCTION apply_booster_xp()
RETURNS TRIGGER AS $$
DECLARE
  booster_multiplier FLOAT := 1;
BEGIN
  SELECT b.multiplier INTO booster_multiplier
  FROM "user_booster" ub
  JOIN "booster" b ON b.id = ub."boosterId"
  WHERE ub."userId" = NEW."userId"
    AND ub.active = TRUE
    AND ub."expiresAt" > NOW()
  LIMIT 1;

  NEW.amount := NEW.amount * booster_multiplier;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER xp_booster_trigger
BEFORE INSERT ON "xp_logs"
FOR EACH ROW
EXECUTE FUNCTION apply_booster_xp();
