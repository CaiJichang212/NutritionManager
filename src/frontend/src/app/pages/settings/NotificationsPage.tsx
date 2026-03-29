import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  Bell,
  Clock,
  Check,
} from "lucide-react";

const mealReminders = [
  { id: "breakfast", label: "早餐", time: "08:00", enabled: true },
  { id: "lunch", label: "午餐", time: "12:00", enabled: true },
  { id: "dinner", label: "晚餐", time: "18:30", enabled: false },
  { id: "snack", label: "加餐", time: "15:00", enabled: false },
];

export function NotificationsPage() {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState(mealReminders);
  const [goalReminder, setGoalReminder] = useState(true);

  const toggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r)
    );
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
        <h1 className="text-xl font-semibold text-gray-800">提醒设置</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800 flex items-center gap-2">
            <Bell size={18} className="text-green-500" />
            饮食提醒
          </h2>
          <p className="text-sm text-gray-500 mt-1">设置用餐提醒，帮助您养成规律饮食习惯</p>
        </div>
        <div className="divide-y divide-gray-50">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Clock size={18} className="text-gray-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{reminder.label}</div>
                  <div className="text-xs text-gray-400">{reminder.time}</div>
                </div>
              </div>
              <button
                onClick={() => toggleReminder(reminder.id)}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  reminder.enabled ? "bg-green-500" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    reminder.enabled ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          <div className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-medium text-gray-800">目标达成提醒</div>
              <div className="text-xs text-gray-400">热量/营养素达标时通知</div>
            </div>
            <button
              onClick={() => setGoalReminder(!goalReminder)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                goalReminder ? "bg-green-500" : "bg-gray-200"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  goalReminder ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
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
