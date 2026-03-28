# 塔罗占卜 Web 应用 — 设计文档

**日期：** 2026-03-27
**版本：** v1.0
**状态：** 已确认，待实现

---

## 背景与目标

从零开始构建一个塔罗占卜 Web 工具，供用户在浏览器中体验经典塔罗占卜流程。目标是提供沉浸式神秘氛围、流畅的翻牌交互和清晰的中文解读内容，初版快速上线，后续按需迭代。

---

## 技术栈

| 项目 | 选型 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建工具 | Vite |
| 样式 | CSS Modules（或 Tailwind CSS） |
| 动画 | CSS 3D Transform（翻牌）+ CSS keyframes（淡入） |
| 部署 | Vercel / GitHub Pages（纯静态） |
| 后端 | 无 |

---

## 项目结构

```
tarot-app/
├── public/
│   └── cards/              # 78张 Rider-Waite 牌图（PNG/JPG）
│       ├── 00-fool.jpg
│       ├── 01-magician.jpg
│       └── ...
├── src/
│   ├── data/
│   │   └── cards.ts        # 78张牌的完整数据
│   ├── components/
│   │   ├── CardBack.tsx    # 牌背组件
│   │   ├── CardFront.tsx   # 牌面组件
│   │   ├── CardSpread.tsx  # 牌阵布局容器
│   │   └── ReadingResult.tsx # 解读文字区域
│   ├── pages/
│   │   ├── Home.tsx        # 首页
│   │   └── Reading.tsx     # 占卜页
│   ├── hooks/
│   │   └── useTarotReading.ts # 抽牌逻辑 hook
│   ├── types/
│   │   └── tarot.ts        # TypeScript 类型定义
│   ├── App.tsx
│   └── main.tsx
├── docs/
│   └── superpowers/specs/  # 本设计文档
└── package.json
```

---

## 数据结构

### 牌的数据类型（`src/types/tarot.ts`）

```typescript
interface TarotCard {
  id: number;           // 0-77
  name: string;         // 中文牌名，如"愚者"
  nameEn: string;       // 英文牌名，如"The Fool"
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  image: string;        // 图片路径，如 "/cards/00-fool.jpg"
  keywords: string[];   // 关键词，如 ["新开始", "冒险", "自由"]
  upright: string;      // 正位中文解读（100-150字）
  reversed: string;     // 逆位中文解读（100-150字）
}

interface DrawnCard {
  card: TarotCard;
  isReversed: boolean;
  position?: string;    // "过去" | "现在" | "未来"（三张牌时）
}

interface ReadingResult {
  spread: 'single' | 'three-card';
  question: string;
  cards: DrawnCard[];
  timestamp: Date;
}
```

---

## 页面设计

### 首页（`Home.tsx`）

- 全屏深色背景（星空或渐变）
- 居中标题：「塔罗占卜」
- 两个牌阵选择卡片：
  - **单张牌** — "今日指引"
  - **三张牌** — "过去·现在·未来"
- 问题输入框：「你想问什么？」（可跳过，placeholder 提示）
- 点击牌阵卡片后进入占卜页

### 占卜页（`Reading.tsx`）

1. **等待翻牌阶段**：N 张牌背朝上水平排列，每张可点击
2. **翻牌中**：点击牌背触发 3D 翻转动画（0.6s），显示牌面图及牌名
3. **全部翻开后**：底部淡入解读区域，每张牌一个解读卡片
4. 底部「再次占卜」按钮，返回首页

---

## 交互流程

```
首页
 └─ 选择牌阵（单张 / 三张）
     └─ 输入问题（可选）
         └─ 进入占卜页，显示牌背
             └─ 依次点击每张牌 → 3D 翻牌动画
                 └─ 全部翻开 → 解读区域淡入出现
                     └─ 点击"再次占卜" → 返回首页
```

---

## 视觉风格

### 配色方案

| 元素 | 颜色值 | 说明 |
|------|--------|------|
| 页面背景 | `#0D0B1E` | 深空蓝黑 |
| 卡片背景 | `#1A1535` | 深紫 |
| 金色强调 | `#C9A84C` | 神秘金（标题、边框、分割线） |
| 主文字 | `#F0E6FF` | 柔和白紫 |
| 次要文字 | `#A89BC2` | 暗紫灰（关键词、副标题） |

### 字体

- 标题 / 牌名：`Cinzel`（Google Fonts，经典神秘衬线体）
- 正文 / 解读：`Noto Serif SC`（中文衬线，优雅易读）

### 动画

- **翻牌**：CSS `rotateY(180deg)`，duration 0.6s，ease-in-out
- **解读淡入**：每张牌的解读卡片依次 `opacity 0→1 + translateY 20px→0`，错开 0.2s

---

## 抽牌逻辑（`useTarotReading.ts`）

- 从 78 张牌中随机洗牌（Fisher-Yates 算法）
- 取前 N 张（单张取 1，三张取 3）
- 每张牌独立随机正逆位（`Math.random() < 0.5`）

---

## 牌图资源

使用 **Rider-Waite 塔罗牌**图集（公共领域，版权已过期），共 78 张：
- 22 张大阿卡纳（Major Arcana）
- 56 张小阿卡纳（Minor Arcana，分权杖/圣杯/宝剑/星币四个花色）

图片来源：从公共领域资源（如 Wikimedia Commons）下载，放置于 `public/cards/`。

---

## 未来可扩展方向（超出本期范围）

- 历史记录（localStorage）
- 凯尔特十张牌阵
- AI 动态解读
- 背景音效（可开关）
- 移动端手势（滑动翻牌）

---

## 验证方式

1. `npm run dev` 启动本地开发服务器，访问 `localhost:5173`
2. 首页：能看到两种牌阵选项，可输入问题
3. 占卜页：点击牌背触发翻牌动画，翻开后显示牌面图和解读文字
4. 正逆位：多次占卜确认约 50% 概率出现逆位，且解读文字有所不同
5. 响应式：在手机浏览器宽度下布局正常，牌面可读
