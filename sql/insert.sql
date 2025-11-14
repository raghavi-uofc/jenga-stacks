-- Insert Users
INSERT INTO users (first_name, last_name, password, email, role)
VALUES
('Alice', 'Johnson', 'hashed_pw_123', 'alice@example.com', 'regular'),
('Bob', 'Smith', 'hashed_pw_456', 'bob@example.com', 'regular'),
('Cassy', 'Bondi', 'hashed_pw_789', 'cassib@example.com', 'admin');

-- Insert Members
INSERT INTO Member (firstName, lastName)
VALUES
('Charlie', 'Brown'),
('Diana', 'Wong'),
('Ethan', 'Kim');

-- Insert Projects (all in draft)
INSERT INTO Project (name, requirement_description, goal_description, project_status, userId)
VALUES
('AI Writing Assistant', 'Create an AI that helps users write better emails.', 'Deploy MVP version for beta testing.', 'draft', 1),
('Budget Tracker App', 'Track expenses and visualize spending.', 'Develop web dashboard with reports.', 'draft', 2);

-- Insert Budgets
INSERT INTO Budget (projectId, floor, ceiling)
VALUES
(1, 5000.00, 12000.00),
(2, 3000.00, 8000.00);

-- Insert Timeframes
INSERT INTO Timeframe (projectId, startTime, endTime)
VALUES
(1, '2025-01-01 00:00:00', '2025-06-01 00:00:00'),
(2, '2025-03-15 00:00:00', '2025-07-30 00:00:00');

-- Insert Teams
INSERT INTO Team (projectId, name)
VALUES
(1, 'AI Core Devs'),
(2, 'Frontend Crew');

-- Insert Team Members
INSERT INTO TeamMember (TeamId, MemberId)
VALUES
(1, 1),
(1, 2),
(2, 3);

-- Insert Skillsets
INSERT INTO Skillset (memberId, skill, category, description, level)
VALUES
(1, 'Python', 'Programming', 'Proficient in Python for AI and automation.', 'Expert'),
(2, 'UI/UX Design', 'Design', 'Experienced in Figma and user testing.', 'Intermediate'),
(3, 'React', 'Frontend', 'Builds scalable web apps with React.', 'Advanced');