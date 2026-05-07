<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 20)->unique();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('service_id')->constrained()->onDelete('restrict');
            $table->string('shoe_type', 50);
            $table->unsignedInteger('quantity')->default(1);
            $table->text('notes')->nullable();
            $table->date('pickup_date');
            $table->string('pickup_time', 20);
            $table->boolean('is_urgent')->default(false);
            $table->enum('status', [
                'pending',
                'pickup',
                'processing',
                'qc',
                'ready',
                'delivery',
                'completed',
                'cancelled'
            ])->default('pending');
            $table->unsignedTinyInteger('progress')->default(0);
            $table->date('estimated_completion')->nullable();
            $table->decimal('subtotal', 12, 2);
            $table->decimal('urgent_fee', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
