-- 00006_seed_ocean_rules.sql

INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('rule_id', map_belt_name('belt_level'), map_ocean_condition('ocean_condition'), 'rule_state'::risk_state, 'coach_note', FALSE, map_coach_role('override_role_required'));
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-001', map_belt_name('Cinta Blanca (Beginner)'), map_ocean_condition('Flat'), 'safe'::risk_state, 'Solo espuma. Nunca enviar a olas verdes.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-002', map_belt_name('Cinta Blanca (Beginner)'), map_ocean_condition('1-2 feet'), 'safe'::risk_state, 'Solo espuma. Nunca enviar a olas verdes.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-003', map_belt_name('Cinta Blanca (Beginner)'), map_ocean_condition('3-4 feet'), 'alert'::risk_state, 'Solo espuma. Nunca enviar a olas verdes.', TRUE, map_coach_role('head_coach_or_higher'));
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-004', map_belt_name('Cinta Blanca (Beginner)'), map_ocean_condition('4-6 feet'), 'blocked'::risk_state, 'Solo espuma. Nunca enviar a olas verdes.', FALSE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-005', map_belt_name('Cinta Blanca (Beginner)'), map_ocean_condition('6+ feet'), 'blocked'::risk_state, 'Solo espuma. Nunca enviar a olas verdes.', FALSE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-006', map_belt_name('Cinta Amarilla (Novice)'), map_ocean_condition('Flat'), 'safe'::risk_state, 'Olas verdes pequeñas. Evaluar confianza.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-007', map_belt_name('Cinta Amarilla (Novice)'), map_ocean_condition('1-2 feet'), 'safe'::risk_state, 'Olas verdes pequeñas. Evaluar confianza.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-008', map_belt_name('Cinta Amarilla (Novice)'), map_ocean_condition('3-4 feet'), 'safe'::risk_state, 'Olas verdes pequeñas. Evaluar confianza.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-009', map_belt_name('Cinta Amarilla (Novice)'), map_ocean_condition('4-6 feet'), 'alert'::risk_state, 'Olas verdes pequeñas. Evaluar confianza.', TRUE, map_coach_role('head_coach_or_higher'));
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-010', map_belt_name('Cinta Amarilla (Novice)'), map_ocean_condition('6+ feet'), 'blocked'::risk_state, 'Olas verdes pequeñas. Evaluar confianza.', FALSE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-011', map_belt_name('Cinta Azul (Foundation)'), map_ocean_condition('Flat'), 'safe'::risk_state, 'Puede surfear olas reales. Evaluar sección.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-012', map_belt_name('Cinta Azul (Foundation)'), map_ocean_condition('1-2 feet'), 'safe'::risk_state, 'Puede surfear olas reales. Evaluar sección.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-013', map_belt_name('Cinta Azul (Foundation)'), map_ocean_condition('3-4 feet'), 'safe'::risk_state, 'Puede surfear olas reales. Evaluar sección.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-014', map_belt_name('Cinta Azul (Foundation)'), map_ocean_condition('4-6 feet'), 'safe'::risk_state, 'Puede surfear olas reales. Evaluar sección.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-015', map_belt_name('Cinta Azul (Foundation)'), map_ocean_condition('6+ feet'), 'alert'::risk_state, 'Puede surfear olas reales. Evaluar sección.', TRUE, map_coach_role('head_coach_or_higher'));
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-016', map_belt_name('Cinta Morada (Emerging)'), map_ocean_condition('Flat'), 'safe'::risk_state, 'Evaluar compromiso y manejo de riesgo.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-017', map_belt_name('Cinta Morada (Emerging)'), map_ocean_condition('1-2 feet'), 'safe'::risk_state, 'Evaluar compromiso y manejo de riesgo.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-018', map_belt_name('Cinta Morada (Emerging)'), map_ocean_condition('3-4 feet'), 'safe'::risk_state, 'Evaluar compromiso y manejo de riesgo.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-019', map_belt_name('Cinta Morada (Emerging)'), map_ocean_condition('4-6 feet'), 'safe'::risk_state, 'Evaluar compromiso y manejo de riesgo.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-020', map_belt_name('Cinta Morada (Emerging)'), map_ocean_condition('6+ feet'), 'safe'::risk_state, 'Evaluar compromiso y manejo de riesgo.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-021', map_belt_name('Cinta Café (Pre-Elite)'), map_ocean_condition('Flat'), 'safe'::risk_state, 'Competidor. Evaluar estrategia, no seguridad básica.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-022', map_belt_name('Cinta Café (Pre-Elite)'), map_ocean_condition('1-2 feet'), 'safe'::risk_state, 'Competidor. Evaluar estrategia, no seguridad básica.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-023', map_belt_name('Cinta Café (Pre-Elite)'), map_ocean_condition('3-4 feet'), 'safe'::risk_state, 'Competidor. Evaluar estrategia, no seguridad básica.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-024', map_belt_name('Cinta Café (Pre-Elite)'), map_ocean_condition('4-6 feet'), 'safe'::risk_state, 'Competidor. Evaluar estrategia, no seguridad básica.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-025', map_belt_name('Cinta Café (Pre-Elite)'), map_ocean_condition('6+ feet'), 'safe'::risk_state, 'Competidor. Evaluar estrategia, no seguridad básica.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-026', map_belt_name('Cinta Negra (Elite)'), map_ocean_condition('Flat'), 'safe'::risk_state, 'Autónomo. Foco en rendimiento y periodización.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-027', map_belt_name('Cinta Negra (Elite)'), map_ocean_condition('1-2 feet'), 'safe'::risk_state, 'Autónomo. Foco en rendimiento y periodización.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-028', map_belt_name('Cinta Negra (Elite)'), map_ocean_condition('3-4 feet'), 'safe'::risk_state, 'Autónomo. Foco en rendimiento y periodización.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-029', map_belt_name('Cinta Negra (Elite)'), map_ocean_condition('4-6 feet'), 'safe'::risk_state, 'Autónomo. Foco en rendimiento y periodización.', TRUE, NULL);
INSERT INTO ocean_rules (id, belt_level, ocean_condition, rule_state, coach_note, override_allowed, override_role_required)
  VALUES ('OR-030', map_belt_name('Cinta Negra (Elite)'), map_ocean_condition('6+ feet'), 'safe'::risk_state, 'Autónomo. Foco en rendimiento y periodización.', TRUE, NULL);