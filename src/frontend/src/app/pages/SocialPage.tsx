import { useState, useEffect } from "react";
import {
  Trophy,
  Flame,
  Users,
  Medal,
  ChevronRight,
  CheckCircle2,
  Share2,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useDietStore } from "../stores/dietStore";

const leaderboard = [
  { rank: 1, name: "健身达人", avatar: "💪", streak: 45, calories: "达标率98%" },
  { rank: 2, name: "营养小能手", avatar: "🥗", streak: 38, calories: "达标率95%" },
  { rank: 3, name: "健康先锋", avatar: "🏃", streak: 32, calories: "达标率92%" },
  { rank: 4, name: "饮食达人", avatar: "🍽️", streak: 28, calories: "达标率89%" },
  { rank: 5, name: "营养专家", avatar: "🥑", streak: 25, calories: "达标率87%" },
];

const weeklyChallenges = [
  { id: 1, title: "7天连续记录", desc: "每天记录至少3餐", progress: 4, total: 7, reward: 50, icon: "🔥" },
  { id: 2, title: "蛋白质达标周", desc: "连续7天蛋白质达标", progress: 3, total: 7, reward: 80, icon: "💪" },
  { id: 3, title: "蔬菜达人", desc: "本周吃够25种蔬菜", progress: 12, total: 25, reward: 100, icon: "🥬" },
];

const achievements = [
  { id: 1, title: "初来乍到", icon: "🌱", desc: "完成首次记录", unlocked: true, date: "2024-01-15" },
  { id: 2, title: "坚持一周", icon: "🔥", desc: "连续记录7天", unlocked: true, date: "2024-01-22" },
  { id: 3, title: "营养达人", icon: "🥗", desc: "单日营养均衡", unlocked: true, date: "2024-01-20" },
  { id: 4, title: "蛋白质王者", icon: "👑", desc: "连续7天蛋白质达标", unlocked: false, date: null },
  { id: 5, title: "减脂先锋", icon: "⚡", desc: "连续14天热量达标", unlocked: false, date: null },
  { id: 6, title: "探索家", icon: "🔍", desc: "记录100种不同食物", unlocked: false, date: null },
];

export function SocialPage() {
  const { user } = useAuthStore();
  const { todayRecords } = useDietStore();
  const [checkedIn, setCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const savedStreak = localStorage.getItem("streak");
    const lastCheckIn = localStorage.getItem("lastCheckIn");
    const today = new Date().toDateString();
    
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }
    
    if (lastCheckIn === today) {
      setCheckedIn(true);
    }
  }, []);

  const handleCheckIn = async () => {
    if (checkedIn) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const today = new Date().toDateString();
      const newStreak = streak + 1;
      
      setStreak(newStreak);
      setCheckedIn(true);
      localStorage.setItem("streak", newStreak.toString());
      localStorage.setItem("lastCheckIn", today);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `🔥 我在用营养健康管家，连续打卡${streak}天！科学饮食，健康生活 #营养健康管家`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '营养健康管家',
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(shareText);
          alert('分享内容已复制到剪贴板');
        }
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('分享内容已复制到剪贴板');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-800">社交激励</h1>
        <button 
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
        >
          <Share2 size={14} /> 分享成果
        </button>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame size={24} />
              <span className="text-xl font-bold">连续打卡</span>
            </div>
            <div className="text-4xl font-bold">{streak} 天</div>
            <p className="text-orange-100 text-sm mt-1">坚持就是胜利，继续保持！</p>
          </div>
          <button
            onClick={handleCheckIn}
            disabled={checkedIn || loading}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
              checkedIn
                ? "bg-white/20 text-white cursor-not-allowed"
                : "bg-white text-orange-600 hover:bg-orange-50"
            }`}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : checkedIn ? <CheckCircle2 size={16} /> : null}
            {checkedIn ? "已打卡" : "立即打卡"}
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mt-4">
          {["一", "二", "三", "四", "五", "六", "日"].map((day, i) => {
            const isChecked = i < streak % 7 || (checkedIn && i === new Date().getDay() - 1);
            return (
              <div key={day} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    isChecked ? "bg-white text-orange-500" : "bg-white/20 text-white/60"
                  }`}
                >
                  {isChecked ? "✓" : i + 1}
                </div>
                <span className="text-xs text-orange-100 mt-1">{day}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 flex items-center gap-2">
              <Trophy size={18} className="text-yellow-500" /> 排行榜
            </h3>
            <button className="text-sm text-green-600 flex items-center gap-1">
              全部 <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {leaderboard.map((user, i) => (
              <div
                key={user.rank}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  i === 0 ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    user.rank === 1
                      ? "bg-yellow-400 text-white"
                      : user.rank === 2
                      ? "bg-gray-300 text-white"
                      : user.rank === 3
                      ? "bg-amber-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {user.rank}
                </div>
                <div className="text-xl">{user.avatar}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{user.name}</div>
                  <div className="text-xs text-gray-400">连续{user.streak}天</div>
                </div>
                <div className="text-xs text-green-600 font-medium">{user.calories}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-700 flex items-center gap-2">
              <Medal size={18} className="text-purple-500" /> 本周挑战
            </h3>
          </div>
          <div className="space-y-4">
            {weeklyChallenges.map((challenge) => (
              <div key={challenge.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{challenge.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{challenge.title}</div>
                    <div className="text-xs text-gray-400">{challenge.desc}</div>
                  </div>
                  <div className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                    +{challenge.reward}积分
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {challenge.progress}/{challenge.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-700 flex items-center gap-2">
            <Medal size={18} className="text-yellow-500" /> 我的成就
          </h3>
          <div className="text-sm text-gray-400">
            已解锁 {achievements.filter(a => a.unlocked).length}/{achievements.length}
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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
              {ach.unlocked && ach.date && (
                <div className="text-xs text-green-600 mt-2">
                  ✓ {ach.date}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Users size={20} className="text-green-100" />
          <h3 className="font-semibold">邀请好友</h3>
        </div>
        <p className="text-green-100 text-sm mb-4">
          邀请好友一起记录饮食，双方各得100积分！好友完成首次记录，您再得50积分！
        </p>
        <div className="flex gap-3">
          <button
            onClick={async () => {
              const shareText = `🔥 我在用营养健康管家，科学饮食，健康生活！邀请码：${user?.username || 'USER'}\n下载地址：${window.location.origin}`;
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: '营养健康管家',
                    text: shareText,
                    url: window.location.origin,
                  });
                } catch (err) {
                  if ((err as Error).name !== 'AbortError') {
                    await navigator.clipboard.writeText(shareText);
                    alert('分享内容已复制到剪贴板');
                  }
                }
              } else {
                await navigator.clipboard.writeText(shareText);
                alert('分享内容已复制到剪贴板');
              }
            }}
            className="flex-1 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            微信分享
          </button>
          <button
            onClick={async () => {
              const inviteLink = `${window.location.origin}?invite=${user?.id || 'guest'}`;
              await navigator.clipboard.writeText(inviteLink);
              alert('邀请链接已复制到剪贴板');
            }}
            className="flex-1 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            复制链接
          </button>
        </div>
      </div>
    </div>
  );
}
