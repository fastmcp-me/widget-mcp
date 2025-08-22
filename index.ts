import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
// @ts-ignore idk what's going on but it works and it's simple
import { createUIResource } from "@mcp-ui/server";
// Import generated HTML content with full type safety
import { timerHtml } from "./generated/html.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

export default function createServer() {
  const server = new McpServer({
    name: "mcp-starter232",
    version: "1.0.0",
  });

  const resource1 = createUIResource({
    uri: "ui://my-component/instance-1",
    content: { type: "rawHtml", htmlString: timerHtml },
    encoding: "blob",
  });

  server.registerTool(
    "hello_world",
    {
      title: "Hello World",
      description: "Say hello to the world",
      inputSchema: {
        name: z.string().describe("The name to say hello to"),
      },
    },
    async ({ name }) => {
      return {
        content: [
          {
            type: "text",
            text: `Hello, ${name}!`,
          },
          resource1,
        ],
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
