<?php
require ( dirname( __FILE__ ) . '/includes/WebStart.php' );

$dbw = wfGetDB( DB_MASTER );
if ($wgRequest->getVal( 'action' ) == 'log') {
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
} else if ($wgRequest->getVal( 'action' ) == 'countlog') {
	$res = $dbw->query('SELECT COUNT(*) AS count FROM tutorial_action_log');
	$row = $res->fetchObject();
	print $row->count;
} else {
	print 'Unimplemented';
}
$dbw->close();
?>
