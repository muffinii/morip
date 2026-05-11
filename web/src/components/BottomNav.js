import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        {
            name: '기록',
            path: '/home',
            icon: (color) => (
                <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
        },
        {
            name: '통계',
            path: '/stats',
            icon: (color) => (
                <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
        {
            name: '코칭',
            path: '/coaching',
            icon: (color) => (
                <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
            ),
        },
        {
            name: '친구',
            path: '/friends',
            icon: (color) => (
                <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
                    <path d="M17 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            ),
        },
    ];

    return (
        <div className="bottom-nav">
            {tabs.map((tab) => {
                const isActive = location.pathname === tab.path;
                const color = isActive ? '#3b82f6' : '#cbd5e1';
                return (
                    <button
                        key={tab.name}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => navigate(tab.path)}
                    >
                        {tab.icon(color)}
                        <span>{tab.name}</span>
                    </button>
                );
            })}
        </div>
    );
}