import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    platform: 'Resonate MSP OS',
    modules: [
      'service-desk',
      'netops',
      'finance',
      'procurement',
      'crm',
      'contracts',
      'security',
    ],
  });
}
