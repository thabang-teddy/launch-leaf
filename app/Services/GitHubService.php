<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GitHubService
{
    private string $token;
    private string $baseUrl = 'https://api.github.com';

    public function __construct()
    {
        $this->token = config('services.github.token', '');
    }

    /**
     * Sync GitHub data (README + file tree) for a given repo URL.
     * Returns an array with readme_content, file_tree, and synced_at.
     * Throws on HTTP failure so the caller can handle it.
     */
    public function syncRepo(string $githubUrl): array
    {
        [$owner, $repo] = $this->parseRepoUrl($githubUrl);

        $readme    = $this->fetchReadme($owner, $repo);
        $fileTree  = $this->fetchFileTree($owner, $repo);

        return [
            'readme_content' => $readme,
            'file_tree'      => $fileTree,
            'synced_at'      => now(),
        ];
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private function fetchReadme(string $owner, string $repo): ?string
    {
        $response = $this->get("/repos/{$owner}/{$repo}/readme");

        if ($response->failed()) {
            Log::warning("GitHubService: README not found for {$owner}/{$repo}");
            return null;
        }

        $encoded = $response->json('content', '');

        return base64_decode(str_replace(["\n", "\r"], '', $encoded)) ?: null;
    }

    private function fetchFileTree(string $owner, string $repo): array
    {
        $response = $this->get("/repos/{$owner}/{$repo}/git/trees/HEAD", ['recursive' => 1]);

        if ($response->failed()) {
            Log::warning("GitHubService: file tree not found for {$owner}/{$repo}");
            return [];
        }

        return collect($response->json('tree', []))
            ->where('type', 'blob')
            ->pluck('path')
            ->values()
            ->all();
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function parseRepoUrl(string $url): array
    {
        // Accepts https://github.com/owner/repo or owner/repo
        $path = parse_url(trim($url, '/'), PHP_URL_PATH) ?? $url;
        $parts = array_values(array_filter(explode('/', trim($path, '/'))));

        if (count($parts) < 2) {
            throw new \InvalidArgumentException("Invalid GitHub URL: {$url}");
        }

        return [$parts[count($parts) - 2], $parts[count($parts) - 1]];
    }

    private function get(string $path, array $query = []): \Illuminate\Http\Client\Response
    {
        return Http::withToken($this->token)
            ->withHeaders(['Accept' => 'application/vnd.github+json'])
            ->get($this->baseUrl . $path, $query);
    }
}
