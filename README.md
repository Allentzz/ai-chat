# AI Chat 智能对话应用

一个基于 React + TypeScript + Vite 构建的现代化 AI 对话应用。

## 功能特点

- 💬 实时对话：支持与 AI 助手进行实时对话交流
- 📝 Markdown 支持：完整支持 Markdown 格式，包括代码高亮
- 🔄 流式响应：AI 回复采用流式输出，提供更好的交互体验
- 📚 会话管理：支持多会话创建、切换和删除
- 💾 本地存储：自动保存对话历史，无需担心数据丢失
- 🎨 优雅界面：简洁现代的用户界面设计

## 技术栈

- ⚡️ Vite - 闪电般的前端构建工具
- ⚛️ React - 用户界面构建库
- 📘 TypeScript - 类型安全的 JavaScript 超集
- 🎨 SCSS - 强大的 CSS 预处理器
- 🤖 OpenAI API - AI 对话能力支持
- 📝 React-Markdown - Markdown 渲染支持

## 开始使用

1. 克隆项目并安装依赖：

```bash
git clone [repository-url]
cd ai-chat
npm install
```

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
