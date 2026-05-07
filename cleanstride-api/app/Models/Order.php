<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_id',
        'service_id',
        'shoe_type',
        'quantity',
        'notes',
        'pickup_date',
        'pickup_time',
        'is_urgent',
        'status',
        'progress',
        'estimated_completion',
        'subtotal',
        'urgent_fee',
        'total',
    ];

    protected $casts = [
        'pickup_date' => 'date',
        'estimated_completion' => 'date',
        'is_urgent' => 'boolean',
        'subtotal' => 'decimal:2',
        'urgent_fee' => 'decimal:2',
        'total' => 'decimal:2',
        'quantity' => 'integer',
        'progress' => 'integer',
    ];

    /**
     * Generate a unique order number.
     */
    public static function generateOrderNumber(): string
    {
        $timestamp = now()->format('ymdHis');
        $random = str_pad(random_int(0, 999), 3, '0', STR_PAD_LEFT);
        return 'CLS-' . substr($timestamp, -6) . $random;
    }

    /**
     * Get the customer that owns the order.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the service for the order.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get the timeline events for the order.
     */
    public function timeline(): HasMany
    {
        return $this->hasMany(OrderTimeline::class)->orderBy('created_at');
    }

    /**
     * Get the transaction for the order.
     */
    public function transaction(): HasOne
    {
        return $this->hasOne(Transaction::class);
    }

    /**
     * Get the photos for the order.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(ShoePhoto::class);
    }

    /**
     * Calculate totals based on service and quantity.
     */
    public function calculateTotals(): void
    {
        $service = $this->service;
        $this->subtotal = $service->price * $this->quantity;
        $this->urgent_fee = $this->is_urgent ? $this->subtotal * 0.30 : 0;
        $this->total = $this->subtotal + $this->urgent_fee;
    }

    /**
     * Get the progress percentage based on status.
     */
    public function getProgressFromStatus(): int
    {
        $progressMap = [
            'pending' => 0,
            'pickup' => 15,
            'processing' => 40,
            'qc' => 70,
            'ready' => 85,
            'delivery' => 95,
            'completed' => 100,
            'cancelled' => 0,
        ];

        return $progressMap[$this->status] ?? 0;
    }
}
