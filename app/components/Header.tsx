'use client'
import { NextPage } from 'next'
import { useState, useEffect } from 'react'

const Header: NextPage = () => {
    const [currentTime, setCurrentTime] = useState('')
    const [currentDate, setCurrentDate] = useState('')

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date()
            const time = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            const date = now.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
            setCurrentTime(time)
            setCurrentDate(date)
        }
        
        updateDateTime()
        const interval = setInterval(updateDateTime, 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg'>
            <div className='container mx-auto px-4 py-3'>
                <div className='flex justify-between items-center flex-wrap gap-3'>
                    <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm'>
                            <span className='text-2xl'>🕵️</span>
                        </div>
                        <div>
                            <h1 className='font-bold text-lg'>بازی جاسوس</h1>
                            <p className='text-xs text-white/80'>حدس بزن کی جاسوسه!</p>
                        </div>
                    </div>
                    
                    <div className='flex gap-4'>
                        <div className='bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center'>
                            <div className='text-xs text-white/70'>📅 تاریخ</div>
                            <div className='text-sm font-semibold'>{currentDate}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Header