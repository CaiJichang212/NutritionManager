import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  Shield,
  Lock,
  Eye,
  Trash2,
  Check,
} from "lucide-react";

export function PrivacyPage() {
  const navigate = useNavigate();
  const [hideCalories, setHideCalories] = useState(false);
  const [anonymousMode, setAnonymousMode] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/profile")}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">隐私与安全</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800 flex items-center gap-2">
            <Shield size={18} className="text-green-500" />
            数据可见性
          </h2>
          <p className="text-sm text-gray-500 mt-1">控制您的健康数据的可见范围</p>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Eye size={18} className="text-gray-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">隐藏热量数据</div>
                <div className="text-xs text-gray-400">在排行榜中隐藏具体数值</div>
              </div>
            </div>
            <button
              onClick={() => setHideCalories(!hideCalories)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                hideCalories ? "bg-green-500" : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  hideCalories ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Shield size={18} className="text-gray-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">匿名模式</div>
                <div className="text-xs text-gray-400">排行榜使用昵称而非真实姓名</div>
              </div>
            </div>
            <button
              onClick={() => setAnonymousMode(!anonymousMode)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                anonymousMode ? "bg-green-500" : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  anonymousMode ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800 flex items-center gap-2">
            <Lock size={18} className="text-green-500" />
            账号安全
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          <button
            onClick={() => alert("修改密码功能开发中")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="text-sm font-medium text-gray-800">修改密码</div>
            <ChevronLeft size={16} className="text-gray-400 rotate-180" />
          </button>
          <button
            onClick={() => alert("绑定手机功能开发中")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="text-sm font-medium text-gray-800">绑定手机号</div>
            <ChevronLeft size={16} className="text-gray-400 rotate-180" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800 flex items-center gap-2">
            <Trash2 size={18} className="text-red-500" />
            数据管理
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          <button
            onClick={() => {
              if (confirm("确定要导出所有数据吗？")) {
                alert("数据导出功能开发中");
              }
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="text-sm font-medium text-gray-800">导出我的数据</div>
            <ChevronLeft size={16} className="text-gray-400 rotate-180" />
          </button>
          <button
            onClick={() => {
              if (confirm("确定要删除账号吗？此操作不可恢复！")) {
                alert("删除账号功能开发中");
              }
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors"
          >
            <div className="text-sm font-medium text-red-500">删除账号</div>
            <ChevronLeft size={16} className="text-gray-400 rotate-180" />
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
