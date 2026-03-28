# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

塔罗占卜 Web 应用 — 纯前端静态应用，支持单张和三张牌阵，含 3D 翻牌动画和中文解读。

**Tech Stack:** React 19 + TypeScript + Vite 8 + CSS Modules + React Router v7

## Commands

```bash
npm run dev        # Start dev server at localhost:5173
npm run build      # TypeScript check (tsc -b) + Vite build
npm run lint       # ESLint
npm run preview    # Preview production build
bash scripts/download-cards.sh  # Download 78 Rider-Waite card images to public/cards/
```

No test framework is configured — there are no tests.

## Architecture

**Data flow:**
```
src/data/cards.ts (78张牌静态数据, ~850 lines)
  → src/hooks/useTarotReading.ts (Fisher-Yates 洗牌 + 随机正/逆位)
    → src/pages/Reading.tsx (占卜页，管理翻牌状态 via flippedSet)
      → src/components/CardSpread.tsx (牌阵布局 + 3D翻牌 + 图片加载失败时 SVG 占位)
      → src/components/ReadingResult.tsx (解读区域，allFlipped 后渲染)
```

**Routing** (`src/App.tsx`): `/` → Home, `/reading` → Reading

**Navigation state pattern:** Home 通过 `navigate('/reading', { state: { spread, question } })` 传参。Reading 页通过 `useLocation().state` 读取，若 state 为空则重定向回首页。

**CSS strategy:** CSS Modules（每个组件 `.module.css`）+ `src/index.css` 全局变量与动画关键帧

## Key Implementation Details

### 牌图资源
- 路径：`public/cards/`
- 大阿卡纳命名：`00-fool.jpg`, `01-magician.jpg`, ..., `21-world.jpg`
- 小阿卡纳命名：`wands-01.jpg`~`wands-14.jpg`，cups/swords/pentacles 同理
- 序号 01=Ace, 11=Page, 12=Knight, 13=Queen, 14=King
- 图片加载失败时，`CardSpread` 内的 `CardPlaceholder` 组件渲染 SVG 风格占位卡面

### 翻牌动画
- 容器 `.spread` 设置 `perspective: 1000px`
- `.cardInner` 使用 `transform-style: preserve-3d`，`.flipped .cardInner` 触发 `rotateY(180deg)`
- `.cardBack` 和 `.cardFront` 各自设置 `backface-visibility: hidden`，`.cardFront` 初始 `rotateY(180deg)`
- Duration: `var(--card-flip-duration)` = 0.6s

### 配色（CSS 变量定义在 `src/index.css`）
```css
--bg-primary: #0D0B1E;   /* 深空蓝黑 */
--bg-card: #1A1535;      /* 深紫 */
--gold: #C9A84C;         /* 神秘金 */
--text-primary: #F0E6FF; /* 柔和白紫 */
--text-secondary: #A89BC2; /* 暗紫灰 */
```

### 字体
Google Fonts：`Cinzel`（标题/牌名, `--font-heading`）+ `Noto Serif SC`（正文/解读, `--font-body`）

### 牌数据结构（`src/types/tarot.ts`）
- `TarotCard`: id, name(中), nameEn, arcana, suit?, image, keywords[], upright, reversed
- `DrawnCard`: card, isReversed, position?（"指引" | "过去" | "现在" | "未来"）
- `ReadingResult`: spread ('single' | 'three-card'), question, cards[], timestamp

## Design Spec

完整设计文档：`docs/superpowers/specs/2026-03-27-tarot-app-design.md`
