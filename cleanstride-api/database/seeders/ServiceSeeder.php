<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'name' => 'Basic Clean',
                'description' => 'Pembersihan dasar dengan sabun khusus sepatu. Cocok untuk sepatu dengan kotoran ringan.',
                'price' => 25000,
                'duration' => '2-3 hari',
                'is_active' => true,
            ],
            [
                'name' => 'Premium Clean',
                'description' => 'Pembersihan menyeluruh dengan treatment khusus termasuk deep cleaning dan penghilang noda.',
                'price' => 45000,
                'duration' => '1-2 hari',
                'is_active' => true,
            ],
            [
                'name' => 'Deep Clean',
                'description' => 'Pembersihan mendalam untuk sepatu sangat kotor. Termasuk treatment anti-bacterial dan deodorizer.',
                'price' => 65000,
                'duration' => '3-4 hari',
                'is_active' => true,
            ],
            [
                'name' => 'Express Clean',
                'description' => 'Layanan cepat untuk kebutuhan mendesak. Proses prioritas dengan hasil maksimal.',
                'price' => 55000,
                'duration' => '1 hari',
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}
