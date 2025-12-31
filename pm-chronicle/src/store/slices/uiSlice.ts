/**
 * UIスライス - UI状態管理
 */

export type ScreenType = 'TITLE' | 'SETUP' | 'DASHBOARD' | 'PM_COCKPIT' | 'CHARACTER_LIST' | 'BATTLE' | 'REPORT';
export type ModalType = 'CHARACTER_DETAIL' | 'SAVE_LOAD' | 'SETTINGS' | 'VACATION' | 'NEGOTIATION' | null;

export interface UISlice {
    // 状態
    currentScreen: ScreenType;
    activeModal: ModalType;
    modalData: unknown;
    isLoading: boolean;
    loadingMessage: string;
    notifications: { id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }[];
    sidebarOpen: boolean;

    // アクション
    navigateTo: (screen: ScreenType) => void;
    openModal: (modal: ModalType, data?: unknown) => void;
    closeModal: () => void;
    setLoading: (loading: boolean, message?: string) => void;
    addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
    removeNotification: (id: string) => void;
    toggleSidebar: () => void;
}

export const createUISlice = (set: (fn: (state: UISlice) => Partial<UISlice>) => void): UISlice => ({
    // 初期状態
    currentScreen: 'TITLE',
    activeModal: null,
    modalData: null,
    isLoading: false,
    loadingMessage: '',
    notifications: [],
    sidebarOpen: true,

    // アクション
    navigateTo: (screen) => set(() => ({
        currentScreen: screen,
    })),

    openModal: (modal, data = null) => set(() => ({
        activeModal: modal,
        modalData: data,
    })),

    closeModal: () => set(() => ({
        activeModal: null,
        modalData: null,
    })),

    setLoading: (loading, message = '') => set(() => ({
        isLoading: loading,
        loadingMessage: message,
    })),

    addNotification: (message, type = 'info') => set((state) => ({
        notifications: [
            ...state.notifications,
            {
                id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                message,
                type,
            },
        ],
    })),

    removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
    })),

    toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen,
    })),
});
