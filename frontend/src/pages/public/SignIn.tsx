import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type SignInForm = z.infer<typeof signInSchema>;

export function SignIn() {
  const { loginMutation, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const { register, handleSubmit, formState: { errors } } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role.toLowerCase();
      
      // Determine if the 'from' path is safe for this role
      let isPathAllowed = true;
      if (from) {
        if (from.startsWith('/admin') && !['admin', 'receptionist'].includes(role)) isPathAllowed = false;
        if (from.startsWith('/doctor') && role !== 'doctor') isPathAllowed = false;
        if (from.startsWith('/nurse') && role !== 'nurse') isPathAllowed = false;
        if (from.startsWith('/patient') && role !== 'patient') isPathAllowed = false;
      }

      if (from && isPathAllowed && from !== '/dashboard' && from !== '/sign-in' && from !== '/unauthorized') {
        navigate(from, { replace: true });
      } else {
        switch (role) {
          case 'admin':
          case 'receptionist':
            navigate('/admin/dashboard', { replace: true });
            break;
          case 'doctor':
            navigate('/doctor/dashboard', { replace: true });
            break;
          case 'nurse':
            navigate('/nurse/dashboard', { replace: true });
            break;
          case 'patient':
            navigate('/patient/dashboard', { replace: true });
            break;
          default:
            navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const onSubmit = (data: SignInForm) => {
    loginMutation.mutate(data, {
      onSuccess: (result) => {
        const userData = result?.data?.data?.user;
        if (userData) {
          toast.success(`Welcome back, ${userData.firstName}!`);
        }
        // Navigation is handled by the useEffect above
      },
      onError: (error: any) => {
        const message = error.response?.data?.error?.message || 'Invalid email or password';
        toast.error(message);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl bg-primary mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <CardTitle className="text-2xl">Network Control Center</CardTitle>
          <p className="text-muted-foreground text-sm">Monitor hospital infrastructure and system performance</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@hospital.com" {...register('email')} />
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput id="password" {...register('password')} />
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{' '}
              <Link to="/sign-up" className="text-primary hover:underline font-medium">Create an account</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
