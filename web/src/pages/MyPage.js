import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MyPage() {
    const navigate = useNavigate();
    const nickname = localStorage.getItem('nickname');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('nickname');
        navigate('/');
    };

    return (
        <div style={styles.container}>
            <div style={styles.profileSection}>
                <div style={styles.avatar}>
                    <svg width="36" height="36" fill="#94a3b8" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                </div>
                <h2 style={styles.nickname}>{nickname}</h2>
            </div>

            <button style={styles.backButton} onClick={() => navigate('/home')}>
                ← 홈으로 돌아가기
            </button>

            <button style={styles.logoutButton} onClick={handleLogout}>
                로그아웃
            </button>
        </div>
    );
}

const styles = {
    container: {
        padding: '30px 20px',
        maxWidth: '500px',
        margin: '0 auto',
        minHeight: '100vh',
        backgroundColor: '#fff',
    },
    profileSection: {
        textAlign: 'center',
        marginTop: '30px',
        marginBottom: '40px',
    },
    avatar: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto 15px',
    },
    nickname: {
        fontSize: '22px',
        fontWeight: 'bold',
    },
    backButton: {
        width: '100%',
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid #ddd',
        backgroundColor: '#fff',
        fontSize: '16px',
        cursor: 'pointer',
        marginBottom: '10px',
    },
    logoutButton: {
        width: '100%',
        padding: '15px',
        borderRadius: '10px',
        border: '1px solid #e74c3c',
        backgroundColor: '#fff',
        color: '#e74c3c',
        fontSize: '16px',
        cursor: 'pointer',
    },
};