import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Briefcase, ShieldCheck, Monitor, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_HOME_ROUTE } from '@/constants/roles';
import { cn } from '@/utils/cn';

const DEMO_ROLE_CARDS = [
  {
    role: 'citizen',
    icon: User,
    emoji: '👤',
    title: 'Citizen Demo',
    description: 'Book appointments and track queues.',
    accent: 'from-blue-500/10 to-blue-500/0 hover:border-blue-400',
    iconClass: 'text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400',
  },
  {
    role: 'staff',
    icon: Briefcase,
    emoji: '👨‍💼',
    title: 'Staff Demo',
    description: 'Manage queues and serve citizens.',
    accent: 'from-emerald-500/10 to-emerald-500/0 hover:border-emerald-400',
    iconClass: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400',
  },
  {
    role: 'admin',
    icon: ShieldCheck,
    emoji: '🛡️',
    title: 'Admin Demo',
    description: 'View analytics and manage departments.',
    accent: 'from-purple-500/10 to-purple-500/0 hover:border-purple-400',
    iconClass: 'text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-400',
  },
  {
    role: 'display',
    icon: Monitor,
    emoji: '📺',
    title: 'Display Board Demo',
    description: 'Watch live queue display screen.',
    accent: 'from-amber-500/10 to-amber-500/0 hover:border-amber-400',
    iconClass: 'text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-400',
  },
];

export default function DemoModeModal({ isOpen, onClose }) {
  const { loginDemo } = useAuth();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState(null);

  const handleSelectRole = async (role) => {
    setLoadingRole(role);
    try {
      if (role === 'display') {
        await loginDemo('display');
        onClose();
        navigate('/display');
        return;
      }

      const user = await loginDemo(role);
      toast.success(`Welcome to the ${role} demo!`);
      onClose();
      navigate(ROLE_HOME_ROUTE[user.role] || '/');
    } catch (error) {
      toast.error(error.message || 'Failed to start demo session');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Demo Role" size="lg">
      <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
        Explore the full system instantly — no account needed. Pick a role to see what that
        experience looks like.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {DEMO_ROLE_CARDS.map((card) => {
          const Icon = card.icon;
          const isLoading = loadingRole === card.role;
          return (
            <motion.button
              key={card.role}
              type="button"
              onClick={() => handleSelectRole(card.role)}
              disabled={Boolean(loadingRole)}
              whileHover={{ scale: loadingRole ? 1 : 1.02 }}
              whileTap={{ scale: loadingRole ? 1 : 0.98 }}
              className={cn(
                'group relative flex flex-col items-start gap-3 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all',
                'dark:border-gray-700 dark:bg-gray-800/60 dark:backdrop-blur-sm',
                'disabled:cursor-not-allowed disabled:opacity-60',
                card.accent,
                'bg-gradient-to-br'
              )}
            >
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', card.iconClass)}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Icon className="h-5 w-5" aria-hidden="true" />}
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-gray-50">
                  <span aria-hidden="true">{card.emoji}</span> {card.title}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{card.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <p className="mt-5 text-center text-xs text-gray-400 dark:text-gray-500">
        Demo Mode — actions are simulated. No permanent changes are made to real data.
      </p>
    </Modal>
  );
}
