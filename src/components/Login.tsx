import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { signInWithGoogle, loginUser } from './authService'; // assume these methods are implemented in authService
import { Button, Input, Spinner, Text, Link } from 'cosmic-observatory-ui'; // assuming these components exist

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const history = useHistory();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await loginUser(email, password);
            history.push('/dashboard'); // redirect to dashboard on success
        } catch (error) {
            console.error('Login failed', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signInWithGoogle();
            history.push('/dashboard'); // redirect to dashboard on success
        } catch (error) {
            console.error('Google Sign-In failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                />
                <label>
                    <input type="checkbox" onChange={() => setShowPassword(!showPassword)} />
                    Show Password
                </label>
                <Button type="submit" disabled={loading}>
                    {loading ? <Spinner /> : 'Login'}
                </Button>
                <Link to="/forgot-password">Forgot Password?</Link>
                <Button onClick={handleGoogleSignIn}>Sign in with Google</Button>
            </form>
        </div>
    );
};

export default Login;