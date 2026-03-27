import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";

const client = new Anthropic();
const projectDir = process.cwd();
const historyFile = path.join(projectDir, ".claude-history.json");

let conversationHistory = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const SYSTEM_PROMPT = `你是一个专业的 Next.js 项目分析和开发助手。

你的任务是：
1. 主动分析用户的项目结构和代码
2. 识别问题和改进机会
3. 自动生成详细的 Markdown 文档
4. 提供可执行的改进建议
5. 生成改进后的代码示例

当用户询问关于他们的项目时，你应该：
- 🔍 深入分析相关文件
- 📋 生成详细的分析报告 (Markdown 格式)
- 💡 提供具体的改进建议
- 🛠️ 给出代码示例和实现方案

用户的项目是: MyWeb (Next.js 项目)`;

// 加载历史对话
function loadHistory() {
  if (fs.existsSync(historyFile)) {
    try {
      conversationHistory = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
      console.log(`✅ 加载了之前的 ${conversationHistory.length} 条对话\n`);
    } catch (e) {
      console.log("⚠️ 无法加载历史，开始新对话\n");
    }
  }
}

// 保存历史对话
function saveHistory() {
  fs.writeFileSync(historyFile, JSON.stringify(conversationHistory, null, 2));
}

// 清除历史
function clearHistory() {
  conversationHistory = [];
  if (fs.existsSync(historyFile)) {
    fs.unlinkSync(historyFile);
  }
  console.log("✅ 已清除历史对话\n");
}

async function chat(userMessage) {
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  const response = await client.messages.create({
    model: "claude-opus-4-1-20250805",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: conversationHistory,
  });

  const assistantMessage = response.content[0].text;
  conversationHistory.push({
    role: "assistant",
    content: assistantMessage,
  });

  saveHistory();
  return assistantMessage;
}

function getProjectStructure(dir = ".", depth = 0, maxDepth = 2) {
  if (depth > maxDepth) return "";
  try {
    const items = fs.readdirSync(dir).sort();
    let result = "";
    const ignore = [
      "node_modules",
      ".next",
      ".git",
      "dist",
      "build",
      ".env",
      ".env.local",
      ".claude-history.json",
    ];
    for (const item of items) {
      if (ignore.includes(item) || item.startsWith(".")) continue;
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      const indent = "  ".repeat(depth);
      if (stat.isDirectory()) {
        result += `${indent}📁 ${item}/\n`;
        result += getProjectStructure(fullPath, depth + 1, maxDepth);
      } else {
        result += `${indent}📄 ${item}\n`;
      }
    }
    return result;
  } catch (e) {
    return "";
  }
}

function getFileContent(filePath) {
  try {
    const fullPath = path.join(projectDir, filePath);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      return `[目录]`;
    }
    const content = fs.readFileSync(fullPath, "utf-8");
    return content.substring(0, 3000);
  } catch (e) {
    return `无法读取: ${e.message}`;
  }
}

async function main() {
  console.log("🚀 Claude Agent - MyWeb 项目分析");
  console.log("命令: ls | cat <file> | clear | exit");
  console.log("=".repeat(60) + "\n");

  loadHistory();

  // 如果是第一次，自动分析项目
  if (conversationHistory.length === 0) {
    console.log("📊 首次运行，正在分析你的项目...\n");
    const projectStructure = getProjectStructure();
    const initialMessage = `请分析我的 MyWeb Next.js 项目。

项目结构:
\`\`\`
${projectStructure}
\`\`\`

请:
1. 分析项目的整体结构
2. 识别任何潜在的问题或改进机会
3. 给出具体的改进建议`;

    try {
      const analysis = await chat(initialMessage);
      console.log("Claude:\n" + analysis + "\n");
    } catch (error) {
      console.error("❌ 错误:", error.message);
    }
  }

  // 交互模式
  while (true) {
    const userInput = await new Promise((resolve) => {
      rl.question("\nYou: ", resolve);
    });

    if (userInput.toLowerCase() === "exit") {
      console.log("👋 再见！对话已保存。");
      rl.close();
      break;
    }

    if (userInput.toLowerCase() === "clear") {
      clearHistory();
      continue;
    }

    if (!userInput.trim()) continue;

    try {
      if (userInput === "ls") {
        console.log("\n📁 项目结构:\n" + getProjectStructure());
      } else if (userInput.startsWith("cat ")) {
        const filePath = userInput.slice(4).trim();
        const content = getFileContent(filePath);
        console.log(`\n📄 ${filePath}:\n${content}\n`);
      } else {
        const reply = await chat(userInput);
        console.log("\nClaude:\n" + reply);
      }
    } catch (error) {
      console.error("❌ 错误:", error.message);
    }
  }
}

main().catch(console.error);