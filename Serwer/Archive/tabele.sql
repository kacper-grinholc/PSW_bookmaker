CREATE DATABASE bets;

DROP TABLE users;

CREATE TABLE IF NOT EXISTS users (
   id serial PRIMARY KEY,
   username VARCHAR NOT NULL,
   email VARCHAR NOT NULL,
   password VARCHAR NOT NULL,
   token VARCHAR,
   access_level VARCHAR DEFAULT 'user'
);


-- INSERT INTO users(username, email, password, access_level)
-- VALUES('admin', 'admin@admin.com', 'admin', 'admin');