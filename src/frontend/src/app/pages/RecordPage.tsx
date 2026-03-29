import { useState, useEffect, useRef } from "react";
import {
  Search,
  Camera,
  ScanLine,
  Clock,
  Heart,
  ChevronRight,
  Plus,
  X,
  Loader2,
  Upload,
  CameraOff,
} from "lucide-react";
import { foodService, Food } from "../services/foodService";
import { recordService } from "../services/recordService";
import { useFoodStore } from "../stores/foodStore";
import { useDietStore, FoodItem } from "../stores/dietStore";

const mealTypes = [
  { id: "breakfast", label: "早餐", icon: "🌅", time: "6:00-9:00" },
  { id: "lunch", label: "午餐", icon: "☀️", time: "11:00-13:00" },
  { id: "dinner", label: "晚餐", icon: "🌙", time: "17:00-19:00" },
  { id: "snack", label: "加餐", icon: "🍎", time: "其他时间" },
];

export function RecordPage() {
  const { searchResults, recentFoods, favoriteFoods, setSearchResults, addRecent, toggleFavorite, isFavorite } = useFoodStore();
  const { addRecord } = useDietStore();
  const [activeTab, setActiveTab] = useState<"search" | "recent" | "favorite">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [recognizedFoods, setRecognizedFoods] = useState<Food[]>([]);
  const [showRecognizedModal, setShowRecognizedModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const startCamera = async () => {
    try {
      setCameraLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setShowCamera(true);
      }
    } catch (err) {
      console.error("无法访问相机:", err);
      alert("无法访问相机，请检查权限设置");
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        uploadImage(imageData);
      }
      stopCamera();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        uploadImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (imageData: string) => {
    setUploadLoading(true);
    try {
      const mockFoods: Food[] = [
        {
          id: 'recognized-1',
          name: '识别食物（模拟）',
          brand: '包装食品',
          servingSize: 100,
          servingUnit: 'g',
          calories: 200,
          protein: 5,
          carbohydrates: 25,
          fat: 10,
          fiber: 2,
        },
      ];
      setRecognizedFoods(mockFoods);
      setShowRecognizedModal(true);
    } catch (err) {
      console.error("图片识别失败:", err);
      alert("图片识别失败，请稍后重试");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleBarcodeScan = () => {
    alert("条形码扫描功能：请确保后端已实现条形码识别API");
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const results = await foodService.searchFoods(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setAmount(100);
  };

  const handleAddFood = async () => {
    if (!selectedFood || !selectedMeal) return;

    setLoading(true);
    try {
      const foodItem: FoodItem = {
        id: selectedFood.id,
        name: selectedFood.name,
        amount: amount,
        unit: "g",
        calories: Math.round((selectedFood.calories / 100) * amount),
        protein: Math.round((selectedFood.protein / 100) * amount * 10) / 10,
        carbohydrates: Math.round((selectedFood.carbs / 100) * amount * 10) / 10,
        fat: Math.round((selectedFood.fat / 100) * amount * 10) / 10,
        fiber: selectedFood.fiber ? Math.round((selectedFood.fiber / 100) * amount * 10) / 10 : undefined,
      };

      await recordService.addRecord({
        date: new Date().toISOString().split('T')[0],
        meal_type: selectedMeal as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        foods: [{
          food_id: parseInt(selectedFood.id),
          name: selectedFood.name,
          amount: amount,
          unit: "g",
          calories: foodItem.calories,
          protein: foodItem.protein,
          fat: foodItem.fat,
          carbs: foodItem.carbohydrates,
        }],
      });

      addRecent(selectedFood);
      setSelectedFood(null);
      setSelectedMeal(null);
      setAmount(100);
    } catch (error) {
      console.error("Failed to add food:", error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getNovaClassLabel = (novaClass: string) => {
    const labels: Record<string, string> = {
      "1": "未加工",
      "2": "加工食材",
      "3": "加工食品",
      "4": "超加工食品",
    };
    return labels[novaClass] || novaClass;
  };

  const displayFoods = activeTab === "search" 
    ? searchResults 
    : activeTab === "recent" 
      ? recentFoods 
      : favoriteFoods;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-gray-800">记录饮食</h1>
        <p className="text-sm text-gray-500">记录您的每一餐，追踪营养摄入</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {mealTypes.map((meal) => (
          <button
            key={meal.id}
            onClick={() => setSelectedMeal(meal.id)}
            className={`p-4 rounded-2xl border-2 transition-all ${
              selectedMeal === meal.id
                ? "border-green-500 bg-green-50"
                : "border-gray-100 bg-white hover:border-green-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{meal.icon}</span>
              <div className="text-left">
                <div className="font-medium text-gray-800">{meal.label}</div>
                <div className="text-xs text-gray-400">{meal.time}</div>
              </div>
              {selectedMeal === meal.id && (
                <div className="ml-auto w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("search")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors ${
              activeTab === "search"
                ? "text-green-600 border-b-2 border-green-500 bg-green-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Search size={14} /> 搜索
          </button>
          <button
            onClick={() => setActiveTab("recent")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors ${
              activeTab === "recent"
                ? "text-green-600 border-b-2 border-green-500 bg-green-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Clock size={14} /> 最近
          </button>
          <button
            onClick={() => setActiveTab("favorite")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors ${
              activeTab === "favorite"
                ? "text-green-600 border-b-2 border-green-500 bg-green-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Heart size={14} /> 收藏
          </button>
        </div>

        {activeTab === "search" && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索食物名称或品牌..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400 focus:bg-white transition-colors"
                />
              </div>
              <button
                onClick={handleBarcodeScan}
                className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:border-green-300 hover:text-green-600 transition-colors"
                title="扫码识别"
              >
                <ScanLine size={16} />
              </button>
              <button
                onClick={startCamera}
                disabled={cameraLoading}
                className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:border-green-300 hover:text-green-600 transition-colors"
                title="拍照识别"
              >
                {cameraLoading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </button>
              <button
                onClick={handleImageUploadClick}
                disabled={uploadLoading}
                className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:border-green-300 hover:text-green-600 transition-colors"
                title="图片上传"
              >
                {uploadLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        <div className="max-h-[400px] overflow-y-auto">
          {searching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-green-500" />
            </div>
          ) : displayFoods.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              {activeTab === "search" ? (
                <>
                  <Search size={32} className="mb-2" />
                  <p className="text-sm">输入关键词搜索食物</p>
                </>
              ) : activeTab === "recent" ? (
                <>
                  <Clock size={32} className="mb-2" />
                  <p className="text-sm">暂无最近食用记录</p>
                </>
              ) : (
                <>
                  <Heart size={32} className="mb-2" />
                  <p className="text-sm">暂无收藏食物</p>
                </>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {displayFoods.map((food) => (
                <button
                  key={food.id}
                  onClick={() => handleSelectFood(food)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-lg">
                    🍽️
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 truncate">{food.name}</span>
                      {food.brand && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {food.brand}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{food.calories} kcal/100g</span>
                      <span className="text-xs text-gray-300">|</span>
                      <span className="text-xs text-gray-500">蛋白质 {food.protein}g</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {food.health_score && (
                      <span className={`text-xs px-2 py-1 rounded-full ${getHealthScoreColor(food.health_score)}`}>
                        {food.health_score}分
                      </span>
                    )}
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedFood && (
        <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">添加食物</h3>
              <button
                onClick={() => setSelectedFood(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                  🍽️
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{selectedFood.name}</div>
                  {selectedFood.brand && (
                    <div className="text-xs text-gray-400">{selectedFood.brand}</div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {selectedFood.health_score && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getHealthScoreColor(selectedFood.health_score)}`}>
                        健康评分 {selectedFood.health_score}
                      </span>
                    )}
                    {selectedFood.nova_class && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                        NOVA {getNovaClassLabel(selectedFood.nova_class)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1.5 block">食用量（克）</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-400"
                  />
                  <span className="text-sm text-gray-500">克</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-2">营养成分（估算）</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-lg font-semibold text-gray-800">
                      {Math.round((selectedFood.calories / 100) * amount)}
                    </div>
                    <div className="text-xs text-gray-400">千卡</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-800">
                      {Math.round((selectedFood.protein / 100) * amount * 10) / 10}g
                    </div>
                    <div className="text-xs text-gray-400">蛋白质</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-800">
                      {Math.round((selectedFood.carbs / 100) * amount * 10) / 10}g
                    </div>
                    <div className="text-xs text-gray-400">碳水化合物</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-800">
                      {Math.round((selectedFood.fat / 100) * amount * 10) / 10}g
                    </div>
                    <div className="text-xs text-gray-400">脂肪</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => toggleFavorite(selectedFood)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isFavorite(selectedFood.id)
                      ? "border-red-200 bg-red-50 text-red-500"
                      : "border-gray-200 text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  <Heart size={18} fill={isFavorite(selectedFood.id) ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={handleAddFood}
                  disabled={!selectedMeal || loading}
                  className={`flex-1 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                    selectedMeal
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  添加到{selectedMeal ? mealTypes.find(m => m.id === selectedMeal)?.label : "..."}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCamera && (
        <div className="fixed inset-0 bg-black/80 flex flex-col z-50">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={stopCamera}
              className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <video
              ref={videoRef}
              className="w-full max-h-full object-contain"
              playsInline
              muted
            />
          </div>
          <div className="p-6 flex justify-center gap-4">
            <button
              onClick={stopCamera}
              className="p-4 bg-white/20 rounded-full text-white hover:bg-white/30"
            >
              <CameraOff size={24} />
            </button>
            <button
              onClick={capturePhoto}
              className="p-4 bg-green-500 rounded-full text-white hover:bg-green-600 shadow-lg"
            >
              <Camera size={32} />
            </button>
          </div>
        </div>
      )}

      {showRecognizedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">识别结果</h3>
              <button
                onClick={() => {
                  setShowRecognizedModal(false);
                  setRecognizedFoods([]);
                }}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              {recognizedFoods.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Camera size={48} className="mx-auto mb-4" />
                  <p>未识别到食物，请尝试重新拍照或手动搜索</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recognizedFoods.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => {
                        setSelectedFood(food);
                        setShowRecognizedModal(false);
                        setRecognizedFoods([]);
                      }}
                      className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-lg">
                        🍽️
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-800">{food.name}</div>
                        <div className="text-xs text-gray-500">{food.calories} kcal/100g</div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
