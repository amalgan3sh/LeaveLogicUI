import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    // For admin, username is used; for others, treat as email
    const loginResult = await login(username, password);
    if (loginResult.success) {
      toast.success('Login successful! Welcome back.');
      // Get user from localStorage (set by AuthContext)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      let role = user.role ? user.role.toLowerCase() : '';
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'manager') {
        navigate('/manager');
      } else if (role === 'employee') {
        navigate('/employee');
      } else {
        navigate('/');
      }
    } else {
      setError(loginResult.error || 'Invalid username or password');
      toast.error(loginResult.error || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-md relative z-10 shadow-2xl">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="mb-4 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Leave Logic</CardTitle>
          <CardDescription className="text-base">Smart Leave Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-input-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-input-background"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
              Sign In
            </Button>
          </form>
          <div className="mt-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border border-indigo-100 dark:border-indigo-800">
            <p className="text-muted-foreground text-center mb-3 font-medium">Demo Credentials</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 rounded-lg">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Admin:</span>
                <span className="text-muted-foreground">admin / admin</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 rounded-lg">
                <span className="font-semibold text-purple-600 dark:text-purple-400">Manager:</span>
                <span className="text-muted-foreground">manager / manager</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white dark:bg-slate-800 rounded-lg">
                <span className="font-semibold text-pink-600 dark:text-pink-400">Employee:</span>
                <span className="text-muted-foreground">employee / employee</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
