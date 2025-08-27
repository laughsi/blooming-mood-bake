<template>
  <div class="contact-page">
    <section class="w-full px-4 py-12">
      <h1 class="text-4xl md:text-5xl font-bold text-center mb-10 text-primary">문의 및 오시는 길</h1>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        <div class="bg-gray-100 p-8 rounded-xl shadow-custom-md">
          <h2 class="text-3xl font-semibold text-secondary mb-6">문의하기</h2>
          <form @submit.prevent="submitContact">
            <div class="mb-6">
              <label for="contactName" class="block text-textDark text-sm font-bold mb-2">이름</label>
              <BaseInput id="contactName" v-model="contactForm.name" placeholder="이름을 입력해주세요" required />
            </div>

            <div class="mb-6">
              <label for="contactEmail" class="block text-textDark text-sm font-bold mb-2">이메일</label>
              <BaseInput id="contactEmail" v-model="contactForm.email" type="email" placeholder="email@example.com" required />
            </div>

            <div class="mb-6">
              <label for="contactMessage" class="block text-textDark text-sm font-bold mb-2">메시지</label>
              <BaseTextarea id="contactMessage" v-model="contactForm.message" rows="6" placeholder="문의하실 내용을 입력해주세요." required></BaseTextarea>
            </div>

            <div class="text-center">
              <BaseButton type="submit" variant="primary" :disabled="isSending">
                {{ isSending ? '보내는 중...' : '메시지 보내기' }}
              </BaseButton>
            </div>
          </form>
          <p v-if="contactMessage" :class="{'text-green-600': isContactSuccess, 'text-red-600': !isContactSuccess}" class="mt-6 text-center font-semibold">
            {{ contactMessage }}
          </p>
        </div>

        <div class="bg-gray-100 p-8 rounded-xl shadow-custom-md">
          <h2 class="text-3xl font-semibold text-secondary mb-6">카페 정보</h2>
          <ul class="text-lg text-textDark space-y-4">
            <li><span class="font-bold">주소:</span> 울진군 북면 부구리 231-8, 블루밍무드베이킹</li>
            <li><span class="font-bold">전화:</span> 02-8937-2752</li>
            <li><span class="font-bold">이메일:</span> laughsi@naver.com</li>
            <li><span class="font-bold">영업시간:</span> 매일 오전 8시 - 오후 10시 (Last Order 9시 30분)</li>
          </ul>

          <h3 class="text-2xl font-semibold text-secondary mt-8 mb-4">오시는 길</h3>
          <div class="w-full h-64 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
            <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d668.9248010510059!2d129.3724832683469!3d37.106056998275925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sko!2skr!4v1752817100820!5m2!1sko!2skr"
                    width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseTextarea from '@/components/ui/BaseTextarea.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const contactForm = reactive({
  name: '',
  email: '',
  message: '',
});

const isSending = ref(false);
const contactMessage = ref('');
const isContactSuccess = ref(false);

const submitContact = async () => {
  isSending.value = true;
  contactMessage.value = '';
  isContactSuccess.value = false;

  try {
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    if (Math.random() > 0.1) {
      isContactSuccess.value = true;
      contactMessage.value = '문의 메시지가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.';
      Object.assign(contactForm, { name: '', email: '', message: '' });
    } else {
      isContactSuccess.value = false;
      contactMessage.value = '메시지 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }
  } catch (error) {
    isContactSuccess.value = false;
    contactMessage.value = '네트워크 오류가 발생했습니다. 관리자에게 문의해주세요.';
    console.error('Contact form submission error:', error);
  } finally {
    isSending.value = false;
  }
};

useHead({
  title: '문의 및 오시는 길',
});
</script>

<style scoped>
</style>