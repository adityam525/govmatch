import Card from '@/components/ui/Card';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <Card padding="lg" className="w-full max-w-sm">
      <ForgotPasswordForm />
    </Card>
  );
}
