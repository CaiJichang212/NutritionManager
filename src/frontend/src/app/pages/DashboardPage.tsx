import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  ChevronRight,
  Flame,
  Clock,
  Camera,
  Search,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useNutritionStore } from "../stores/nutritionStore";
import { useDietStore } from "../stores/dietStore";
import { recordService } from "../services/recordService";

const COLORS = {
  protein: "#3b82f6",
  fat: "#f59e0b",
  carbs: "#8b5cf6",
  fiber: "#10b981",
};

const mealTypeLabels: Record<string, { label: string; icon: string }> = {
  breakfast: { label: "早餐", icon: "🌅" },
  lunch: { label: "午餐", icon: "☀️" },
  dinner: { label: "晚餐", icon: "🌙" },
  snack: { label: "加餐", icon: "🍎" },
};

function CalorieRing({ consumed, target }: { consumed: number; target: number }) {
  const pct = Math.min((consumed / target) * 100, 100);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="60" cy="60" r="54" fill="none"
          stroke={pct > 110 ? "#ef4444" : pct > 95 ? "#f59e0b" : "#22c55e"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-gray-800">{consumed}</div>
        <div className="text-xs text-gray-400">/ {target}</div>
        <div className="text-xs text-gray-500">千卡</div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { todayNutrition, calorieTarget, macroTargets, updateNutrition, setCalorieTarget, setMacroTargets } = useNutritionStore();
  const { todayRecords, setTodayRecords } = useDietStore();
  const [loading, setLoading] = useState(true);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      if (user?.daily_calorie_goal) {
        setCalorieTarget(user.daily_calorie_goal);
      }
      if (user?.protein_goal && user?.fat_goal && user?.carbs_goal) {
        setMacroTargets({
          protein: user.protein_goal,
          fat: user.fat_goal,
          carbohydrates: user.carbs_goal,
        });
      }

      const records = await recordService.getTodayRecords();
      setTodayRecords(records);

      let totalCalories = 0;
      let totalProtein = 0;
      let totalFat = 0;
      let totalCarbs = 0;
      let totalFiber = 0;

      records.forEach(record => {
        totalCalories += record.totalCalories;
        totalProtein += record.totalProtein;
        totalFat += record.totalFat;
        totalCarbs += record.totalCarbohydrates;
        record.foods.forEach(food => {
          totalFiber += food.fiber || 0;
        });
      });

      updateNutrition({
        calories: totalCalories,
        protein: totalProtein,
        fat: totalFat,
        carbohydrates: totalCarbs,
        fiber: totalFiber,
      });
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calorieRemaining = calorieTarget - todayNutrition.calories;
  const macros = [
    { name: "蛋白质", key: "protein", consumed: todayNutrition.protein, target: macroTargets.protein, unit: "g", color: COLORS.protein, tip: "增肌关键" },
    { name: "脂肪", key: "fat", consumed: todayNutrition.fat, target: macroTargets.fat, unit: "g", color: COLORS.fat, tip: "优先不饱和脂肪" },
    { name: "碳水", key: "carbs", consumed: todayNutrition.carbohydrates, target: macroTargets.carbohydrates, unit: "g", color: COLORS.carbs, tip: "主要能量来源" },
    { name: "膳食纤维", key: "fiber", consumed: todayNutrition.fiber, target: macroTargets.fiber || 25, unit: "g", color: COLORS.fiber, tip: "促进消化" },
  ];

  const reminders = [];
  const proteinPct = (todayNutrition.protein / macroTargets.protein) * 100;
  if (proteinPct < 70) {
    reminders.push({ type: "warn", icon: AlertCircle, text: `蛋白质摄入不足 ${Math.round(proteinPct)}%，建议增加蛋白质食物`, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" });
  }
  if (calorieRemaining > 0) {
    reminders.push({ type: "ok", icon: CheckCircle2, text: `热量摄入良好，距目标还有 ${calorieRemaining} kcal`, color: "text-green-600", bg: "bg-green-50 border-green-200" });
  } else if (calorieRemaining < 0) {
    reminders.push({ type: "warn", icon: AlertCircle, text: `热量已超标 ${Math.abs(calorieRemaining)} kcal`, color: "text-red-600", bg: "bg-red-50 border-red-200" });
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "夜深了";
    if (hour < 12) return "早上好";
    if (hour < 14) return "中午好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  const groupedRecords = todayRecords.reduce((acc, record) => {
    const mealType = record.mealType;
    if (!acc[mealType]) {
      acc[mealType] = [];
    }
    acc[mealType].push(record);
    return acc;
  }, {} as Record<string, typeof todayRecords>);

  const mealOrder = ['breakfast', 'lunch', 'snack', 'dinner'] as const;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-800">{getGreeting()}，{user?.username || '用户'} 👋</h1>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" })}
            {user?.goal_type === 'lose_weight' && ' · 减脂计划进行中'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-orange-100 text-orange-600 rounded-full text-xs font-medium flex items-center gap-1">
            🔥 连续记录 {todayRecords.length > 0 ? '1' : '0'} 天
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-700">今日热量</h3>
              <span className="text-xs text-gray-400">目标 {calorieTarget} kcal</span>
            </div>
            <div className="flex items-center gap-4">
              <CalorieRing consumed={todayNutrition.calories} target={calorieTarget} />
              <div className="flex-1 space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">已摄入</div>
                  <div className="text-lg font-bold text-gray-800">{todayNutrition.calories} <span className="text-sm font-normal text-gray-400">kcal</span></div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">剩余</div>
                  <div className={`text-lg font-bold ${calorieRemaining < 0 ? "text-red-500" : "text-green-600"}`}>
                    {calorieRemaining} <span className="text-sm font-normal text-gray-400">kcal</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-2 py-1">
                  达成率 {Math.round((todayNutrition.calories / calorieTarget) * 100)}%
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-orange-50 rounded-xl p-3 flex items-center gap-2">
                <Flame size={16} className="text-orange-500" />
                <div>
                  <div className="text-xs text-gray-500">运动消耗</div>
                  <div className="text-sm font-semibold text-gray-700">0 kcal</div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 flex items-center gap-2">
                <Zap size={16} className="text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500">基础代谢</div>
                  <div className="text-sm font-semibold text-gray-700">{user?.bmr || 0} kcal</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-700">三大营养素</h3>
              <button
                onClick={() => navigate("/nutrition")}
                className="text-sm text-green-600 flex items-center gap-1 hover:text-green-700"
              >
                详情 <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {macros.map((m) => (
                <div key={m.key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-600">{m.name}</span>
                    <span className="text-xs text-gray-400">{m.consumed.toFixed(0)}/{m.target}{m.unit}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min((m.consumed / m.target) * 100, 100)}%`,
                        backgroundColor: m.color,
                      }}
                    />
                  </div>
                  <div className="text-xs" style={{ color: m.color }}>
                    {Math.round((m.consumed / m.target) * 100)}% · {m.tip}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2">关注指标</div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "添加糖", consumed: todayNutrition.sugar || 0, target: 50, unit: "g" },
                  { label: "钠摄入", consumed: todayNutrition.sodium || 0, target: 2000, unit: "mg" },
                  { label: "饱和脂肪", consumed: 0, target: 20, unit: "g" },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                    <div className="flex items-end gap-1">
                      <span className="text-sm font-semibold text-gray-800">{item.consumed}</span>
                      <span className="text-xs text-gray-400 mb-0.5">/{item.target}{item.unit}</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-green-400 rounded-full"
                        style={{ width: `${Math.min((item.consumed / item.target) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {reminders.length > 0 && (
            <div className="space-y-2">
              {reminders.map((r, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${r.bg}`}>
                  <r.icon size={16} className={`${r.color} mt-0.5 flex-shrink-0`} />
                  <p className="text-sm text-gray-700">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700">快捷添加</h3>
          <button
            onClick={() => navigate("/record")}
            className="text-sm text-green-600 flex items-center gap-1 hover:text-green-700"
          >
            更多选项 <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          <button
            onClick={() => navigate("/record")}
            className="flex flex-col items-center gap-2 p-3 border-2 border-dashed border-green-300 rounded-xl hover:bg-green-50 transition-colors text-green-600"
          >
            <Camera size={20} />
            <span className="text-xs">拍照识别</span>
          </button>
          <button
            onClick={() => navigate("/record")}
            className="flex flex-col items-center gap-2 p-3 border-2 border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition-colors text-blue-600"
          >
            <Search size={20} />
            <span className="text-xs">搜索食物</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700">今日饮食记录</h3>
          <div className="text-sm text-gray-400">共 {todayNutrition.calories} kcal</div>
        </div>
        <div className="space-y-3">
          {mealOrder.map((mealType) => {
            const records = groupedRecords[mealType];
            const mealInfo = mealTypeLabels[mealType];
            const totalCalories = records?.reduce((sum, r) => sum + r.totalCalories, 0) || 0;
            
            if (!records || records.length === 0) {
              return (
                <div
                  key={mealType}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-green-300 hover:bg-green-50/50 transition-colors"
                  onClick={() => navigate("/record")}
                >
                  <span className="text-xl">{mealInfo.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">{mealInfo.label}</div>
                    <div className="text-xs text-gray-400">尚未记录 · 点击添加</div>
                  </div>
                  <Plus size={16} className="text-green-500" />
                </div>
              );
            }

            return (
              <div key={mealType} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedMeal(expandedMeal === mealType ? null : mealType)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl">{mealInfo.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-800">{mealInfo.label}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={11} /> {records.length} 条记录
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700">{totalCalories} kcal</div>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`text-gray-400 transition-transform ${expandedMeal === mealType ? "rotate-90" : ""}`}
                  />
                </button>

                {expandedMeal === mealType && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {records.map((record) => (
                      <div key={record.id}>
                        {record.foods.map((food, fi) => (
                          <div key={fi} className="flex items-center gap-3 px-4 py-3 bg-gray-50/50">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                              🍽️
                            </div>
                            <div className="flex-1">
                              <div className="text-sm text-gray-800">{food.name}</div>
                              <div className="text-xs text-gray-400">{food.amount}{food.unit}</div>
                            </div>
                            <div className="text-sm font-medium text-gray-600">{food.calories} kcal</div>
                          </div>
                        ))}
                      </div>
                    ))}
                    <div className="px-4 py-2 flex justify-end">
                      <button
                        onClick={() => navigate("/record")}
                        className="text-xs text-green-600 flex items-center gap-1 hover:text-green-700"
                      >
                        <Plus size={12} /> 添加食物
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">本周健康摘要</h3>
            <p className="text-green-100 text-sm">开始记录，查看您的健康趋势！</p>
          </div>
          <button
            onClick={() => navigate("/reports")}
            className="flex items-center gap-1 text-sm text-green-100 hover:text-white bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            查看报告 <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {["一", "二", "三", "四", "五", "六", "日"].map((day, i) => {
            const isToday = i === new Date().getDay() - 1 || (new Date().getDay() === 0 && i === 6);
            const hasRecord = i < new Date().getDay() - 1 || (new Date().getDay() === 0 && i < 6);
            return (
              <div key={day} className="flex flex-col items-center gap-1">
                <div className="relative w-full flex flex-col-reverse items-center" style={{ height: 48 }}>
                  <div
                    className="w-5 rounded-full transition-all"
                    style={{
                      height: hasRecord ? "60%" : "0%",
                      backgroundColor: isToday ? "#fbbf24" : hasRecord ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)",
                    }}
                  />
                </div>
                <div className={`text-xs ${isToday ? "text-yellow-300 font-semibold" : "text-green-100"}`}>
                  {day}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
