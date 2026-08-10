-- Delete old coaches
DELETE FROM coaches;

-- Insert 34 coaches with CORRECT gender/name matching
INSERT INTO coaches (user_id, name, bio, years_experience, hourly_rate, age_groups, specialties, city, training_locations, availability, photo_url, email, phone, status) VALUES

-- MALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Marco van der Berg', 'Experienced defensive coach focused on tactical positioning and team strategy. Former professional player with 15 years in the Dutch top league.', 15, 45.00, '{"teens","adults"}', '{"Tactics","Defensive Strategy","Team Building"}', 'Amsterdam', '{"Ajax Training Complex","Vondelpark"}', '{"monday":["18:00-20:00"],"wednesday":["19:00-21:00"],"friday":["18:00-20:00"],"saturday":["10:00-12:00"],"sunday":[]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_01.jpg', 'marco.berg@coachfinder.nl', '+31 6 12345678', 'approved'),

-- FEMALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Elena Kowalski', 'Specialist in youth development and technique. Passionate about building confidence in young players aged 8-16.', 12, 35.00, '{"kids","teens"}', '{"Technique","Youth Development","Passing"}', 'Rotterdam', '{"Sparta Rotterdam Academy","Cruyff Court"}', '{"tuesday":["16:00-18:00"],"thursday":["16:00-18:00"],"saturday":["09:00-11:00"],"sunday":["10:00-12:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_02.jpg', 'elena.kowalski@coachfinder.nl', '+31 6 23456789', 'approved'),

('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Sophie Vermeulen', 'Women''s football specialist. Focused on attacking play and creative positioning. 8 years coaching experience.', 8, 40.00, '{"teens","adults"}', '{"Attacking","Creativity","1-on-1 drills"}', 'Eindhoven', '{"PSV Academy","Parkstad Limburg Stadium"}', '{"tuesday":["18:00-20:00"],"thursday":["19:00-21:00"],"sunday":["14:00-16:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_03.jpg', 'sophie.vermeulen@coachfinder.nl', '+31 6 34567890', 'approved'),

-- MALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'James Foster', 'Fitness and conditioning coach with sports science background. Specialized programs for performance enhancement.', 11, 50.00, '{"teens","adults"}', '{"Fitness","Conditioning","Speed Training"}', 'The Hague', '{"ADO Den Haag","Beach Training"}', '{"monday":["17:00-19:00"],"wednesday":["18:00-20:00"],"thursday":["17:00-19:00"],"saturday":["08:00-10:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_04.jpg', 'james.foster@coachfinder.nl', '+31 6 45678901', 'approved'),

('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Robert Mueller', 'Midfielder specialist teaching ball control and positional awareness. 13 years of professional experience.', 13, 42.00, '{"kids","teens"}', '{"Technique","Passing","Positional Training"}', 'Groningen', '{"FC Groningen Academy","Stadion Hitachi"}', '{"tuesday":["16:30-18:30"],"thursday":["17:00-19:00"],"saturday":["10:00-12:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_05.jpg', 'robert.mueller@coachfinder.nl', '+31 6 56789012', 'approved'),

-- FEMALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Anna Schmidt', 'Young talents coach (U8-U12). Emphasis on enjoyment, skill development, and creating love for the game.', 6, 30.00, '{"kids"}', '{"Youth Development","Technique","Fun Training"}', 'Breda', '{"NAC Breda Academy","Brabank Stadium"}', '{"monday":["16:00-17:30"],"tuesday":["16:00-17:30"],"thursday":["16:00-17:30"],"saturday":["10:00-11:30"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_06.jpg', 'anna.schmidt@coachfinder.nl', '+31 6 67890123', 'approved'),

-- MALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Pieter de Boer', 'Attacking coach focused on shooting technique and finishing. 10 years experience with youth to professional levels.', 10, 48.00, '{"kids","teens","adults"}', '{"Shooting","Finishing","Attacking Tactics"}', 'Tilburg', '{"Willem II Academy","Spark Arena"}', '{"monday":["18:00-20:00"],"wednesday":["17:00-19:00"],"friday":["19:00-21:00"],"sunday":["11:00-13:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_07.jpg', 'pieter.boer@coachfinder.nl', '+31 6 78901234', 'approved'),

-- FEMALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Maria García', 'Defensive line coach specializing in pressing and marking. Former professional defender with 14 years experience.', 14, 46.00, '{"teens","adults"}', '{"Defense","Pressing","Marking"}', 'Almere', '{"Almere City Academy","De Meerpaal"}', '{"tuesday":["19:00-21:00"],"thursday":["18:00-20:00"],"saturday":["09:00-11:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_08.jpg', 'maria.garcia@coachfinder.nl', '+31 6 89012345', 'approved'),

-- MALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Diego Rodriguez', 'Ball control and dribbling specialist. 11 years teaching attacking techniques and footwork.', 11, 41.00, '{"kids","teens"}', '{"Dribbling","Ball Control","1-on-1 drills"}', 'Apeldoorn', '{"Vitesse Reserve","Erwitje Park"}', '{"monday":["17:00-19:00"],"wednesday":["16:00-18:00"],"friday":["17:00-19:00"],"sunday":["10:00-12:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_09.jpg', 'diego.rodriguez@coachfinder.nl', '+31 6 90123456', 'approved'),

-- FEMALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Lisa von Neumann', 'Mental strength coach. Focuses on confidence building, game awareness, and psychological preparation.', 8, 44.00, '{"teens","adults"}', '{"Mental Training","Confidence","Game Awareness"}', 'Nijmegen', '{"NEC Academy","Goffert Park"}', '{"tuesday":["18:00-20:00"],"thursday":["19:00-21:00"],"friday":["18:00-20:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_10.jpg', 'lisa.neumann@coachfinder.nl', '+31 6 01234567', 'approved'),

-- MALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Hans Petersen', 'Aerial ball specialist. Expert in headers, crossing, and set piece execution. 16 years professional experience.', 16, 52.00, '{"teens","adults"}', '{"Heading","Crossing","Aerial Play"}', 'Maastricht', '{"Maastricht Football Club","Parkstad Limburg"}', '{"monday":["19:00-21:00"],"wednesday":["18:00-20:00"],"saturday":["10:00-12:00"],"sunday":["15:00-17:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_11.jpg', 'hans.petersen@coachfinder.nl', '+31 6 11234567', 'approved'),

-- FEMALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Isabella Romano', 'Goalkeeper reflexes specialist with sports science approach. 9 years experience at youth and semi-pro levels.', 9, 47.00, '{"kids","teens","adults"}', '{"Goalkeeping","Reflexes","Shot Stopping"}', 'Haarlem', '{"Haarlem FC Academy","Spaarnwoude"}', '{"tuesday":["18:00-20:00"],"thursday":["18:00-20:00"],"saturday":["11:00-13:00"],"sunday":["14:00-16:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_12.jpg', 'isabella.romano@coachfinder.nl', '+31 6 21234567', 'approved'),

-- MALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Carlos Mendes', 'Set piece specialist. Expert in corner kicks, free kicks, and defensive organization. 9 years coaching experience.', 9, 38.00, '{"teens","adults"}', '{"Set Pieces","Free Kicks","Tactics"}', 'Arnhem', '{"Vitesse Academy","GelreDome"}', '{"monday":["18:30-20:30"],"wednesday":["19:00-21:00"],"friday":["18:00-20:00"],"sunday":["14:00-16:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_13.jpg', 'carlos.mendes@coachfinder.nl', '+31 6 31234567', 'approved'),

-- FEMALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Patricia Lopez', 'Youth development specialist (U10-U14). Emphasis on technical skills and enjoyment.', 7, 32.00, '{"kids"}', '{"Youth Development","Technique","Skill Building"}', 'Zaanstad', '{"AZ Alkmaar Academy","Zaanstadion"}', '{"monday":["16:00-18:00"],"tuesday":["16:00-18:00"],"thursday":["16:00-18:00"],"saturday":["10:00-12:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_14.jpg', 'patricia.lopez@coachfinder.nl', '+31 6 41234567', 'approved'),

-- MALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Ahmed Hassan', 'Tactical coach specializing in team formations and strategies. 12 years coaching professional teams.', 12, 49.00, '{"teens","adults"}', '{"Tactics","Team Strategy","Formation"}', 'Delft', '{"Delft Football Club","Sportpark Tanthof"}', '{"monday":["18:00-20:00"],"wednesday":["19:00-21:00"],"friday":["18:00-20:00"],"saturday":["14:00-16:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_15.jpg', 'ahmed.hassan@coachfinder.nl', '+31 6 51234567', 'approved'),

-- FEMALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Emma Johnson', 'Passing and ball retention specialist. 8 years teaching possession-based football.', 8, 39.00, '{"kids","teens"}', '{"Passing","Ball Retention","Possession"}', 'Leiden', '{"AFC Leiden Academy","Stadion De Gayk"}', '{"tuesday":["17:00-19:00"],"thursday":["17:00-19:00"],"sunday":["11:00-13:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_16.jpg', 'emma.johnson@coachfinder.nl', '+31 6 61234567', 'approved'),

-- MALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Laurent Blanc', 'Speed and agility coach. Professional athletic trainer with 10 years experience in performance optimization.', 10, 51.00, '{"teens","adults"}', '{"Fitness","Speed Training","Agility"}', 'Gouda', '{"Gouda FC Academy","Sportpark Molensloot"}', '{"monday":["17:30-19:30"],"wednesday":["18:00-20:00"],"friday":["17:30-19:30"],"saturday":["09:00-11:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_17.jpg', 'laurent.blanc@coachfinder.nl', '+31 6 71234567', 'approved'),

('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Michael Chen', 'Defensive midfielder coach. Teaches positioning, interception, and defensive awareness. 9 years experience.', 9, 40.00, '{"teens","adults"}', '{"Defense","Positioning","Interception"}', 'Dordrecht', '{"FC Dordrecht Academy","Stadion Baarsjes"}', '{"tuesday":["19:00-21:00"],"thursday":["18:00-20:00"],"saturday":["10:00-12:00"],"sunday":["14:00-16:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_18.jpg', 'michael.chen@coachfinder.nl', '+31 6 81234567', 'approved'),

-- FEMALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Nadia Osman', 'Winger and full-back specialist. 13 years teaching crossing, dribbling, and defensive duties.', 13, 43.00, '{"kids","teens","adults"}', '{"Crossing","Dribbling","Winger Play"}', 'Haarlem', '{"Haarlem FC","Floridapark"}', '{"monday":["18:00-20:00"],"wednesday":["17:00-19:00"],"friday":["18:00-20:00"],"sunday":["10:00-12:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_19.jpg', 'nadia.osman@coachfinder.nl', '+31 6 91234567', 'approved'),

-- MALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Viktor Petrov', 'Striker and finishing coach. 11 years helping forwards develop scoring instincts and positioning.', 11, 45.00, '{"teens","adults"}', '{"Striking","Finishing","Shooting"}', 'Zoetermeer', '{"Zoetermeer Football Club","Sportpark Buytenland"}', '{"tuesday":["18:00-20:00"],"thursday":["19:00-21:00"],"saturday":["11:00-13:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_20.jpg', 'viktor.petrov@coachfinder.nl', '+31 6 02345678', 'approved'),

-- FEMALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Jennifer Martinez', 'Technical director and coach educator. 14 years experience developing young talent and coaching philosophy.', 14, 48.00, '{"kids","teens"}', '{"Technique","Youth Development","Skill Building"}', 'Utrecht', '{"Utrecht Youth Academy","Sportpark Galgenwaard"}', '{"monday":["16:30-18:30"],"wednesday":["17:00-19:00"],"friday":["16:30-18:30"],"saturday":["10:00-12:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_21.jpg', 'jennifer.martinez@coachfinder.nl', '+31 6 12345679', 'approved'),

-- MALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Felipe Guimares', 'Women''s football and empowerment coach. 10 years building confidence in female players.', 10, 42.00, '{"kids","teens","adults"}', '{"Women''s Football","Confidence Building","Team Tactics"}', 'Rotterdam', '{"Feyenoord Academy","Stadion De Kuip"}', '{"tuesday":["17:00-19:00"],"thursday":["18:00-20:00"],"saturday":["10:00-12:00"],"sunday":["14:00-16:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_22.jpg', 'felipe.guimares@coachfinder.nl', '+31 6 22345678', 'approved'),

-- FEMALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Svetlana Kuznetsova', 'Attacking transitions and counter-attacking specialist. 12 years coaching rapid play tactics.', 12, 46.00, '{"teens","adults"}', '{"Attacking","Transitions","Counter Attack"}', 'Amsterdam', '{"Ajax Reserve","Sportpark Sloterdijk"}', '{"monday":["19:00-21:00"],"wednesday":["18:00-20:00"],"thursday":["19:00-21:00"],"saturday":["15:00-17:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_23.jpg', 'svetlana.kuznetsova@coachfinder.nl', '+31 6 32345678', 'approved'),

-- MALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Dmitri Popov', 'Goalkeeper distribution and sweeper keeper specialist. 8 years teaching modern goalkeeper demands.', 8, 43.00, '{"teens","adults"}', '{"Goalkeeping","Distribution","Ball Playing"}', 'Eindhoven', '{"PSV Academy","Sportpark Aalst"}', '{"tuesday":["18:30-20:30"],"friday":["18:00-20:00"],"saturday":["10:00-12:00"],"sunday":["15:00-17:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_24.jpg', 'dmitri.popov@coachfinder.nl', '+31 6 42345678', 'approved'),

('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Thomas Andersen', 'Midfield control and possession coach. 15 years teaching team coordination and game management.', 15, 50.00, '{"teens","adults"}', '{"Midfield","Possession","Team Coordination"}', 'Groningen', '{"FC Groningen","Stadion De Held"}', '{"monday":["18:00-20:00"],"wednesday":["19:00-21:00"],"thursday":["18:00-20:00"],"saturday":["14:00-16:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_25.jpg', 'thomas.andersen@coachfinder.nl', '+31 6 52345678', 'approved'),

-- FEMALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Sarah O''Connor', 'Defensive positioning and reading the game coach. 9 years helping defenders understand game patterns.', 9, 41.00, '{"kids","teens"}', '{"Defense","Positioning","Game Reading"}', 'Tilburg', '{"Willem II Youth","Sportpark Schuttersveld"}', '{"monday":["17:00-19:00"],"wednesday":["16:00-18:00"],"friday":["17:00-19:00"],"sunday":["10:00-12:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_26.jpg', 'sarah.oconnor@coachfinder.nl', '+31 6 62345678', 'approved'),

-- MALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Jan Jansen', 'Advanced tactical coach for senior players. 18 years teaching complex team strategies and positioning.', 18, 54.00, '{"adults"}', '{"Tactics","Team Strategy","Advanced Positioning"}', 'Amsterdam', '{"Ajax Advanced Training","Sportpark Zuidas"}', '{"tuesday":["19:00-21:00"],"thursday":["19:00-21:00"],"saturday":["15:00-17:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_27.jpg', 'jan.jansen@coachfinder.nl', '+31 6 72345678', 'approved'),

-- FEMALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Nina Volkova', 'Youth coach specialist (U6-U10). Creative training games and fundamental skill development.', 6, 28.00, '{"kids"}', '{"Youth Development","Skill Building","Fun Training"}', 'The Hague', '{"ADO Youth Academy","Sportpark Zuiderpark"}', '{"monday":["15:30-17:00"],"tuesday":["15:30-17:00"],"wednesday":["15:30-17:00"],"thursday":["15:30-17:00"],"saturday":["09:00-10:30"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_28.jpg', 'nina.volkova@coachfinder.nl', '+31 6 82345678', 'approved'),

-- MALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Christopher Scott', 'Senior development coach with expertise in player progression pathways. 17 years in elite academies.', 17, 53.00, '{"teens","adults"}', '{"Youth Development","Player Progression","Leadership"}', 'Eindhoven', '{"PSV Elite Academy","Advanced Training Center"}', '{"monday":["19:00-21:00"],"wednesday":["18:00-20:00"],"thursday":["19:00-21:00"],"saturday":["16:00-18:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_29.jpg', 'christopher.scott@coachfinder.nl', '+31 6 92345678', 'approved'),

('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Andrew Davies', 'Forward coaching specialist focused on movement and positioning. 10 years coaching attacking lines.', 10, 44.00, '{"kids","teens"}', '{"Striking","Movement","Positioning"}', 'Amsterdam', '{"Ajax Youth","Training Grounds"}', '{"tuesday":["16:30-18:30"],"thursday":["17:00-19:00"],"sunday":["11:00-13:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/coach_30.jpg', 'andrew.davies@coachfinder.nl', '+31 6 03456789', 'approved'),

('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'David Anderson', 'Strength and conditioning coach specializing in injury prevention. 12 years with professional teams.', 12, 52.00, '{"teens","adults"}', '{"Fitness","Injury Prevention","Strength Training"}', 'Rotterdam', '{"Feyenoord Training","Sports Science Center"}', '{"monday":["17:00-19:00"],"wednesday":["18:00-20:00"],"friday":["17:00-19:00"],"saturday":["08:00-10:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/SCR-20260809-rjso.png', 'david.anderson@coachfinder.nl', '+31 6 13456789', 'approved'),

-- FEMALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Michelle Torres', 'Technical skills coach specializing in youth progression. 9 years developing young talent.', 9, 37.00, '{"kids","teens"}', '{"Technique","Skill Building","Youth Development"}', 'Utrecht', '{"Utrecht Academy","Youth Center"}', '{"monday":["16:00-18:00"],"tuesday":["16:00-18:00"],"thursday":["16:00-18:00"],"saturday":["10:00-12:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/SCR-20260809-rjwa.png', 'michelle.torres@coachfinder.nl', '+31 6 23456790', 'approved'),

-- MALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Kevin O''Brien', 'Strength and conditioning coach specializing in injury prevention and peak performance. 12 years with professional teams.', 12, 52.00, '{"teens","adults"}', '{"Fitness","Injury Prevention","Strength Training"}', 'Rotterdam', '{"Feyenoord Training","Sports Science Center"}', '{"monday":["17:00-19:00"],"wednesday":["18:00-20:00"],"friday":["17:00-19:00"],"saturday":["08:00-10:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/SCR-20260809-rjxc.png', 'kevin.obrien@coachfinder.nl', '+31 6 33456789', 'approved'),

-- FEMALE COACHES
('89d62e55-03e7-44b1-ae9e-8d7b1c1aa2e0', 'Olivia Williams', 'Women''s football coach with expertise in attacking strategy. 9 years developing women''s talent.', 9, 37.00, '{"kids","teens","adults"}', '{"Technique","Skill Building","Women''s Football"}', 'Utrecht', '{"Utrecht Academy","Youth Center"}', '{"monday":["16:00-18:00"],"tuesday":["16:00-18:00"],"thursday":["16:00-18:00"],"saturday":["10:00-12:00"]}', 'https://prvwmdurszhaagbxgato.supabase.co/storage/v1/object/public/coach-photos/SCR-20260809-rjye.png', 'olivia.williams@coachfinder.nl', '+31 6 43456789', 'approved');
