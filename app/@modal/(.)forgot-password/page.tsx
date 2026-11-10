import Modal from '@/components/auth/Modal';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordModalPage() {
  return (
    <Modal label="Reset password">
      <ForgotPasswordForm />
    </Modal>
  );
}
