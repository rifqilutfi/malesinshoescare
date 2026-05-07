<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderTimeline;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Public Booking Controller
 * 
 * This controller handles public booking requests from the landing page.
 * No authentication required.
 */
class BookingController extends Controller
{
    /**
     * Create a new booking/order from the landing page.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'email' => 'nullable|email',
            'service_id' => 'required|exists:services,id',
            'shoe_type' => 'required|string|max:50',
            'quantity' => 'required|integer|min:1|max:10',
            'notes' => 'nullable|string',
            'pickup_date' => 'required|date|after_or_equal:today',
            'pickup_time' => 'required|string',
        ]);

        // Get service for price calculation
        $service = Service::findOrFail($validated['service_id']);

        // Create or find customer
        $customer = Customer::firstOrCreate(
            ['phone' => $validated['phone']],
            [
                'name' => $validated['customer_name'],
                'email' => $validated['email'] ?? null,
                'address' => $validated['address'],
            ]
        );

        // Update customer info if needed
        if ($validated['email'] && !$customer->email) {
            $customer->update(['email' => $validated['email']]);
        }
        if (!$customer->address) {
            $customer->update(['address' => $validated['address']]);
        }

        // Generate order number
        $orderNumber = 'ORD-' . strtoupper(Str::random(8));

        // Calculate totals
        $subtotal = $service->price * $validated['quantity'];
        $total = $subtotal;

        // Create order
        $order = Order::create([
            'order_number' => $orderNumber,
            'customer_id' => $customer->id,
            'service_id' => $validated['service_id'],
            'shoe_type' => $validated['shoe_type'],
            'quantity' => $validated['quantity'],
            'notes' => $validated['notes'] ?? null,
            'pickup_date' => $validated['pickup_date'],
            'pickup_time' => $validated['pickup_time'],
            'status' => 'pending',
            'subtotal' => $subtotal,
            'urgent_fee' => 0,
            'total' => $total,
            'is_urgent' => false,
        ]);

        // Create initial timeline entry
        OrderTimeline::create([
            'order_id' => $order->id,
            'status' => 'pending',
            'description' => 'Order dibuat melalui website',
            'created_by' => 'System',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking berhasil! Tim kami akan segera menghubungi Anda.',
            'data' => [
                'order_number' => $orderNumber,
                'service' => $service->name,
                'total' => 'Rp ' . number_format($total, 0, ',', '.'),
                'pickup_date' => $validated['pickup_date'],
                'pickup_time' => $validated['pickup_time'],
            ],
        ], 201);
    }

    /**
     * Get active services for the landing page.
     */
    public function services(): JsonResponse
    {
        $services = Service::where('is_active', true)
            ->orderBy('price', 'asc')
            ->get()
            ->map(function ($service) {
                return [
                    'id' => $service->id,
                    'name' => $service->name,
                    'description' => $service->description,
                    'price' => $service->price,
                    'price_formatted' => 'Rp ' . number_format($service->price, 0, ',', '.'),
                    'duration' => $service->duration ?? '2-3 hari',
                    'is_active' => $service->is_active,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $services,
        ]);
    }
}
