import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
// @ts-ignore idk what's going on but it works and it's simple
import { createUIResource } from "@mcp-ui/server";

export default function createServer() {
  const server = new McpServer({
    name: "mcp-starter",
    version: "1.0.0",
  });

  const resource1 = createUIResource({
    uri: "ui://my-component/instance-1",
    content: { type: "rawHtml", htmlString: "<h1>Complex HTML</h1>" },
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
