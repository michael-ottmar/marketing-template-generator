// app/api/qa/route.js
import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Simple rate limiting
const rateLimits = new Map();

function checkRateLimit(userId = 'anonymous') {
  const now = Date.now();
  const userLimit = rateLimits.get(userId) || { count: 0, resetAt: now + 3600000 };

  if (now > userLimit.resetAt) {
    userLimit.count = 0;
    userLimit.resetAt = now + 3600000; // Reset every hour
  }

  if (userLimit.count >= 20) { // 20 requests per hour
    return false;
  }

  userLimit.count++;
  rateLimits.set(userId, userLimit);
  return true;
}

export async function POST(request) {
  try {
    // Check rate limit
    if (!checkRateLimit()) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

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
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 }
    );
  }

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

  try {
    const result = JSON.parse(responseText);
    return NextResponse.json(result);
  } catch (parseError) {
    console.error('Failed to parse Claude response:', responseText);
    return NextResponse.json(
      { error: 'Invalid response from QA engine', details: responseText },
      { status: 500 }
    );
  }
}

// Handle interactive chat
async function handleChat(userMessage, projectData, history = []) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 }
    );
  }

  const context = prepareProjectContext(projectData);

  // Build conversation history
  const messages = [
    {
      role: 'user',
      content: `You are a helpful marketing copy QA assistant. You have access to this project data:

${context}

The user will ask questions about the copy. Provide helpful, specific answers.`
    },
    ...history.filter(h => h.role && h.content),
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
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta') {
            const text = event.delta.text;
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (error) {
        console.error('Streaming error:', error);
        controller.error(error);
      }
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
  } else if (projectData.sections) {
    // Word format
    context += 'Copy Data:\n';
    projectData.sections.forEach(section => {
      context += `\n[${section.deliverable}]\n`;
      section.fields.forEach(field => {
        context += `  ${field.name}: ${field.content}\n`;
      });
    });
  }

  return context;
}
