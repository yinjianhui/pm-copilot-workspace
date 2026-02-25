"""
AI Service Module - Support for multiple LLM providers

Supports:
- Anthropic Claude
- OpenAI
- DeepSeek (OpenAI-compatible)
- GLM (Zhipu AI)
"""

import os
from typing import List, Dict, Any, Optional, AsyncGenerator
from enum import Enum
import httpx
from app.config import get_settings

settings = get_settings()


class ModelProvider(str, Enum):
    """Supported AI model providers."""
    anthropic = "anthropic"
    openai = "openai"
    deepseek = "deepseek"
    glm = "glm"


class ModelConfig:
    """Configuration for AI models."""

    # Anthropic Claude
    ANTHROPIC_BASE_URL = "https://api.anthropic.com"
    ANTHROPIC_MODELS = {
        "claude-3-opus-20240229": "claude-3-opus-20240229",
        "claude-3-sonnet-20240229": "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307": "claude-3-haiku-20240307",
        "claude-3-5-sonnet-20241022": "claude-3-5-sonnet-20241022",
        "claude-3-5-sonnet-20250119": "claude-3-5-sonnet-20250119",
    }

    # OpenAI
    OPENAI_BASE_URL = "https://api.openai.com/v1"
    OPENAI_MODELS = {
        "gpt-4o": "gpt-4o",
        "gpt-4o-mini": "gpt-4o-mini",
        "gpt-4-turbo": "gpt-4-turbo-preview",
        "gpt-3.5-turbo": "gpt-3.5-turbo",
    }

    # DeepSeek (OpenAI-compatible)
    DEEPSEEK_BASE_URL = "https://api.deepseek.com"
    DEEPSEEK_MODELS = {
        "deepseek-chat": "deepseek-chat",
        "deepseek-coder": "deepseek-coder",
        "deepseek-reasoner": "deepseek-reasoner",
    }

    # GLM (Zhipu AI)
    GLM_BASE_URL = "https://open.bigmodel.cn/api/paas/v4"
    GLM_MODELS = {
        "glm-4-plus": "glm-4-plus",
        "glm-4": "glm-4",
        "glm-4-air": "glm-4-air",
        "glm-4-flash": "glm-4-flash",
        "glm-4-flashx": "glm-4-flashx",
    }

    @classmethod
    def get_base_url(cls, provider: ModelProvider) -> str:
        """Get base URL for provider."""
        urls = {
            ModelProvider.anthropic: cls.ANTHROPIC_BASE_URL,
            ModelProvider.openai: cls.OPENAI_BASE_URL,
            ModelProvider.deepseek: cls.DEEPSEEK_BASE_URL,
            ModelProvider.glm: cls.GLM_BASE_URL,
        }
        return urls.get(provider, cls.OPENAI_BASE_URL)

    @classmethod
    def get_available_models(cls, provider: ModelProvider) -> Dict[str, str]:
        """Get available models for provider."""
        models = {
            ModelProvider.anthropic: cls.ANTHROPIC_MODELS,
            ModelProvider.openai: cls.OPENAI_MODELS,
            ModelProvider.deepseek: cls.DEEPSEEK_MODELS,
            ModelProvider.glm: cls.GLM_MODELS,
        }
        return models.get(provider, {})


