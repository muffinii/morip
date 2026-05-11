import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function SignupPage() {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [nickname, setNickname] = useState('');
    const [category, setCategory] = useState('대학생');

    const categories = ['대학생', '고등학생', '공시생', '기타'];

    const handleSignup = async () => {
        if (!userId.trim()) { alert('아이디를 입력해주세요'); return; }
        if (!email.trim()) { alert('이메일을 입력해주세요'); return; }
        if (!password.trim()) { alert('비밀번호를 입력해주세요'); return; }
        if (password !== passwordConfirm) { alert('비밀번호가 일치하지 않습니다'); return; }
        if (!nickname.trim()) { alert('닉네임을 입력해주세요'); return; }

        try {
            const data = await api('/member/signup', 'POST', {
                user_id: userId,
                email: email,
                password: password,
                nickname: nickname,
                category: category,
            });

            if (data.message === '회원가입 성공') {
                alert('회원가입 성공! 로그인 해주세요.');
                navigate('/');
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('서버에 연결할 수 없습니다');
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>회원가입</h1>

            <input style={styles.input} placeholder="아이디" value={userId} onChange={(e) => setUserId(e.target.value)} />
            <input style={styles.input} placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input style={styles.input} placeholder="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <input style={styles.input} placeholder="비밀번호 확인" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
            <input style={styles.input} placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} />

            <p style={styles.label}>카테고리 선택</p>
            <div style={styles.categoryContainer}>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        style={category === cat ? styles.categorySelected : styles.categoryButton}
                        onClick={() => setCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <button style={styles.button} onClick={handleSignup}>회원가입</button>

            <p style={styles.linkText} onClick={() => navigate('/')}>
                이미 계정이 있으신가요? 로그인
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
    card: {
        width: '400px',
        padding: '40px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '25px',
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
    label: {
        fontSize: '14px',
        color: '#555',
        marginBottom: '8px',
    },
    categoryContainer: {
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
    },
    categoryButton: {
        padding: '8px 16px',
        borderRadius: '20px',
        border: '1px solid #ddd',
        backgroundColor: '#fff',
        color: '#555',
        cursor: 'pointer',
        fontSize: '14px',
    },
    categorySelected: {
        padding: '8px 16px',
        borderRadius: '20px',
        border: '1px solid #4A90D9',
        backgroundColor: '#4A90D9',
        color: '#fff',
        cursor: 'pointer',
        fontSize: '14px',
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