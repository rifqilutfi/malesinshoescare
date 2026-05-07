<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderTimeline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Order::with(['customer', 'service', 'timeline', 'photos']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->has('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        // Search by order number or customer name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Limit for dashboard
        if ($request->has('limit')) {
            $query->limit($request->limit);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);

        return OrderResource::collection($orders);
    }

    /**
     * Store a newly created order.
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
            'is_urgent' => 'boolean',
        ]);

        // Create or find customer
        $customer = Customer::firstOrCreate(
            ['phone' => $validated['phone']],
            [
                'name' => $validated['customer_name'],
                'address' => $validated['address'],
                'email' => $validated['email'] ?? null,
            ]
        );

        // Update customer info if changed
        $customer->update([
            'name' => $validated['customer_name'],
            'address' => $validated['address'],
        ]);

        // Create order
        $order = new Order([
            'order_number' => Order::generateOrderNumber(),
            'customer_id' => $customer->id,
            'service_id' => $validated['service_id'],
            'shoe_type' => $validated['shoe_type'],
            'quantity' => $validated['quantity'],
            'notes' => $validated['notes'] ?? null,
            'pickup_date' => $validated['pickup_date'],
            'pickup_time' => $validated['pickup_time'],
            'is_urgent' => $validated['is_urgent'] ?? false,
            'status' => 'pending',
        ]);

        // Calculate totals
        $order->service_id = $validated['service_id'];
        $order->calculateTotals();
        $order->progress = $order->getProgressFromStatus();
        $order->estimated_completion = now()->addDays($order->is_urgent ? 1 : 3);
        $order->save();

        // Create default timeline
        foreach (OrderTimeline::defaultSteps() as $step) {
            $order->timeline()->create($step);
        }

        // Mark first step as completed
        $order->timeline()->first()->markCompleted();

        return response()->json([
            'message' => 'Order created successfully',
            'data' => new OrderResource($order->load(['customer', 'service', 'timeline'])),
        ], 201);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order): OrderResource
    {
        return new OrderResource($order->load(['customer', 'service', 'timeline', 'photos', 'transaction']));
    }

    /**
     * Update the specified order.
     */
    public function update(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'sometimes|string',
            'pickup_date' => 'sometimes|date',
            'pickup_time' => 'sometimes|string',
            'is_urgent' => 'sometimes|boolean',
        ]);

        $order->update($validated);

        if (isset($validated['is_urgent'])) {
            $order->calculateTotals();
            $order->save();
        }

        return response()->json([
            'message' => 'Order updated successfully',
            'data' => new OrderResource($order->load(['customer', 'service', 'timeline'])),
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,pickup,processing,qc,ready,delivery,completed,cancelled',
        ]);

        $order->status = $validated['status'];
        $order->progress = $order->getProgressFromStatus();
        $order->save();

        // Update timeline based on status
        $statusToStep = [
            'pickup' => 'Pickup',
            'processing' => 'Processing',
            'qc' => 'Quality Control',
            'ready' => 'Ready for Delivery',
            'delivery' => 'Ready for Delivery',
            'completed' => 'Delivered',
        ];

        if (isset($statusToStep[$validated['status']])) {
            $step = $order->timeline()->where('step', $statusToStep[$validated['status']])->first();
            if ($step && !$step->completed) {
                $step->markCompleted();
            }
        }

        // Auto-create transaction when order is completed
        if ($validated['status'] === 'completed' && !$order->transaction) {
            \App\Models\Transaction::create([
                'transaction_number' => \App\Models\Transaction::generateTransactionNumber(),
                'order_id' => $order->id,
                'amount' => $order->total,
                'method' => 'cod', // Default to COD
                'status' => 'completed',
                'paid_at' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Order status updated successfully',
            'data' => new OrderResource($order->load(['customer', 'service', 'timeline'])),
        ]);
    }

    /**
     * Remove the specified order.
     */
    public function destroy(Order $order): JsonResponse
    {
        if (in_array($order->status, ['processing', 'qc', 'delivery'])) {
            return response()->json([
                'message' => 'Cannot delete order in progress',
            ], 422);
        }

        $order->delete();

        return response()->json([
            'message' => 'Order deleted successfully',
        ]);
    }
}
