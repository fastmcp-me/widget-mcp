/**
 * HTML Template Utility
 *
 * Provides a generalized function for templating HTML content with arguments.
 * This allows MCP tools to pass parameters that get substituted into HTML templates.
 */

/**
 * Template an HTML string by replacing configuration objects with provided values.
 *
 * This approach maintains HTML validity by replacing entire JavaScript objects
 * that contain default values, rather than individual placeholders.
 *
 * @param htmlContent - The HTML template string containing configuration objects
 * @param templateArgs - Object containing key-value pairs for replacement
 * @returns The templated HTML string with configuration objects replaced
 *
 * @example
 * ```typescript
 * const html = `
 *   <script>
 *     const CONFIG = {"duration": 1200, "title": "Default Timer"};
 *   </script>
 * `;
 * const result = templateHtml(html, { duration: 300, title: "Custom Timer" });
 * // Result: CONFIG object will have duration: 300, title: "Custom Timer"
 * ```
 */
export function templateHtml(htmlContent: string, templateArgs: Record<string, any>): string {
  let templatedContent = htmlContent;
  const configRegex = /const\s+TEMPLATE_CONFIG\s*=\s*({[^}]*})\s*;/g;

  templatedContent = templatedContent.replace(configRegex, (match, configObject) => {
    try {
      const defaultConfig = JSON.parse(configObject);
      const mergedConfig = { ...defaultConfig, ...templateArgs };
      return `const TEMPLATE_CONFIG = ${JSON.stringify(mergedConfig, null, 2)};`;
    } catch (error) {
      console.warn("Failed to parse TEMPLATE_CONFIG object:", error);
      return match; // Return original if parsing fails
    }
  });

  return templatedContent;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Helper function to create a UI resource with templated HTML content.
 * This is the main function that MCP tools should use.
 *
 * @param createUIResource - The createUIResource function from @mcp-ui/server
 * @param uri - The UI resource URI
 * @param htmlTemplate - The HTML template string
 * @param templateArgs - Arguments to substitute in the template
 * @param encoding - The encoding type (defaults to "blob")
 * @returns A UI resource object ready to be used with @mcp-ui/server
 */
export function createTemplatedUIResource(
  createUIResource: any,
  uri: string,
  htmlTemplate: string,
  templateArgs: Record<string, any> = {},
  encoding: "blob" | "base64" = "blob"
) {
  const templatedHtml = templateHtml(htmlTemplate, templateArgs);

  return createUIResource({
    uri,
    content: { type: "rawHtml", htmlString: templatedHtml },
    encoding,
  });
}
