import { useState } from "react";
import { useNavigate } from "react-router";
import { Leaf, Phone, Mail, Eye, EyeOff, ChevronRight, Check, Loader2 } from "lucide-react";
import { authService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";

type Step = "login" | "register-info" | "register-goal";

const healthGoals = [
  { id: "lose_weight", label: "减脂", desc: "控制热量，塑造体型", icon: "🔥", color: "border-orange-300 bg-orange-50" },
  { id: "muscle_gain", label: "增肌", desc: "高蛋白摄入，增强肌肉", icon: "💪", color: "border-blue-300 bg-blue-50" },
  { id: "health", label: "健康管理", desc: "特定健康需求管理", icon: "❤️", color: "border-red-300 bg-red-50" },
  { id: "maintain", label: "维持健康", desc: "保持当前健康状态", icon: "⚖️", color: "border-green-300 bg-green-50" },
];

const activityLevels = [
  { id: "sedentary", label: "久坐（很少运动）" },
  { id: "light", label: "轻度活动（1-3天/周）" },
  { id: "moderate", label: "中度活动（3-5天/周）" },
  { id: "active", label: "高度活动（6-7天/周）" },
  { id: "very_active", label: "极度活动（体力劳动/高强度训练）" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loginType, setLoginType] = useState<"phone" | "email">("phone");
  const [step, setStep] = useState<Step>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState("lose_weight");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    password: "",
    code: "",
    nickname: "",
    gender: "male",
    age: 28,
    height: 175,
    weight: 72,
    activity_level: "moderate",
    target_weight: 65,
  });
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async () => {
    if (!formData.phone || countdown > 0) return;
    try {
      await authService.sendVerificationCode(formData.phone);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError("发送验证码失败，请稍后重试");
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        setStep("register-info");
      } else {
        if (loginType === "phone") {
          await authService.login({
            phone: formData.phone,
            code: formData.code,
          });
        } else {
          await authService.login({
            email: formData.email,
            password: formData.password,
          });
        }
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "登录失败，请检查输入");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.register({
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        password: formData.password,
        nickname: formData.nickname,
        gender: formData.gender,
        age: formData.age,
        height: formData.height,
        weight: formData.weight,
        activity_level: formData.activity_level,
        goal_type: selectedGoal,
        target_weight: formData.target_weight,
      });
      navigate("/");
    } catch (err: any) {
      setError(err.message || "注册失败，请检查输入");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col lg:flex-row">
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-green-600 to-emerald-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Leaf size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-lg">营养健康管家</div>
              <div className="text-green-200 text-sm">Nutrition Health Manager</div>
            </div>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            科学饮食，<br />健康生活从这里开始
          </h1>
          <p className="text-green-100 text-lg leading-relaxed mb-8">
            智能识别食物营养成分，个性化营养方案，<br />
            帮助您轻松达成健康目标
          </p>
          <img
            src="https://images.unsplash.com/photo-1642339800099-921df1a0a958?w=600&h=400&fit=crop"
            alt="healthy food"
            className="rounded-2xl object-cover w-full h-64 shadow-2xl opacity-90"
          />
        </div>
        <div className="relative z-10 flex gap-6">
          {[
            { num: "10万+", label: "用户信任" },
            { num: "50万+", label: "食物数据库" },
            { num: "98%", label: "识别准确率" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-white font-bold text-2xl">{s.num}</div>
              <div className="text-green-200 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
              <Leaf size={20} className="text-white" />
            </div>
            <div>
              <div className="text-gray-800 font-semibold text-lg">营养健康管家</div>
              <div className="text-green-600 text-sm">科学饮食，健康生活</div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          {step === "login" && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-gray-800 text-2xl font-bold mb-1">
                {isRegister ? "创建账号" : "欢迎回来"}
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                {isRegister ? "开始您的健康管理之旅" : "继续您的健康管理旅程"}
              </p>

              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                <button
                  onClick={() => setLoginType("phone")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${
                    loginType === "phone" ? "bg-white text-green-700 shadow-sm font-medium" : "text-gray-500"
                  }`}
                >
                  <Phone size={14} /> 手机号登录
                </button>
                <button
                  onClick={() => setLoginType("email")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm transition-all ${
                    loginType === "email" ? "bg-white text-green-700 shadow-sm font-medium" : "text-gray-500"
                  }`}
                >
                  <Mail size={14} /> 邮箱登录
                </button>
              </div>

              <div className="space-y-4">
                {loginType === "phone" ? (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">手机号</label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 whitespace-nowrap">
                        +86
                      </div>
                      <input
                        type="tel"
                        placeholder="请输入手机号"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">邮箱</label>
                    <input
                      type="email"
                      placeholder="请输入邮箱地址"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 focus:bg-white transition-colors"
                    />
                  </div>
                )}

                {loginType === "phone" && !isRegister ? (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">验证码</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="请输入验证码"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 focus:bg-white transition-colors"
                      />
                      <button 
                        onClick={handleSendCode}
                        disabled={countdown > 0}
                        className="px-4 py-3 border border-green-400 text-green-600 rounded-xl text-sm whitespace-nowrap hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {countdown > 0 ? `${countdown}s` : "发送验证码"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm text-gray-600">密码</label>
                      {!isRegister && (
                        <button className="text-sm text-green-600 hover:text-green-700">忘记密码?</button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="请输入密码（8-20位）"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 focus:bg-white transition-colors pr-10"
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {isRegister && loginType === "phone" && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">验证码</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="请输入验证码"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 focus:bg-white transition-colors"
                      />
                      <button 
                        onClick={handleSendCode}
                        disabled={countdown > 0}
                        className="px-4 py-3 border border-green-400 text-green-600 rounded-xl text-sm whitespace-nowrap hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {countdown > 0 ? `${countdown}s` : "发送验证码"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!isRegister && (
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" id="remember" className="accent-green-500" />
                  <label htmlFor="remember" className="text-sm text-gray-600">记住我</label>
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full mt-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {isRegister ? "下一步" : "登录"} <ChevronRight size={16} />
              </button>

              <div className="text-center mt-4 text-sm text-gray-500">
                {isRegister ? "已有账号？" : "还没有账号？"}
                <button
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-green-600 hover:text-green-700 ml-1 font-medium"
                >
                  {isRegister ? "立即登录" : "立即注册"}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="text-center text-sm text-gray-400 mb-3">或通过以下方式快速登录</div>
                <div className="flex gap-3">
                  {["微信", "QQ", "小红书"].map((p) => (
                    <button
                      key={p}
                      className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "register-info" && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full ${i === 1 ? "w-8 bg-green-500" : "w-4 bg-gray-200"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400">第1步/共2步</span>
              </div>
              <h2 className="text-gray-800 text-xl font-bold mb-1">完善基本信息</h2>
              <p className="text-gray-500 text-sm mb-6">用于精准计算您的每日营养目标</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">昵称</label>
                    <input
                      value={formData.nickname}
                      onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-green-400 transition-colors"
                      placeholder="请输入昵称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">性别</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-green-400 transition-colors"
                    >
                      <option value="male">男</option>
                      <option value="female">女</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">年龄</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-green-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">身高(cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-green-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1.5">体重(kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-green-400 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">活动强度</label>
                  <select 
                    value={formData.activity_level}
                    onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 outline-none focus:border-green-400 transition-colors"
                  >
                    {activityLevels.map((level) => (
                      <option key={level.id} value={level.id}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep("register-goal")}
                className="w-full mt-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"
              >
                下一步 <ChevronRight size={16} />
              </button>
            </div>
          )}

          {step === "register-goal" && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full ${i <= 2 ? "w-8 bg-green-500" : "w-4 bg-gray-200"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400">第2步/共2步</span>
              </div>
              <h2 className="text-gray-800 text-xl font-bold mb-1">设置健康目标</h2>
              <p className="text-gray-500 text-sm mb-6">根据您的目标，系统将自动制定个性化营养方案</p>

              <div className="grid grid-cols-2 gap-3">
                {healthGoals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      selectedGoal === goal.id ? "border-green-500 bg-green-50" : `${goal.color} border-transparent`
                    }`}
                  >
                    {selectedGoal === goal.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                    <div className="text-2xl mb-2">{goal.icon}</div>
                    <div className="text-sm font-semibold text-gray-800">{goal.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{goal.desc}</div>
                  </button>
                ))}
              </div>

              {selectedGoal === "lose_weight" && (
                <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="text-sm font-medium text-orange-700 mb-2">减脂目标设置</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">目标体重(kg)</label>
                      <input
                        type="number"
                        value={formData.target_weight}
                        onChange={(e) => setFormData({ ...formData, target_weight: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm text-gray-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">减脂速度</label>
                      <select className="w-full px-3 py-2 bg-white border border-orange-200 rounded-lg text-sm text-gray-800 outline-none">
                        <option>0.5 kg/周（推荐）</option>
                        <option>1.0 kg/周（较快）</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="text-sm text-green-700">
                  <span className="font-medium">系统将根据您的信息自动计算：</span>
                  <br />BMR（基础代谢率）· TDEE（每日总消耗）· 每日热量目标
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full mt-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                完成注册，开始使用 <ChevronRight size={16} />
              </button>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-4">
            登录即表示同意{" "}
            <a href="#" className="text-green-600">服务条款</a> 和{" "}
            <a href="#" className="text-green-600">隐私政策</a>
          </p>
        </div>
      </div>
    </div>
  );
}
