export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          AI Agent Marketplace
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Discover powerful AI agents for your business needs
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-purple-200/50">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Service</h3>
            <p className="text-gray-600">24/7 automated support</p>
          </div>
          <div className="p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-purple-200/50">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">✨</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Content Creation</h3>
            <p className="text-gray-600">AI-powered content generation</p>
          </div>
          <div className="p-6 bg-white/70 backdrop-blur-sm rounded-xl border border-purple-200/50">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sales Analytics</h3>
            <p className="text-gray-600">Intelligent data insights</p>
          </div>
        </div>
      </div>
    </div>
  );
}