# QA Engine & Claude API Integration Guide

## 🎯 Goal
Integrate Claude API to automatically check marketing copy for errors, inconsistencies, and quality issues.

## 🔑 API Setup

### Step 1: Get Anthropic API Key
1. Sign up at https://console.anthropic.com
2. Generate API key
3. Add to Vercel environment variables: `ANTHROPIC_API_KEY`

### Step 2: Create API Route
**Path:** `/app/api/qa/route.js`

This MUST be a server-side route to protect the API key.

```javascript
// app/api/qa/route.js
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const { message, projectData, conversationHistory, mode } = await request.json();
    
    if (mode === 'batch') {
      // Batch QA check
      return handleBatchQA(projectData);
    } else {
      // Interactive chat
      return handleChat(message, projectData, conversationHistory);
    }
    
  } catch (error) {
    console.error('QA API error:', error);
    return NextResponse.json(
      { error: 'QA check failed', details: error.message },
      { status: 500 }
    );
  }
}

// Handle batch QA check
async function handleBatchQA(projectData) {
  const issues = [];
  
  // Prepare context for Claude
  const context = prepareProjectContext(projectData);
  
  // Send to Claude for analysis
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `You are a marketing copy QA assistant. Analyze this project and identify issues.

Project Data:
${context}

Check for:
1. Grammar and spelling errors
2. Inconsistent terminology across markets
3. Tone inconsistencies
4. Missing or placeholder content
5. Character length issues (too long for UI)
6. Cultural sensitivity concerns

Respond ONLY with valid JSON in this format:
{
  "issues": [
    {
      "severity": "error|warning|suggestion",
      "deliverable": "Gallery 1",
      "field": "Headline",
      "market": "en-US",
      "message": "Description of issue",
      "suggestion": "Optional fix"
    }
  ],
  "summary": {
    "totalIssues": 0,
    "errors": 0,
    "warnings": 0,
    "suggestions": 0
  }
}

DO NOT include any text outside the JSON object. DO NOT use markdown code blocks.`
    }]
  });
  
  // Parse Claude's response
  const responseText = message.content[0].text.trim();
  const result = JSON.parse(responseText);
  
  return NextResponse.json(result);
}

// Handle interactive chat
async function handleChat(userMessage, projectData, history) {
  const context = prepareProjectContext(projectData);
  
  // Build conversation history
  const messages = [
    {
      role: 'user',
      content: `You are a helpful marketing copy QA assistant. You have access to this project data:

${context}

The user will ask questions about the copy. Provide helpful, specific answers.`
    },
    ...history,
    {
      role: 'user',
      content: userMessage
    }
  ];
  
  // Stream response
  const stream = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages,
    stream: true,
  });
  
  // Create streaming response
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          const text = event.delta.text;
          controller.enqueue(encoder.encode(text));
        }
      }
      controller.close();
    }
  });
  
  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked'
    }
  });
}

// Helper: Prepare project data for Claude
function prepareProjectContext(projectData) {
  if (!projectData) return 'No project data available';
  
  let context = `Markets: ${projectData.markets?.join(', ') || 'unknown'}\n\n`;
  
  // Add copy data
  if (projectData.rows) {
    context += 'Copy Data:\n';
    projectData.rows.forEach(row => {
      context += `\n[${row.deliverable} - ${row.field}]\n`;
      Object.entries(row.content).forEach(([market, content]) => {
        if (content) {
          context += `  ${market}: ${content}\n`;
        }
      });
    });
  }
  
  return context;
}
```

## 📊 Client-Side Usage

### Batch QA Check
```javascript
// In your component
async function runBatchQA(parsedData) {
  setIsRunningQA(true);
  
  try {
    const response = await fetch('/api/qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'batch',
        projectData: parsedData
      })
    });
    
    if (!response.ok) throw new Error('QA check failed');
    
    const results = await response.json();
    
    // Display results
    setQAResults(results);
    
    // Show summary
    alert(`Found ${results.summary.totalIssues} issues:
      ${results.summary.errors} errors
      ${results.summary.warnings} warnings
      ${results.summary.suggestions} suggestions`);
    
  } catch (error) {
    console.error('QA error:', error);
    alert('Failed to run QA check');
  } finally {
    setIsRunningQA(false);
  }
}
```

### Interactive Chat
```javascript
// In QAAssistant component
async function sendChatMessage(message) {
  const response = await fetch('/api/qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'chat',
      message,
      projectData,
      conversationHistory: messages
    })
  });
  
  // Handle streaming response
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  let fullResponse = '';
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    fullResponse += chunk;
    
    // Update UI with partial response
    updateStreamingMessage(fullResponse);
  }
}
```

## 🎯 QA Check Types

### 1. Grammar & Spelling
```javascript
const grammarPrompt = `Check for grammar and spelling errors in:
"${content}"

Language: ${market}
Context: ${deliverable} - ${field}

Respond with JSON:
{
  "hasErrors": boolean,
  "errors": ["error description"],
  "corrected": "corrected text"
}`;
```

### 2. Tone Consistency
```javascript
const tonePrompt = `Compare tone across these headlines:
${headlines.map((h, i) => `${i+1}. [${h.market}] ${h.content}`).join('\n')}

Expected tone: Professional, friendly
Deliverable: ${deliverable}

