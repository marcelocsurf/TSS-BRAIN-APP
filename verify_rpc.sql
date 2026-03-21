-- Verify save_cascade_session RPC exists and check its parameters
SELECT proname, pronargs, proargnames
FROM pg_proc
WHERE proname = 'save_cascade_session';

-- Verify update_student_profile_on_close RPC exists
SELECT proname, pronargs, proargnames
FROM pg_proc
WHERE proname = 'update_student_profile_on_close';

-- Verify get_drills_for_belt RPC exists
SELECT proname, pronargs, proargnames
FROM pg_proc
WHERE proname = 'get_drills_for_belt';

-- Verify get_pilar_parts_for_belt RPC exists
SELECT proname, pronargs, proargnames
FROM pg_proc
WHERE proname = 'get_pilar_parts_for_belt';

-- Verify students table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;

-- Verify cascade_sessions table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'cascade_sessions'
ORDER BY ordinal_position;

-- Verify student_session_results table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'student_session_results'
ORDER BY ordinal_position;
