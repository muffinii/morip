import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function LoginPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const data = await api('/member/login', 'POST', {
                user_id: userId,
                password: password,
            });

            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('nickname', data.user.nickname);
                alert(`${data.user.nickname}님 환영합니다!`);
                navigate('/home');
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('서버에 연결할 수 없습니다');
        }
    };

    return (
        <div style={styles.container}>
                <h1 style={styles.title}>morip</h1>
                <p style={styles.subtitle}>집중 패턴 분석 스터디 타이머</p>

                <input
                    style={styles.input}
                    placeholder="아이디"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                />

                <input
                    style={styles.input}
                    placeholder="비밀번호"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button style={styles.button} onClick={handleLogin}>
                    로그인
                </button>

                <p style={styles.linkText} onClick={() => navigate('/signup')}>
                    계정이 없으신가요? 회원가입
                </p>
            </div>
    );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '30px',
    maxWidth: '500px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    textAlign: 'center',
    marginBottom: '40px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4A90D9',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '15px',
  },
  linkText: {
    color: '#4A90D9',
    textAlign: 'center',
    fontSize: '14px',
    cursor: 'pointer',
  },
};