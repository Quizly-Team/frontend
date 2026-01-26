import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { authUtils } from '@/lib/auth';
import { getUserInfo, type ReadUserInfoResponse } from '@/api/account';

type UserContextType = {
  userInfo: ReadUserInfoResponse | null;
  isLoading: boolean;
  refreshUserInfo: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<ReadUserInfoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태를 true로 설정
  const userInfoRef = useRef<ReadUserInfoResponse | null>(null);
  const isLoadingRef = useRef<boolean>(true);

  // ref를 최신 상태로 유지
  useEffect(() => {
    userInfoRef.current = userInfo;
    isLoadingRef.current = isLoading;
  }, [userInfo, isLoading]);

  const refreshUserInfo = async () => {
    const isAuthenticated = authUtils.isAuthenticated();
    if (!isAuthenticated) {
      setUserInfo(null);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getUserInfo();
      setUserInfo(data);
    } catch (err) {
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 마운트 시 및 인증 상태 변경 감지
  useEffect(() => {
    const checkAuthAndRefresh = () => {
      const isAuthenticated = authUtils.isAuthenticated();
      if (isAuthenticated) {
        refreshUserInfo();
      } else {
        setUserInfo(null);
        setIsLoading(false); // 인증되지 않은 경우 로딩 완료
      }
    };

    // 초기 조회
    checkAuthAndRefresh();

    // localStorage 변경 감지를 위한 커스텀 이벤트 리스너
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        checkAuthAndRefresh();
      }
    };

    // 커스텀 이벤트 리스너 (같은 탭에서의 localStorage 변경 감지)
    const handleCustomStorageChange = () => {
      checkAuthAndRefresh();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleCustomStorageChange);

    // 주기적으로 인증 상태 확인 (로그인 후 갱신을 위해)
    const interval = setInterval(() => {
      const currentAuth = authUtils.isAuthenticated();
      const hasUserInfo = userInfoRef.current !== null;
      const isCurrentlyLoading = isLoadingRef.current;
      
      // 인증되었는데 유저 정보가 없고 로딩 중이 아니면 조회
      if (currentAuth && !hasUserInfo && !isCurrentlyLoading) {
        checkAuthAndRefresh();
      }
      // 인증되지 않았는데 유저 정보가 있으면 제거
      else if (!currentAuth && hasUserInfo) {
        setUserInfo(null);
        setIsLoading(false);
      }
    }, 1000); // 1초마다 확인

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleCustomStorageChange);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 초기 마운트 시에만 실행

  return (
    <UserContext.Provider value={{ userInfo, isLoading, refreshUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

