<?php

namespace App\Providers;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use League\Flysystem\Filesystem;
use League\Flysystem\Local\LocalFilesystemAdapter;
use League\MimeTypeDetection\ExtensionMimeTypeDetector;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Use extension-based MIME detection when the fileinfo PHP extension is unavailable.
        if (! extension_loaded('fileinfo')) {
            Storage::extend('local', function ($app, $config) {
                $adapter = new LocalFilesystemAdapter(
                    $config['root'],
                    null,
                    LOCK_EX,
                    LocalFilesystemAdapter::DISALLOW_LINKS,
                    new ExtensionMimeTypeDetector(),
                );
                return new FilesystemAdapter(
                    new Filesystem($adapter, $config),
                    $adapter,
                    $config,
                );
            });
        }
    }
}
