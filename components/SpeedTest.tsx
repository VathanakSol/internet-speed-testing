"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

interface SpeedTestResult {
  download: number;
  upload: number;
  ping: number;
}

export default function SpeedTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SpeedTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const runSpeedTest = async () => {
    setIsLoading(true);
    setResults(null);
    setError(null);

    toast({
      title: "Speed Test Started",
      description: "Please wait while we measure your internet speed.",
      variant: "success",
    });

    try {
      const response = await fetch("/api/speedtest");
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("Failed to start speed test");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const data = JSON.parse(chunk);

        setResults(data);
      }

      toast({
        title: "Speed Test Completed",
        description: "Your internet speed has been measured successfully.",
        variant: "success",
      });
    } catch (error) {
      console.error("Error running speed test:", error);
      setError("Failed to complete speed test");
      toast({
        title: "Speed Test Failed",
        description:
          "An error occurred while measuring your internet speed. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Speed Test Results</CardTitle>
      </CardHeader>
      <CardContent>
        {!isLoading && !results && !error && (
          <Button onClick={runSpeedTest} className="w-full">
            Start Speed Test
          </Button>
        )}
        {isLoading && (
          <div className="space-y-2">
            <Progress value={undefined} className="w-full" />
            <p className="text-center">Testing in progress...</p>
          </div>
        )}
        {results && (
          <div className="space-y-2">
            <p>Download Speed: {results.download.toFixed(2)} Mbps</p>
            <p>Upload Speed: {results.upload.toFixed(2)} Mbps</p>
            <p>Ping: {results.ping.toFixed(0)} ms</p>
            <Button onClick={runSpeedTest} className="w-full mt-4">
              Run Again
            </Button>
          </div>
        )}
        {error && (
          <div className="space-y-2">
            <p className="text-red-500">{error}</p>
            <Button onClick={runSpeedTest} className="w-full mt-4">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
