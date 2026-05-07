<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Order;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TransactionController extends Controller
{
    /**
     * Display a listing of transactions.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Transaction::with(['order.customer']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by method
        if ($request->has('method')) {
            $query->where('method', $request->method);
        }

        // Filter by date
        if ($request->has('date')) {
            $query->whereDate('created_at', $request->date);
        }

        $transactions = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);

        return TransactionResource::collection($transactions);
    }

    /**
     * Store a newly created transaction (process payment).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'method' => 'required|in:cod,transfer,ewallet,credit',
        ]);

        $order = Order::findOrFail($validated['order_id']);

        // Check if order already has a completed transaction
        if ($order->transaction && $order->transaction->status === 'completed') {
            return response()->json([
                'message' => 'Order already paid',
            ], 422);
        }

        // Create or update transaction
        $transaction = Transaction::updateOrCreate(
            ['order_id' => $order->id],
            [
                'transaction_number' => Transaction::generateTransactionNumber(),
                'amount' => $order->total,
                'method' => $validated['method'],
                'status' => 'pending',
            ]
        );

        // For COD, keep pending until delivery
        // For other methods, mark as completed
        if ($validated['method'] !== 'cod') {
            $transaction->markCompleted();
        }

        return response()->json([
            'message' => 'Transaction created successfully',
            'data' => new TransactionResource($transaction->load('order.customer')),
        ], 201);
    }

    /**
     * Display the specified transaction.
     */
    public function show(Transaction $transaction): TransactionResource
    {
        return new TransactionResource($transaction->load('order.customer'));
    }
}
