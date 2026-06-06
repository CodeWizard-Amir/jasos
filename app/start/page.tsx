'use client'
import { NextPage } from 'next'
import Header from '../components/Header'
import { useGame } from '../contexts/gameContexts'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const Page: NextPage = () => {
    const { gameState, resetGame, endRound, nextRound } = useGame()
    const router = useRouter()
    const [revealedPlayers, setRevealedPlayers] = useState<string[]>([])
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
    const [showAlert, setShowAlert] = useState(false)
    const [alertData, setAlertData] = useState({ name: '', role: '', location: '', hints: '' })
    const [showGuessModal, setShowGuessModal] = useState(false)
    const [selectedSpies, setSelectedSpies] = useState<string[]>([])
    const [gameResult, setGameResult] = useState<{ win: boolean; message: string; details: string[] } | null>(null)
    const [timeLeft, setTimeLeft] = useState(gameState.roundTime)
    const [showLeaderboard, setShowLeaderboard] = useState(false)

    useEffect(() => {
        setTimeLeft(gameState.roundTime)
    }, [gameState.currentRound, gameState.roundTime])

    useEffect(() => {
        if (!gameState.isGameActive) return
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    endRound('citizens')
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        
        return () => clearInterval(timer)
    }, [gameState.isGameActive, endRound])

    useEffect(() => {
        const saved = localStorage.getItem(`revealed_${gameState.location?.name}_round_${gameState.currentRound}`)
        if (saved) {
            setRevealedPlayers(JSON.parse(saved))
        } else {
            setRevealedPlayers([])
        }
    }, [gameState.location, gameState.currentRound])

    const handlePlayerClick = (player: any) => {
        if (revealedPlayers.includes(player.id) || !gameState.isGameActive) {
            return
        }

        const newRevealed = [...revealedPlayers, player.id]
        setRevealedPlayers(newRevealed)
        localStorage.setItem(`revealed_${gameState.location?.name}_round_${gameState.currentRound}`, JSON.stringify(newRevealed))

        let hintsText = ''
        if (player.isSpy && player.hints) {
            hintsText = `💡 راهنما: ${player.hints.join(' - ')}`
        }

        setAlertData({
            name: player.name,
            role: player.isSpy ? '🕵️‍♂️ جاسوس' : '👮 شهروند',
            location: player.isSpy ? '❓ نامشخص' : `${gameState.location?.emoji || ''} ${gameState.location?.name || 'نامشخص'}`,
            hints: hintsText
        })
        setSelectedPlayer(player.id)
        setShowAlert(true)
    }

    const closeAlert = () => {
        setShowAlert(false)
        setSelectedPlayer(null)
    }

    const handleGuessSpy = () => {
        setSelectedSpies([])
        setShowGuessModal(true)
    }

    const toggleSpySelection = (playerId: string) => {
        if (selectedSpies.includes(playerId)) {
            setSelectedSpies(selectedSpies.filter(id => id !== playerId))
        } else {
            if (selectedSpies.length < gameState.settings.spyCount) {
                setSelectedSpies([...selectedSpies, playerId])
            }
        }
    }

    const submitGuess = () => {
        const realSpies = gameState.players.filter(p => p.isSpy).map(p => p.id)
        const guessedSpies = selectedSpies
        
        const correctGuesses = guessedSpies.filter(id => realSpies.includes(id))
        const wrongGuesses = guessedSpies.filter(id => !realSpies.includes(id))
        
        let win = false
        let message = ''
        let details: string[] = []
        
        if (wrongGuesses.length > 0) {
            win = false
            message = '❌ شهروندان برنده شدن!'
            details = [`${wrongGuesses.length} نفر شهروند رو اشتباه جاسوس معرفی کردی`]
            endRound('citizens')
        } else if (correctGuesses.length === realSpies.length && realSpies.length > 0) {
            win = true
            message = '🎉 تبریک! جاسوس‌ها بردن! 🎉'
            details = [`همه ${realSpies.length} تا جاسوس رو درست حدس زدی`]
            endRound('spy')
        } else {
            win = false
            message = '💀 شهروندان بردن!'
            details = [`هیچ جاسوسی رو نتونستی پیدا کنی`]
            endRound('citizens')
        }
        
        setGameResult({ win, message, details })
        setShowGuessModal(false)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getLeaderboard = () => {
        return [...gameState.players].sort((a, b) => b.score - a.score)
    }

    const isRoundFinished = !gameState.isGameActive && gameState.roundHistory.length < gameState.currentRound

    return (
        <>
            <Header />
            
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-6 pb-28">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 text-center">
                            <div className="text-white/60 text-xs">دور</div>
                            <div className="text-white font-bold text-xl">{gameState.currentRound}/{gameState.settings.roundsCount}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 text-center">
                            <div className="text-white/60 text-xs">زمان باقی‌مانده</div>
                            <div className={`font-bold text-xl ${timeLeft < 10 ? 'text-red-400' : 'text-white'}`}>
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 text-center">
                            <div className="text-white/60 text-xs">لوکیشن</div>
                            <div className="text-white font-bold text-sm">{gameState.location?.emoji} {gameState.location?.name || '?'}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-3 text-center cursor-pointer hover:bg-white/20 transition-all" onClick={() => setShowLeaderboard(!showLeaderboard)}>
                            <div className="text-white/60 text-xs">🏆 امتیازات</div>
                            <div className="text-white font-bold text-sm">مشاهده جدول</div>
                        </div>
                    </div>

                    {showLeaderboard && (
                        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 mb-6 animate-fade-in">
                            <h3 className="text-white font-bold mb-3">🏆 جدول امتیازات</h3>
                            <div className="space-y-2">
                                {getLeaderboard().map((player, idx) => (
                                    <div key={player.id} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-bold ${idx === 0 ? 'text-yellow-400' : 'text-white/60'}`}>{idx + 1}</span>
                                            <span className="text-white">{player.name}</span>
                                        </div>
                                        <span className="font-bold text-indigo-300">{player.score} امتیاز</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="text-center mb-8">
                        <div className="inline-block bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-3 mb-4">
                            <span className="text-3xl mr-2">🎭</span>
                            <span className="text-white font-bold text-lg">نقش‌های بازیکنان</span>
                        </div>
                        <p className="text-white/70 text-sm">
                            {gameState.isGameActive ? '🔒 هر بازیکن فقط یک بار می‌تواند نقش خود را ببیند' : '⏳ در حال آماده‌سازی دور بعد...'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {gameState.players.map((player) => {
                            const isRevealed = revealedPlayers.includes(player.id)
                            const isSelected = selectedPlayer === player.id
                            
                            return (
                                <div key={player.id} onClick={() => handlePlayerClick(player)} className={`relative group cursor-pointer transition-all duration-300 transform ${isRevealed ? 'opacity-40 grayscale scale-95' : 'hover:scale-105 hover:shadow-2xl'} ${isSelected ? 'ring-4 ring-yellow-400 scale-105' : ''}`}>
                                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20">
                                        <div className="relative h-32 bg-gradient-to-br from-indigo-500 to-purple-600">
                                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${player.isSpy ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-gradient-to-br from-green-500 to-emerald-500'} shadow-lg border-4 border-white/20`}>
                                                    {player.isSpy ? '🕵️' : '👤'}
                                                </div>
                                            </div>
                                            <div className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-0.5 text-xs text-white">
                                                {player.score} pts
                                            </div>
                                        </div>
                                        
                                        <div className="pt-10 pb-4 px-4 text-center">
                                            <h3 className="text-white font-bold text-lg mb-2">{player.name}</h3>
                                            {isRevealed && (
                                                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${player.isSpy ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 'bg-green-500/20 text-green-300 border border-green-500/50'}`}>
                                                    {player.isSpy ? '🕵️ جاسوس' : '👮 شهروند'}
                                                </div>
                                            )}
                                            <div className="mt-3">
                                                {isRevealed ? <span className="text-white/30 text-xs">✓ مشاهده شده</span> : <span className="text-white/50 text-xs">🔒 برای مشاهده کلیک کن</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {gameState.roundHistory.length > 0 && (
                        <div className="mt-8">
                            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4">
                                <h3 className="text-white font-bold mb-3 text-center">📜 تاریخچه بازی</h3>
                                <div className="space-y-2">
                                    {gameState.roundHistory.map((round, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-sm bg-white/5 rounded-lg p-2">
                                            <span className="text-white/70">دور {round.round}</span>
                                            <span className="text-white">{round.location}</span>
                                            <span className={`font-bold ${round.winner === 'spy' ? 'text-red-400' : 'text-green-400'}`}>برنده: {round.winner === 'spy' ? 'جاسوس' : 'شهروندان'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {gameState.isGameActive && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
                    <button onClick={handleGuessSpy} className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3">
                        <span className="text-2xl">🕵️</span>
                        <span>حدس جاسوس</span>
                        <span className="text-sm bg-white/20 px-2 py-1 rounded-full">{gameState.settings.spyCount} جاسوس</span>
                    </button>
                </div>
            )}

            {showAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                    <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl max-w-md w-full transform animate-slide-up">
                        <button onClick={closeAlert} className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors z-10">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div className="p-6 text-center">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${alertData.role.includes('جاسوس') ? 'bg-red-500/20 border-2 border-red-500' : 'bg-green-500/20 border-2 border-green-500'}`}>
                                <span className="text-4xl">{alertData.role.includes('جاسوس') ? '🕵️' : '👮'}</span>
                            </div>
                            <h3 className="text-white text-2xl font-bold mb-2">{alertData.name}</h3>
                            <div className="mb-3"><span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${alertData.role.includes('جاسوس') ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>{alertData.role}</span></div>
                            {!alertData.role.includes('جاسوس') && (<div className="bg-white/5 rounded-xl p-3 mt-3"><p className="text-gray-300 text-sm">📍 لوکیشن</p><p className="text-white font-bold text-lg">{alertData.location}</p></div>)}
                            {alertData.role.includes('جاسوس') && (<><div className="bg-red-500/10 rounded-xl p-3 mt-3 border border-red-500/30"><p className="text-red-300 text-sm">🤫 تو جاسوسی!</p><p className="text-red-200 text-xs mt-1">هیچ لوکیشنی نمی‌بینی. سعی کن خودت رو لو ندی!</p></div>{alertData.hints && (<div className="bg-yellow-500/10 rounded-xl p-3 mt-3 border border-yellow-500/30"><p className="text-yellow-300 text-sm">{alertData.hints}</p></div>)}</>)}
                            <button onClick={closeAlert} className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">متوجه شدم</button>
                        </div>
                    </div>
                </div>
            )}

            {showGuessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 p-4 rounded-t-2xl">
                            <div className="flex justify-between items-center"><h3 className="text-white font-bold text-xl">حدس بزن جاسوس کیه؟</h3><button onClick={() => setShowGuessModal(false)} className="text-white/80 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
                            <p className="text-white/80 text-sm mt-1">{selectedSpies.length} از {gameState.settings.spyCount} جاسوس انتخاب شده</p>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {gameState.players.map((player) => {
                                    const isSelected = selectedSpies.includes(player.id)
                                    return (<button key={player.id} onClick={() => toggleSpySelection(player.id)} disabled={!isSelected && selectedSpies.length >= gameState.settings.spyCount} className={`relative p-4 rounded-xl transition-all duration-200 text-right ${isSelected ? 'bg-red-600 text-white shadow-lg scale-95' : 'bg-white/10 text-white hover:bg-white/20'} ${!isSelected && selectedSpies.length >= gameState.settings.spyCount ? 'opacity-50 cursor-not-allowed' : ''}`}><div className="flex justify-between items-center"><span className="font-bold">{player.name}</span>{isSelected && <span className="text-xl">🕵️</span>}</div></button>)
                                })}
                            </div>
                            <div className="flex gap-3 mt-6"><button onClick={() => setSelectedSpies([])} className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all">پاک کردن انتخاب</button><button onClick={submitGuess} disabled={selectedSpies.length !== gameState.settings.spyCount} className={`flex-1 py-3 rounded-xl font-semibold transition-all ${selectedSpies.length === gameState.settings.spyCount ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>تایید حدس ({selectedSpies.length}/{gameState.settings.spyCount})</button></div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                .animate-slide-up { animation: slide-up 0.4s ease-out; }
            `}</style>
        </>
    )
}

export default Page