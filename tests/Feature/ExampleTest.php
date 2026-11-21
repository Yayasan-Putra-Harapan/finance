<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_halaman_utama_mengarah_ke_dashboard()
    {
        $response = $this->get(route('home'));

        $response->assertRedirect('/dashboard');
    }
}
