import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Ensure speedtest-cli is installed
        await execAsync("speedtest-cli --version").catch(() => {
          throw new Error("speedtest-cli is not installed. Please install it.");
        });

        // Run the speed test
        const { stdout, stderr } = await execAsync(
          "speedtest-cli --secure --json",
        );

        if (stderr) {
          throw new Error(stderr);
        }

        // Parse and format the result
        const result = JSON.parse(stdout);

        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              download: result.download / 1_000_000, // Convert to Mbps
              upload: result.upload / 1_000_000, // Convert to Mbps
              ping: result.ping,
            }),
          ),
        );
        controller.close();
      } catch (error) {
        console.error("Speed test error:", error);
        controller.enqueue(
          encoder.encode(
            JSON.stringify({
              error: "Failed to run speed test. Please try again.",
              details: error instanceof Error ? error.message : "Unknown error",
            }),
          ),
        );
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/json",
      "Transfer-Encoding": "chunked",
    },
  });
}
