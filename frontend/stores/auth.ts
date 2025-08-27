// stores/auth.ts
import { defineStore } from 'pinia';
import { useRuntimeConfig, useCookie } from '#app'; 

interface User {
  id: number;
  login_id: string;
  email: string;
  username?: string | null;
  profile_image_url?: string | null;
  phone_number?: string | null;
  address?: string | null;
  is_social_user?: boolean;
  isAdmin: boolean; 
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: null,
    user: null,
    isLoggedIn: false,
    isAdmin: false,
  }),

  getters: {
    isAuthenticated: (state) => state.isLoggedIn,
    currentUser: (state) => state.user,
    isCurrentUserAdmin: (state) => state.isAdmin,
  },

  actions: {
    async login(loginId: string, password: string) {
      const config = useRuntimeConfig();
      try {
        const response: any = await $fetch(`${config.public.apiBaseUrl}/auth/login`, {
          method: 'POST',
          body: { login_id: loginId, password: password },
        });

        if (response.success && response.token && response.user) {
          this.token = response.token;
          this.user = {
            ...response.user,
            isAdmin: response.user.isAdmin || false
          };
          this.isLoggedIn = true;
          this.isAdmin = this.user.isAdmin;

          const tokenCookie = useCookie('auth_token');
          const userCookie = useCookie('auth_user');

          tokenCookie.value = response.token;
          userCookie.value = encodeURIComponent(JSON.stringify(this.user));

          return { success: true, message: response.message };
        } else {
          this.logout();
          return { success: false, message: response.message || '로그인 실패' };
        }
      } catch (error: any) {
        this.logout(); 
        console.error('로그인 에러:', error);
        return { success: false, message: error.data?.message || error.message || '서버 오류 발생' };
      }
    },

    async logout() {
      this.token = null;
      this.user = null;
      this.isLoggedIn = false;
      this.isAdmin = false;

      const tokenCookie = useCookie('auth_token');
      const userCookie = useCookie('auth_user');
      tokenCookie.value = null; 
      userCookie.value = null; 

      console.log('[Auth Store] Logged out. Cookies cleared.');
    },

    async updateUserProfile(formData: FormData | Partial<User>) {
      const config = useRuntimeConfig();
      if (!this.token) {
        console.error('인증 토큰이 없습니다. 로그인 상태가 아닙니다.');
        throw new Error('Not authenticated');
      }

      try {
        const headers: HeadersInit = {
          'Authorization': `Bearer ${this.token}`,
        };

        let requestBody: FormData | Partial<User>;

        if (formData instanceof FormData) {
          requestBody = formData;
        } else {
          requestBody = formData;
          headers['Content-Type'] = 'application/json';
        }

        // 수정된 부분: URL 경로를 '/users/profile' -> '/auth/profile'로 변경
        const response: any = await $fetch(`${config.public.apiBaseUrl}/auth/profile`, {
          method: 'PUT',
          headers: headers,
          body: requestBody,
        });

        if (response.success && response.user) {
          this.updateUser(response.user);
          return { success: true, message: response.message || '프로필 업데이트 성공' };
        } else {
          throw new Error(response.message || '프로필 업데이트 실패');
        }
      } catch (error: any) {
        console.error('프로필 업데이트 에러:', error);
        throw new Error(error.data?.message || error.message || '서버 오류 발생');
      }
    },

    updateUser(updatedUser: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...updatedUser };
        if (typeof updatedUser.isAdmin === 'boolean') {
          this.isAdmin = updatedUser.isAdmin;
        } else if (this.user.hasOwnProperty('isAdmin')) {
          this.isAdmin = this.user.isAdmin;
        }

        const userCookie = useCookie('auth_user');
        userCookie.value = encodeURIComponent(JSON.stringify(this.user));
      }
    },

    initializeAuth() {
      const tokenCookie = useCookie<string | null>('auth_token');
      const userCookie = useCookie<string | null>('auth_user');

      const token = tokenCookie.value;
      const userDataString = userCookie.value;

      console.log('[Auth Store] Initialize Auth:', { hasToken: !!token, hasUserData: !!userDataString });

      if (token && userDataString) {
        try {
          const parsedUser: User = JSON.parse(decodeURIComponent(userDataString));

          this.token = token;
          this.user = parsedUser;
          this.isLoggedIn = true;
          this.isAdmin = parsedUser.isAdmin || false; 

          console.log('✅ Auth Store Hydrated from cookies. LoggedIn:', this.isLoggedIn, 'Admin:', this.isAdmin);
        } catch (e) {
          console.error('[Auth Store] Failed to parse user data from cookie:', e);
          this.logout(); 
        }
      } else {
        if (this.isLoggedIn || this.isAdmin) {
          console.log('[Auth Store] No token or user data found in cookies. Clearing auth state.');
        }
        this.logout();
      }
    },
  },
});
