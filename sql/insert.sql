-- Insert Users
INSERT INTO users (first_name, last_name, password, email, role)
VALUES
('Alice', 'Johnson', 'hashed_pw_123', 'alice@example.com', 'regular'),
('Bob', 'Smith', 'hashed_pw_456', 'bob@example.com', 'regular'),
('Cassy', 'Bondi', 'hashed_pw_789', 'cassib@example.com', 'admin');

-- Insert Members
INSERT INTO member (first_name, last_name)
VALUES
('Charlie', 'Brown'),
('Diana', 'Wong'),
('Ethan', 'Kim');

-- Insert Projects (all in draft)
INSERT INTO project (name, requirement_description, goal_description, project_status, user_id)
VALUES
('AI Writing Assistant', 'Create an AI that helps users write better emails.', 'Deploy MVP version for beta testing.', 'draft', 1),
('Budget Tracker App', 'Track expenses and visualize spending.', 'Develop web dashboard with reports.', 'draft', 2);

-- Insert Budgets
INSERT INTO budget (project_id, floor, ceiling)
VALUES
(1, 5000.00, 12000.00),
(2, 3000.00, 8000.00);

-- Insert Timeframes
INSERT INTO timeframe (project_id, start_time, end_time)
VALUES
(1, '2025-01-01 00:00:00', '2025-06-01 00:00:00'),
(2, '2025-03-15 00:00:00', '2025-07-30 00:00:00');

-- Insert Teams
INSERT INTO team (project_id, name)
VALUES
(1, 'AI Core Devs'),
(2, 'Frontend Crew');

-- Insert Team Members
INSERT INTO team_member (team_id, member_id)
VALUES
(1, 1),
(1, 2),
(2, 3);

-- Insert Skillsets
INSERT INTO skillset (member_id, skill, category, description, level)
VALUES
(1, 'Python', 'Programming', 'Proficient in Python for AI and automation.', 'Expert'),
(2, 'UI/UX Design', 'Design', 'Experienced in Figma and user testing.', 'Intermediate'),
(3, 'React', 'Frontend', 'Builds scalable web apps with React.', 'Advanced');