Identify any tone mismatches and suggest corrections.`;
```

### 3. Terminology Consistency
```javascript
const termPrompt = `Check terminology consistency across markets:

Product name variations found:
${variations.join('\n')}

Glossary:
${glossary.join('\n')}

Flag any inconsistent usage and suggest standard terms.`;
```

### 4. Character Length Check
```javascript
const lengthPrompt = `Check if these strings fit UI constraints:

${fields.map(f => `[${f.field}] "${f.content}" (${f.content.length} chars)`).join('\n')}

Constraints:
- Headlines: Max 60 chars
- Body: Max 200 chars
- CTA: Max 20 chars

Flag any that exceed limits and suggest shorter versions.`;
```

### 5. Cultural Sensitivity
```javascript
const culturalPrompt = `Review for cultural appropriateness:

Market: ${market}
Content: "${content}"
Deliverable: ${deliverable}

Check for:
- Cultural sensitivities
- Idioms that don't translate
- Date/currency formats
- Color symbolism
- Gestures or symbols

Provide suggestions for culturally appropriate alternatives.`;
```

## 💰 Cost Management

### Estimate API Costs
```javascript
function estimateQACost(projectData) {
  // Rough estimates (as of 2025):
  // Input: $3 per million tokens
  // Output: $15 per million tokens
  
  const avgCharsPerRow = 100;
  const totalRows = projectData.rows?.length || 0;
  const totalChars = totalRows * avgCharsPerRow;
  
  // ~4 chars per token
  const inputTokens = totalChars / 4;
  const outputTokens = totalRows * 50; // ~50 tokens per issue found
  
  const inputCost = (inputTokens / 1000000) * 3;
  const outputCost = (outputTokens / 1000000) * 15;
  
  return {
    estimatedCost: (inputCost + outputCost).toFixed(4),
    inputTokens: Math.round(inputTokens),
    outputTokens: Math.round(outputTokens)
  };
}

// Show to user before running
const cost = estimateQACost(parsedData);
if (!confirm(`Estimated cost: $${cost.estimatedCost}. Continue?`)) {
  return;
}
```

### Batch Smartly
```javascript
// Don't send one API call per field
// Instead, batch 50-100 fields per call

function batchRows(rows, batchSize = 50) {
  const batches = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    batches.push(rows.slice(i, i + batchSize));
  }
  return batches;
}

async function runBatchedQA(projectData) {
  const batches = batchRows(projectData.rows, 50);
  const allResults = [];
  
  for (const batch of batches) {
    const result = await fetch('/api/qa', {
      method: 'POST',
      body: JSON.stringify({
        mode: 'batch',
        projectData: { ...projectData, rows: batch }
      })
    });
    
    const data = await result.json();
    allResults.push(...data.issues);
    
    // Show progress
    updateProgress(allResults.length, projectData.rows.length);
  }
  
  return allResults;
}
```

## 🔒 Security Best Practices

1. **Never expose API key client-side** ✅ Using server route
2. **Rate limiting** - Add to prevent abuse
3. **Authentication** - Require login for QA features (future)
4. **Input validation** - Sanitize user input before sending to Claude
5. **Error handling** - Don't leak sensitive info in errors

### Add Rate Limiting
```javascript
// app/api/qa/route.js (add at top)

const rateLimits = new Map();

function checkRateLimit(userId = 'anonymous') {
  const now = Date.now();
  const userLimit = rateLimits.get(userId) || { count: 0, resetAt: now + 3600000 };
  
  if (now > userLimit.resetAt) {
    userLimit.count = 0;
    userLimit.resetAt = now + 3600000; // Reset every hour
  }
  
  if (userLimit.count >= 10) { // 10 requests per hour
    return false;
  }
  
  userLimit.count++;
  rateLimits.set(userId, userLimit);
  return true;
}

// In POST handler
if (!checkRateLimit()) {
  return NextResponse.json(
    { error: 'Rate limit exceeded. Try again later.' },
    { status: 429 }
  );
}
```

## 📋 Testing Checklist

- [ ] API key properly set in Vercel environment
- [ ] Server route protects API key (never sent to client)
- [ ] Batch QA returns valid JSON
- [ ] Chat streaming works correctly
- [ ] Rate limiting prevents abuse
- [ ] Error messages are user-friendly
- [ ] Cost estimation is accurate
- [ ] All QA check types work
- [ ] Results are actionable

## 🚀 Deployment Notes

### Environment Variables (Vercel)
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

Set via:
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Or via CLI: `vercel env add ANTHROPIC_API_KEY`

### Cold Start Considerations
- First API call may be slow (~2-3 seconds)
- Subsequent calls much faster
- Show loading state clearly to user

## 🎯 Future Enhancements

1. **Custom Glossary** - Upload brand terms
2. **Style Guide Integration** - Brand voice consistency
3. **A/B Testing Suggestions** - Claude suggests variations
4. **Competitor Analysis** - Compare to competitor copy
5. **SEO Optimization** - Check for keywords
6. **Accessibility** - Check for screen reader friendliness

## 🔗 Related Files

- `/app/api/qa/route.js` - Server endpoint
- `/lib/qaEngine.js` - Client-side wrapper (optional)
- `/components/QAAssistant.js` - Chat UI
- `/components/QAResultsPanel.js` - Results display
