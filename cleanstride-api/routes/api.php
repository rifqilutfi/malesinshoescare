<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

// Public routes
Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);
Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);

// Public booking routes (for landing page)
Route::get('/public/services', [\App\Http\Controllers\Api\BookingController::class, 'services']);
Route::post('/public/booking', [\App\Http\Controllers\Api\BookingController::class, 'store']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('/user', [\App\Http\Controllers\Api\AuthController::class, 'user']);

    // Orders
    Route::apiResource('orders', \App\Http\Controllers\Api\OrderController::class);
    Route::patch('/orders/{order}/status', [\App\Http\Controllers\Api\OrderController::class, 'updateStatus']);

    // Services
    Route::apiResource('services', \App\Http\Controllers\Api\ServiceController::class);
    Route::patch('/services/{service}/toggle', [\App\Http\Controllers\Api\ServiceController::class, 'toggle']);

    // Transactions
    Route::apiResource('transactions', \App\Http\Controllers\Api\TransactionController::class)->only(['index', 'show', 'store']);

    // Dashboard & Reports
    Route::get('/dashboard/stats', [\App\Http\Controllers\Api\ReportController::class, 'stats']);
    Route::get('/reports/{type}', [\App\Http\Controllers\Api\ReportController::class, 'show']);

    // File Upload
    Route::post('/upload', [\App\Http\Controllers\Api\UploadController::class, 'store']);

    // Users (Admin)
    Route::apiResource('users', \App\Http\Controllers\Api\UserController::class);
});
