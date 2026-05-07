<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderTimeline extends Model
{
    use HasFactory;

    protected $table = 'order_timeline';

    protected $fillable = [
        'order_id',
        'step',
        'description',
        'completed',
        'completed_at',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the order that owns the timeline event.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Mark this timeline step as completed.
     */
    public function markCompleted(): void
    {
        $this->update([
            'completed' => true,
            'completed_at' => now(),
        ]);
    }

    /**
     * Default timeline steps for a new order.
     */
    public static function defaultSteps(): array
    {
        return [
            ['step' => 'Order Received', 'description' => 'Pesanan diterima dan dikonfirmasi'],
            ['step' => 'Pickup', 'description' => 'Sepatu berhasil dijemput dari alamat customer'],
            ['step' => 'Processing', 'description' => 'Sepatu sedang dalam proses pencucian'],
            ['step' => 'Quality Control', 'description' => 'Pengecekan kualitas hasil pencucian'],
            ['step' => 'Ready for Delivery', 'description' => 'Siap untuk diantar ke customer'],
            ['step' => 'Delivered', 'description' => 'Sepatu telah sampai ke customer'],
        ];
    }
}
