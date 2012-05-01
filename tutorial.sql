CREATE TABLE IF NOT EXISTS tutorial_action_log (
    tutorial_time TEXT NOT NULL PRIMARY KEY,
    tutorial_user INTEGER NOT NULL default 0,
    tutorial_ip TEXT NOT NULL default '',
    tutorial_step TEXT NOT NULL default '',
    tutorial_action TEXT NOT NULL default '',
    tutorial_value TEXT NOT NULL default ''
);

CREATE TABLE IF NOT EXISTS tutorial_user (
	tutorial_user_id INTEGER PRIMARY KEY,
	tutorial_user_name TEXT NOT NULL default '',
	tutorial_user_ip TEXT NOT NULL default '',
	tutorial_user_password TEXT NOT NULL default '',
	tutorial_user_email TEXT NOT NULL default '',
	tutorial_user_create_time TEXT NOT NULL default ''
);

INSERT INTO tutorial_user (tutorial_user_id, tutorial_user_name) VALUES (0, 'Reserved error value') ;

DELETE FROM tutorial_action_log WHERE tutorial_ip='127.0.0.1';
