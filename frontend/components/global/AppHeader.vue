<template>
  <header class="bg-white shadow-md py-6 sticky top-0 z-50">
    <div class="w-full flex items-center justify-between px-4">
      <NuxtLink to="/" class="flex items-center">
        <span class="text-3xl font-script text-primary whitespace-nowrap">Blooming Mood <span class="font-bold">Bake</span></span>
      </NuxtLink>

      <nav class="hidden md:block">
        <ul class="flex flex-nowrap space-x-10 text-xl font-semibold text-gray-600">
          <li><NuxtLink to="/menu" active-class="text-primary" class="whitespace-nowrap flex-shrink-0">Menu</NuxtLink></li>
          <li><NuxtLink to="/reservation" active-class="text-primary" class="whitespace-nowrap flex-shrink-0">Reservation</NuxtLink></li>
          <li><NuxtLink to="/about" active-class="text-primary" class="whitespace-nowrap flex-shrink-0">About Us</NuxtLink></li>
          <li><NuxtLink to="/contact" active-class="text-primary" class="whitespace-nowrap flex-shrink-0">Community</NuxtLink></li>
        </ul>
      </nav>

      <div class="flex items-center space-x-4">
        <div v-if="isLoggedIn" class="hidden md:flex items-center flex-nowrap md:space-x-4 lg:space-x-6">
          <span class="mr-2">{{ userName }} 님</span>
        </div>

        <div class="hidden md:flex items-center flex-nowrap md:space-x-4 lg:space-x-6"> 
          <ClientOnly>
            <template v-if="isLoggedIn">
              <button @click="logout" class="text-textDark hover:text-primary transition-colors whitespace-nowrap flex items-center flex-shrink-0">
                <Icon name="lucide:log-out" class="w-5 h-5 mr-1" />
                Logout
              </button>
              <NuxtLink to="/mypage" class="text-textDark hover:text-primary transition-colors whitespace-nowrap flex items-center flex-shrink-0">
                <Icon name="lucide:user" class="w-5 h-5 mr-1" />
                Mypage
              </NuxtLink>
              <NuxtLink to="/order" class="text-textDark hover:text-primary transition-colors whitespace-nowrap flex items-center flex-shrink-0">
                <Icon name="lucide:clipboard" class="w-5 h-5 mr-1" />
                Order
              </NuxtLink>
              <NuxtLink v-if="isAdmin" to="/admin" class="text-textDark hover:text-primary transition-colors whitespace-nowrap flex items-center flex-shrink-0">
                <Icon name="lucide:settings" class="w-5 h-5 mr-1" />
                Manager
              </NuxtLink>
              <NuxtLink to="/cart" class="text-textDark hover:text-primary transition-colors flex items-center flex-shrink-0 whitespace-nowrap">
                <Icon name="lucide:shopping-cart" class="w-6 h-6 mr-1" />
              </NuxtLink>
            </template>
            
            <template v-else>
              <NuxtLink to="/login" class="text-textDark hover:text-primary transition-colors whitespace-nowrap flex items-center flex-shrink-0">
                <Icon name="lucide:log-in" class="w-5 h-5 mr-1" />
                Login
              </NuxtLink>
              <NuxtLink to="/order" class="text-textDark hover:text-primary transition-colors whitespace-nowrap flex items-center flex-shrink-0">
                <Icon name="lucide:clipboard" class="w-5 h-5 mr-1" />
                Order
              </NuxtLink>
              <NuxtLink to="/cart" class="text-textDark hover:text-primary transition-colors flex items-center flex-shrink-0 whitespace-nowrap">
                <Icon name="lucide:shopping-cart" class="w-6 h-6 mr-1" />
              </NuxtLink>
            </template>
          </ClientOnly>
          <button class="text-textDark hover:text-primary transition-colors flex-shrink-0">
            <Icon name="lucide:search" class="w-6 h-6" />
          </button>
        </div>
      </div>

      <button class="md:hidden text-textDark text-2xl" @click="toggleMobileMenu">
        <Icon v-if="!isMobileMenuOpen" name="lucide:menu" class="w-7 h-7" />
        <Icon v-else name="lucide:x" class="w-7 h-7" />
      </button>
    </div>

    <Transition name="slide-right">
      <div v-if="isMobileMenuOpen" class="md:hidden fixed top-0 right-0 h-full w-3/4 max-w-sm bg-white shadow-lg p-6 z-40 flex flex-col items-start space-y-6 overflow-y-auto">
        <button @click="closeMobileMenu" class="absolute top-4 right-4 text-textDark">
          <Icon name="lucide:x" class="w-8 h-8" />
        </button>

        <NuxtLink to="/menu" class="mobile-nav-link" @click="closeMobileMenu">Menu</NuxtLink>
        <NuxtLink to="/reservation" class="mobile-nav-link" @click="closeMobileMenu">Reservation</NuxtLink>
        <NuxtLink to="/about" class="mobile-nav-link" @click="closeMobileMenu">About Us</NuxtLink>
        <NuxtLink to="/contact" class="mobile-nav-link" @click="closeMobileMenu">Community</NuxtLink>
        
        <div class="w-full h-px bg-gray-200 my-4"></div>

        <ClientOnly>
          <template v-if="isLoggedIn">
            <div class="w-full">
              <span class="text-xl font-semibold text-textDark">{{ userName }}님, 안녕하세요!</span>
            </div>
            <button @click="logoutAndCloseMenu" class="mobile-nav-link flex items-center">
              <Icon name="lucide:log-out" class="w-5 h-5 mr-1" />
              Logout
            </button>
            <NuxtLink to="/mypage" class="mobile-nav-link flex items-center" @click="closeMobileMenu">
              <Icon name="lucide:user" class="w-5 h-5 mr-1" />
              Mypage
            </NuxtLink>
            <NuxtLink to="/order" class="mobile-nav-link flex items-center" @click="closeMobileMenu">
              <Icon name="lucide:clipboard" class="w-5 h-5 mr-1" />
              Order
            </NuxtLink>
            <NuxtLink v-if="isAdmin" to="/admin" class="mobile-nav-link flex items-center" @click="closeMobileMenu">
              <Icon name="lucide:settings" class="w-5 h-5 mr-1" />
              Manager
            </NuxtLink>
            <NuxtLink to="/cart" class="mobile-nav-link flex items-center" @click="closeMobileMenu">
              <Icon name="lucide:shopping-cart" class="w-6 h-6 mr-1" />
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="mobile-nav-link flex items-center" @click="closeMobileMenu">
              <Icon name="lucide:log-in" class="w-5 h-5 mr-1" />
              Login
            </NuxtLink>
            <NuxtLink to="/order" class="mobile-nav-link flex items-center" @click="closeMobileMenu">
              <Icon name="lucide:clipboard" class="w-5 h-5 mr-1" />
              Order
            </NuxtLink>
            <NuxtLink to="/cart" class="mobile-nav-link flex items-center" @click="closeMobileMenu">
              <Icon name="lucide:shopping-cart" class="w-6 h-6 mr-1" />
            </NuxtLink>
          </template>
        </ClientOnly>
      </div>
    </Transition>

    <Transition name="fade-overlay">
      <div v-if="isMobileMenuOpen" @click="closeMobileMenu" class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"></div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);
const isAdmin = computed(() => authStore.isAdmin);
const userName = computed(() => authStore.user?.username || '');

const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

watch(isMobileMenuOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

const logout = async () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    await authStore.logout();
    alert('로그아웃 되었습니다.');
    router.push('/');
  }
};

const logoutAndCloseMenu = () => {
  logout();
  closeMobileMenu();
};
</script>

<style scoped>
.font-script {
  font-family: 'Dancing Script', cursive;
}
.font-bold {
  font-weight: 700;
}

nav ul li a {
  @apply hover:text-primary transition-colors duration-200;
}

.mobile-nav-link {
  @apply text-xl font-semibold text-textDark hover:text-primary transition-colors duration-200 w-full text-left py-2;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}

.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.3s ease-out;
}
.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}
</style>