import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import Squares from '@/components/Squares';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/lib/supabaseClient';

const AspireExamineLogo = () => (
  <svg className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: '#1E90FF' }} fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path
      clipRule="evenodd"
      d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const LoginPage = () => {
  const { theme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [signupStage, setSignupStage] = useState('enterDetails'); // 'enterDetails' | 'enterOtp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('email');
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpExpiresAt) {
      timer = setInterval(() => {
        if (otpExpiresAt < Date.now()) {
          setOtpExpiresAt(null);
        }
        // Force re-render to update countdown
        setOtpExpiresAt(otpExpiresAt => otpExpiresAt ? otpExpiresAt - 1000 : null);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpExpiresAt]);

  const handleEmailSignUp = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setEmailConfirmationSent(true);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      // The onAuthStateChange listener in App.tsx will handle the login
    }
    setLoading(false);
  };

  const handlePhoneSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
    if (error) {
      setError(error.message);
    } else {
      setSignupStage('enterOtp');
      setOtpExpiresAt(Date.now() + 600000); // 10 minutes
      setResendDisabled(true);
      setTimeout(() => setResendDisabled(false), 600000);
    }
    setLoading(false);
  };

  const handleOtpVerify = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({ phone: `+91${phone}`, token: otp, type: 'sms' });

    if (error) {
      setError(error.message);
    } else {
      // The onAuthStateChange listener in App.tsx will handle the login
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    setError(null);
    if (!email) {
      setError("Please enter your email address to reset your password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) {
      setError(error.message);
    } else {
      alert("Password reset link has been sent to your email.");
    }
    setLoading(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeTab === 'email') {
      if (isLogin) {
        handleEmailLogin();
      } else {
        handleEmailSignUp();
      }
    } else {
      if (signupStage === 'enterDetails') {
        handlePhoneSignIn();
      } else {
        handleOtpVerify();
      }
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setSignupStage('enterDetails');
    setError(null);
    setEmailConfirmationSent(false);
  };

  return (
    <div className="relative flex flex-col min-h-screen font-sans">
      {/* Animated Squares Background */}
      <div className="absolute inset-0 z-0">
        <Squares
          borderColor={theme === 'dark' ? '#374151' : '#E5E7EB'}
          hoverFillColor={theme === 'dark' ? '#4B5563' : '#D1D5DB'}
          speed={0.5}
          squareSize={50}
        />
      </div>
      <header className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex items-center justify-between h-14 sm:h-16">
          <a className="flex items-center gap-2 sm:gap-3" href="#">
            <AspireExamineLogo />
            <h1 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: '#1E90FF' }}>AspireExamine</h1>
          </a>
          <div>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="relative z-10 flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-sm mx-auto rounded-2xl border-0 bg-card pointer-events-auto" style={{ boxShadow: '0 10px 15px -3px rgba(30, 144, 255, 0.1), 0 4px 6px -2px rgba(30, 144, 255, 0.05)' }}>
          <CardHeader className="text-center p-4">
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">{isLogin ? 'Welcome Back' : 'Create an Account'}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">{isLogin ? 'Login to access your dashboard' : 'Sign up to get started'}</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {error && <p className="text-red-500 text-xs text-center pb-2">{error}</p>}
            {emailConfirmationSent ? (
              <div className="text-center space-y-4">
                <p>A confirmation email has been sent to your email address. Please confirm it to complete account creation.</p>
                <Button onClick={() => setEmailConfirmationSent(false)}>Back to Login</Button>
              </div>
            ) : signupStage === 'enterOtp' && activeTab === 'phone' ? (
              <form onSubmit={(e) => { e.preventDefault(); handleOtpVerify(); }} className="space-y-4 pt-2">
                <div className="space-y-2 text-center">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <p className="text-xs text-muted-foreground">An OTP has been sent to your phone.</p>
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} id="otp" value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {otpExpiresAt && <p className="text-xs text-muted-foreground">OTP expires in {Math.round((otpExpiresAt - Date.now()) / 1000)}s</p>}
                </div>
                <div>
                  <Button className="w-full h-10 sm:h-11 text-sm sm:text-base font-semibold text-white pointer-events-auto" style={{ backgroundColor: '#1E90FF' }} type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                  </Button>
                  <Button variant="link" onClick={handlePhoneSignIn} disabled={resendDisabled} className="w-full mt-2">Resend OTP</Button>
                </div>
              </form>
            ) : (
              <Tabs defaultValue="email" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="phone">Phone</TabsTrigger>
                </TabsList>
                <TabsContent value="email">
                  <form onSubmit={handleSubmit} className="space-y-2 pt-2">
                    <div className="space-y-2">
                      {isLogin ? (
                        <>
                          <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" placeholder="Enter your email" required type="email" className="h-10 sm:h-11 pointer-events-auto" value={email} onChange={(e) => setEmail(e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="password">Password</Label>
                              <Button variant="link" type="button" className="p-0 h-auto text-xs" onClick={handleForgotPassword}>
                                Forgot Password?
                              </Button>
                            </div>
                            <div className="relative">
                              <Input
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                required
                                type={showPassword ? 'text' : 'password'}
                                className="h-10 sm:h-11 pointer-events-auto pr-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" placeholder="Enter your username" required type="text" className="h-10 sm:h-11 pointer-events-auto" value={username} onChange={(e) => setUsername(e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" placeholder="Enter your email" required type="email" className="h-10 sm:h-11 pointer-events-auto" value={email} onChange={(e) => setEmail(e.target.value)} />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                              <Input
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                required
                                type={showPassword ? 'text' : 'password'}
                                className="h-10 sm:h-11 pointer-events-auto pr-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div>
                      <Button className="w-full h-10 sm:h-11 text-sm sm:text-base font-semibold text-white pointer-events-auto" style={{ backgroundColor: '#1E90FF' }} type="submit" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')} <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                <TabsContent value="phone">
                  <form onSubmit={handleSubmit} className="space-y-2 pt-2">
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm h-10 sm:h-11 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400">
                            +91
                          </span>
                          <Input id="phone" name="phone" placeholder="Enter your phone number" required type="tel" className="rounded-l-none h-10 sm:h-11 pointer-events-auto" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button className="w-full h-10 sm:h-11 text-sm sm:text-base font-semibold text-white pointer-events-auto" style={{ backgroundColor: '#1E90FF' }} type="submit" disabled={loading}>
                        {loading ? 'Sending...' : 'Send OTP'}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            )}
            <div className="mt-2 text-center text-sm">
              <span onClick={toggleForm} className="cursor-pointer text-muted-foreground hover:text-primary pointer-events-auto">
                {isLogin ? 'Don’t have an account? Create one / Signup' : 'Already have an account? Login'}
              </span>
            </div>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-2 pointer-events-auto" onClick={handleGoogleLogin}>
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" /><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.251,44,34,44,30C44,22.659,43.862,21.35,43.611,20.083z" /></svg>
                Continue with Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};