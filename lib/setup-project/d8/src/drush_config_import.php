<?php

/**
 * @file
 * Import and clear cache.
 */

// Import all config changes.
echo "Importing configuration from yml files...\n";
passthru('drush config-import -y');
echo "Import of configuration complete.\n";

// Clear all cache.
echo "Clearing cache.\n";
passthru('drush cr ');
echo "Clearing cache complete.\n";
