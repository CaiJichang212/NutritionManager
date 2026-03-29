import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { useNutritionStore } from "../stores/nutritionStore";
import { useDietStore } from "../stores/dietStore";
import { recordService, HistorySummary } from "../services";

interface Nutrient {
  name: string;
  consumed: number;
  target: number;
  unit: string;
  category: string;
  color: string;
}

function NutrientBar({ n }: { n: Nutrient }) {
  const pct = Math.min((n.consumed / n.target) * 100, 100);
  const isLow = pct < 70;
  const isHigh = pct > 110;
  const status = isHigh ? "超标" : isLow ? "不足" : "达标";
  const statusColor = isHigh ? "text-red-600" : isLow ? "text-amber-600" : "text-green-600";
  const barColor = isHigh ? "#ef4444" : isLow ? "#f59e0b" : n.color;
  const Icon = isHigh ? TrendingUp : isLow ? TrendingDown : Minus;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="w-20 text-sm text-gray-700 flex-shrink-0">{n.name}</div>
      <div className="flex-1">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: barColor }}
          />
        </div>
      </div>
      <div className="text-xs text-gray-500 w-20 text-right flex-shrink-0">
        {Math.round(n.consumed)} / {n.target} {n.unit}
      </div>
      <div className={`flex items-center gap-0.5 text-xs w-10 flex-shrink-0 ${statusColor}`}>
        <Icon size={10} /> {status}
      </div>
    </div>
  );
}

const categories = [
  { id: "all", label: "全部" },
  { id: "energy", label: "能量" },
  { id: "macro", label: "宏量素" },
  { id: "fat", label: "脂肪类" },
  { id: "mineral", label: "矿物质" },
  { id: "vitamin", label: "维生素" },
];

