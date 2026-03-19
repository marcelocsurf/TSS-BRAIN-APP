-- ============================================================
-- TSS BRAIN — Create test users for each role
-- Run against Supabase with service_role key or via SQL Editor
-- ============================================================

-- 1. Admin user
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud, confirmation_token
  ) VALUES (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
    'admin@tss-brain.com',
    crypt('TssBrain2026!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"admin"}',
    false, 'authenticated', 'authenticated', ''
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (v_user_id, v_user_id, 'admin@tss-brain.com', jsonb_build_object('sub', v_user_id, 'email', 'admin@tss-brain.com'), 'email', now(), now(), now());

    INSERT INTO public.coaches (auth_user_id, display_name, role, max_belt_permission)
    VALUES (v_user_id, 'Admin TSS', 'admin', 'black_belt')
    ON CONFLICT (auth_user_id) DO NOTHING;
  END IF;
END $$;

-- 2. Coordinator user
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud, confirmation_token
  ) VALUES (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
    'coordinator@tss-brain.com',
    crypt('TssBrain2026!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"coordinator"}',
    false, 'authenticated', 'authenticated', ''
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (v_user_id, v_user_id, 'coordinator@tss-brain.com', jsonb_build_object('sub', v_user_id, 'email', 'coordinator@tss-brain.com'), 'email', now(), now(), now());

    INSERT INTO public.coaches (auth_user_id, display_name, role, max_belt_permission)
    VALUES (v_user_id, 'Coordinator TSS', 'coordinator', 'brown_belt')
    ON CONFLICT (auth_user_id) DO NOTHING;
  END IF;
END $$;

-- 3. Coach user
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud, confirmation_token
  ) VALUES (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
    'coach@tss-brain.com',
    crypt('TssBrain2026!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"coach"}',
    false, 'authenticated', 'authenticated', ''
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (v_user_id, v_user_id, 'coach@tss-brain.com', jsonb_build_object('sub', v_user_id, 'email', 'coach@tss-brain.com'), 'email', now(), now(), now());

    INSERT INTO public.coaches (auth_user_id, display_name, role, max_belt_permission)
    VALUES (v_user_id, 'Coach TSS', 'coach', 'blue_belt')
    ON CONFLICT (auth_user_id) DO NOTHING;
  END IF;
END $$;

-- 4. Assistant user
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud, confirmation_token
  ) VALUES (
    gen_random_uuid(), '00000000-0000-0000-0000-000000000000',
    'assistant@tss-brain.com',
    crypt('TssBrain2026!', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}',
    '{"role":"assistant"}',
    false, 'authenticated', 'authenticated', ''
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO v_user_id;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (v_user_id, v_user_id, 'assistant@tss-brain.com', jsonb_build_object('sub', v_user_id, 'email', 'assistant@tss-brain.com'), 'email', now(), now(), now());

    INSERT INTO public.coaches (auth_user_id, display_name, role, max_belt_permission)
    VALUES (v_user_id, 'Assistant TSS', 'assistant', 'yellow_belt')
    ON CONFLICT (auth_user_id) DO NOTHING;
  END IF;
END $$;
