# Groq AI Setup Guide

## Step 1: Get Groq API Key

1. Go to https://console.groq.com/keys
2. Sign up with your account (free)
3. Create a new API key
4. Copy the key (it looks like: `gsk_...`)

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```

2. Add your Groq API key:
   ```env
   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx
   AI_ENABLED=true
   AUTO_REPLY_ENABLED=true
   ```

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Run the Application

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Configuration Options

### Auto-Reply Behavior

```env
# Enable/disable auto-reply
AUTO_REPLY_ENABLED=true

# Delay before responding (milliseconds)
AUTO_REPLY_DELAY_MS=1000

# Max messages to keep in context
AUTO_REPLY_MAX_CONTEXT=10

# Response style: friendly, professional, casual
AUTO_REPLY_STYLE=friendly
```

## How Auto-Reply Works

1. **Always responds to**:
   - Direct mentions (@bot)
   - Questions (messages with ?)

2. **Might respond to**:
   - Normal messages (30% chance)

3. **Never responds to**:
   - Commands (starting with /)
   - Very short messages (< 3 characters)

## Groq Models Available

- `mixtral-8x7b-32768` - Fast & Balanced (default)
- `llama2-70b-4096` - Better quality but slower

## Costs

✅ **Completely free** - No rate limits on free tier
✅ **No credit card required**
✅ **Unlimited requests** (within fair use)

## Troubleshooting

### "GROQ_API_KEY is required"
- Make sure `AI_ENABLED=true` and `GROQ_API_KEY=gsk_...` in `.env`

### "Empty response from Groq"
- Check your API key is valid
- Check your internet connection

### Bot not responding
- Check `AUTO_REPLY_ENABLED=true` in `.env`
- Make sure the message is not a command
- Check if Groq API is working

## Monitoring

Check logs for:
```
Groq API error: ...
AI response generation failed: ...
```

## Future Enhancements

- [ ] Support for multiple Groq models
- [ ] Cost tracking
- [ ] User-specific personalities
- [ ] Context window management
- [ ] Admin control commands
