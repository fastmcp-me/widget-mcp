import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
// @ts-ignore idk what's going on but it works and it's simple
import { createUIResource } from "@mcp-ui/server";
// Import generated HTML content with full type safety
import { timerHtml } from "./generated/html.js";

export default function createServer() {
  const server = new McpServer({
    name: "mcp-starter232",
    version: "1.0.0",
  });

  const resource1 = createUIResource({
    uri: "ui://my-component/instance-1",
    content: { type: "rawHtml", htmlString: timerHtml },
    encoding: "blob",
    uiMetadata: {
      "preferred-frame-size": ["800px", "600px"],
    },
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
