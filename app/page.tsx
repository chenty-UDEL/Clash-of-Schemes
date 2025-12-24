'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600">
          权谋决战完整版
        </h1>
        <p className="text-gray-400 mb-8">22角色社交推理游戏</p>
        <div className="bg-gray-900 p-8 rounded-xl shadow-2xl max-w-md">
          <p className="text-yellow-400 mb-4">🚧 项目正在开发中</p>
          <p className="text-gray-400 text-sm">
            完整版功能正在开发中，敬请期待！
          </p>
        </div>
      </div>
    </div>
  );
}

