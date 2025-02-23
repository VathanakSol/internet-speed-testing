import SpeedTest from "@/components/SpeedTest";

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-center p-6 md:p-24 bg-gradient-to-br from-blue-600 to-blue-400">
      <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8 text-white text-center px-4">
        Internet Speed Test
      </h1>
      <SpeedTest />
    </main>
  );
}
