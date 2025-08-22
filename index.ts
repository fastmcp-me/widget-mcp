import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
// @ts-ignore idk what's going on but it works and it's simple
import { createUIResource } from "@mcp-ui/server";
// Import generated HTML content with full type safety
import { timerHtml } from "./generated/html.js";
// Import our HTML templating utility
import { createTemplatedUIResource } from "./utils/html-template.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

export default function createServer() {
  const server = new McpServer({
    name: "widget-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "timer",
    {
      title: "Timer",
      description: "Start a timer",
      inputSchema: {
        duration: z.number().describe("The duration of the timer in seconds"),
      },
    },
    async ({ duration }) => {
      // Create a templated UI resource with the duration parameter
      const timerResource = createTemplatedUIResource(
        createUIResource,
        "ui://widget/timer",
        timerHtml,
        { duration, mode: "timer" }
      );

      return {
        content: [timerResource],
      };
    }
  );

  server.registerTool(
    "stopwatch",
    {
      title: "Stopwatch",
      description: "Start a stopwatch that counts up from zero",
      inputSchema: {},
    },
    async () => {
      // Create a templated UI resource in stopwatch mode
      const stopwatchResource = createTemplatedUIResource(
        createUIResource,
        "ui://widget/stopwatch",
        timerHtml,
        { mode: "stopwatch" }
      );

      return {
        content: [stopwatchResource],
      };
    }
  );

  return server.server;
}

async function runServer() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });
  console.error("MCP Starter Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
