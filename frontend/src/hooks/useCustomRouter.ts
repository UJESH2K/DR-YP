import { useRouter } from 'expo-router';
import { useNavigationStore } from '../state/navigation';

export function useCustomRouter() {
  const router = useRouter();
  const { push: pushToHistory, goBack: goBackFromHistory } = useNavigationStore();

  const push = (path: string) => {
    pushToHistory(path);
    router.push(path);
  };

  const replace = (path: string) => {
    pushToHistory(path); // Even with replace, we add to history for back button logic
    router.replace(path);
  };

  const goBack = () => {
    const backPath = goBackFromHistory();
    if (backPath) {
      router.replace(backPath);
    } else {
      router.back();
    }
  };

  return {
    ...router,
    push,
    replace,
    goBack,
  };
}