import { useState, useEffect } from "react";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Share2,
  Download,
  Award,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { recordService, HistorySummary } from "../services/recordService";
import { useNutritionStore } from "../stores/nutritionStore";
import { useAuthStore } from "../stores/authStore";

export function ReportsPage() {
  const [reportType, setReportType] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [loading, setLoading] = useState(true);
  const [historySummary, setHistorySummary] = useState<HistorySummary | null>(null);
  const { calorieTarget, macroTargets, todayNutrition } = useNutritionStore();
  const { user } = useAuthStore();

  useEffect(() => {
    loadHistoryData();
  }, [reportType]);

  const loadHistoryData = async () => {
    setLoading(true);
    try {
      const days = reportType === "daily" ? 1 : reportType === "weekly" ? 7 : 30;
      const summary = await recordService.getHistorySummary(days);
      setHistorySummary(summary);
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `📊 我的营养报告（${reportType === "daily" ? "日报" : reportType === "weekly" ? "周报" : "月报"}）

🔥 平均热量：${avgCalories} kcal/天
⭐ 平均评分：${avgScore.toFixed(1)}/10
🎯 目标达成率：${goalRate}%
📅 记录天数：${recordDays} 天

#营养健康管家`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '我的营养报告',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(shareText);
          alert('报告已复制到剪贴板');
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('报告已复制到剪贴板');
    }
  };

  const handleExport = () => {
    const reportData = {
      reportType: reportType === "daily" ? "日报" : reportType === "weekly" ? "周报" : "月报",
      generatedAt: new Date().toLocaleString('zh-CN'),
      averageCalories: avgCalories,
      averageScore: avgScore.toFixed(1),
      goalAchievementRate: goalRate,
      recordDays: recordDays,
      calorieTarget: calorieTarget,
      macroTargets: macroTargets,
      dailySummaries: historySummary?.daily_summaries || [],
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `营养报告_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const weeklyData = historySummary?.daily_summaries.map((d, i) => ({
    day: ["周一", "周二", "周三", "周四", "周五", "周六", "今天"][i] || d.date.slice(5),
    calories: d.calories,
    protein: d.protein,
    fat: d.fat,
    carbs: d.carbs,
    score: d.health_score || 7.5,
  })) || [];

  const avgCalories = historySummary?.avg_calories || 0;
  const avgScore = historySummary?.avg_health_score || 7.5;
  const goalRate = historySummary?.goal_achievement_rate || 0;
  const recordDays = historySummary?.record_days || 0;

  const monthlyTrend = [
    { week: "第1周", avgCal: 1890, goalRate: 72 },
    { week: "第2周", avgCal: 1820, goalRate: 78 },
    { week: "第3周", avgCal: 1760, goalRate: 84 },
    { week: "第4周", avgCal: avgCalories || 1810, goalRate: goalRate || 81 },
  ];

  const foodCategories = [
    { name: "蔬菜", pct: 28, color: "#22c55e" },
    { name: "蛋白质", pct: 25, color: "#3b82f6" },
    { name: "主食", pct: 22, color: "#8b5cf6" },
    { name: "水果", pct: 12, color: "#f59e0b" },
    { name: "乳制品", pct: 8, color: "#06b6d4" },
    { name: "其他", pct: 5, color: "#9ca3af" },
  ];

  const achievements = [
    { id: 1, title: "连续记录7天", icon: "🔥", desc: "坚持记录饮食", unlocked: recordDays >= 7 },
    { id: 2, title: "健康先锋", icon: "🥗", desc: "健康评分≥7的食品50次", unlocked: false },
    { id: 3, title: "蛋白质达人", icon: "💪", desc: "连续7天蛋白质达标", unlocked: false },
    { id: 4, title: "探索家", icon: "🔍", desc: "识别超过100种不同食品", unlocked: false },
  ];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-800">数据报告</h1>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-green-600 hover:border-green-300 transition-colors"
            title="分享报告"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={handleExport}
            className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-green-600 hover:border-green-300 transition-colors"
            title="导出报告"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="flex bg-gray-100 rounded-xl p-1">
        {(["daily", "weekly", "monthly"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setReportType(t)}
            className={`flex-1 py-2 rounded-lg text-sm transition-all ${
              reportType === t ? "bg-white text-green-700 shadow-sm font-medium" : "text-gray-500"
            }`}
          >
            {{ daily: "日报", weekly: "周报", monthly: "月报" }[t]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "平均热量", value: `${avgCalories}`, unit: "kcal/天", icon: "🔥", color: "bg-red-50 border-red-100", trend: -3.2, trendLabel: "较上周" },
          { label: "平均营养评分", value: avgScore.toFixed(1), unit: "/ 10", icon: "⭐", color: "bg-yellow-50 border-yellow-100", trend: 0.4, trendLabel: "较上周" },
          { label: "目标达成率", value: `${goalRate}%`, unit: "", icon: "🎯", color: "bg-green-50 border-green-100", trend: 6, trendLabel: "较上周" },
          { label: "记录天数", value: `${recordDays}`, unit: "天", icon: "📅", color: "bg-blue-50 border-blue-100", trend: recordDays, trendLabel: "本周记录" },
        ].map((card) => (
          <div key={card.label} className={`p-4 rounded-2xl border ${card.color}`}>
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-xl font-bold text-gray-800">{card.value}<span className="text-sm font-normal text-gray-500 ml-1">{card.unit}</span></div>
            <div className="text-xs text-gray-500 mt-0.5">{card.label}</div>
            <div className={`flex items-center gap-1 text-xs mt-1 ${card.trend > 0 ? "text-green-600" : "text-red-500"}`}>
              {card.trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {card.trend > 0 ? "+" : ""}{card.trend} {card.trendLabel}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-700 mb-4">{reportType === "daily" ? "今日" : "本周"}热量摄入</h3>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, Math.max(calorieTarget * 1.3, 2500)]} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                  formatter={(v: number) => [`${Math.round(v)} kcal`, "热量"]}
                />
                <Area type="monotone" dataKey="calories" stroke="#22c55e" strokeWidth={2} fill="url(#calGrad)" dot={{ fill: "#22c55e", r: 3 }} />
                <ReferenceLine y={calorieTarget} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400">
              暂无数据，开始记录您的饮食吧
            </div>
          )}
          <div className="flex gap-3 mt-2 text-xs text-gray-400 justify-center">
            <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-green-500 rounded" /> 实际摄入</span>
            <span className="flex items-center gap-1"><div className="w-3 h-0.5 bg-yellow-500 rounded" style={{ borderTop: "2px dashed" }} /> 目标</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-700 mb-4">每日健康评分</h3>
          {weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} hide />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                  formatter={(v: number) => [`${v}分`, "健康评分"]}
                />
                <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.score >= 8 ? "#22c55e" : entry.score >= 7 ? "#f59e0b" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400">
              暂无数据
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-gray-700 mb-4">三大营养素摄入</h3>
        {weeklyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="protein" name="蛋白质(g)" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="fat" name="脂肪(g)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              <Bar dataKey="carbs" name="碳水(g)" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-gray-400">
            暂无数据
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-700 mb-4">食物种类分布</h3>
          <div className="space-y-3">
            {foodCategories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <div className="text-sm text-gray-600 w-16">{cat.name}</div>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                  />
                </div>
                <div className="text-sm font-medium text-gray-700 w-10 text-right">{cat.pct}%</div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-green-50 rounded-xl text-sm text-green-700">
            ✅ 食物多样性评分 <span className="font-semibold">85分</span> · 建议增加豆类摄入
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-700 mb-4">月度目标达成率</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={monthlyTrend}>
              <defs>
                <linearGradient id="goalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[60, 95]} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                formatter={(v: number) => [`${v}%`, "达成率"]}
              />
              <Area type="monotone" dataKey="goalRate" stroke="#22c55e" strokeWidth={2} fill="url(#goalGrad)" dot={{ fill: "#22c55e", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 text-center text-sm text-gray-500">
            本月平均达成率 <span className="text-green-600 font-semibold">{goalRate}%</span> · 持续提升中 📈
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700 flex items-center gap-2">
            <Award size={18} className="text-yellow-500" /> 成就徽章
          </h3>
          <button className="text-sm text-green-600 flex items-center gap-1">
            全部 <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border text-center transition-all ${
                ach.unlocked
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              <div className={`text-3xl mb-2 ${!ach.unlocked && "grayscale"}`}>{ach.icon}</div>
              <div className={`text-sm font-medium ${ach.unlocked ? "text-gray-800" : "text-gray-400"}`}>
                {ach.title}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{ach.desc}</div>
              {ach.unlocked && (
                <div className="mt-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full inline-block">
                  已解锁
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-green-100" />
          <h3 className="font-semibold">{reportType === "daily" ? "今日" : "本周"}健康总结</h3>
        </div>
        <div className="space-y-2 text-green-100 text-sm">
          <p>📊 {reportType === "daily" ? "今日" : "本周平均"}热量摄入 {avgCalories} kcal，目标 {calorieTarget} kcal</p>
          <p>🥩 蛋白质摄入 {todayNutrition.protein}g，目标 {macroTargets.protein}g</p>
          <p>🎯 目标达成率 {goalRate}%</p>
          {user?.goal_type === 'lose_weight' && avgCalories < calorieTarget && (
            <p>✨ 减脂效果明显，继续保持！</p>
          )}
        </div>
        <div className="mt-4 flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm transition-colors">
            <Share2 size={14} /> 分享报告
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm transition-colors">
            <Download size={14} /> 导出PDF
          </button>
        </div>
      </div>
    </div>
  );
}
