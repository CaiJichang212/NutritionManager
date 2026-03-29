import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  HelpCircle,
  MessageCircle,
  FileText,
  Mail,
  Send,
  Check,
} from "lucide-react";

const faqs = [
  {
    question: "如何记录我的饮食？",
    answer: "您可以通过搜索食物名称、拍照识别或扫描条形码来添加食物到您的饮食记录中。",
  },
  {
    question: "如何设置每日营养目标？",
    answer: "您可以在个人中心修改您的健康目标，系统会根据您的目标自动计算每日营养摄入建议。",
  },
  {
    question: "健康评分是如何计算的？",
    answer: "健康评分基于食品的营养成分、添加剂种类和数量、加工程度等多个维度综合评估，满分10分。",
  },
  {
    question: "如何联系客服？",
    answer: "您可以通过页面底部的反馈入口提交问题，我们会尽快回复您。",
  },
];

export function HelpPage() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [feedbackType, setFeedbackType] = useState<"suggestion" | "problem">("suggestion");
  const [feedbackContent, setFeedbackContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = () => {
    if (!feedbackContent.trim()) {
      alert("请输入反馈内容");
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedbackContent("");
    }, 2000);
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
        <h1 className="text-xl font-semibold text-gray-800">帮助与反馈</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800 flex items-center gap-2">
            <HelpCircle size={18} className="text-green-500" />
            常见问题
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {faqs.map((faq, index) => (
            <div key={index}>
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="text-sm font-medium text-gray-800 text-left">{faq.question}</div>
                <ChevronLeft
                  size={16}
                  className={`text-gray-400 transition-transform ${expandedFaq === index ? "rotate-90" : "-rotate-90"}`}
                />
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4 text-sm text-gray-600 bg-gray-50">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-medium text-gray-800 flex items-center gap-2">
            <MessageCircle size={18} className="text-green-500" />
            意见反馈
          </h2>
          <p className="text-sm text-gray-500 mt-1">我们重视您的每一条建议</p>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFeedbackType("suggestion")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                feedbackType === "suggestion"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              意见建议
            </button>
            <button
              onClick={() => setFeedbackType("problem")}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                feedbackType === "problem"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              报告问题
            </button>
          </div>
          <textarea
            value={feedbackContent}
            onChange={(e) => setFeedbackContent(e.target.value)}
            placeholder="请详细描述您的问题或建议..."
            className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-green-400 resize-none"
          />
          <button
            onClick={handleSubmitFeedback}
            disabled={submitted}
            className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
              submitted
                ? "bg-green-500 text-white"
                : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {submitted ? (
              <>
                <Check size={16} />
                提交成功
              </>
            ) : (
              <>
                <Send size={16} />
                提交反馈
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4">
          <h2 className="font-medium text-gray-800 flex items-center gap-2">
            <Mail size={18} className="text-green-500" />
            联系我们
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <FileText size={18} className="text-gray-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">使用指南</div>
              <div className="text-xs text-gray-400">详细的功能操作说明</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Mail size={18} className="text-gray-500" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-800">support@nutrition.com</div>
              <div className="text-xs text-gray-400">工作日 9:00-18:00 回复</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
