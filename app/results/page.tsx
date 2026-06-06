'use client'
import { NextPage } from 'next'
import { useGame } from '../contexts/gameContexts'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const ResultsPage: NextPage = () => {
    const { gameState, resetGame, getLeaderboard } = useGame()
    const router = useRouter()
    const [chartData, setChartData] = useState<{ name: string; score: number; color: string }[]>([])
    
    useEffect(() => {
        const leaderboard = getLeaderboard()
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7B787']
        const data = leaderboard.map((player, idx) => ({
            name: player.name,
            score: player.score,
            color: colors[idx % colors.length]
        }))
        setChartData(data)
    }, [getLeaderboard])

    const maxScore = Math.max(...chartData.map(d => d.score), 1)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <div className="inline-block bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-3 mb-4"><span className="text-5xl">🏆</span></div>
                    <h1 className="text-3xl font-bold text-white mb-2">پایان بازی!</h1>
                    <p className="text-white/70">نتایج نهایی مسابقه</p>
                </div>

                {chartData.length > 0 && chartData[0].score > 0 && (
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 mb-8 text-center transform hover:scale-105 transition-all">
                        <div className="text-6xl mb-3">👑</div>
                        <h2 className="text-2xl font-bold text-white">برنده اصلی</h2>
                        <p className="text-3xl font-black mt-2">{chartData[0].name}</p>
                        <p className="text-xl mt-1">با {chartData[0].score} امتیاز</p>
                    </div>
                )}

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
                    <h3 className="text-white font-bold text-xl mb-6 text-center">📊 نمودار امتیازات</h3>
                    <div className="space-y-4">
                        {chartData.map((item, idx) => (
                            <div key={idx} className="group">
                                <div className="flex justify-between mb-1"><span className="text-white font-medium">{idx + 1}. {item.name}</span><span className="text-white/80">{item.score} امتیاز</span></div>
                                <div className="w-full bg-white/20 rounded-full h-8 overflow-hidden"><div className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-3" style={{ width: `${(item.score / maxScore) * 100}%`, backgroundColor: item.color }}><span className="text-white text-xs font-bold">{Math.round((item.score / maxScore) * 100)}%</span></div></div>
                            </div>
                        ))}
                    </div>
                </div>

                {gameState.roundHistory.length > 0 && (
                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
                        <h3 className="text-white font-bold text-xl mb-4 text-center">📜 تاریخچه دورها</h3>
                        <div className="space-y-3">
                            {gameState.roundHistory.map((round, idx) => (
                                <div key={idx} className="bg-white/5 rounded-xl p-4">
                                    <div className="flex justify-between items-center mb-2"><span className="text-white font-bold">دور {round.round}</span><span className="text-2xl">{round.locationEmoji}</span></div>
                                    <div className="text-white/80 text-sm mb-2">لوکیشن: {round.location}</div>
                                    <div className={`text-sm font-semibold ${round.winner === 'spy' ? 'text-red-400' : 'text-green-400'}`}>برنده: {round.winner === 'spy' ? '🕵️ جاسوس' : '👮 شهروندان'}</div>
                                    <div className="text-xs text-white/50 mt-2">جاسوس‌ها: {round.spies.join(', ')}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center"><div className="text-3xl mb-2">🎮</div><div className="text-white/60 text-xs">تعداد دورها</div><div className="text-white font-bold text-xl">{gameState.settings.roundsCount}</div></div>
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center"><div className="text-3xl mb-2">👥</div><div className="text-white/60 text-xs">تعداد بازیکنان</div><div className="text-white font-bold text-xl">{gameState.players.length}</div></div>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => { resetGame(); router.push('/'); }} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all">🎮 بازی جدید</button>
                    <button onClick={() => router.push('/')} className="flex-1 bg-white/10 text-white py-4 rounded-xl font-bold hover:bg-white/20 transition-all">🏠 صفحه اصلی</button>
                </div>
            </div>
        </div>
    )
}

export default ResultsPage