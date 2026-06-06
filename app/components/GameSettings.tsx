'use client'
import { NextPage } from 'next'
import { useGame } from '../contexts/gameContexts'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const GameSettings: NextPage = () => {
  const { gameState, addPlayer, removePlayer, startGame, updateSettings, getLeaderboard, resetGame } = useGame()
  const navigate = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [showSettings, setShowSettings] = useState(false)

  const handleStart = async () => {
    let res = await startGame()
    if (res) {
      navigate.push('/start')
    }
  }

  const handleReset = () => {
    resetGame()
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleAddPlayer = () => {
    const name = inputRef.current?.value.trim()
    if (name && name !== '') {
      addPlayer(name)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } else {
      alert('لطفا نام بازیکن را وارد کنید')
    }
  }

  const leaderboard = getLeaderboard()

  return (
    <section className='min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6'>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm mb-3">
            <span className="text-4xl">🕵️</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            بازی جاسوس
          </h1>
          <p className="text-gray-500 text-sm mt-1">بازیکن‌ها رو اضافه کن و بازی رو شروع کن</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 mb-6 border border-white/50">
              <div className="flex w-full justify-between items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  className='flex-1 py-4 px-5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all'
                  placeholder='نام بازیکن رو وارد کن ...'
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                />
                <button
                  onClick={handleAddPlayer}
                  className='bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all'
                >
                  ➕ اضافه
                </button>
              </div>
            </div>

            {gameState.players.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="font-bold text-gray-800 text-lg">🎮 بازیکنان</h3>
                  <div className="bg-indigo-100 px-3 py-1 rounded-full">
                    <span className="text-indigo-600 font-semibold text-sm">{gameState.players.length} نفر</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
                  {gameState.players.map((player, index) => (
                    <div key={player.id} className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-xl"></div>
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                            <span className='text-white font-bold'>{index + 1}</span>
                          </div>
                          <div>
                            <h2 className="font-bold text-gray-800">{player.name}</h2>
                            <p className="text-xs text-gray-400">امتیاز: {player.score}</p>
                          </div>
                        </div>
                        <button onClick={() => removePlayer(player.id)} className='px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-lg transition-all text-sm'>
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gameState.players.length === 0 && (
              <div className="text-center py-12 bg-white/40 backdrop-blur-sm rounded-2xl">
                <div className="inline-block p-4 bg-white/60 rounded-full mb-3">
                  <span className="text-4xl">🎲</span>
                </div>
                <p className="text-gray-400 text-sm">هنوز بازیکنی اضافه نشده</p>
                <p className="text-gray-300 text-xs mt-1">اسم بازیکن‌ها رو وارد کن</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-white/50">
              <button onClick={() => setShowSettings(!showSettings)} className="w-full flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800">⚙️ تنظیمات بازی</h3>
                <span className="text-gray-400">{showSettings ? '▲' : '▼'}</span>
              </button>
              
              {showSettings && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm text-gray-600 block mb-2">تعداد جاسوس‌ها</label>
                    <div className="flex gap-2">
                      {[1, 2, 3].map(num => (
                        <button key={num} onClick={() => updateSettings({ spyCount: num })} className={`flex-1 py-2 rounded-lg font-semibold transition-all ${gameState.settings.spyCount === num ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {num} جاسوس
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 block mb-2">زمان هر دور (ثانیه)</label>
                    <div className="flex gap-2">
                      {[30, 60, 90, 120].map(time => (
                        <button key={time} onClick={() => updateSettings({ timeLimit: time })} className={`flex-1 py-2 rounded-lg font-semibold transition-all ${gameState.settings.timeLimit === time ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {time}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 block mb-2">تعداد دورها</label>
                    <div className="flex gap-2">
                      {[1, 3, 5].map(round => (
                        <button key={round} onClick={() => updateSettings({ roundsCount: round })} className={`flex-1 py-2 rounded-lg font-semibold transition-all ${gameState.settings.roundsCount === round ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {round} دور
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {leaderboard.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-white/50">
                <h3 className="font-bold text-gray-800 mb-3">🏆 جدول امتیازات</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {leaderboard.map((player, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-lg ${idx === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>{idx + 1}</span>
                        <span className="text-gray-700">{player.name}</span>
                      </div>
                      <span className="font-bold text-indigo-600">{player.score} امتیاز</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleReset} className="flex-1 bg-gray-500 text-white py-4 rounded-xl font-bold hover:bg-gray-600 transition-all shadow-lg">
                🔄 بازی جدید
              </button>
              <button onClick={handleStart} disabled={gameState.players.length < 3} className={`flex-1 py-4 rounded-xl font-bold text-white transition-all shadow-lg ${gameState.players.length >= 3 ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-xl hover:scale-105' : 'bg-gray-300 cursor-not-allowed'}`}>
                {gameState.players.length < 3 ? `❌ حداقل ${3 - gameState.players.length} بازیکن` : "🎮 شروع بازی"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default GameSettings