import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getChatResponse } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Fetch all agents to provide context to Gemini
    const { data: agents } = await supabase
      .from('agents')
      .select('id, name, description, category');

    const response = await getChatResponse(message, agents || []);

    return NextResponse.json({ response });

  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}