import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
const healthlensLogo = '/lovable-uploads/1e18d88c-c078-42bf-bad2-30cc4d92e30e.png';
import { SignupScreen } from './SignupScreen';
export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const {
    login,
    loginWithOTP
  } = useAuth();
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome to HealthLens!');
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleSendOTP = async () => {
    setIsLoading(true);
    // Simulate OTP send
    await new Promise(resolve => setTimeout(resolve, 1000));
    setOtpSent(true);
    setIsLoading(false);
    toast.success('OTP sent to your phone!');
  };
  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await loginWithOTP(phone, otp);
      toast.success('Welcome to HealthLens!');
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showSignup) {
    return <SignupScreen onBackToLogin={() => setShowSignup(false)} />;
  }

  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto mb-4">
            <img 
              src={healthlensLogo} 
              alt="HealthLens Logo" 
              className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">HealthLens</h1>
          <p className="text-lg text-gray-600">Your Smart Health Companion</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="otp">Quick OTP</TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <Input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required className="h-12" />
                  </div>
                  <div>
                    <Input type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required className="h-12" />
                  </div>
                  <Button type="submit" className="w-full h-12" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="otp" className="space-y-4">
                <form onSubmit={handleOTPLogin} className="space-y-4">
                  <div>
                    <Input type="tel" placeholder="Enter your phone number" value={phone} onChange={e => setPhone(e.target.value)} required className="h-12" />
                  </div>
                  {!otpSent ? <Button type="button" onClick={handleSendOTP} className="w-full h-12" disabled={isLoading}>
                      {isLoading ? 'Sending...' : 'Send OTP'}
                    </Button> : <>
                      <div>
                        <Input type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} required className="h-12" maxLength={6} />
                      </div>
                      <Button type="submit" className="w-full h-12" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                      </Button>
                    </>}
                </form>
              </TabsContent>
            </Tabs>


            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                New to HealthLens?{' '}
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-semibold text-primary"
                  onClick={() => setShowSignup(true)}
                >
                  Create Account
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-500">
          Secure • Private • HIPAA Compliant
        </div>
      </div>
    </div>;
};