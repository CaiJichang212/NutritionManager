import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Zap,
  Loader2,
} from "lucide-react";
import { aiService } from "../services/aiService";
import { useAuthStore } from "../stores/authStore";
import { useNutritionStore } from "../stores/nutritionStore";

type Message = {
  id: number;
  role: "user" | "ai";
  text: string;
  time: string;
};

const quickQuestions = [
  "今天应该吃什么？",
  "我的蛋白质摄入够吗？",
  "如何加快减脂速度？",
  "推荐高蛋白低卡食物",
];

export function AIChatPage() {
  const { user } = useAuthStore();
  const { todayNutrition, calorieTarget, macroTargets } = useNutritionStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      text: `你好！我是你的 AI 营养师 🌿\n\n我已经了解你的基本情况：\n• 目标：${user?.goal_type === 'lose_weight' ? '减脂' : user?.goal_type === 'muscle_gain' ? '增肌' : '健康管理'}\n• 今日热量：${todayNutrition.calories} / ${calorieTarget} kcal\n• 蛋白质：${todayNutrition.protein} / ${macroTargets.protein}g\n\n有什么我可以帮助你的吗？`,
      time: "刚刚",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: text.trim(),
      time: "刚刚",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const context = {
        user: {
          goal: user?.goal_type,
          weight: user?.weight,
          height: user?.height,
          age: user?.age,
          targetWeight: user?.target_weight,
        },
        nutrition: {
          calories: todayNutrition.calories,
          targetCalories: calorieTarget,
          protein: todayNutrition.protein,
          targetProtein: macroTargets.protein,
          fat: todayNutrition.fat,
          targetFat: macroTargets.fat,
          carbs: todayNutrition.carbohydrates,
          targetCarbs: macroTargets.carbohydrates,
        },
      };

      const response = await aiService.chat(text, context);

      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        text: response,
        time: "刚刚",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        text: "抱歉，我暂时无法回答这个问题。请稍后再试。",
        time: "刚刚",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatText = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={i} className="font-semibold text-gray-800 mt-2">{line.slice(2, -2)}</p>;
      }
      if (line.startsWith("• ") || line.startsWith("- ")) {
        return <p key={i} className="flex gap-2"><span>•</span><span>{line.slice(2)}</span></p>;
      }
      if (line === "") return <div key={i} className="h-1" />;
      return <p key={i}>{line}</p>;
    });
  };

  const handleReset = () => {
    setMessages([
      {
        id: 1,
        role: "ai",
        text: `对话已重置。有什么我可以帮助你的吗？`,
        time: "刚刚",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-120px)] lg:max-h-[calc(100vh-64px)]">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <div className="font-semibold text-gray-800 flex items-center gap-1.5">
            AI 营养师
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div className="text-xs text-gray-400">基于中国居民膳食指南 · 感知你的健康数据</div>
        </div>
        <button 
          onClick={handleReset}
          className="ml-auto p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="bg-green-50 border-b border-green-100 px-4 py-2.5 flex items-center gap-4 text-xs text-green-700 flex-shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Zap size={12} /> 今日热量 {todayNutrition.calories}/{calorieTarget} kcal
        </div>
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Zap size={12} /> 蛋白质 {todayNutrition.protein}/{macroTargets.protein}g
        </div>
        <div className="flex items-center gap-1 whitespace-nowrap">
          <Zap size={12} /> 目标：{user?.goal_type === 'lose_weight' ? '减脂' : user?.goal_type === 'muscle_gain' ? '增肌' : '健康管理'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
              msg.role === "ai"
                ? "bg-gradient-to-br from-green-400 to-emerald-600"
                : "bg-gray-200"
            }`}>
              {msg.role === "ai" ? (
                <Bot size={14} className="text-white" />
              ) : (
                <User size={14} className="text-gray-600" />
              )}
            </div>

            <div className={`max-w-[75%] lg:max-w-[60%]`}>
              <div
                className={`px-4 py-3 rounded-2xl text-sm space-y-0.5 ${
                  msg.role === "ai"
                    ? "bg-white border border-gray-100 shadow-sm text-gray-700 rounded-tl-sm"
                    : "bg-green-500 text-white rounded-tr-sm"
                }`}
              >
                {msg.role === "ai" ? formatText(msg.text) : <p>{msg.text}</p>}
              </div>
              <div className={`text-xs text-gray-400 mt-1 ${msg.role === "user" ? "text-right" : ""}`}>
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 size={16} className="animate-spin text-green-500" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && (
        <div className="px-4 py-3 flex-shrink-0">
          <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
            <Sparkles size={11} /> 快捷问题
          </div>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full hover:bg-green-100 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
        <div className="flex gap-2 items-end">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-2 focus-within:border-green-400 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="问我任何营养相关问题..."
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none"
              rows={1}
              style={{ minHeight: "20px", maxHeight: "80px" }}
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
              input.trim() && !isTyping
                ? "bg-green-500 text-white hover:bg-green-600 shadow-md shadow-green-200"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-1.5 text-center">
          AI 建议仅供参考，如有特殊健康状况请咨询专业医生
        </div>
      </div>
    </div>
  );
}
