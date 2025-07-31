import { useState } from 'react';
import { Mail } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import { auth } from '../../../firebase';
import { useToast } from '../../../context/ToastContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [resent, setResent] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);

    const handleResend = async () => {
        setEmailError('');

        if (!email.trim()) {
            setEmailError('Email tidak boleh kosong.');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Format email tidak valid.');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            showToast('success', 'Link reset password telah dikirim ulang. Periksa folder Spam jika tidak muncul.');
            setResent(true);
            setResendDisabled(true);
            setTimeout(() => setResendDisabled(false), 60000); // tombol aktif lagi setelah 60 detik
        } catch (error) {
            console.error('Resend password error:', error);
            setEmailError('Gagal mengirim ulang email.');
            showToast('gagal', 'Gagal mengirim ulang link.');
        }
    };

    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEmailError('');

        if (!email.trim()) {
            setEmailError('Email tidak boleh kosong.');
            return;
        }

        if (!validateEmail(email)) {
            setEmailError('Format email tidak valid.');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            showToast('success', 'Link reset password telah dikirim ke email Anda. Silakan periksa juga folder Spam atau Sampah.');
        } catch (error) {
            console.error('Reset password error:', error);
            setEmailError('Gagal mengirim email. Pastikan email sudah terdaftar.');
            showToast('gagal', 'Gagal mengirim link reset password.');
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-content">
                <div className="signin-left">
                    <img src="/assets/logo.png" className="signin-image" alt="Logo" />
                    <div className="signin-image-title">RIKO Motorcycle Parts</div>
                </div>

                <div className="signin-right">
                    <div className="signin-title">Lupa Password</div>
                    <div className="signin-subtitle">
                        Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Email:</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="signin-input"
                                    style={{ padding: "0.75rem 1rem 0.75rem 2.8rem" }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            {emailError && <div className="error-message">{emailError}</div>}
                        </div>

                        <button type="submit" className="signin-button">
                            Kirim Link Reset Password
                        </button>

                        <div className="back-to-login" onClick={() => navigate('/signin')}>
                            ← Kembali ke Login
                        </div>

                        {resent && (
                            <div className="info-message">
                                Jika Anda belum menerima email, silakan cek folder Spam atau Sampah.
                            </div>
                        )}

                        <div className="resend-container">
                            <span>Tidak menerima email? </span>
                            <button
                                type="button"
                                className="resend-link"
                                disabled={resendDisabled}
                                onClick={handleResend}
                            >
                                Kirim Ulang
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
