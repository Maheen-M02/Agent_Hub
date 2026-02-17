import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { agent_id, webhook_url, input_data } = await request.json();

    if (!agent_id || !webhook_url || !input_data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call the n8n webhook
    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input_data),
    });

    if (!response.ok) {
      throw new Error(`Webhook call failed: ${response.status} ${response.statusText}`);
    }

    const output_data = await response.json();

    // Log the usage if user is authenticated
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        await supabase.from('agent_usage_logs').insert({
          agent_id,
          user_id: user.id,
          input_data,
          output_data,
        });
      }
    }

    return NextResponse.json({ output: output_data });

  } catch (error: any) {
    console.error('Error running agent:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to run agent' },
      { status: 500 }
    );
  }
}