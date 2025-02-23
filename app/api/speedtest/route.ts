import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { stdout, stderr } = await execAsync("speedtest-cli --json");

        if (stderr) {
          throw new Error(stderr);
        }

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
        controller.error(error);
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
