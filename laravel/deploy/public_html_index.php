<?php

// /home/thabangt/public_html/index.php
// Upload this file to public_html/index.php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/launch-leaf/laravel/storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/launch-leaf/laravel/vendor/autoload.php';

$app = require_once __DIR__.'/launch-leaf/laravel/bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
