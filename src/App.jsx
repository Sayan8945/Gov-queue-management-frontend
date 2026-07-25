import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import AppRouter from '@/routes/AppRouter';
import { useUiStore } from '@/store/uiStore';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import ServerWakingBanner from '@/components/shared/ServerWakingBanner';
import DemoModeBanner from '@/components/shared/DemoModeBanner';
import DemoSessionBadge from '@/components/shared/DemoSessionBadge';

// Connects the authenticated Socket.IO namespace (citizen or staff/admin)
// for the logged-in user and keeps React Query caches in sync with real
// backend events — the production replacement for the old mock timer.
// Must render as a CHILD of QueryClientProvider (not a sibling call in App)
// since useQueryClient() only sees context from an ancestor provider.
function RealtimeSync() {
  useRealtimeSync();
  return null;
}

function App() {
  const theme = useUiStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <QueryClientProvider client={queryClient}>
      <RealtimeSync />
      <ServerWakingBanner />
      <DemoModeBanner />
      <DemoSessionBadge />
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontSize: '14px' },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
