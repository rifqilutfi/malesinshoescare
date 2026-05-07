<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'customer' => $this->whenLoaded('customer', fn() => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'phone' => $this->customer->phone,
                'address' => $this->customer->address,
            ]),
            'service' => new ServiceResource($this->whenLoaded('service')),
            'shoe_type' => $this->shoe_type,
            'quantity' => $this->quantity,
            'notes' => $this->notes,
            'pickup_date' => $this->pickup_date->format('Y-m-d'),
            'pickup_time' => $this->pickup_time,
            'is_urgent' => $this->is_urgent,
            'status' => $this->status,
            'progress' => $this->progress,
            'estimated_completion' => $this->estimated_completion?->format('Y-m-d'),
            'subtotal' => (float) $this->subtotal,
            'urgent_fee' => (float) $this->urgent_fee,
            'total' => (float) $this->total,
            'total_formatted' => 'Rp ' . number_format($this->total, 0, ',', '.'),
            'timeline' => $this->whenLoaded('timeline', fn() => 
                $this->timeline->map(fn($t) => [
                    'step' => $t->step,
                    'description' => $t->description,
                    'completed' => $t->completed,
                    'completed_at' => $t->completed_at?->toISOString(),
                ])
            ),
            'photos' => $this->whenLoaded('photos', fn() => 
                $this->photos->map(fn($p) => [
                    'id' => $p->id,
                    'url' => $p->url,
                    'type' => $p->type,
                ])
            ),
            'transaction' => new TransactionResource($this->whenLoaded('transaction')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
