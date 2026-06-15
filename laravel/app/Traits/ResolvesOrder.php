<?php

namespace App\Traits;

trait ResolvesOrder
{
    /**
     * Return the first unused order integer >= $desired for the given model.
     * When updating an existing record, pass its $excludeId to ignore itself.
     */
    protected function nextAvailableOrder(string $modelClass, int $desired, ?int $excludeId = null): int
    {
        $order = max(1, $desired);

        while (
            $modelClass::where('order', $order)
                ->when($excludeId !== null, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $order++;
        }

        return $order;
    }
}
