import { useState } from 'react'

const Questionnaire = () => {
  const [managingLiquidity, setManagingLiquidity] = useState('')
  const [liquidationStrategies, setLiquidationStrategies] = useState('')
  const [tokenPledge, setTokenPledge] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [aiResponse, setAiResponse] = useState<string>('')
  const [isShowingResponse, setIsShowingResponse] = useState(false)
  const [isLoadingResponse, setIsLoadingResponse] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setIsShowingResponse(false)
    setIsLoadingResponse(true)

    try {
      const response = await fetch(
        'https://api-d7b62b.stack.tryrelevance.com/latest/studios/78e515ba-acab-47a9-a790-f7cc94108b41/trigger_limited',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            params: {
              managing_liquidity: managingLiquidity,
              liquidation_strategies: liquidationStrategies,
              token_pledge: tokenPledge
            },
            project: "060debf85845-4c22-b5e1-1454566534c2"
          })
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log("data", data);
        
        setAiResponse(data.output.answer || 'Thank you for your feedback!')
        setIsShowingResponse(true)
        setIsLoadingResponse(false)
        
        setTimeout(() => {
          document.getElementById('ai-response')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }, 100)
      } else {
        throw new Error('Failed to submit survey')
      }
    } catch (error) {
      console.error('Error submitting survey:', error)
      alert('Failed to submit survey. Please try again.')
      setIsLoadingResponse(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Orbitlen AI
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Question 1 */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-blue-400 mb-3">1. Managing Liquidity in DeFi</h2>
            <p className="text-gray-300 mb-4">
              How do you usually manage liquidity in decentralized finance? Would you use Orbitlen's lending/borrowing features to optimize your portfolio?
            </p>
            <textarea
              value={managingLiquidity}
              onChange={(e) => setManagingLiquidity(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              placeholder="Your response..."
            />
          </div>

          {/* Question 2 */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-blue-400 mb-3">2. Liquidation Strategies</h2>
            <p className="text-gray-300 mb-4">
              What is your approach to token liquidation in DeFi, and how do you handle the associated risks?
            </p>
            <textarea
              value={liquidationStrategies}
              onChange={(e) => setLiquidationStrategies(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              placeholder="Your response..."
            />
          </div>

          {/* Question 3 */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-blue-400 mb-3">3. Using Raydium for Token Pledge</h2>
            <p className="text-gray-300 mb-4">
              How would you incorporate pledging Ray or WIF tokens to interact with Raydium into your investment strategy?
            </p>
            <textarea
              value={tokenPledge}
              onChange={(e) => setTokenPledge(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              placeholder="Your response..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 text-white px-8 py-3 rounded-lg transition-colors font-medium
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Survey'}
            </button>
          </div>
        </form>

        {/* Loading Animation */}
        {isLoadingResponse && (
          <div className="mt-12">
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg border border-blue-500/20">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping delay-150"></div>
                <span className="text-blue-400 font-medium">AI is analyzing your responses...</span>
              </div>
            </div>
          </div>
        )}

        {/* AI Response Section */}
        {isShowingResponse && !isLoadingResponse && (
          <div 
            id="ai-response"
            className="mt-12 opacity-0 animate-fade-in"
          >
            <div className="bg-gray-800 rounded-xl p-8 shadow-lg border border-blue-500/20">
              <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-3"></div>
                AI Analysis
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-line animate-text-reveal">
                  {aiResponse}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Questionnaire

