import { useRouter } from 'expo-router';
import { useNavigationStore } from '../state/navigation';

export function useCustomRouter() {
  const router = useRouter();
  const { push: pushToHistory } = useNavigationStore();

  const push = (path: string) => {
    pushToHistory(path);
    router.push(path);
  };

  const replace = (path: string) => {
    pushToHistory(path); // Even with replace, we add to history for back button logic
    router.replace(path);
  };

  return {
    ...router,
    push,
    replace,
  };
}
