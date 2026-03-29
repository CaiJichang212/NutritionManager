import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  Settings,
  Globe,
  Moon,
  Monitor,
  Trash2,
  RefreshCw,
  Check,
} from "lucide-react";

export function SystemPage() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
  const [language, setLanguage] = useState("zh-CN");
  const [clearCache, setClearCache] = useState(false);

  const handleClearCache = () => {
    setClearCache(true);
    localStorage.clear();
    setTimeout(() => {
      setClearCache(false);
      alert("缓存已清除");
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">系统设置</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800 flex items-center gap-2">
            <Monitor size={18} className="text-green-500" />
            外观
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="p-4">
            <div className="text-sm font-medium text-gray-800 mb-3">主题模式</div>
            <div className="flex gap-2">
              <button
                onClick={() => setTheme("light")}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  theme === "light"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Settings size={16} />
                浅色
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  theme === "dark"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Moon size={16} />
                深色
              </button>
              <button
                onClick={() => setTheme("auto")}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  theme === "auto"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Globe size={16} />
                自动
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800 flex items-center gap-2">
            <Globe size={18} className="text-green-500" />
            语言
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="p-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-green-400"
            >
              <option value="zh-CN">简体中文</option>
              <option value="zh-TW">繁體中文</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800 flex items-center gap-2">
            <Settings size={18} className="text-green-500" />
            应用
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          <button
            onClick={handleClearCache}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Trash2 size={18} className="text-gray-500" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-800">清除缓存</div>
                <div className="text-xs text-gray-400">包括本地搜索历史等数据</div>
              </div>
            </div>
            {clearCache ? (
              <RefreshCw size={16} className="text-green-500 animate-spin" />
            ) : (
              <ChevronLeft size={16} className="text-gray-400 rotate-180" />
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800">关于</h2>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="flex items-center justify-between p-4">
            <div className="text-sm text-gray-800">当前版本</div>
            <div className="text-sm text-gray-400">v1.0.0 MVP</div>
          </div>
          <button
            onClick={() => alert("检查更新功能开发中")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="text-sm font-medium text-gray-800">检查更新</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-full">最新版本</span>
              <ChevronLeft size={16} className="text-gray-400 rotate-180" />
            </div>
          </button>
        </div>
      </div>

      <button
        onClick={() => navigate("/profile")}
        className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
      >
        <Check size={16} />
        保存设置
      </button>
    </div>
  );
}
