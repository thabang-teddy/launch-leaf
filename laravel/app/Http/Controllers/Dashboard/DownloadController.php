<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DownloadController extends Controller
{
    public function index(): Response
    {
        $version = config('app.version', '1.0.0');
        $base    = public_path('downloads');

        $apkFile = $base . '/launch-leaf-v' . $version . '.apk';
        $exeFile = $base . '/launch-leaf-v' . $version . '-setup.exe';

        return Inertia::render('Dashboard/Downloads', [
            'version'      => $version,
            'apkAvailable' => file_exists($apkFile),
            'exeAvailable' => file_exists($exeFile),
            'apkUrl'       => route('download.apk'),
            'exeUrl'       => route('download.exe'),
            'apkSize'      => file_exists($apkFile) ? round(filesize($apkFile) / 1048576, 2) : null,
            'exeSize'      => file_exists($exeFile) ? round(filesize($exeFile) / 1048576, 2) : null,
        ]);
    }

    public function apk(): BinaryFileResponse|HttpResponse
    {
        $version = config('app.version', '1.0.0');
        $path    = public_path('downloads/launch-leaf-v' . $version . '.apk');

        if (! file_exists($path)) {
            abort(404);
        }

        return response()
            ->download($path, 'launch-leaf-v' . $version . '.apk', [
                'Content-Type'        => 'application/vnd.android.package-archive',
                'Content-Disposition' => 'attachment; filename="launch-leaf-v' . $version . '.apk"',
                'Cache-Control'       => 'no-transform, no-store',
                'X-Content-Type-Options' => 'nosniff',
            ]);
    }

    public function exe(): BinaryFileResponse|HttpResponse
    {
        $version = config('app.version', '1.0.0');
        $path    = public_path('downloads/launch-leaf-v' . $version . '-setup.exe');

        if (! file_exists($path)) {
            abort(404);
        }

        return response()
            ->download($path, 'launch-leaf-v' . $version . '-setup.exe', [
                'Content-Type'        => 'application/octet-stream',
                'Content-Disposition' => 'attachment; filename="launch-leaf-v' . $version . '-setup.exe"',
                'Cache-Control'       => 'no-transform, no-store',
                'X-Content-Type-Options' => 'nosniff',
            ]);
    }
}
