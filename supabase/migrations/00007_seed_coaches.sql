-- 00007_seed_coaches.sql

INSERT INTO coaches (id, first_name, last_name, display_name, email, phone, role, max_belt_permission, certification_level, active_status, languages, specialty_area)
  VALUES (gen_random_uuid(), 'Marcelo Jose', 'Castellanos Soto', 'Marcelo Castellanos', 'marcelo@purosurf.com', '79149261', map_coach_role('Holistic Coach'), 'black_belt'::belt_level, 'Cinta Negra (Elite)', TRUE, 'Español, Inglés', 'Método, visión, liderazgo');
INSERT INTO coaches (id, first_name, last_name, display_name, email, phone, role, max_belt_permission, certification_level, active_status, languages, specialty_area)
  VALUES (gen_random_uuid(), 'Stanley', 'Perez', 'Stanley Perez', '', '', map_coach_role('Head Coach'), 'brown_belt'::belt_level, 'Cinta Café (Pre-Elite)', TRUE, '', '');
INSERT INTO coaches (id, first_name, last_name, display_name, email, phone, role, max_belt_permission, certification_level, active_status, languages, specialty_area)
  VALUES (gen_random_uuid(), 'Carlos', 'Santamaria', 'Carlos Santamaria', '', '', map_coach_role('Coach'), 'purple_belt'::belt_level, 'Cinta Morada (Emerging)', TRUE, '', '');
INSERT INTO coaches (id, first_name, last_name, display_name, email, phone, role, max_belt_permission, certification_level, active_status, languages, specialty_area)
  VALUES (gen_random_uuid(), 'Bautista', 'Sanot', 'Bautista Sanot', 'bautisanot@gmail.com', '5491162893017', map_coach_role('Coach'), 'purple_belt'::belt_level, 'Cinta Morada (Emerging)', TRUE, 'Inglés y Español', 'Presencia, empatía, buena onda');
INSERT INTO coaches (id, first_name, last_name, display_name, email, phone, role, max_belt_permission, certification_level, active_status, languages, specialty_area)
  VALUES (gen_random_uuid(), 'Daniel Alexander', 'Monterrosa Salmeron', 'Daniel Monterrosa', 'danielmonterrosa503@icloud.com', '71028662', map_coach_role('Instructor'), 'blue_belt'::belt_level, 'Cinta Morada (Emerging)', TRUE, 'Español', 'Nunca rendirme');
INSERT INTO coaches (id, first_name, last_name, display_name, email, phone, role, max_belt_permission, certification_level, active_status, languages, specialty_area)
  VALUES (gen_random_uuid(), 'Tito Angel Antonio', 'Mejia Veliz', 'Tito Mejia', 'titosurf1998@icloud.com', '73221776', map_coach_role('Instructor'), 'blue_belt'::belt_level, 'Cinta Morada (Emerging)', TRUE, 'Español, Inglés', 'Paciencia, dedicado, deportista');
INSERT INTO coaches (id, first_name, last_name, display_name, email, phone, role, max_belt_permission, certification_level, active_status, languages, specialty_area)
  VALUES (gen_random_uuid(), 'Santo Jose', 'Molina Pineda', 'Santo Molina', 'santosmolina127@gmail.com', '70087572', map_coach_role('Instructor'), 'blue_belt'::belt_level, 'Cinta Morada (Emerging)', TRUE, 'Español', 'Paciencia, respeto, amabilidad');
INSERT INTO coaches (id, first_name, last_name, display_name, email, phone, role, max_belt_permission, certification_level, active_status, languages, specialty_area)
  VALUES (gen_random_uuid(), 'Kelvin', '', 'Kelvin', '', '79149261', map_coach_role('Instructor'), 'blue_belt'::belt_level, 'Cinta Morada (Emerging)', TRUE, '', '');
INSERT INTO coaches (id, first_name, last_name, display_name, email, phone, role, max_belt_permission, certification_level, active_status, languages, specialty_area)
  VALUES (gen_random_uuid(), 'Erickson Abdias', 'Ortiz Gusman', 'Erickson Ortiz', '', '', map_coach_role('Ayudante'), 'white_belt'::belt_level, 'Cinta Morada (Emerging)', TRUE, 'Español', 'Amabilidad');
INSERT INTO coaches (id, first_name, last_name, display_name, email, phone, role, max_belt_permission, certification_level, active_status, languages, specialty_area)
  VALUES (gen_random_uuid(), 'Erick Alfredo', 'Valles Centenos', 'Erick Valles', '', '76909385', map_coach_role('Ayudante'), 'white_belt'::belt_level, 'Cinta Morada (Emerging)', TRUE, '', 'Amabilidad, honestidad, gratitud');
INSERT INTO coaches (id, first_name, last_name, display_name, email, phone, role, max_belt_permission, certification_level, active_status, languages, specialty_area)
  VALUES (gen_random_uuid(), 'Julio Ernesto', 'Garcia Crespin', 'Julio Garcia', 'julioernesto754@gmail.com', '75475086', map_coach_role('Ayudante'), 'white_belt'::belt_level, 'Cinta Morada (Emerging)', TRUE, 'Español', 'Respetuoso');
INSERT INTO coaches (id, first_name, last_name, display_name, email, phone, role, max_belt_permission, certification_level, active_status, languages, specialty_area)
  VALUES (gen_random_uuid(), 'Melvin Alexi', 'Ayala Alvarenga', 'Melvin Ayala', 'melvinalexisayalaalvarenga3@gmail.com', '60734292', map_coach_role('Ayudante'), 'white_belt'::belt_level, 'Cinta Morada (Emerging)', TRUE, 'Español', 'Dormir');