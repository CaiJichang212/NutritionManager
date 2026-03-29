# CLAUDE.md

## 项目简介

这是一个**营养健康管家 Web 应用**的 MVP 版本，采用前后端分离架构。后端使用 FastAPI (Python)，前端使用 React + TypeScript。

---

## 技术栈概览

### 后端
- **框架**: FastAPI (Python 3.10+)
- **ORM**: SQLAlchemy 2.0
- **认证**: JWT (python-jose)
- **AI**: OpenAI SDK (连接 ModelScope API)

### 前端
- **框架**: React 18 + TypeScript
- **构建**: Vite 6
- **状态**: Zustand 5
- **样式**: Tailwind CSS 4 + Radix UI
- **路由**: React Router 7
- **测试**: Vitest

---

## 开发命令

### 后端
```bash
cd src/backend

# 安装依赖
uv sync

# 启动开发服务器
uv run uvicorn main:app --reload --port 8000

# 运行测试
uv run pytest

# 初始化数据库
uv run python init_db.py
```

### 前端
```bash
cd src/frontend

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 运行测试
pnpm test
```

---

## 项目结构要点

```
src/
├── backend/
│   ├── main.py          # FastAPI 入口
│   ├── config.py        # 配置 (SECRET_KEY, DATABASE_URL, API_KEY)
│   ├── models.py        # SQLAlchemy 模型 (User, Food, DietRecord)
│   ├── schemas.py       # Pydantic 模式
│   ├── routers/         # API 路由
│   │   ├── auth.py      # 认证 API
│   │   ├── foods.py     # 食物 API
│   │   └── records.py   # 记录 API
│   └── services/
│       ├── ai_service.py    # AI 营养师
│       └── nutrition.py     # 营养计算
│
└── frontend/
    └── src/
        └── app/
            ├── App.tsx       # 应用入口
            ├── Root.tsx      # 根布局
            ├── routes.ts     # 路由配置
            ├── pages/        # 页面组件
            ├── components/   # UI 组件
            ├── services/     # API 服务层
            └── stores/       # Zustand stores
```

---

## 核心功能

1. **用户认证**: 手机号/邮箱登录，JWT Token 认证
2. **食物识别**: 条形码扫描、拍照识别、手动搜索
3. **营养追踪**: 热量、蛋白质、脂肪、碳水摄入监控
4. **AI 营养师**: 基于 Qwen 模型的智能问答
5. **健康评估**: 食品健康评分、NOVA 分类

---

## API 概览

| 模块 | 端点前缀 | 主要功能 |
|------|---------|---------|
| 认证 | `/api/auth` | 注册、登录、用户信息 |
| 食物 | `/api/foods` | 食物查询、条形码识别 |
| 记录 | `/api/records` | 饮食记录 CRUD |
| AI | `/api/ai/chat` | AI 营养师对话 |

---

## 数据模型

- **User**: 用户信息、健康目标、营养指标
- **Food**: 食物营养数据、健康评分
- **DietRecord**: 饮食记录、餐次分类

---

## 环境配置

后端配置在 `src/backend/config.py`:
- `SECRET_KEY`: JWT 密钥
- `DATABASE_URL`: 数据库连接 (默认 SQLite)
- `MODELSCOPE_API_KEY`: AI 服务密钥

前端 API 基础 URL: `http://localhost:8000/api`

---

## 编码规范

1. **后端**: 使用 Pydantic 进行数据验证，SQLAlchemy ORM 操作数据库
2. **前端**: 使用 Zustand 管理状态，Axios 封装 API 请求
3. **样式**: Tailwind CSS 原子化样式，Radix UI 组件
4. **类型**: TypeScript 严格模式

---

## 注意事项

- 后端默认使用 SQLite，生产环境建议 PostgreSQL
- CORS 已开放所有来源，生产环境需限制
- AI 服务有主备模型自动切换机制
- 前端状态使用 localStorage 持久化
