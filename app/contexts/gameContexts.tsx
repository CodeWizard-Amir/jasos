'use client'

import { createContext, ReactNode, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export type Player = {
    id: string,
    name: string,
    isSpy: boolean,
    score: number,
    hints?: string[]
}

type RoundHistory = {
    round: number
    location: string
    locationEmoji: string
    winner: 'spy' | 'citizens'
    spies: string[]
    citizens: string[]
}

type GameState = {
    players: Player[]
    roundTime: number
    currentRound: number
    isGameActive: boolean
    location: { name: string; emoji: string; hints: string[] } | null
    spies: Player[]
    roundHistory: RoundHistory[]
    settings: {
        spyCount: number
        timeLimit: number
        roundsCount: number
    }
}

interface gamecontextType {
    gameState: GameState
    addPlayer: (name: string) => void
    removePlayer: (id: string) => void
    startGame: () => Promise<boolean>
    endRound: (winner: 'spy' | 'citizens') => Promise<void>
    resetGame: () => void
    updateSettings: (settings: Partial<GameState['settings']>) => void
    getLeaderboard: () => { name: string; score: number; id: string }[]
    nextRound: () => Promise<void>
}

const GameContext = createContext<gamecontextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
    const router = useRouter()
    const [gameState, setGameState] = useState<GameState>({
        players: [],
        currentRound: 1,
        roundTime: 60,
        isGameActive: false,
        location: null,
        spies: [],
        roundHistory: [],
        settings: {
            spyCount: 1,
            timeLimit: 60,
            roundsCount: 3
        }
    })

    useEffect(() => {
        const savedSettings = localStorage.getItem('gameSettings')
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings)
            setGameState(prev => ({
                ...prev,
                settings: { ...prev.settings, ...parsed },
                roundTime: parsed.timeLimit || 60
            }))
        }
        
        const savedPlayers = localStorage.getItem('gamePlayers')
        if (savedPlayers) {
            const parsed = JSON.parse(savedPlayers)
            setGameState(prev => ({
                ...prev,
                players: parsed
            }))
        }
        
        const savedHistory = localStorage.getItem('gameHistory')
        if (savedHistory) {
            const parsed = JSON.parse(savedHistory)
            setGameState(prev => ({
                ...prev,
                roundHistory: parsed
            }))
        }
        
        const savedCurrentRound = localStorage.getItem('currentRound')
        if (savedCurrentRound) {
            setGameState(prev => ({
                ...prev,
                currentRound: parseInt(savedCurrentRound)
            }))
        }
    }, [])

    useEffect(() => {
        localStorage.setItem('gamePlayers', JSON.stringify(gameState.players))
        localStorage.setItem('gameHistory', JSON.stringify(gameState.roundHistory))
        localStorage.setItem('currentRound', gameState.currentRound.toString())
    }, [gameState.players, gameState.roundHistory, gameState.currentRound])

    const addPlayer = (name: string) => {
        setGameState(prev => ({
            ...prev,
            players: [...prev.players, { 
                id: crypto.randomUUID(), 
                name, 
                isSpy: false,
                score: 0 
            }]
        }))
    }

    const removePlayer = (id: string) => {
        setGameState(prev => ({
            ...prev,
            players: prev.players.filter(p => p.id !== id)
        }))
    }

    const updateSettings = (settings: Partial<GameState['settings']>) => {
        setGameState(prev => ({
            ...prev,
            settings: { ...prev.settings, ...settings },
            roundTime: settings.timeLimit || prev.settings.timeLimit
        }))
        localStorage.setItem('gameSettings', JSON.stringify({
            ...gameState.settings,
            ...settings
        }))
    }

    const fetchRandomLocation = async () => {
        const res = await fetch('/words.json')
        const data = await res.json()
        const locations = data.locations
        return locations[Math.floor(Math.random() * locations.length)]
    }

    const startGame = async () => {
        if (gameState.players.length < 3) {
            alert("حداقل 3 بازیکن برای شروع بازی نیاز است")
            return false
        }

        const resetPlayers = gameState.players.map(player => ({
            ...player,
            isSpy: false,
            score: 0,
            hints: undefined
        }))

        setGameState(prev => ({
            ...prev,
            players: resetPlayers,
            currentRound: 1,
            roundHistory: [],
            isGameActive: true
        }))

        localStorage.setItem('gameHistory', JSON.stringify([]))
        localStorage.setItem('currentRound', '1')
        
        await startNewRound(1, resetPlayers)
        return true
    }

    const startNewRound = async (roundNumber: number, currentPlayers: Player[]) => {
        const randomLocation = await fetchRandomLocation()
        
        const shuffled = [...currentPlayers]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        
        const spies = shuffled.slice(0, gameState.settings.spyCount)
        const spyIds = new Set(spies.map(s => s.id))
        
        const updatedPlayers = currentPlayers.map(player => ({
            ...player,
            isSpy: spyIds.has(player.id),
            hints: spyIds.has(player.id) ? randomLocation.hints : undefined
        }))
        
        setGameState((prev) => ({
            ...prev,
            players: updatedPlayers,
            location: randomLocation,
            spies: spies,
            isGameActive: true,
            currentRound: roundNumber,
            roundTime: prev.settings.timeLimit
        }))
        
        // Clear revealed players for new round
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
            if (key.startsWith('revealed_')) {
                localStorage.removeItem(key)
            }
        })
    }

    const endRound = async (winner: 'spy' | 'citizens') => {
        const roundScore = winner === 'spy' ? 4 : 2
        
        const updatedPlayers = gameState.players.map(player => {
            const isWinner = player.isSpy === (winner === 'spy')
            return {
                ...player,
                score: player.score + (isWinner ? roundScore : 0)
            }
        })
        
        const roundResult: RoundHistory = {
            round: gameState.currentRound,
            location: gameState.location?.name || 'نامشخص',
            locationEmoji: gameState.location?.emoji || '❓',
            winner: winner,
            spies: gameState.players.filter(p => p.isSpy).map(p => p.name),
            citizens: gameState.players.filter(p => !p.isSpy).map(p => p.name)
        }
        
        const newHistory = [...gameState.roundHistory, roundResult]
        const nextRound = gameState.currentRound + 1
        
        setGameState(prev => ({
            ...prev,
            players: updatedPlayers,
            roundHistory: newHistory,
            isGameActive: false
        }))
        
        localStorage.setItem('gameHistory', JSON.stringify(newHistory))
        localStorage.setItem('gamePlayers', JSON.stringify(updatedPlayers))
        
        if (nextRound <= gameState.settings.roundsCount) {
            // Go to next round
            router.push('/start')
            await startNewRound(nextRound, updatedPlayers)
        } else {
            // Game finished
            router.push('/results')
        }
    }

    const nextRound = async () => {
        const nextRoundNumber = gameState.currentRound + 1
        if (nextRoundNumber <= gameState.settings.roundsCount) {
            await startNewRound(nextRoundNumber, gameState.players)
        }
    }

    const resetGame = () => {
        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p => ({ ...p, isSpy: false, score: 0, hints: undefined })),
            currentRound: 1,
            isGameActive: false,
            location: null,
            spies: [],
            roundHistory: []
        }))
        
        localStorage.setItem('gameHistory', JSON.stringify([]))
        localStorage.setItem('currentRound', '1')
        localStorage.setItem('gamePlayers', JSON.stringify(gameState.players.map(p => ({ ...p, isSpy: false, score: 0, hints: undefined }))))
        
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
            if (key.startsWith('revealed_')) {
                localStorage.removeItem(key)
            }
        })
    }

    const getLeaderboard = () => {
        return [...gameState.players].sort((a, b) => b.score - a.score)
    }

    return (
        <GameContext.Provider value={{ 
            gameState, 
            addPlayer, 
            removePlayer,
            startGame, 
            endRound, 
            resetGame,
            updateSettings,
            getLeaderboard,
            nextRound
        }}>
            {children}
        </GameContext.Provider>
    )
}

export function useGame() {
    const context = useContext(GameContext)
    if (!context) throw new Error("useGame must be used within GameProvider")
    return context
}