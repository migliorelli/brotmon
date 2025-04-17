-- normal nature Moves
INSERT INTO moves (name, nature, type, power, accuracy, max_uses, always_crit, priority, effect) VALUES
('Tackle', 'NORMAL', 'ATTACK', 40, 1.0, 25, false, 0, null),
('Quick Strike', 'NORMAL', 'ATTACK', 40, 0.95, 20, false, 10, null),
('Headbutt', 'NORMAL', 'ATTACK', 65, 0.9, 15, false, 0, '{"type": "BRAINROT", "chance": 0.2, "duration": 4}'),
('Psychic Blast', 'NORMAL', 'ATTACK', 80, 0.85, 10, false, 0, null),
('Iron Defense', 'NORMAL', 'STATUS', 0, 1.0, 5, false, 0, '{"type": "BUFF", "duration": 1, "chance": 1, "modifiers": {"defense": 0.4}}'),
('Weaken Defense', 'NORMAL', 'STATUS', 0, 1.0, 15, false, 0, '{"type": "DEBUFF", "duration": 3, "chance": 1, "modifiers": {"defense": -0.3}}'),
('Mind Control', 'NORMAL', 'STATUS', 0, 1.0, 15, false, 0, '{"type": "DEBUFF", "duration": 2, "chance": 1, "modifiers": {"attack": -0.3, "speed": -0.2}}'),
('Mental Breakdown', 'NORMAL', 'STATUS', 0, 1.0, 10, false, 0, '{"type": "DEBUFF", "duration": 3, "chance": 1, "modifiers": {"attack": -0.4, "speed": -0.3}}'),
('Brainrot', 'NORMAL', 'STATUS', 0, 1.0, 10, false, 0, '{"type": "BRAINROT", "chance": 1, "duration": 4}');

-- fire nature Moves
INSERT INTO moves (name, nature, type, power, accuracy, max_uses, always_crit, priority, effect) VALUES
('Bombardiro Missile', 'FIRE', 'ATTACK', 110, 0.7, 5, false, 0, '{"type": "BURN", "chance": 0.3, "duration": 2}'),
('Atomic Bomb', 'FIRE', 'ATTACK', 125, 0.7, 5, false, 0, '{"type": "POISON", "chance": 0.1, "duration": 3}'),
('Flame Burst', 'FIRE', 'ATTACK', 70, 1.0, 10, false, 0, '{"type": "BURN", "chance": 0.11, "duration": 2}');

-- water nature Moves
INSERT INTO moves (name, nature, type, power, accuracy, max_uses, always_crit, priority, effect) VALUES
('Tralalero Blast', 'WATER', 'ATTACK', 75, 0.85, 15, false, 0, '{"type": "BRAINROT", "chance": 0.5, "duration": 4}'),
('Water Pulse', 'WATER', 'ATTACK', 60, 0.95, 15, false, 0, null),
('Bubble Beam', 'WATER', 'ATTACK', 70, 0.9, 15, false, 0, null);

-- grass nature Moves
INSERT INTO moves (name, nature, type, power, accuracy, max_uses, always_crit, priority, effect) VALUES
('Banana Slip', 'GRASS', 'ATTACK', 110, 0.8, 15, false, 0, '{"type": "BRAINROT", "chance": 0.4, "duration": 4}'),
('Coconut Bomb', 'GRASS', 'ATTACK', 70, 0.9, 15, false, 0, null),
('Vine Whip', 'GRASS', 'ATTACK', 70, 1.0, 15, false, 0, null),
('Leaf Blade', 'GRASS', 'ATTACK', 80, 1.0, 15, false, 0, null),
('Leaf Storm', 'GRASS', 'ATTACK', 70, 1.0, 15, false, 0, null);

-- electric nature Moves
INSERT INTO moves (name, nature, type, power, accuracy, max_uses, always_crit, priority, effect) VALUES
('Thunder Shock', 'ELECTRIC', 'ATTACK', 40, 0.95, 20, false, 0, '{"type": "PARALYZE", "chance": 0.2, "duration": 4}'),
('Electric Shock', 'ELECTRIC', 'ATTACK', 75, 0.85, 10, false, 0, '{"type": "PARALYZE", "chance": 0.3, "duration": 4}'),
('Shock Wave', 'ELECTRIC', 'ATTACK', 80, 0.8, 10, false, 0, '{"type": "PARALYZE", "chance": 0.2, "duration": 4}');

