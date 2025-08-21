// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export default function createServer() {
  const server = new McpServer({
    name: "mcp-starter",
    version: "1.0.0",
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
        ],
      };
    }
  );

  return server.server;
}
