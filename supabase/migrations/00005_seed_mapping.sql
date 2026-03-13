-- 00005_seed_mapping.sql
-- Maps Excel Spanish values to canonical English enums

CREATE OR REPLACE FUNCTION map_belt_name(raw TEXT) RETURNS belt_level AS $$
BEGIN
  RETURN CASE
    WHEN raw ILIKE '%blanca%' OR raw ILIKE '%white%' OR raw ILIKE '%beginner%'
      THEN 'white_belt'::belt_level
    WHEN raw ILIKE '%amarilla%' OR raw ILIKE '%yellow%' OR raw ILIKE '%novice%' OR raw ILIKE '%novato%'
      THEN 'yellow_belt'::belt_level
    WHEN raw ILIKE '%azul%' OR raw ILIKE '%blue%' OR raw ILIKE '%foundation%'
      THEN 'blue_belt'::belt_level
    WHEN raw ILIKE '%morada%' OR raw ILIKE '%purple%' OR raw ILIKE '%emerging%'
      THEN 'purple_belt'::belt_level
    WHEN raw ILIKE '%caf%' OR raw ILIKE '%brown%' OR raw ILIKE '%pre-elite%'
      THEN 'brown_belt'::belt_level
    WHEN raw ILIKE '%negra%' OR raw ILIKE '%black%' OR raw ILIKE '%elite%'
      THEN 'black_belt'::belt_level
    ELSE 'white_belt'::belt_level
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION map_ocean_condition(raw TEXT) RETURNS ocean_condition AS $$
BEGIN
  RETURN CASE
    WHEN raw ILIKE '%flat%' THEN 'flat'::ocean_condition
    WHEN raw ILIKE '%1-2%' OR raw ILIKE '%1_2%' THEN '1_2ft'::ocean_condition
    WHEN raw ILIKE '%3-4%' OR raw ILIKE '%3_4%' THEN '3_4ft'::ocean_condition
    WHEN raw ILIKE '%4-6%' OR raw ILIKE '%4_6%' THEN '4_6ft'::ocean_condition
    WHEN raw ILIKE '%6+%' OR raw ILIKE '%6_plus%' OR raw ILIKE '%6 plus%' THEN '6_plus'::ocean_condition
    ELSE 'flat'::ocean_condition
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION map_pilar(raw TEXT) RETURNS pilar AS $$
BEGIN
  RETURN CASE
    WHEN raw ILIKE '%technical%' OR raw ILIKE '%t_c%' THEN 'technical'::pilar
    WHEN raw ILIKE '%physical%' OR raw ILIKE '%f_s%' THEN 'physical'::pilar
    WHEN raw ILIKE '%tactical%' OR raw ILIKE '%t_c%' THEN 'tactical'::pilar
    WHEN raw ILIKE '%mental%' THEN 'mental'::pilar
    ELSE NULL
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION map_coach_role(raw TEXT) RETURNS coach_role AS $$
BEGIN
  RETURN CASE
    WHEN raw ILIKE '%holistic%' THEN 'holistic_coach'::coach_role
    WHEN raw ILIKE '%head%' THEN 'head_coach'::coach_role
    WHEN raw ILIKE '%coach%' AND raw NOT ILIKE '%head%' AND raw NOT ILIKE '%holistic%'
      THEN 'coach'::coach_role
    WHEN raw ILIKE '%instructor%' THEN 'instructor'::coach_role
    WHEN raw ILIKE '%ayudante%' THEN 'ayudante'::coach_role
    ELSE 'instructor'::coach_role
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
