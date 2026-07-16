import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from '@/lib/queryClient';
import AppRouter from '@/routes/AppRouter';
import { useUiStore } from '@/store/uiStore';
import { useQueueStore } from '@/store/queueStore';

function App() {
  const theme = useUiStore((s) => s.theme);
  const startAutoSimulation = useQueueStore((s) => s.startAutoSimulation);
  const stopAutoSimulation = useQueueStore((s) => s.stopAutoSimulation);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    // Drives the frontend-only real-time simulation (walk-in tokens appearing
    // over time). TODO(backend): remove once server pushes real queue events.
    startAutoSimulation();
    return () => stopAutoSimulation();
  }, [startAutoSimulation, stopAutoSimulation]);

  return (
    <QueryClientProvider client={queryClient}>
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