export function NutritionPage() {
  const [selectedCat, setSelectedCat] = useState("all");
  const [dateOffset, setDateOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [historySummary, setHistorySummary] = useState<HistorySummary | null>(null);
  
  const { todayNutrition, calorieTarget, macroTargets } = useNutritionStore();
  const { todayRecords } = useDietStore();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const summary = await recordService.getHistorySummary(7);
        setHistorySummary(summary);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };
    fetchHistory();
  }, []);

  const dateLabel = dateOffset === 0 ? "今天" : dateOffset === -1 ? "昨天" : `${Math.abs(dateOffset)}天前`;

  const nutrients: Nutrient[] = [
    { name: "热量", consumed: todayNutrition.calories, target: calorieTarget, unit: "kcal", category: "energy", color: "#ef4444" },
    { name: "蛋白质", consumed: todayNutrition.protein, target: macroTargets.protein, unit: "g", category: "macro", color: "#3b82f6" },
    { name: "脂肪", consumed: todayNutrition.fat, target: macroTargets.fat, unit: "g", category: "macro", color: "#f59e0b" },
    { name: "碳水化合物", consumed: todayNutrition.carbohydrates, target: macroTargets.carbohydrates, unit: "g", category: "macro", color: "#8b5cf6" },
    { name: "膳食纤维", consumed: todayNutrition.fiber, target: macroTargets.fiber || 25, unit: "g", category: "macro", color: "#10b981" },
  ];

  const filtered = selectedCat === "all"
    ? nutrients
    : nutrients.filter((n) => n.category === selectedCat);

  const issues = nutrients.filter((n) => {
    const pct = (n.consumed / n.target) * 100;
    return pct < 70 || pct > 110;
  });

  const radarData = [
    { subject: "蛋白质", A: Math.min((todayNutrition.protein / macroTargets.protein) * 100, 100), fullMark: 100 },
    { subject: "脂肪", A: Math.min((todayNutrition.fat / macroTargets.fat) * 100, 100), fullMark: 100 },
    { subject: "碳水", A: Math.min((todayNutrition.carbohydrates / macroTargets.carbohydrates) * 100, 100), fullMark: 100 },
    { subject: "纤维", A: Math.min((todayNutrition.fiber / (macroTargets.fiber || 25)) * 100, 100), fullMark: 100 },
  ];

  const weeklyCalories = historySummary?.daily_summaries.map((d, i) => ({
    day: ["周一", "周二", "周三", "周四", "周五", "周六", "今天"][i] || d.date,
    val: d.calories,
    target: historySummary.calorie_goal,
  })) || [];

  const avgScore = radarData.reduce((sum, d) => sum + d.A, 0) / radarData.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-800">营养数据中心</h1>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <button
            onClick={() => setDateOffset(dateOffset - 1)}
            className="text-gray-400 hover:text-gray-600 p-0.5"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-700 min-w-[60px] text-center">{dateLabel}</span>
          <button
            onClick={() => setDateOffset(Math.min(0, dateOffset + 1))}
            className={`text-gray-400 hover:text-gray-600 p-0.5 ${dateOffset === 0 ? "opacity-30" : ""}`}
            disabled={dateOffset === 0}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-700 mb-4">营养均衡度</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Radar
                name="今日"
                dataKey="A"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="text-center text-sm text-gray-500 mt-1">综合均衡评分 <span className="text-green-600 font-semibold">{Math.round(avgScore)}分</span></div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-gray-700 mb-4">本周热量趋势</h3>
          {weeklyCalories.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyCalories} barSize={20}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, Math.max(calorieTarget * 1.3, 2500)]} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                  formatter={(v: number) => [`${Math.round(v)} kcal`, "摄入"]}
                />
                <Bar dataKey="val" radius={[6, 6, 0, 0]}>
                  {weeklyCalories.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        i === 6 ? "#d1fae5" :
                        entry.val > entry.target * 1.1 ? "#fecaca" :
                        entry.val < entry.target * 0.8 ? "#fef3c7" :
                        "#22c55e"
                      }
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
          <div className="flex gap-3 mt-2 justify-center text-xs text-gray-400">
            <div className="flex items-center gap-1"><div className="w-3 h-2 rounded bg-green-400" /> 达标</div>
            <div className="flex items-center gap-1"><div className="w-3 h-2 rounded bg-red-200" /> 超标</div>
            <div className="flex items-center gap-1"><div className="w-3 h-2 rounded bg-yellow-200" /> 不足</div>
            <div className="flex items-center gap-1"><div className="w-3 h-2 rounded bg-green-100" /> 今天</div>
          </div>
        </div>
      </div>

      {issues.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-amber-700 font-medium mb-3">
            <AlertTriangle size={16} /> 今日营养提醒 ({issues.length} 项)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {issues.map((n) => {
              const pct = Math.round((n.consumed / n.target) * 100);
              const isLow = pct < 70;
              return (
                <div key={n.name} className={`flex items-center gap-2 p-2.5 rounded-xl ${isLow ? "bg-amber-100" : "bg-red-50"}`}>
                  {isLow ? <TrendingDown size={14} className="text-amber-600" /> : <TrendingUp size={14} className="text-red-500" />}
                  <div>
                    <div className="text-sm font-medium text-gray-800">{n.name}</div>
                    <div className="text-xs text-gray-500">{pct}% · {isLow ? "建议增加" : "建议控制"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700">营养素详情</h3>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Info size={12} /> 基于当前记录
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-colors ${
                selectedCat === c.id
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div>
          {filtered.map((n) => (
            <NutrientBar key={n.name} n={n} />
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">今日营养建议</h3>
            <ul className="space-y-1.5 text-green-100 text-sm">
              {issues.length === 0 ? (
                <li>• 整体营养摄入均衡，继续保持 👍</li>
              ) : (
                issues.map((n) => {
                  const pct = Math.round((n.consumed / n.target) * 100);
                  const isLow = pct < 70;
                  return (
                    <li key={n.name}>
                      • {n.name}{isLow ? "摄入不足" : "摄入偏高"}（{pct}%），{isLow ? "建议适当增加" : "建议适当控制"}
                    </li>
                  );
                })
              )}
              {calorieTarget - todayNutrition.calories > 0 && (
                <li>• 热量还剩 {Math.round(calorieTarget - todayNutrition.calories)} kcal，可安排适量饮食</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
