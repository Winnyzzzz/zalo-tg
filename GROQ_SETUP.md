# Groq AI Auto-Reply Setup Guide

## Overview

This guide explains how to set up Groq AI auto-reply functionality for the Zalo-Telegram bridge.

## What is Groq?

**Groq** is a free AI inference platform that provides:
- ✅ **100% free** - No credit card required
- ⚡ **Ultra-fast** - Real-time inference (200+ tokens/sec)
- 🚀 **High quality** - Mixtral 8x7B model
- 🔓 **Open API** - Easy integration

## Prerequisites

1. Node.js >= 18
2. npm >= 9
3. Groq API key (free)

## Setup Steps

### Step 1: Get Groq API Key

1. Visit https://console.groq.com/keys
2. Sign up (free, no credit card needed)
3. Create a new API key
4. Copy the key (looks like: `gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)

### Step 2: Update .env File

```bash
cp .env.example .env
```

Edit `.env` and add:

```env
# Groq AI Configuration
AI_ENABLED=true
GROQ_API_KEY=gsk_your_api_key_here
GROQ_MODEL=mixtral-8x7b-32768
AI_STYLE=friendly

# Auto-Reply Settings
AUTO_REPLY_ENABLED=true
AUTO_REPLY_DELAY_MS=1000
AUTO_REPLY_RESPOND_TO_MENTIONS=true
AUTO_REPLY_RESPOND_TO_QUESTIONS=true
AUTO_REPLY_RESPOND_TO_RANDOM=true
AUTO_REPLY_RANDOM_CHANCE=0.3
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install `groq-sdk` automatically.

### Step 4: Update Index File

Integrate AI responder into your handlers (see integration guide below).

### Step 5: Run

```bash
npm run dev
# or
npm start
```

## Configuration Options

### AI Style

Choose from:

- **friendly** (default) - Warm, helpful, uses emojis
- **professional** - Formal, accurate, no emojis
- **casual** - Natural, like talking to a friend
- **creative** - Out-of-the-box thinking

Example:
```env
AI_STYLE=casual
```

### Auto-Reply Triggers

```env
# Respond when mentioned
AUTO_REPLY_RESPOND_TO_MENTIONS=true

# Respond to questions (messages with ?)
AUTO_REPLY_RESPOND_TO_QUESTIONS=true

# Respond to random messages
AUTO_REPLY_RESPOND_TO_RANDOM=true

# Probability for random responses (0.0 - 1.0)
AUTO_REPLY_RANDOM_CHANCE=0.3
```

### Timing

```env
# Delay before sending response (ms)
# Higher = more natural, Lower = faster
AUTO_REPLY_DELAY_MS=1000
```

## Integration with Handlers

### In `src/telegram/handler.ts`:

```typescript
import { AIResponder } from '../middleware/ai-responder';

// Initialize in your handler setup
let aiResponder: AIResponder | null = null;

export function setupAIResponder(responder: AIResponder) {
  aiResponder = responder;
}

// In message handler
if (aiResponder && aiResponder.isEnabled()) {
  const shouldRespond = aiResponder.shouldRespond(message.text, {
    isCommand: false,
    minLength: 3,
  });

  if (shouldRespond) {
    const aiResponse = await aiResponder.generateResponseWithDelay(message.text);
    if (aiResponse) {
      // Send to Zalo
      // ...
    }
  }
}
```

### In `src/zalo/handler.ts`:

Similar pattern for Zalo messages.

## Available AI Styles

### Friendly (Default)
```
Prompt: "You are a helpful AI assistant..."
Characteristics: Warm, helpful, uses emojis
Best for: General conversations, support
```

### Professional
```
Prompt: "You are a professional AI assistant..."
Characteristics: Formal, accurate, no emojis
Best for: Work, serious discussions
```

### Casual
```
Prompt: "You are a friend AI..."
Characteristics: Natural, relaxed, like a friend
Best for: Casual chats, fun conversations
```

### Creative
```
Prompt: "You are a creative AI assistant..."
Characteristics: Out-of-the-box, imaginative
Best for: Brainstorming, fun ideas
```

## Troubleshooting

### Issue: "GROQ_API_KEY is not set"

**Solution**: Make sure you added the key to `.env`:
```bash
echo "GROQ_API_KEY=gsk_your_key_here" >> .env
```

### Issue: "API error: 401 Unauthorized"

**Solution**: Your API key is invalid. Get a new one from https://console.groq.com/keys

### Issue: "Slow responses"

**Solution**: This might be Groq servers being busy. Try:
- Reducing `AUTO_REPLY_DELAY_MS`
- Checking Groq status at https://status.groq.com

### Issue: "Too many responses"

**Solution**: Reduce `AUTO_REPLY_RANDOM_CHANCE`:
```env
AUTO_REPLY_RANDOM_CHANCE=0.1  # 10% instead of 30%
```

## Groq Models

Available models:

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| mixtral-8x7b-32768 | ⚡⚡⚡ | ⭐⭐⭐⭐ | **Default** |
| llama2-70b | ⚡⚡ | ⭐⭐⭐ | Detailed |
| gemma-7b-it | ⚡⚡⚡ | ⭐⭐⭐ | Fast |

Change model in `.env`:
```env
GROQ_MODEL=llama2-70b
```

## Rate Limits

Groq free tier:
- ✅ No hard limits
- ⚠️ Fair use policy applied
- 💡 Recommended: 60 requests/minute for stability

## Cost

**100% FREE** - Groq provides free inference API for everyone.

## API Docs

- https://console.groq.com/docs/speech-text
- https://console.groq.com/docs/text-chat

## Support

- Groq Discord: https://discord.gg/groq
- Groq Docs: https://console.groq.com/docs

## Next Steps

1. ✅ Set up `.env` with your Groq API key
2. ✅ Integrate AI responder into handlers
3. ✅ Test auto-reply feature
4. ✅ Customize style and triggers as needed

Enjoy AI-powered auto-replies! 🚀
