<?php
require ( dirname( __FILE__ ) . '/includes/WebStart.php' );
require_once ( dirname( __FILE__ ) . '/apibot/apibot.php' );

function normalizeUser($user) {
	return ucfirst(str_replace(' ', '_', $user));
}

function getConfirmationCode($user) {
	global $wgTwaSecretKey;
	return base_convert(md5($wgTwaSecretKey . $user), 16, 36);
}

function getPasswordHash($user, $password) {
	global $wgTwaSecretKey;
	# Salt and stretch - iteration count chosen to take about 2 secs
	$salt = $wgTwaSecretKey . $user;
	$password_hash = '';
	for ($i=0; $i<3000000; $i++) {
		$password_hash = md5($password_hash . $password . $salt);
	}
	return base_convert($password_hash, 16, 36); # Compress
}

if ($wgRequest->getVal( 'action' ) == '') {
	print <<<EOT
<p>Valid requests:</p>
<p>action=log: Logs a tutorial user interface action. Takes parameters user
(username of user performing action), step (name of step user is currently on),
user_action (short identifier of action performed by user), and value (free form
value associated with user action).

<p>action=countlog: Returns a count of the total number of logged actions.
Useful for testing</p>

<p>action=sendconfirmationemail: Used to send an e-mail to a Wikipedia user
account containing a confirmation code. Allows ownership of a Wikipedia user
account to be confirmed. Takes parameter user (Wikipedia username).</p>

<p>action=confirmcode: Tests if the code entered by a user matches the one
sent out by the sendconfirmationemail request. Takes parameter user (Wikipedia
username), code (the code to test).</p>

<p>action=createuser: Creates a user account. Parameters: user (must match
Wikipedia username), code (code sent by sendconfirmationemail action to
confirm ownership of Wikipedia username), password, email. Returns 1 if
successful, else error code.</p>

<p>action=login: Logs in as a previously created user. Parameters: user
(must match Wikipedia username), password. Sets PHP session cookies and
prints '1' if successful, else error code.</p>

<p>action=logout: Logs out currently logged-in user, if any.</p>
EOT;
} else if ($wgRequest->getVal( 'action' ) == 'log') {
	$dbw = wfGetDB( DB_MASTER );
	$res = $dbw->insert(
		'tutorial_action_log',
		array(
		    'tutorial_time' => date("c"),
		    'tutorial_user' => $wgRequest->getVal('user'),
		    'tutorial_ip' => $_SERVER['REMOTE_ADDR'],
		    'tutorial_step' => $wgRequest->getVal('step'),
		    'tutorial_action' => $wgRequest->getVal('user_action'),
		    'tutorial_value' => $wgRequest->getVal('value'),
		),
		__METHOD__,
		array()
	);
	if ($res) {
		print '1';
	}
	$dbw->close();
} else if ($wgRequest->getVal( 'action' ) == 'countlog') {
	$dbw = wfGetDB( DB_MASTER );
	$res = $dbw->query('SELECT COUNT(*) AS count FROM tutorial_action_log');
	$row = $res->fetchObject();
	print $row->count;
	$dbw->close();
} else if ($wgRequest->getVal( 'action' ) == 'sendconfirmationemail') {
	global $wgTwaUserName, $wgTwaUserPassword, $wgTwaSecretKey;
	# From apibot\logins.php
	$wikipedia_en = array (
	  'name'     => 'English-language Wikipedia',
	  'api_url'  => 'http://en.wikipedia.org/w/api.php',
	  'retries'  => array ('link_error' => 10, 'bad_login'  => 3),
	  'interval' => array ('link_error' => 10, 'submit'     => 5),
	  'limits' => array ('DL' => NULL, 'UL' => NULL, 'total' => NULL)
	  );
	$login['user'] = $wgTwaUserName;
	$login['password'] = $wgTwaUserPassword;
	$login['wiki'] = $wikipedia_en;
	$bot = new \apibot\Apibot ( $login );
	$user = normalizeUser($wgRequest->getVal('user'));
	$code = getConfirmationCode($user);
	
	$bot->email_user ( $user, 'The Wikipedia Adventure confirmation code',
		"This was sent to the e-mail you registered with your Wikipedia account.\n" .
		"Please enter the following code into The Wikipedia Adventure to confirm ownership\n" .
		"of your Wikipedia account:\n\n" .
		"$code\n\n", true );
} else if ($wgRequest->getVal( 'action' ) == 'confirmcode') {
	global $wgTwaSecretKey;
	$entered_code = $wgRequest->getVal( 'code' );
	$user = normalizeUser($wgRequest->getVal('user'));
	$expected_code = getConfirmationCode($user);
	if ($entered_code == $expected_code) {
		print '1';
	} else {
		print '0';
	}
} else if ($wgRequest->getVal( 'action' ) == 'createuser') {
	$dbw = wfGetDB( DB_MASTER );
	$code = $wgRequest->getVal( 'code' );
	$user = normalizeUser($wgRequest->getVal( 'user' ));
	$password = $wgRequest->getVal( 'password' );
	$email = $wgRequest->getVal( 'email' );

	// Check if user already exists
	$res = $dbw->selectField('tutorial_user', 'tutorial_user_id', array('tutorial_user_name' => $user));
	if ($res) {
		print 'alreadyexists';
		exit(0);
	}
		
	// Check confirmation code
	$expected_code = getConfirmationCode($user);
	if ($code != $expected_code) {
		print 'confirmfailed';
		exit(0);
	}
	
	$res = $dbw->insert(
		'tutorial_user',
		array(
			'tutorial_user_name' => $user,
			'tutorial_user_ip' => $_SERVER['REMOTE_ADDR'],
			'tutorial_user_password' => getPasswordHash($user, $password),
			'tutorial_user_email' => $email,
			'tutorial_user_create_time' => date("c"),
		),
		__METHOD__,
		array()
	);
	if (!$res) {
		print 'insertfailed';
		exit(0);
	}

	print '1';
	$dbw->close();
} else if ($wgRequest->getVal( 'action' ) == 'login') {
	$dbw = wfGetDB( DB_MASTER );
	$user = normalizeUser($wgRequest->getVal( 'user' ));
	$password = $wgRequest->getVal( 'password' );
	$password_hash_expected = $dbw->selectField('tutorial_user', 'tutorial_user_password', array('tutorial_user_name' => $user));
	if (!$password_hash_expected) {
		print 'nosuchuser';
		exit(0);
	}
	$password_hash = getPasswordHash($user, $password);
	if ($password_hash != $password_hash_expected) {
		print 'badpassword';
		exit(0);
	}
	session_start();
	$_SESSION['user'] = $user;
	print '1';
	$dbw->close();
} else if ($wgRequest->getVal( 'action' ) == 'logout') {
	session_destroy();
	print '1';
} else {
	print 'Unimplemented';
}
?>
