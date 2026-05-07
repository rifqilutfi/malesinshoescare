<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Admin CleanStride',
                'email' => 'admin@cleanstride.com',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Kurir 1',
                'email' => 'kurir@cleanstride.com',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Workshop 1',
                'email' => 'workshop@cleanstride.com',
                'password' => Hash::make('password'),
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
