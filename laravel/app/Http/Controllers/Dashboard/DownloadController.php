<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DownloadController extends Controller
{
    public function index(): Response
    {
        $version = config('app.version', '1.0.0');
        $base    = public_path('downloads');

        $apkFile  = $base . '/launch-leaf-v' . $version . '.apk';
        $exeFile  = $base . '/launch-leaf-v' . $version . '-setup.exe';

        return Inertia::render('Dashboard/Downloads', [
            'version'      => $version,
            'apkAvailable' => file_exists($apkFile),
            'exeAvailable' => file_exists($exeFile),
            'apkUrl'       => '/downloads/launch-leaf-v' . $version . '.apk',
            'exeUrl'       => '/downloads/launch-leaf-v' . $version . '-setup.exe',
            'apkSize'      => file_exists($apkFile) ? round(filesize($apkFile) / 1048576, 1) : null,
            'exeSize'      => file_exists($exeFile) ? round(filesize($exeFile) / 1048576, 1) : null,
        ]);
    }
}
