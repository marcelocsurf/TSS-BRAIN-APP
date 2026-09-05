-- 00183: códigos de regalo del libro ONE WAVE (product_type 'one_wave').
-- Mismo generador de códigos; prefijo propio para que se reconozcan a simple vista.
CREATE OR REPLACE FUNCTION public.generate_access_code(p_product_type text DEFAULT 'white_belt'::text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  new_code TEXT;
  prefix TEXT;
  attempts INTEGER := 0;
BEGIN
  prefix := CASE p_product_type
    WHEN 'white_belt' THEN 'TSS-WB-'
    WHEN 'yellow_belt' THEN 'TSS-YB-'
    WHEN 'blue_belt' THEN 'TSS-BB-'
    WHEN 'one_wave' THEN 'TSS-OW-'
    ELSE 'TSS-XX-'
  END;

  LOOP
    new_code := prefix ||
      UPPER(SUBSTRING(MD5(random()::TEXT) FROM 1 FOR 4)) || '-' ||
      UPPER(SUBSTRING(MD5(random()::TEXT) FROM 1 FOR 4));

    EXIT WHEN NOT EXISTS (SELECT 1 FROM access_codes WHERE code = new_code);
    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Could not generate unique access code';
    END IF;
  END LOOP;

  RETURN new_code;
END;
$function$;
