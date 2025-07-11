-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    roblox_username VARCHAR(255) UNIQUE NOT NULL,
    discord_username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    permission VARCHAR(50) DEFAULT 'User' CHECK (permission IN ('User', 'Honours Committee', 'Admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nominations table
CREATE TABLE IF NOT EXISTS nominations (
    id SERIAL PRIMARY KEY,
    nominator_id INTEGER REFERENCES users(id),
    nominee_roblox_username VARCHAR(255) NOT NULL,
    fields TEXT[] NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Review comments table
CREATE TABLE IF NOT EXISTS review_comments (
    id SERIAL PRIMARY KEY,
    nomination_id INTEGER REFERENCES nominations(id),
    user_id INTEGER REFERENCES users(id),
    username VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Honours table
CREATE TABLE IF NOT EXISTS honours (
    id SERIAL PRIMARY KEY,
    roblox_username VARCHAR(255) NOT NULL,
    discord_username VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    field VARCHAR(100) NOT NULL CHECK (field IN ('Parliamentary and Public Service', 'Military', 'Diplomatic', 'Private Sector')),
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (roblox_username, discord_username, password, is_admin, permission) 
VALUES ('AdminUser', 'admin#1234', 'admin123', TRUE, 'Admin')
ON CONFLICT (roblox_username) DO NOTHING;

-- Insert default committee user
INSERT INTO users (roblox_username, discord_username, password, is_admin, permission) 
VALUES ('CommitteeUser', 'committee#5678', 'committee123', FALSE, 'Honours Committee')
ON CONFLICT (roblox_username) DO NOTHING;

-- Insert sample nomination
INSERT INTO nominations (nominator_id, nominee_roblox_username, fields, description, status)
SELECT 1, 'JohnDoe123', ARRAY['Military', 'Diplomatic'], 'Outstanding service in military operations and diplomatic missions for Project Britannia.', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM nominations WHERE nominee_roblox_username = 'JohnDoe123');

-- Insert sample honours
INSERT INTO honours (roblox_username, discord_username, title, field)
VALUES 
    ('JaneSmith456', 'jane#5678', 'Order of Project Britannia', 'Parliamentary and Public Service'),
    ('BobWilson789', 'bob#9012', 'Military Cross', 'Military')
ON CONFLICT DO NOTHING;