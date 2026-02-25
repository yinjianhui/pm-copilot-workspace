# AI Services Integration Guide

This document describes the AI services integration in PM Copilot Workspace, including support for multiple LLM providers.

## Supported AI Providers

The project supports the following AI model providers:

| Provider | Display Name | Base URL | Notes |
|----------|--------------|----------|-------|
| `anthropic` | Anthropic Claude | https://api.anthropic.com | Requires ANTHROPIC_API_KEY |
| `openai` | OpenAI | https://api.openai.com/v1 | Requires OPENAI_API_KEY |
| `deepseek` | DeepSeek | https://api.deepseek.com | OpenAI-compatible, requires DEEPSEEK_API_KEY |
| `glm` | GLM (智谱清言) | https://open.bigmodel.cn/api/paas/v4 | Requires GLM_API_KEY |

## Available Models

### Anthropic Claude
- `claude-3-opus-20240229` - Most powerful model
- `claude-3-5-sonnet-20250119` - Latest Sonnet (recommended)
- `claude-3-sonnet-20240229` - Sonnet
- `claude-3-haiku-20240307` - Fastest, most cost-effective

### OpenAI
- `gpt-4o` - Latest GPT-4 Omni
- `gpt-4o-mini` - Cost-effective
- `gpt-4-turbo` - GPT-4 Turbo
- `gpt-3.5-turbo` - Legacy model

### DeepSeek
- `deepseek-chat` - General purpose chat
- `deepseek-coder` - Code generation
- `deepseek-reasoner` - Advanced reasoning

### GLM (智谱清言)
- `glm-4-plus` - Most powerful
- `glm-4` - Standard model
- `glm-4-air` - Balanced
- `glm-4-flash` - Fast, cost-effective (recommended)
- `glm-4-flashx` - Enhanced flash

## Environment Configuration

Add the following to your `.env` file:

```bash
# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-xxx...

# OpenAI API
OPENAI_API_KEY=sk-xxx...

# DeepSeek API
DEEPSEEK_API_KEY=sk-xxx...

# GLM API
GLM_API_KEY=xxx...
```

**Note:** At minimum, you need to configure the API key for your preferred provider. The project defaults to using DeepSeek.

## API Endpoints

### Conversation API

#### Get Available Models
```
GET /api/v1/conversations/models
```

Response:
```json
{
  "providers": [
    {
      "name": "deepseek",
      "display_name": "DeepSeek",
      "models": ["deepseek-chat", "deepseek-coder", "deepseek-reasoner"]
    }
  ]
}
```

#### Create Conversation
```
POST /api/v1/conversations/
```

Request body:
```json
{
  "title": "Product Requirements Discussion",
  "model_provider": "deepseek",
  "model_name": "deepseek-chat",
  "system_prompt": "You are a helpful product manager assistant.",
  "workspace_id": "optional-workspace-id",
  "created_by": "user-id"
}
```

#### Send Chat Message
```
POST /api/v1/conversations/{conversation_id}/chat
```

Request body:
```json
{
  "message": "Help me write user stories for a new feature",
  "temperature": 0.7,
  "max_tokens": 2000
}
```

#### Get Conversation with Messages
```
GET /api/v1/conversations/{conversation_id}
```

### PRD (Product Requirement Document) API

#### Generate PRD
```
POST /api/v1/prds/generate
```

Request body:
```json
{
  "product_description": "A mobile app for tracking daily habits with gamification elements",
  "context": "Target users are millennials who want to build healthy habits",
  "title": "Habit Tracker PRD",
  "model_provider": "deepseek",
  "model_name": "deepseek-chat",
  "temperature": 0.7,
  "workspace_id": "optional-workspace-id",
  "created_by": "user-id"
}
```

#### Refine PRD Section
```
POST /api/v1/prds/refine-section
```

Request body (standalone refinement without saving):
```json
{
  "content": "# Current PRD content...",
  "section_name": "User Stories",
  "feedback": "Make the user stories more specific and add acceptance criteria",
  "model_provider": "deepseek",
  "temperature": 0.7
}
```

#### Refine Existing PRD
```
POST /api/v1/prds/{prd_id}/refine
```

Request body:
```json
{
  "section_name": "User Stories",
  "feedback": "Add acceptance criteria for each user story",
  "temperature": 0.7
}
```

## Python Service Usage

### Basic AI Service

```python
from app.services.ai import create_ai_service

# Create service with specific provider
ai_service = create_ai_service(
    provider="deepseek",
    model="deepseek-chat"
)

# Send messages
messages = [
    {"role": "user", "content": "Hello!"}
]
response = await ai_service.chat(messages)
print(response)
```

### Conversation Service

```python
from app.services.ai import create_conversation_service

# Create conversation service
conv_service = create_conversation_service(
    provider="deepseek",
    system_prompt="You are a helpful PM assistant."
)

# Send messages
response = await conv_service.send_message(
    "Help me write user stories"
)
print(response)

# Get conversation history
history = conv_service.get_history()
```

### PRD Generation Service

```python
from app.services.ai import create_prd_service

# Create PRD service
prd_service = create_prd_service(provider="deepseek")

# Generate PRD
prd = await prd_service.generate_prd(
    product_description="A habit tracking app",
    context="For millennial users",
    temperature=0.7
)
print(prd)

# Refine a section
refined = await prd_service.refine_prd_section(
    prd_content=prd,
    section_name="User Stories",
    feedback="Add acceptance criteria"
)
print(refined)
```

## Default Model Selection

If no model is specified, the following defaults are used:

| Provider | Default Model |
|----------|---------------|
| anthropic | claude-3-5-sonnet-20250119 |
| openai | gpt-4o-mini |
| deepseek | deepseek-chat |
| glm | glm-4-flash |

## Error Handling

The service will raise appropriate errors when:

- **API key not found**: `ValueError` - Ensure the appropriate environment variable is set
- **API errors**: HTTP exceptions from the provider
- **Invalid provider**: `ValueError` - Use one of the supported providers

## Best Practices

1. **Use appropriate models**: Use faster/cheaper models for simple tasks, powerful models for complex analysis
2. **Set temperature carefully**: Lower (0.3-0.5) for factual responses, higher (0.7-1.0) for creative work
3. **Use system prompts**: Set clear system prompts to guide AI behavior
4. **Handle conversation context**: The conversation service maintains message history automatically
5. **Save important generations**: Use the PRD API to save generated documents with version history

## Rate Limits and Costs

Each provider has different rate limits and pricing:

- **DeepSeek**: Most cost-effective, good for general use
- **GLM**: Competitive pricing, good Chinese language support
- **OpenAI**: Industry standard, higher cost
- **Anthropic**: High quality, premium pricing

Check provider documentation for current rates and limits.
