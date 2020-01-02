<?php

// phpcs:ignoreFile
// No need to log this script operation in New Relic's stats.
// PROTIP: you might also want to use this snippet if you have PHP code handling
// very fast things like redirects or the like.
if (extension_loaded('newrelic')) {
  newrelic_ignore_transaction();
}

$app_info = get_app_info( PANTHEON_ENVIRONMENT );

// Fail fast if we're not going to be able to call New Relic.
if ($app_info == FALSE) {
  echo "\n\nALERT! No New Relic metadata could be found.\n\n";
  exit();
}

// This is one example that handles code pushes, dashboard
// commits, and deploys between environments. To make sure we
// have good deploy markers, we gather data differently depending
// on the context.
if ($_POST['wf_type'] == 'sync_code') {
  // commit 'subject'
  $description = trim(`git log --pretty=format:"%s" -1`);
  $revision = trim(`git log --pretty=format:"%h" -1`);
  if ($_POST['user_role'] == 'super') {
    // This indicates an in-dashboard SFTP commit.
    $user = trim(`git log --pretty=format:"%ae" -1`);
    $changelog = trim(`git log --pretty=format:"%b" -1`);
    $changelog .= "\n\n" . '(Commit made via Pantheon dashbaord.)';
  }
  else {
    $user = $_POST['user_email'];
    $changelog = trim(`git log --pretty=format:"%b" -1`);
    $changelog .= "\n\n" . '(Triggered by remote git push.)';
  }
}
elseif ($_POST['wf_type'] == 'deploy') {
  // Topline description:
  $description = 'Deploy to environment triggered via Pantheon';
  // Find out if there's a deploy tag:
  $revision = `git describe --tags`;
  // Get the annotation:
  $changelog = `git tag -l -n99 $revision`;
  $user = $_POST['user_email'];
}

// Use New Relic's v2 curl command-line example.
$structure = [
  "deployment" => [
    "revision" => $revision,
    "changelog" => '', // $changelog,
    "description" => $description,
    "user" => $user
  ]
];

$curl = "curl -X POST https://api.newrelic.com/v2/applications/" . $app_info['id'] . "/deployments.json ";
$curl .= " -H 'X-Api-Key:" . $app_info['api_key'] . "' -i ";
$curl .= " -H 'Content-Type: application/json' ";
$curl .= " -d '" . json_encode($structure) . "' ";

// The below can be helpful debugging.
echo "APP id: " . $app_info['id'] . "\n\n";
echo "api_key: " . $app_info['api_key'] . "\n\n";
echo "\n\nCURLing... \n\n$curl\n\n";
echo "Logging deployment in New Relic...\n";
passthru($curl);
echo "Done!";




/**
 * Gets the New Relic API Key so that further requests can be made.
 *
 * Also gets New Relic's name for the given environment.
 */
function get_nr_connection_info( $env = 'dev' ) {
  $output = array();
  $req    = pantheon_curl( 'https://api.live.getpantheon.com/sites/self/bindings?type=newrelic', null, 8443 );
  $meta   = json_decode( $req['body'], true );
  foreach ( $meta as $data ) {
    if ( $data['environment'] === $env ) {
      if ( empty( $data['api_key'] ) ) {
        echo "Failed to get API Key\n";
        return;
      }
      $output['api_key'] = $data['api_key'];
      if ( empty( $data['app_name'] ) ) {
        echo "Failed to get app name\n";
        return;
      }
      $output['app_name'] = $data['app_name'];
    }
  }
  return $output;
}

/**
 * Get the id of the current multidev environment.
 */
function get_app_id( $api_key, $app_name ) {
  $return = '';
  $s      = curl_init();
  curl_setopt( $s, CURLOPT_URL, 'https://api.newrelic.com/v2/applications.json?filter[name]=' . curl_escape($s, $app_name) );
  curl_setopt( $s, CURLOPT_HTTPHEADER, array( 'X-API-KEY:' . $api_key ) );
  curl_setopt( $s, CURLOPT_RETURNTRANSFER, 1 );
  $result = curl_exec( $s );
  curl_close( $s );
  $result = json_decode( $result, true );

  print_r($result);

  foreach ( $result['applications'] as $application ) {
    if ( $application['name'] === $app_name ) {
      $return = $application['id'];
      break;
    }
  }
  return $return;
}
/**
 * Get New Relic information about a given environment.
 */
function get_app_info( $env = 'dev' ) {
  $nr_connection_info = get_nr_connection_info($env);
  if ( empty( $nr_connection_info ) ) {
    echo "Unable to get New Relic connection info\n";
    return;
  }

  print_r($nr_connection_info);

  $api_key  = $nr_connection_info['api_key'];
  $app_name = $nr_connection_info['app_name'];
  $app_id = get_app_id( $api_key, $app_name );
  $url = "https://api.newrelic.com/v2/applications/$app_id.json";
  $ch = curl_init();
  curl_setopt( $ch, CURLOPT_URL, $url );
  curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1 );
  $headers = [
      'X-API-KEY:' . $api_key
  ];
  curl_setopt( $ch, CURLOPT_HTTPHEADER, $headers );
  $response = curl_exec( $ch );
  if ( curl_errno( $ch ) ) {
    echo 'Error:' . curl_error( $ch );
  }
  curl_close( $ch );
  $output = json_decode( $response, true );
  $output['application']['api_key'] = $api_key;
  return $output['application'];
}
