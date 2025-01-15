import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// TODO:
// - privide examples of all the different types (prompt, tool, resource, others?)
// - example of API and loading API key from env

const server = new Server(
  {
    name: "mcp-starter",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      logging: {},
    },
  }
);

const HELLO_TOOL: Tool = {
  name: "hello_tool",
  description: "Hello tool",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The name of the person to greet",
      },
    },
    required: ["name"],
  },
};

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [HELLO_TOOL],
}));

function doHello(name: string) {
  return {
    message: `Hello, ${name}!`,
  };
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "hello_tool") {
    console.error("Hello tool", request.params.arguments);
    const input = request.params.arguments as { name: string };
    return doHello(input.name);
  }

  throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
});

server.onerror = (error: any) => {
  console.error(error);
};

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
