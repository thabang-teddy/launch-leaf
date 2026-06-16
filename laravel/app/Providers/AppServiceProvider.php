<?php

namespace App\Providers;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use League\Flysystem\Filesystem;
use League\Flysystem\Local\LocalFilesystemAdapter;
use League\Flysystem\UnixVisibility\PortableVisibilityConverter;
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
        // Also set explicit directory permissions (755) so Apache can serve uploaded files.
        if (! extension_loaded('fileinfo')) {
            Storage::extend('local', function ($app, $config) {
                $visibility = PortableVisibilityConverter::fromArray([
                    'file' => ['public' => 0644, 'private' => 0600],
                    'dir'  => ['public' => 0755, 'private' => 0700],
                ]);
                $adapter = new LocalFilesystemAdapter(
                    $config['root'],
                    $visibility,
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
