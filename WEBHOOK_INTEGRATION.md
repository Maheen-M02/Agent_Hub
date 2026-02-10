# AI Assistant Webhook Integration

## Changes Made

The AI Assistant has been updated to use your custom webhook instead of the Gemini API.

### Webhook URL
```
http://localhost:5678/webhook-test/agent-suggester
```

## Modified Files

### 1. `app/api/assistant/chat/route.ts`
- Removed Gemini API integration
- Added webhook POST request
- Sends the following data to your webhook:
  ```json
  {
    "message": "user's message",
    "agents": [...], // array of available agents from Supabase
    "conversationHistory": [...] // previous conversation messages
  }
  ```

### 2. `.env`
- Added `ASSISTANT_WEBHOOK_URL` environment variable
- Set to: `http://localhost:5678/webhook-test/agent-suggester`

### 3. `.env.example`
- Updated template to include webhook URL

## Webhook Request Format

Your webhook will receive POST requests with this structure:

```json
{
  "message": "string - the user's message",
  "agents": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "category": "string"
    }
  ],
  "conversationHistory": [
    {
      "type": "user" | "assistant",
      "content": "string"
    }
  ]
}
```

## Expected Webhook Response

Your webhook should return JSON in one of these formats:

**Option 1 (Your Current Format - Recommended):**
```json
{
  "output": "Your AI assistant response here with markdown formatting"
}
```

**Option 2:**
```json
{
  "response": "Your AI assistant response here"
}
```

**Option 3:**
```json
{
  "message": "Your AI assistant response here"
}
```

**Option 4:**
```json
{
  "text": "Your AI assistant response here"
}
```

The code will automatically extract the response from any of these formats, checking in this order: `output` → `response` → `message` → `text`.

### Markdown Support

The response supports full markdown formatting including:
- **Headers** (# H1, ## H2, ### H3)
- **Bold** (`**text**`) and *italic* (`*text*`)
- **Lists** (ordered and unordered)
- **Code blocks** (inline and multi-line)
- **Horizontal rules** (`---`)
- **Links** and more

Your webhook response will be beautifully formatted with proper spacing, indentation, and styling!

## Testing

1. Make sure your n8n webhook is running on `http://localhost:5678`
2. The webhook endpoint should be: `/webhook-test/agent-suggester`
3. Navigate to the AI Assistant page: `http://localhost:3000/assistant`
4. Send a message and it will be forwarded to your webhook

## Configuration

To change the webhook URL, edit the `.env` file:

```env
ASSISTANT_WEBHOOK_URL=http://your-custom-url/webhook-endpoint
```

Then restart the development server.

## Error Handling

If the webhook fails:
- The error will be logged to the console
- The user will see an error message with details
- Check the browser console and server logs for debugging

## Notes

- The webhook must be accessible from your Next.js server
- Make sure CORS is properly configured on your webhook if needed
- The Gemini API code is still in the project but no longer used
- All agent data is fetched from Supabase and sent to your webhook