-- ice nature Moves
INSERT INTO moves (name, nature, type, power, accuracy, max_uses, always_crit, priority, effect) VALUES
('Icy Wind', 'ICE', 'ATTACK', 50, 1.0, 20, false, 0, null),
('Ice Beam', 'ICE', 'ATTACK', 70, 0.9, 10, false, 0, null),
('Ice Punch', 'ICE', 'ATTACK', 60, 0.9, 15, false, 0, null);

-- fighting nature Moves
INSERT INTO moves (name, nature, type, power, accuracy, max_uses, always_crit, priority, effect) VALUES
('Discombobulate', 'FIGHTING', 'ATTACK', 50, 0.7, 5, false, 0, '{"type": "BRAINROT", "chance": 1, "duration": 4}'),
('Flying Kick', 'FIGHTING', 'ATTACK', 85, 0.85, 10, false, 0, null),
('Adrenaline Rush', 'FIGHTING', 'STATUS', 0, 1.0, 5, false, 0, '{"type": "BUFF", "duration": 4, "chance": 1, "modifiers": {"speed": 2}}'),
('Power Up', 'FIGHTING', 'STATUS', 0, 1.0, 20, false, 0, '{"type": "BUFF", "duration": 2, "chance": 1, "modifiers": {"attack": 0.2, "defense": 0.2}}');

-- poison nature Moves
INSERT INTO moves (name, nature, type, power, accuracy, max_uses, always_crit, priority, effect) VALUES
('Mind Bend', 'POISON', 'ATTACK', 65, 0.8, 10, false, 0, '{"type": "POISON", "chance": 0.3, "duration": 2}'),
('Poison Sting', 'POISON', 'ATTACK', 50, 1.0, 15, false, 0, null),
('Poison Gas', 'POISON', 'ATTACK', 70, 0.8, 10, false, 0, '{"type": "POISON", "chance": 0.2, "duration": 3}');

-- rock nature Moves
INSERT INTO moves (name, nature, type, power, accuracy, max_uses, always_crit, priority, effect) VALUES
('Rock Throw', 'ROCK', 'ATTACK', 65, 0.9, 15, false, 0, null),
('Rock Slide', 'ROCK', 'ATTACK', 75, 0.8, 10, false, 0, null),
('Rock Smash', 'ROCK', 'ATTACK', 85, 1.0, 15, false, 0, null),
('Meteor', 'ROCK', 'ATTACK', 120, 0.8, 5, false, 0, null);

-- flying nature Moves
INSERT INTO moves (name, nature, type, power, accuracy, max_uses, always_crit, priority, effect) VALUES
('Wing Attack', 'FLYING', 'ATTACK', 60, 0.95, 15, false, 0, null),
('Fly', 'FLYING', 'STATUS', 0, 1.0, 5, false, 0, '{"type": "BUFF", "duration": 4, "chance": 1, "modifiers": {"speed": 2}}'),
('Acrobatics', 'FLYING', 'ATTACK', 50, 1.0, 15, false, 5, '{"type": "BUFF", "chance": 0.2, "duration": 2, "modifiers": {"speed": 0.5}}');

-- ground nature Moves
INSERT INTO moves (name, nature, type, power, accuracy, max_uses, always_crit, priority, effect) VALUES
('Earthquake', 'GROUND', 'ATTACK', 100, 0.7, 5, false, 0, '{"type": "BRAINROT", "chance": 0.1, "duration": 4}'),
('Mud Slap', 'GROUND', 'ATTACK', 55, 1.0, 15, false, 0, null),
('Sand Attack', 'GROUND', 'ATTACK', 60, 0.9, 15, false, 0, null);

-- bug nature Moves
INSERT INTO moves (name, nature, type, power, accuracy, max_uses, always_crit, priority, effect) VALUES
('Bug Bite', 'BUG', 'ATTACK', 60, 1.0, 15, false, 0, null);