<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShoePhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * Upload a file (shoe photo).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => 'required|image|max:5120', // 5MB max
            'order_id' => 'required|exists:orders,id',
            'type' => 'sometimes|in:before,after',
        ]);

        $path = $request->file('file')->store('shoe-photos', 'public');

        $photo = ShoePhoto::create([
            'order_id' => $validated['order_id'],
            'file_path' => $path,
            'type' => $validated['type'] ?? 'before',
        ]);

        return response()->json([
            'message' => 'File uploaded successfully',
            'data' => [
                'id' => $photo->id,
                'url' => $photo->url,
                'type' => $photo->type,
            ],
        ], 201);
    }
}
