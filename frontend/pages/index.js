// pages/index.js
export default function Home() {
  return (
    <div>
      <div
        className="relative flex flex-1 items-center justify-center text-center h-screen overflow-hidden"
        style={{
          backgroundImage: "url('https://noun-api.com/beta/pfp')",
          backgroundSize: '100px 100px',
          backgroundRepeat: 'repeat',
        }}
      >
        <div className="absolute inset-0 bg-white opacity-50 z-0"></div>

        <div className="relative z-5 flex flex-col items-center justify-center bg-white/80 p-10 rounded-lg shadow-lg">
          <img
            src="https://noun-api.com/beta/pfp?name=chainwave"
            alt="ChainWave"
            className="w-32 h-32 mb-4"
          />
          <h1 className="text-3xl font-bold">Welcome to ChainWave! ⌐◘-◘</h1>
        </div>
      </div>
    </div>
  );
}
