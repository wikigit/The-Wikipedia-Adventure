CREATE TABLE IF NOT EXISTS tutorial_action_log (
    tutorial_time TEXT NOT NULL PRIMARY KEY,
    tutorial_user INTEGER NOT NULL default 0,
    tutorial_ip TEXT NOT NULL default '',
    tutorial_step TEXT NOT NULL default '',
    tutorial_action TEXT NOT NULL default '',
    tutorial_value TEXT NOT NULL default ''
);

DELETE FROM tutorial_action_log WHERE tutorial_ip='127.0.0.1';
