import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
      console.error('유저 정보 조회 실패:', err);
      setUserInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 마운트 시 유저 정보 조회
  useEffect(() => {
    const isAuthenticated = authUtils.isAuthenticated();
    if (isAuthenticated) {
      refreshUserInfo();
    } else {
      setUserInfo(null);
      setIsLoading(false); // 인증되지 않은 경우 로딩 완료
    }
  }, []);

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

