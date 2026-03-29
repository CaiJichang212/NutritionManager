from openai import OpenAI
from typing import Optional, AsyncGenerator
from config import settings

MODELSCOPE_API_KEY = settings.MODELSCOPE_API_KEY
MODELSCOPE_BASE_URL = "https://api-inference.modelscope.cn/v1"

PRIMARY_MODEL = "Qwen/Qwen3.5-122B-A10B"
FALLBACK_MODEL = "PaddlePaddle/ERNIE-4.5-VL-28B-A3B-PT"

class AIService:
    def __init__(self):
        self.client = OpenAI(
            base_url=MODELSCOPE_BASE_URL,
            api_key=MODELSCOPE_API_KEY,
        )
        self.current_model = PRIMARY_MODEL

    def _build_nutrition_system_prompt(self) -> str:
        return """你是一位专业的AI营养师，专门帮助用户进行健康饮食管理。你的职责包括：

1. 分析用户的饮食习惯和营养摄入
2. 提供个性化的饮食建议和营养方案
3. 解答关于食物营养、健康饮食的问题
4. 帮助用户制定合理的饮食计划
5. 根据用户的健康目标和身体状况提供建议

请用专业但易懂的语言回答用户的问题，必要时可以提供具体的食物推荐和份量建议。
回答时要考虑用户可能提供的个人信息，如年龄、体重、身高、活动水平、健康目标等。"""

    async def chat(
        self, 
        message: str, 
        context: Optional[dict] = None,
        stream: bool = False
    ) -> str:
        messages = [
            {"role": "system", "content": self._build_nutrition_system_prompt()}
        ]

        if context:
            context_str = self._format_context(context)
            messages.append({"role": "system", "content": f"用户背景信息：\n{context_str}"})

        messages.append({"role": "user", "content": message})

        try:
            response = self.client.chat.completions.create(
                model=self.current_model,
                messages=messages,
                stream=stream
            )

            if stream:
                return response

            return response.choices[0].message.content

        except Exception as e:
            if "rate" in str(e).lower() or "limit" in str(e).lower():
                self.current_model = FALLBACK_MODEL
                response = self.client.chat.completions.create(
                    model=self.current_model,
                    messages=messages,
                    stream=stream
                )
                if stream:
                    return response
                return response.choices[0].message.content
            raise e

    async def chat_stream(
        self, 
        message: str, 
        context: Optional[dict] = None
    ) -> AsyncGenerator[str, None]:
        response = await self.chat(message, context, stream=True)
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    def _format_context(self, context: dict) -> str:
        parts = []
        if "age" in context:
            parts.append(f"年龄: {context['age']}岁")
        if "gender" in context:
            parts.append(f"性别: {context['gender']}")
        if "height" in context:
            parts.append(f"身高: {context['height']}cm")
        if "weight" in context:
            parts.append(f"体重: {context['weight']}kg")
        if "activity_level" in context:
            parts.append(f"活动水平: {context['activity_level']}")
        if "goal_type" in context:
            parts.append(f"健康目标: {context['goal_type']}")
        if "daily_calorie_goal" in context:
            parts.append(f"每日热量目标: {context['daily_calorie_goal']}kcal")
        if "today_intake" in context:
            parts.append(f"今日已摄入: {context['today_intake']}kcal")
        return "\n".join(parts)

ai_service = AIService()
