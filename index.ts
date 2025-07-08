import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer(
  {
    name: "mcp-starter",
    version: "0.2.0",
  },
  {
    capabilities: {
      tools: {},
      logging: {},
    },
  }
);

server.tool(
  "hello_tool",
  "Hello tool",
  {
    name: z.string().describe("The name of the person to greet"),
  },
  async ({ name }) => {
    console.error("Hello tool", { name });
    return {
      content: [
        {
          type: "text",
          text: `Hello, ${name}!`,
        },
      ],
    };
  }
);

process.on("SIGINT", async () => {
  await server.close();
  process.exit(0);
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Starter Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
