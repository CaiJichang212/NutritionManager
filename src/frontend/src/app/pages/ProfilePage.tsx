import { useState } from "react";
import { useNavigate } from "react-router";
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  LogOut,
  Edit3,
  Target,
  Activity,
  Ruler,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";

const activityLevelLabels: Record<string, string> = {
  sedentary: "久坐（很少运动）",
  light: "轻度活动（1-3天/周）",
  moderate: "中度活动（3-5天/周）",
  active: "高度活动（6-7天/周）",
  very_active: "极度活动（体力劳动/高强度训练）",
};

const goalTypeLabels: Record<string, string> = {
  lose_weight: "减脂",
  maintain: "维持健康",
  gain_weight: "增重",
  muscle_gain: "增肌",
};

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: user?.username || "",
    age: user?.age || 25,
    height: user?.height || 170,
    weight: user?.weight || 65,
    activity_level: user?.activity_level || "moderate",
    goal_type: user?.goal_type || "maintain",
    target_weight: user?.target_weight || 60,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile({
        nickname: formData.nickname,
        age: formData.age,
        height: formData.height,
        weight: formData.weight,
        activity_level: formData.activity_level as any,
        goal_type: formData.goal_type as any,
        target_weight: formData.target_weight,
      });
      updateUser(updatedUser);
      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const menuItems = [
    { icon: Bell, label: "提醒设置", desc: "饮食提醒、目标提醒", path: "/settings/notifications" },
    { icon: Shield, label: "隐私与安全", desc: "数据管理、账号安全", path: "/settings/privacy" },
    { icon: HelpCircle, label: "帮助与反馈", desc: "常见问题、意见反馈", path: "/settings/help" },
    { icon: Settings, label: "系统设置", desc: "语言、主题、缓存", path: "/settings/system" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>{user?.username?.charAt(0) || "用"}</span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{user?.username || "用户"}</h2>
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Edit3 size={14} />
              </button>
            </div>
            <p className="text-green-100 text-sm mt-0.5">
              {user?.phone || user?.email || "未绑定手机号"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{user?.daily_calorie_goal || 0}</div>
            <div className="text-xs text-green-100">每日热量目标</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{user?.bmr || 0}</div>
            <div className="text-xs text-green-100">基础代谢</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{user?.tdee || 0}</div>
            <div className="text-xs text-green-100">每日消耗</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-800">健康档案</h3>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <User size={18} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">性别</div>
              <div className="text-sm font-medium text-gray-800">
                {user?.gender === "male" ? "男" : user?.gender === "female" ? "女" : "未设置"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Activity size={18} className="text-purple-500" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">年龄</div>
              <div className="text-sm font-medium text-gray-800">{user?.age || "-"} 岁</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Ruler size={18} className="text-green-500" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">身高</div>
              <div className="text-sm font-medium text-gray-800">{user?.height || "-"} cm</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Target size={18} className="text-orange-500" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">体重 / 目标体重</div>
              <div className="text-sm font-medium text-gray-800">
                {user?.weight || "-"} kg → {user?.target_weight || "-"} kg
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Activity size={18} className="text-teal-500" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">活动强度</div>
              <div className="text-sm font-medium text-gray-800">
                {user?.activity_level ? activityLevelLabels[user.activity_level] : "未设置"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Target size={18} className="text-red-500" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">健康目标</div>
              <div className="text-sm font-medium text-gray-800">
                {user?.goal_type ? goalTypeLabels[user.goal_type] : "未设置"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <item.icon size={18} className="text-gray-500" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-800">{item.label}</div>
                <div className="text-xs text-gray-400">{item.desc}</div>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-red-500 hover:bg-red-50 transition-colors"
      >
        <LogOut size={18} />
        <span className="font-medium">退出登录</span>
      </button>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">编辑资料</h3>
              <button
                onClick={() => setEditing(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                取消
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">昵称</label>
                <input
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">年龄</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">身高(cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1.5 block">体重(kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">活动强度</label>
                <select
                  value={formData.activity_level}
                  onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"
                >
                  {Object.entries(activityLevelLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">健康目标</label>
                <select
                  value={formData.goal_type}
                  onChange={(e) => setFormData({ ...formData, goal_type: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"
                >
                  {Object.entries(goalTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">目标体重(kg)</label>
                <input
                  type="number"
                  value={formData.target_weight}
                  onChange={(e) => setFormData({ ...formData, target_weight: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
