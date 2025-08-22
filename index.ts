import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { timerHtml, display_factHtml, conversionHtml } from "./generated/html.js";
import { createTemplatedUIResource } from "./utils/html-template.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
// @ts-ignore idk what's going on but it works and it's simple
import { createUIResource } from "@mcp-ui/server";

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

  server.registerTool(
    "display-fact",
    {
      title: "Display Fact",
      description:
        "Display a simple fact. Should be used when answering a users question that has a short factual answer. You don't need to say anything else after answering with this tool. Example: { description: 'The capital of France', fact: 'Paris' }",
      inputSchema: {
        description: z.string().describe("A description of the fact"),
        fact: z.string().describe("The fact to display. Should be short and concise."),
      },
    },
    async ({ description, fact }) => {
      const factResource = createTemplatedUIResource(
        createUIResource,
        "ui://widget/display-fact",
        display_factHtml,
        { description, fact }
      );

      return {
        content: [factResource],
      };
    }
  );

  server.registerTool(
    "conversion",
    {
      title: "Unit Conversion",
      description:
        "Display a unit conversion widget that allows real-time conversion between multiple units. Each unit should contain a formula to convert to that unit from each of the other units. Example input: { units: [{id: 'ft', name: 'Feet', formulas: {in:'{ft} * 12'}, {id: 'in', name: 'Inches', formulas: {ft:'{in} * 12'}}], initialValue: { id: 'ft', value: 1 }}",
      inputSchema: {
        units: z
          .array(
            z.object({
              id: z.string().describe("Unique identifier for the unit"),
              name: z.string().describe("Display name for the unit"),
              formulas: z
                .record(z.string())
                .describe("Conversion formulas to other units, using {id} as placeholder."),
            })
          )
          .describe("Array of units with conversion formulas"),
        initialValue: z
          .object({
            id: z.string().describe("ID of the unit to set initial value for"),
            value: z.number().describe("Initial value for the unit"),
          })
          .describe("Initial value to display in the converter"),
      },
    },
    async ({ units, initialValue }) => {
      const conversionResource = createTemplatedUIResource(
        createUIResource,
        "ui://widget/conversion",
        conversionHtml,
        { units, initialValue }
      );

      return {
        content: [conversionResource],
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
