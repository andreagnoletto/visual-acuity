type RemoteAction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'OK' | 'BACK';

interface UseRemoteNavigationOptions {
  restoreFocus?: boolean;
  onAction?: (action: RemoteAction) => boolean | void;
}

const FOCUS_STORAGE_KEY = 'last-focus-';

export function useRemoteNavigation(options: UseRemoteNavigationOptions = {}) {
  const { restoreFocus: shouldRestoreFocus = false, onAction } = options;
  const currentRoute = useRoute();
  const savedFocusIndex = ref<number | null>(null);

  const normalizeRemoteKey = (event: KeyboardEvent): RemoteAction | null => {
    const key = event.key;
    const keyCode = event.keyCode;

    // Prefer event.key when available
    if (key) {
      switch (key) {
        case 'ArrowUp':
          return 'UP';
        case 'ArrowDown':
          return 'DOWN';
        case 'ArrowLeft':
          return 'LEFT';
        case 'ArrowRight':
          return 'RIGHT';
        case 'Enter':
        case 'NumpadEnter':
        case ' ':
        case 'OK':
        case 'Select':
          return 'OK';
        case 'Escape':
        case 'Backspace':
          return 'BACK';
      }
    }

    // Fallback to keyCode for TV platforms
    switch (keyCode) {
      // Android TV: OK=13/66/23, BACK=4
      case 13:
      case 66:
      case 23:
        return 'OK';
      case 4:
        return 'BACK';
      // Samsung Tizen: OK=13, BACK=10009
      case 10009:
        return 'BACK';
      // LG webOS: OK=13, BACK=461
      case 461:
        return 'BACK';
      // Arrow keys (keyCode fallback)
      case 38:
        return 'UP';
      case 40:
        return 'DOWN';
      case 37:
        return 'LEFT';
      case 39:
        return 'RIGHT';
    }

    return null;
  };

  const saveFocus = (index: number) => {
    if (typeof window === 'undefined') return;
    const storageKey = `${FOCUS_STORAGE_KEY}${currentRoute.path}`;
    try {
      localStorage.setItem(storageKey, String(index));
      savedFocusIndex.value = index;
    } catch {
      // Ignore storage errors
    }
  };

  const restoreFocusState = () => {
    if (typeof window === 'undefined' || !shouldRestoreFocus) return;
    const storageKey = `${FOCUS_STORAGE_KEY}${currentRoute.path}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) {
        savedFocusIndex.value = parseInt(saved, 10);
      }
    } catch {
      // Ignore storage errors
    }
  };

  // Global keyboard handler for onAction callback
  if (onAction && typeof window !== 'undefined') {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const action = normalizeRemoteKey(event);
      if (action) {
        const result = onAction(action);
        if (result === false) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    };

    onMounted(() => {
      window.addEventListener('keydown', handleGlobalKeyDown);
      if (shouldRestoreFocus) {
        restoreFocusState();
      }
    });

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    });
  } else if (shouldRestoreFocus && typeof window !== 'undefined') {
    onMounted(() => {
      restoreFocusState();
    });
  }

  return {
    normalizeRemoteKey,
    saveFocus,
    restoreFocus: restoreFocusState,
    savedFocusIndex: readonly(savedFocusIndex)
  };
}

