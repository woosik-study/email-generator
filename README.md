# Compose X - AI-Powered Email generator(Gmail Add-on)

An intelligent Gmail add-on that uses Google's Vertex AI (Gemini) to help you compose emails, generate replies, summarize messages, and extract calendar events automatically.

## Features

- **AI Reply Generation**: Automatically generate professional replies to emails
- **Smart Email Composition**: Create well-structured emails from simple prompts
- **Email Summarization**: Get concise summaries of long emails
- **Calendar Event Extraction**: Automatically detect and add events to Google Calendar
- **Regenerate Options**: Refine AI-generated content with one click
- **Context-Aware**: Understands email threads and maintains conversation context

## Getting Started

### Prerequisites

- Google Account
- Google Cloud Project with Vertex AI API enabled
- Apps Script project

### Installation

1. **Clone or copy the code files**:
   - `Code.gs` - Entry point and action handlers
   - `Cards.gs` - UI card builders
   - `Vertex.gs` - Vertex AI integration

2. **Set up Google Cloud Project**:
   ```
   - Create a new project at console.cloud.google.com
   - Enable Vertex AI API
   - Note your PROJECT_ID
   ```

3. **Configure Script Properties**:
   
   In Apps Script Editor → ⚙️ Project Settings → Script Properties, add:
   ```
   PROJECT_ID: your-gcp-project-id
   VERTEX_AI_LOCATION: us-central1
   ```

4. **Update Vertex.gs**:
   Replace the constants at the top of `Vertex.gs`:
   ```javascript
   const PROJECT_ID = "your-project-id";
   const VERTEX_AI_LOCATION = "us-central1";
   const MODEL_ID = "gemini-2.5-flash";
   ```

5. **Configure OAuth Consent Screen**:
   - Go to GCP Console → APIs & Services → OAuth consent screen
   - Add your email as a test user
   - Leave Authorized domains blank

6. **Deploy as Add-on**:
   - In Apps Script Editor: Deploy → Test deployments
   - Select type: "Editor Add-on"
   - Install in Gmail

## Required OAuth Scopes

Add these to your `appsscript.json`:

```json
{
  "timeZone": "America/Los_Angeles",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "oauthScopes": [
    "https://www.googleapis.com/auth/gmail.addons.execute",
    "https://www.googleapis.com/auth/gmail.addons.current.message.readonly",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/calendar"
  ],
  "gmail": {
    "name": "Compose X",
    "logoUrl": "https://www.gstatic.com/images/branding/product/1x/gmail_48dp.png",
    "contextualTriggers": [
      {
        "unconditional": {},
        "onTriggerFunction": "buildAddOn"
      }
    ],
    "composeTrigger": {
      "selectActions": [
        {
          "text": "Compose with AI",
          "runFunction": "buildAddOn"
        }
      ],
      "draftAccess": "NONE"
    },
    "universalActions": [
      {
        "text": "Open Compose X",
        "runFunction": "buildAddOn"
      }
    ]
  }
}
```

## Usage

### Composing New Emails

1. Click "Compose" in Gmail
2. Open Compose X from the add-on sidebar
3. Enter recipient and what you want to say
4. Click "✨ Generate Draft"
5. Use "Regenerate" to refine or "Back" to start over

### Replying to Emails

1. Open any email in Gmail
2. Open Compose X from the sidebar
3. Click "Generate AI Reply"
4. Review and regenerate if needed

### Summarizing Emails

1. Open an email
2. Click "Summarize Email"
3. View summary and extracted calendar events
4. Add events to calendar with one click

## Project Structure

```
├── Main.gs          # Entry point, action handlers, calendar functions
├── Cards.gs         # UI card builders for different states
└── Vertex.gs        # Vertex AI API integration
```

### Key Functions

**Main.gs**:
- `buildAddOn(e)` - Main entry point
- `generateCompose(e)` - Handle compose generation
- `generateReply(e)` - Handle reply generation
- `handleSummarizeEmail(e)` - Summarize and extract events
- `createCalendarEvent(e)` - Add event to calendar

**Cards.gs**:
- `buildComposeCard()` - Initial compose form
- `buildReplyCard(e)` - Email preview card
- `buildGeneratedDraftCard()` - Show generated draft
- `buildGeneratedReplyCard()` - Show generated reply
- `buildErrorCard()` - Error display

**Vertex.gs**:
- `processEmail()` - Generate reply to email
- `processComposeEmail()` - Generate new email draft
- `summarizeEmail()` - Summarize email content
- `extractCalendarEvents()` - Extract event info with structured output

## 🔧 Configuration

### Vertex AI Settings

Modify these in `Vertex.gs`:

```javascript
const PROJECT_ID = "your-project-id";
const VERTEX_AI_LOCATION = "us-central1";  // or "asia-northeast3" for Seoul
const MODEL_ID = "gemini-2.5-flash";       // or "gemini-1.5-pro"
```

### Generation Parameters

Adjust in API payloads:

```javascript
generationConfig: {
  temperature: 0.7,      // 0.0-1.0 (higher = more creative)
  maxOutputTokens: 2048  // Max response length
}
```

## Testing

Run test functions in Apps Script Editor:

```javascript
// Test reply generation
testProcessEmail()

// Test compose generation
testComposeEmail()

// Test summarization
testSummarizeEmail()

// Test calendar extraction
testExtractCalendar()

// Test calendar event creation
testCreateCalendarEvent()
```

## Troubleshooting

### "Access blocked" Error
- Add your email to test users in GCP Console OAuth consent screen
- Wait 5-10 minutes for changes to propagate

### "API call failed" Error
- Verify Vertex AI API is enabled in GCP
- Check PROJECT_ID matches your GCP project
- Ensure OAuth token has cloud-platform scope

### Add-on doesn't appear
- Check appsscript.json is properly formatted
- Verify all required scopes are listed
- Redeploy the add-on

### Calendar events not creating
- Verify Calendar API scope is included
- Check date format in extracted events (ISO 8601)
- Ensure start time is before end time

## API Limits

- **Vertex AI Gemini Flash**: ~60 requests/minute
- **Calendar API**: 1M requests/day per project
- Consider rate limiting for production use

**Note**: This add-on requires a Google Cloud Project with Vertex AI enabled. Vertex AI usage incurs costs based on token consumption. Check [Google Cloud Pricing](https://cloud.google.com/vertex-ai/pricing) for details.
