import toast from 'react-hot-toast';

/**
 * Standard toast shown after the backend triggers a Gmail send (OTP,
 * password reset code, etc.). Gmail deliveries occasionally land in
 * spam/junk for new senders, so every email-triggering action should
 * surface this same reminder instead of assuming it landed in the inbox.
 */
export function notifyEmailSent(message = 'Email sent.') {
  toast.success(`${message} If you don't see it shortly, please check your spam or junk folder.`, {
    duration: 6000,
  });
}
