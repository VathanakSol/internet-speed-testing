"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
    <Card className="w-full min-h-[200px] max-w-[95%] mx-auto md:max-w-md bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-2xl font-bold text-center">
          Speed Test Results
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {!isLoading && !results && !error && (
          <Button
            onClick={runSpeedTest}
            className="w-full bg-blue-400 hover:bg-blue-500 text-white text-base font-semibold py-3 rounded-lg transition-all duration-300"
          >
            Start Speed Test
          </Button>
        )}
        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-4 min-h-[120px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-200" />
            <p className="text-base text-blue-200">Testing in progress...</p>
          </div>
        )}
        {results && (
          <div className="space-y-4">
            <div className="bg-blue-600/30 p-4 rounded-lg">
              <p className="text-lg mb-3">
                Download Speed: {results.download.toFixed(2)} Mbps
              </p>
              <p className="text-lg mb-3">
                Upload Speed: {results.upload.toFixed(2)} Mbps
              </p>
              <p className="text-lg">Ping: {results.ping.toFixed(0)} ms</p>
            </div>
            <Button
              onClick={runSpeedTest}
              className="w-full bg-blue-400 hover:bg-blue-500 text-white text-base font-semibold py-3 rounded-lg transition-all duration-300"
            >
              Run Again
            </Button>
          </div>
        )}
        {error && (
          <div className="space-y-4">
            <p className="text-base text-red-300 text-center p-4">{error}</p>
            <Button
              onClick={runSpeedTest}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold py-3 rounded-lg transition-all duration-300"
            >
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
