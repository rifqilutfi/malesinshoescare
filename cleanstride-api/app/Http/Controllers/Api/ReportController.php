<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Service;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Get dashboard stats.
     */
    public function stats(): JsonResponse
    {
        $today = Carbon::today();

        $todayOrders = Order::whereDate('created_at', $today)->count();
        $todayRevenue = Transaction::where('status', 'completed')
            ->whereDate('paid_at', $today)
            ->sum('amount');

        $processingOrders = Order::whereIn('status', ['pickup', 'processing', 'qc'])->count();
        $activeCustomers = Customer::whereHas('orders', function ($q) {
            $q->where('created_at', '>=', Carbon::now()->subDays(30));
        })->count();

        // Yesterday comparison
        $yesterday = Carbon::yesterday();
        $yesterdayOrders = Order::whereDate('created_at', $yesterday)->count();
        $yesterdayRevenue = Transaction::where('status', 'completed')
            ->whereDate('paid_at', $yesterday)
            ->sum('amount');

        return response()->json([
            'today' => [
                'orders' => $todayOrders,
                'revenue' => $todayRevenue,
                'orders_change' => $yesterdayOrders > 0 
                    ? round((($todayOrders - $yesterdayOrders) / $yesterdayOrders) * 100, 1) 
                    : 0,
                'revenue_change' => $yesterdayRevenue > 0 
                    ? round((($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100, 1) 
                    : 0,
            ],
            'processing_orders' => $processingOrders,
            'active_customers' => $activeCustomers,
        ]);
    }

    /**
     * Get specific report by type.
     */
    public function show(Request $request, string $type): JsonResponse
    {
        return match ($type) {
            'revenue' => $this->revenueReport($request),
            'services' => $this->servicesReport($request),
            'customers' => $this->customersReport($request),
            'operational' => $this->operationalReport($request),
            default => response()->json(['message' => 'Report type not found'], 404),
        };
    }

    /**
     * Revenue report.
     */
    protected function revenueReport(Request $request): JsonResponse
    {
        $months = $request->input('months', 6);
        $data = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $revenue = Transaction::where('status', 'completed')
                ->whereYear('paid_at', $date->year)
                ->whereMonth('paid_at', $date->month)
                ->sum('amount');
            
            $orders = Order::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();

            $data[] = [
                'month' => $date->format('M'),
                'year' => $date->year,
                'revenue' => $revenue,
                'orders' => $orders,
            ];
        }

        return response()->json(['data' => $data]);
    }

    /**
     * Services popularity report.
     */
    protected function servicesReport(Request $request): JsonResponse
    {
        $services = Service::withCount('orders')
            ->withSum(['orders as revenue' => function ($q) {
                $q->whereHas('transaction', function ($q) {
                    $q->where('status', 'completed');
                });
            }], 'total')
            ->orderBy('orders_count', 'desc')
            ->get()
            ->map(fn ($s) => [
                'name' => $s->name,
                'orders' => $s->orders_count,
                'revenue' => $s->revenue ?? 0,
            ]);

        return response()->json(['data' => $services]);
    }

    /**
     * Customer metrics report.
     */
    protected function customersReport(Request $request): JsonResponse
    {
        $totalCustomers = Customer::count();
        $newCustomers = Customer::where('created_at', '>=', Carbon::now()->subDays(30))->count();
        $repeatCustomers = Customer::has('orders', '>=', 2)->count();

        return response()->json([
            'data' => [
                'total' => $totalCustomers,
                'new' => $newCustomers,
                'repeat' => $repeatCustomers,
                'retention_rate' => $totalCustomers > 0 
                    ? round(($repeatCustomers / $totalCustomers) * 100, 1) 
                    : 0,
            ],
        ]);
    }

    /**
     * Operational efficiency report.
     */
    protected function operationalReport(Request $request): JsonResponse
    {
        $totalOrders = Order::count();
        $completedOrders = Order::where('status', 'completed')->count();
        $cancelledOrders = Order::where('status', 'cancelled')->count();

        return response()->json([
            'data' => [
                'completion_rate' => $totalOrders > 0 
                    ? round(($completedOrders / $totalOrders) * 100, 1) 
                    : 0,
                'cancelled_rate' => $totalOrders > 0 
                    ? round(($cancelledOrders / $totalOrders) * 100, 1) 
                    : 0,
                'total_orders' => $totalOrders,
                'completed_orders' => $completedOrders,
            ],
        ]);
    }
}
