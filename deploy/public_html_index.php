<?php

// /home/thabangt/public_html/index.php
// Front controller — upload this file to public_html/index.php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Maintenance mode check
if (file_exists($maintenance = __DIR__.'/launch-leaf/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Autoloader
require __DIR__.'/launch-leaf/vendor/autoload.php';

// Bootstrap and handle the request
(require_once __DIR__.'/launch-leaf/bootstrap/app.php')
    ->handleRequest(Request::capture());
