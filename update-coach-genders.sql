-- Update gender for all coaches based on their names

-- Male coaches
UPDATE coaches SET gender = 'male' WHERE name IN (
  'Marco van der Berg', 'James Foster', 'Robert Mueller', 'Pieter de Boer', 'Diego Rodriguez',
  'Hans Petersen', 'Carlos Mendes', 'Ahmed Hassan', 'Laurent Blanc', 'Michael Chen',
  'Thomas Andersen', 'Viktor Petrov', 'Felipe Guimares', 'Jan Jansen', 'Christopher Scott',
  'Andrew Davies', 'David Anderson', 'Kevin O''Brien'
);

-- Female coaches
UPDATE coaches SET gender = 'female' WHERE name IN (
  'Elena Kowalski', 'Sophie Vermeulen', 'Anna Schmidt', 'Maria García', 'Lisa von Neumann',
  'Isabella Romano', 'Patricia Lopez', 'Emma Johnson', 'Nadia Osman', 'Jennifer Martinez',
  'Svetlana Kuznetsova', 'Sarah O''Connor', 'Nina Volkova', 'Michelle Torres', 'Olivia Williams'
);
