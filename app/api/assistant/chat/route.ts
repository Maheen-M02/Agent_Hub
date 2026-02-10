import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const WEBHOOK_URL = process.env.ASSISTANT_WEBHOOK_URL || 'http://localhost:5678/webhook-test/agent-suggester';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Fetch all agents to provide context
    const { data: agents } = await supabase
      .from('agents')
      .select('id, name, description, category');

    // Call the webhook with the message and context
    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        agents: agents || [],
        conversationHistory,
      }),
    });

    if (!webhookResponse.ok) {
      throw new Error(`Webhook returned status ${webhookResponse.status}`);
    }

    const data = await webhookResponse.json();
    
    // Extract response from webhook data
    // Adjust this based on your webhook's response structure
    const response = data.output || data.response || data.message || data.text || JSON.stringify(data);

    return NextResponse.json({ response });

  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response: ' + error.message },
      { status: 500 }
    );
  }
}