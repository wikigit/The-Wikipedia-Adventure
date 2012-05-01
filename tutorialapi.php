<?php
require ( dirname( __FILE__ ) . '/includes/WebStart.php' );
require_once ( dirname( __FILE__ ) . '/apibot/apibot.php' );

function normalize_user($user) {
	return ucfirst(str_replace(' ', '_', $user));
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
		print 'Success';
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
	$user = $wgRequest->getVal('user');
	$code = base_convert(md5($wgTwaSecretKey . $user), 16, 36);
	
	$bot->email_user ( $user, 'The Wikipedia Adventure confirmation code',
		"This was sent to the e-mail you registered with your Wikipedia account.\n" .
		"Please enter the following code into The Wikipedia Adventure to confirm ownership\n" .
		"of your Wikipedia account:\n\n" .
		"$code\n\n", true );
} else if ($wgRequest->getVal( 'action' ) == 'confirmcode') {
	global $wgTwaSecretKey;
	$entered_code = $wgRequest->getVal( 'code' );
	$user = $wgRequest->getVal('user');
	$expected_code = base_convert(md5($wgTwaSecretKey . $user), 16, 36);
	if ($entered_code == $expected_code) {
		print '1';
	} else {
		print '0';
	}
} else {
	print 'Unimplemented';
}
?>