class AIService:
    """
    Unified AI service supporting multiple LLM providers.
    """

    def __init__(
        self,
        provider: ModelProvider = ModelProvider.deepseek,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
    ):
        """
        Initialize AI service with specified provider.

        Args:
            provider: Model provider (anthropic, openai, deepseek, glm)
            model: Specific model to use (defaults to provider's default)
            api_key: API key for the provider (defaults to env var)
        """
        self.provider = provider
        self.base_url = ModelConfig.get_base_url(provider)
        self.api_key = api_key or self._get_api_key(provider)

        # Set default model if not specified
        if model is None:
            model = self._get_default_model(provider)
        self.model = model

    def _get_api_key(self, provider: ModelProvider) -> str:
        """Get API key from environment for provider."""
        keys = {
            ModelProvider.anthropic: getattr(settings, "ANTHROPIC_API_KEY", None),
            ModelProvider.openai: getattr(settings, "OPENAI_API_KEY", None),
            ModelProvider.deepseek: getattr(settings, "DEEPSEEK_API_KEY", None),
            ModelProvider.glm: getattr(settings, "GLM_API_KEY", None),
        }

        key = keys.get(provider)
        if not key:
            raise ValueError(f"API key not found for provider: {provider}. "
                           f"Please set the appropriate environment variable.")
        return key

    def _get_default_model(self, provider: ModelProvider) -> str:
        """Get default model for provider."""
        defaults = {
            ModelProvider.anthropic: "claude-3-5-sonnet-20250119",
            ModelProvider.openai: "gpt-4o-mini",
            ModelProvider.deepseek: "deepseek-chat",
            ModelProvider.glm: "glm-4-flash",
        }
        return defaults.get(provider, "gpt-4o-mini")

    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for API request."""
        headers = {
            "Content-Type": "application/json",
        }

        if self.provider == ModelProvider.anthropic:
            headers["x-api-key"] = self.api_key
            headers["anthropic-version"] = "2023-06-01"
        else:
            # OpenAI-compatible (OpenAI, DeepSeek, GLM)
            headers["Authorization"] = f"Bearer {self.api_key}"

        return headers

    def _format_messages(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Format messages for the specific provider's API.

        Args:
            messages: List of message dicts with 'role' and 'content'
            system_prompt: Optional system prompt

        Returns:
            Formatted request payload
        """
        if self.provider == ModelProvider.anthropic:
            # Anthropic format
            payload = {
                "model": self.model,
                "max_tokens": 4096,
                "messages": messages,
            }
            if system_prompt:
                payload["system"] = system_prompt
        else:
            # OpenAI-compatible format (OpenAI, DeepSeek, GLM)
            payload = {
                "model": self.model,
                "messages": messages,
            }
            if system_prompt:
                payload["messages"] = [
                    {"role": "system", "content": system_prompt},
                    *messages,
                ]

        return payload

    def _extract_response(self, response_data: Dict[str, Any]) -> str:
        """Extract content from provider response."""
        if self.provider == ModelProvider.anthropic:
            return response_data.get("content", [{}])[0].get("text", "")
        else:
            # OpenAI-compatible format
            return response_data.get("choices", [{}])[0].get("message", {}).get("content", "")

    async def chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        stream: bool = False,
    ) -> str:
        """
        Send chat completion request to the AI model.

        Args:
            messages: List of message dicts with 'role' and 'content'
            system_prompt: Optional system prompt
            temperature: Sampling temperature (0-2)
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response

        Returns:
            AI response text
        """
        payload = self._format_messages(messages, system_prompt)

        if temperature is not None:
            payload["temperature"] = temperature

        if max_tokens is not None:
            if self.provider == ModelProvider.anthropic:
                payload["max_tokens"] = max_tokens
            else:
                payload["max_tokens"] = max_tokens

        if stream:
            payload["stream"] = True

        endpoint = self._get_endpoint()

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                endpoint,
                headers=self._get_headers(),
                json=payload,
            )
            response.raise_for_status()
            response_data = response.json()

        return self._extract_response(response_data)

    async def chat_stream(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Stream chat completion response from the AI model.

        Args:
            messages: List of message dicts with 'role' and 'content'
            system_prompt: Optional system prompt
            temperature: Sampling temperature (0-2)
            max_tokens: Maximum tokens to generate

        Yields:
            Chunks of AI response text
        """
        payload = self._format_messages(messages, system_prompt)

        if temperature is not None:
            payload["temperature"] = temperature

        if max_tokens is not None:
            if self.provider == ModelProvider.anthropic:
                payload["max_tokens"] = max_tokens
            else:
                payload["max_tokens"] = max_tokens

        payload["stream"] = True

        endpoint = self._get_endpoint()

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                endpoint,
                headers=self._get_headers(),
                json=payload,
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            import json
                            chunk = json.loads(data)
                            yield self._extract_stream_chunk(chunk)
                        except json.JSONDecodeError:
                            continue

    def _extract_stream_chunk(self, chunk: Dict[str, Any]) -> str:
        """Extract content from streaming response chunk."""
        if self.provider == ModelProvider.anthropic:
            if chunk.get("type") == "content_block_delta":
                return chunk.get("delta", {}).get("text", "")
        else:
            # OpenAI-compatible format
            return chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
        return ""

    def _get_endpoint(self) -> str:
        """Get the full API endpoint URL."""
        if self.provider == ModelProvider.anthropic:
            return f"{self.base_url}/v1/messages"
        elif self.provider == ModelProvider.glm:
            return f"{self.base_url}/chat/completions"
        else:
            return f"{self.base_url}/chat/completions"


class ConversationService:
    """
    Service for managing AI conversations with message history.
    """

    def __init__(
        self,
        provider: ModelProvider = ModelProvider.deepseek,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        system_prompt: Optional[str] = None,
    ):
        """
        Initialize conversation service.

        Args:
            provider: Model provider to use
            model: Specific model to use
            api_key: API key for the provider
            system_prompt: Default system prompt for conversations
        """
        self.ai_service = AIService(provider, model, api_key)
        self.system_prompt = system_prompt
        self.conversation_history: List[Dict[str, str]] = []

    def add_message(self, role: str, content: str) -> None:
        """
        Add a message to conversation history.

        Args:
            role: Message role ('user' or 'assistant')
            content: Message content
        """
        self.conversation_history.append({"role": role, "content": content})

    def clear_history(self) -> None:
        """Clear conversation history."""
        self.conversation_history = []

    def get_history(self) -> List[Dict[str, str]]:
        """Get current conversation history."""
        return self.conversation_history.copy()

    async def send_message(
        self,
        message: str,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> str:
        """
        Send a message and get AI response.

        Args:
            message: User message
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate

        Returns:
            AI response
        """
        self.add_message("user", message)

        response = await self.ai_service.chat(
            messages=self.conversation_history,
            system_prompt=self.system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        )

        self.add_message("assistant", response)
        return response

    async def send_message_stream(
        self,
        message: str,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> AsyncGenerator[str, None]:
        """
        Send a message and stream AI response.

        Args:
            message: User message
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate

        Yields:
            Chunks of AI response
        """
        self.add_message("user", message)

        full_response = ""
        async for chunk in self.ai_service.chat_stream(
            messages=self.conversation_history[:-1],  # Exclude the user message we just added
            system_prompt=self.system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
        ):
            full_response += chunk
            yield chunk

        self.add_message("assistant", full_response)

    def set_system_prompt(self, system_prompt: str) -> None:
        """Set the system prompt for conversations."""
        self.system_prompt = system_prompt


class PRDGenerationService:
    """
    Service for generating Product Requirement Documents (PRDs).
    """

    DEFAULT_SYSTEM_PROMPT = """You are an expert Product Manager with deep experience in writing clear, comprehensive Product Requirement Documents (PRDs). Your task is to generate well-structured PRDs based on the user's input.

A good PRD should include:
1. Executive Summary - Brief overview of the product/feature
2. Background & Context - Why are we building this?
3. Goals & Success Metrics - What are we trying to achieve?
4. User Stories - Who are the users and what do they need?
5. Functional Requirements - Detailed feature specifications
6. Non-Functional Requirements - Performance, security, scalability
7. User Experience - UI/UX considerations
8. Dependencies & Constraints - Technical and business constraints
9. Release Criteria - What defines a successful release?
10. Open Questions - Items that need clarification

Write in clear, professional language. Be specific and actionable."""

    def __init__(
        self,
        provider: ModelProvider = ModelProvider.deepseek,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
    ):
        """
        Initialize PRD generation service.

        Args:
            provider: Model provider to use
            model: Specific model to use
            api_key: API key for the provider
        """
        self.conversation_service = ConversationService(
            provider=provider,
            model=model,
            api_key=api_key,
            system_prompt=self.DEFAULT_SYSTEM_PROMPT,
        )

    async def generate_prd(
        self,
        product_description: str,
        context: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        """
        Generate a PRD based on product description.

        Args:
            product_description: Description of the product/feature
            context: Additional context (target users, market, etc.)
            temperature: Sampling temperature

        Returns:
            Generated PRD document
        """
        prompt = f"Generate a comprehensive PRD for the following product/feature:\n\n{product_description}"

        if context:
            prompt = f"Generate a comprehensive PRD for the following product/feature.\n\nAdditional Context:\n{context}\n\nProduct/Feature Description:\n{product_description}"

        return await self.conversation_service.send_message(
            message=prompt,
            temperature=temperature,
        )

    async def refine_prd_section(
        self,
        prd_content: str,
        section_name: str,
        feedback: str,
        temperature: float = 0.7,
    ) -> str:
        """
        Refine a specific section of the PRD.

        Args:
            prd_content: Current PRD content
            section_name: Name of section to refine
            feedback: Feedback on how to improve the section
            temperature: Sampling temperature

        Returns:
            Refined section content
        """
        prompt = f"""Here is the current PRD:

{prd_content}

Please refine the "{section_name}" section based on this feedback:
{feedback}

Return only the refined "{section_name}" section."""

        self.conversation_service.clear_history()
        return await self.conversation_service.send_message(
            message=prompt,
            temperature=temperature,
        )

    def set_system_prompt(self, system_prompt: str) -> None:
        """Set a custom system prompt for PRD generation."""
        self.conversation_service.set_system_prompt(system_prompt)


# Convenience functions for creating service instances

def create_ai_service(
    provider: str = "deepseek",
    model: Optional[str] = None,
    api_key: Optional[str] = None,
) -> AIService:
    """
    Create an AI service instance.

    Args:
        provider: Provider name ('anthropic', 'openai', 'deepseek', 'glm')
        model: Specific model to use
        api_key: API key for the provider

    Returns:
        AIService instance
    """
    return AIService(
        provider=ModelProvider(provider),
        model=model,
        api_key=api_key,
    )


def create_conversation_service(
    provider: str = "deepseek",
    model: Optional[str] = None,
    api_key: Optional[str] = None,
    system_prompt: Optional[str] = None,
) -> ConversationService:
    """
    Create a conversation service instance.

    Args:
        provider: Provider name ('anthropic', 'openai', 'deepseek', 'glm')
        model: Specific model to use
        api_key: API key for the provider
        system_prompt: Default system prompt

    Returns:
        ConversationService instance
    """
    return ConversationService(
        provider=ModelProvider(provider),
        model=model,
        api_key=api_key,
        system_prompt=system_prompt,
    )


def create_prd_service(
    provider: str = "deepseek",
    model: Optional[str] = None,
    api_key: Optional[str] = None,
) -> PRDGenerationService:
    """
    Create a PRD generation service instance.

    Args:
        provider: Provider name ('anthropic', 'openai', 'deepseek', 'glm')
        model: Specific model to use
        api_key: API key for the provider

    Returns:
        PRDGenerationService instance
    """
    return PRDGenerationService(
        provider=ModelProvider(provider),
        model=model,
        api_key=api_key,
    )
