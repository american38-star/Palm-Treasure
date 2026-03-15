<template>
  <div id="app" :class="{ 'rtl': currentLang === 'AR' }">
    <!-- زر تغيير اللغة -->
    <div class="circle-btn lang-btn" @click="toggleLanguageMenu">
      <i class="fas fa-globe"></i>
      <span class="lang-code">{{ currentLang }}</span>
    </div>

    <!-- زر بابلوين (سانتا) لعرض السنة الجديدة -->
    <div class="bubble-chat-btn" @click="toggleNewYearMessage">
      <div class="bubble-chat-icon">🎅🏻</div>
      <div class="bubble-notification">🎉</div>
    </div>

    <!-- زر العرض الخاص المحدود -->
    <div class="special-offer-btn" @click="toggleSpecialOffer">
      <div class="special-offer-icon">🎁</div>
      <div class="special-offer-notification">6</div>
    </div>

    <!-- نافذة بابلوين للرسالة -->
    <div v-if="showNewYearMessage" class="bubble-chat-overlay" @click="closeNewYearMessage">
      <div class="bubble-chat-window" @click.stop>
        <div class="bubble-chat-header">
          <div class="bubble-chat-title">
            <div class="bubble-avatar">🎁</div>
            <div>
              <div class="bubble-sender">Mall of the World</div>
              <div class="bubble-time">عرض خاص</div>
            </div>
          </div>
          <button class="bubble-close-btn" @click="closeNewYearMessage">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="bubble-chat-body">
          <div class="bubble-message bubble-received">
            <div class="bubble-tail"></div>
            <div class="bubble-content">
              <strong>🎉✨ عرض رأس السنة الجديد – فرصة ذهبية! ✨🎉</strong>
              <br><br>
              بمناسبة حلول رأس السنة الجديدة، يسرّ Mall of the World أن يقدّم لكم عرضًا خاصًا ومحدودًا 🎁
              <br><br>
              <strong>🔔 تفاصيل العرض:</strong><br>
              قم بدعوة 10 أشخاص جدد للتسجيل في المنصة، ويجب على كل شخص منهم القيام بشحن رصيد بقيمة 100 دولار.
              <br><br>
              <strong>🎁 المكافأة:</strong><br>
              عند استيفاء الشروط كاملة، ستحصل مباشرة على جائزة نقدية بقيمة 100 دولار 💰
              <br><br>
              <strong>📌 الشروط:</strong><br>
              • الدعوات يجب أن تكون عن طريق رابط الإحالة الخاص بك<br>
              • كل مستخدم مدعو يجب أن يشحن 100 دولار على الأقل<br>
              • العرض ساري لفترة محدودة بمناسبة رأس السنة
              <br><br>
              <strong>🚀 لا تفوّت الفرصة، ابدأ بدعوة أصدقائك الآن واحتفل بالعام الجديد مع أرباح حقيقية!</strong>
              <br><br>
              <em>🎆 Mall of the World يتمنى لكم سنة جديدة مليئة بالنجاح والربح 🎆</em>
            </div>
            <div class="bubble-time">12:00</div>
          </div>
        </div>
        
        <div class="bubble-chat-footer">
          <button class="bubble-action-btn" @click="closeNewYearMessage">
            فهمت وشكرًا! 🎯
          </button>
        </div>
      </div>
    </div>

    <!-- نافذة العرض الخاص المحدود -->
    <div v-if="showSpecialOffer" class="special-offer-overlay" @click="closeSpecialOffer">
      <div class="special-offer-window" @click.stop>
        <div class="special-offer-header">
          <div class="special-offer-title">
            <i class="fas fa-gift"></i>
            <h2>عرض خاص ومحدود</h2>
            <i class="fas fa-clock"></i>
          </div>
          <button class="special-offer-close-btn" @click="closeSpecialOffer">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="special-offer-badge">
          <span>⏳ 6 أشهر فقط ⏳</span>
        </div>
        
        <div class="special-offer-content">
          <p class="special-offer-intro">
            🎉 عرض خاص ومحدود لمدة 6 أشهر فقط! 🎉
            <br><br>
            ابدأ الآن بدعوة أصدقائك عبر رابط الإحالة الخاص بك واحصل على مكافآت مالية مميزة حسب عدد الأشخاص الذين ينضمون ويشحنون حساباتهم.
          </p>

          <div class="special-offer-levels">
            <div class="offer-level">
              <div class="level-badge level-1">المستوى الأول</div>
              <div class="level-details">
                <i class="fas fa-user-plus"></i>
                <span>10 أشخاص + شحن 100$</span>
                <i class="fas fa-arrow-left"></i>
                <span class="level-reward">🎁 100$</span>
              </div>
            </div>

            <div class="offer-level">
              <div class="level-badge level-2">المستوى الثاني</div>
              <div class="level-details">
                <i class="fas fa-user-plus"></i>
                <span>20 شخص + شحن 100$</span>
                <i class="fas fa-arrow-left"></i>
                <span class="level-reward">🎁 250$</span>
              </div>
            </div>

            <div class="offer-level">
              <div class="level-badge level-3">المستوى الثالث</div>
              <div class="level-details">
                <i class="fas fa-user-plus"></i>
                <span>30 شخص + شحن 100$</span>
                <i class="fas fa-arrow-left"></i>
                <span class="level-reward">🎁 500$</span>
              </div>
            </div>

            <div class="offer-level">
              <div class="level-badge level-4">المستوى الرابع</div>
              <div class="level-details">
                <i class="fas fa-user-plus"></i>
                <span>40 شخص + شحن 100$</span>
                <i class="fas fa-arrow-left"></i>
                <span class="level-reward">🎁 800$</span>
              </div>
            </div>

            <div class="offer-level level-special">
              <div class="level-badge level-5">المستوى الخامس</div>
              <div class="level-details">
                <i class="fas fa-user-plus"></i>
                <span>50 شخص + شحن 100$</span>
                <i class="fas fa-arrow-left"></i>
                <span class="level-reward">💎 راتب أسبوعي 700$</span>
              </div>
            </div>
          </div>

          <div class="special-offer-footer">
            <p>
              ⏳ العرض ساري لمدة 6 أشهر فقط، لذلك لا تضيع الفرصة وابدأ الآن بدعوة أصدقائك وزيادة أرباحك!
              <br><br>
              🚀 كلما زاد عدد الأشخاص الذين ينضمون من خلالك، زادت مكافآتك!
            </p>
          </div>
        </div>
        
        <div class="special-offer-footer-btn">
          <button class="special-offer-action-btn" @click="closeSpecialOffer">
            <i class="fas fa-check-circle"></i>
            فهمت وشاركت! 🎯
          </button>
        </div>
      </div>
    </div>

    <!-- زر الدعم -->
    <a class="circle-btn support-btn"
       href="https://t.me/Palm_Treasure"
       target="_blank">
      <i class="fas fa-headset"></i>
    </a>

    <!-- زر انستغرام -->
    <a class="circle-btn instagram-btn"
       href="https://www.instagram.com/palm__treasure?igsh=OXR1emp3N2k2d2Yz"
       target="_blank">
      <i class="fab fa-instagram"></i>
    </a>

    <!-- قائمة اللغات -->
    <transition name="fade">
      <div v-if="showLangMenu" class="lang-menu">
        <div class="lang-menu-header">
          <i class="fas fa-language"></i>
          <span>اختر اللغة</span>
        </div>
        <div 
          class="lang-item" 
          v-for="l in languages" 
          :key="l.code"
          @click="setLanguage(l)"
          :class="{ active: currentLang === l.code }"
        >
          <span class="lang-name">{{ l.name }}</span>
          <span class="lang-code-small">{{ l.code }}</span>
        </div>
      </div>
    </transition>

    <!-- الصفحات مع حاوية داخلية -->
    <div class="page-container">
      <router-view />
    </div>

    <!-- ⭐ شريط التنقل - تم تعديله ليظهر فوق كل شيء مع مؤشرات النقر ⭐ -->
    <div class="bottom-nav" v-if="authLoaded && showBottomNav">
      <div 
        class="nav-item" 
        @click="navigateTo('/home')"
        :class="{ active: isActive('/home') }"
      >
        <i class="fas fa-home"></i>
        <span>الرئيسية</span>
      </div>

      <div 
        class="nav-item" 
        @click="navigateTo('/vip')"
        :class="{ active: isActive('/vip') }"
      >
        <i class="fas fa-crown"></i>
        <span>VIP</span>
      </div>

      <div 
        class="nav-item" 
        @click="navigateTo('/tasks')"
        :class="{ active: isActive('/tasks') }"
      >
        <i class="fas fa-tasks"></i>
        <span>المهام</span>
      </div>

      <div 
        class="nav-item" 
        @click="navigateTo('/team')"
        :class="{ active: isActive('/team') }"
      >
        <i class="fas fa-users"></i>
        <span>الفريق</span>
      </div>

      <div 
        class="nav-item" 
        @click="navigateTo('/profile')"
        :class="{ active: isActive('/profile') }"
      >
        <i class="fas fa-user"></i>
        <span>حسابي</span>
      </div>
    </div>

    <!-- إعلان Popup فاخر -->
    <transition name="fade">
      <div id="companyAd" class="ad-overlay" v-if="showAd" @click.self="closeAd">
        <div class="ad-box">
          <div class="ad-header">
            <h2>
              <i class="fas fa-crown"></i>
              إعلان الشركة
              <i class="fas fa-crown"></i>
            </h2>
            <button class="ad-close-btn" @click="closeAd">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="ad-content">
            <div class="ad-welcome">
              <i class="fas fa-bell"></i>
              <span>🎉 عرض خاص بمناسبة رأس السنة 🎉</span>
            </div>
            
            <p>
              🎉🎉🎉🎉 مرحبا بالجميع! تأسست Mall of the world في سنغافورة في 20 أغسطس 2021 ومقرها حاليًا في منطقة الأعمال المركزية في سنغافورة. نحن شركة استثمار في التجارة الإلكترونية مع فريق تقني قوي وقوة مالية قوية.
            </p>
            
            <div class="ad-highlight">
              <i class="fas fa-handshake"></i>
              <span>شراكات عالمية مع Amazon, eBay, TikTok, Aliexpress, Alibaba, Shopee</span>
            </div>

            <div class="ad-stats">
              <div class="stat-item">
                <i class="fas fa-coins"></i>
                <span>الحد الأدنى للشحن: 12 USDT</span>
              </div>
              <div class="stat-item">
                <i class="fas fa-hand-holding-usd"></i>
                <span>الحد الأدنى للسحب: 3 USDT</span>
              </div>
            </div>

            <div class="vip-table">
              <h3>💎 خطط VIP</h3>
              <div class="vip-row" v-for="vip in vipPlans" :key="vip.level">
                <span class="vip-level">VIP {{ vip.level }}</span>
                <span class="vip-recharge">شحن {{ vip.recharge }} USDT</span>
                <span class="vip-daily">ربح {{ vip.daily }} USDT/يوم</span>
              </div>
            </div>

            <div class="commission-box">
              <h4>🤝 نظام العمولات</h4>
              <div class="commission-row">
                <span>المستوى 1: 6%</span>
                <span>المستوى 2: 2%</span>
                <span>المستوى 3: 1%</span>
              </div>
            </div>
          </div>

          <button class="ad-btn" @click="closeAd">
            <i class="fas fa-check-circle"></i>
            فهمت وشكراً!
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default {
  name: "App",

  data() {
    return {
      authLoaded: false,
      user: null,

      showLangMenu: false,
      currentLang: "AR",

      showAd: false,
      showNewYearMessage: false,
      showSpecialOffer: false,

      vipPlans: [
        { level: 1, recharge: '12', daily: '3' },
        { level: 2, recharge: '52', daily: '13' },
        { level: 3, recharge: '100', daily: '26' },
        { level: 4, recharge: '300', daily: '82' },
        { level: 5, recharge: '500', daily: '145' },
        { level: 6, recharge: '1500', daily: '479' },
        { level: 7, recharge: '3000', daily: '1078' },
        { level: 8, recharge: '5000', daily: '2000' },
        { level: 9, recharge: '10000', daily: '4546' },
        { level: 10, recharge: '30000', daily: '17699' },
        { level: 11, recharge: '90000', daily: '81818' }
      ],

      languages: [
        { name: "Polski", code: "PL" },
        { name: "English", code: "EN" },
        { name: "Français", code: "FR" },
        { name: "Italiano", code: "IT" },
        { name: "日本語", code: "JP" },
        { name: "한국인", code: "KR" },
        { name: "Deutsch", code: "DE" },
        { name: "Русский", code: "RU" },
        { name: "Tiếng Việt", code: "VI" },
        { name: "Português", code: "PT" },
        { name: "Türkçe", code: "TR" },
        { name: "Español", code: "ES" },
        { name: "فارسی", code: "FA" },
        { name: "العربي", code: "AR" }
      ]
    };
  },

  created() {
    const auth = getAuth();

    const saved = localStorage.getItem("app_language");
    if (saved) this.currentLang = saved;

    onAuthStateChanged(auth, (u) => {
      this.user = u;
      this.authLoaded = true;
      
      if (this.user) {
        setTimeout(() => {
          this.showAd = true;
        }, 1000);
      }
    });
  },

  computed: {
    showBottomNav() {
      if (!this.user) return false;

      const path = this.$route.path;
      const hidden = ["/login", "/register", "/admin", "/403"];

      return !hidden.some((r) => path.startsWith(r));
    }
  },

  methods: {
    toggleLanguageMenu() {
      this.showLangMenu = !this.showLangMenu;
    },

    setLanguage(lang) {
      this.currentLang = lang.code;
      localStorage.setItem("app_language", lang.code);
      this.showLangMenu = false;
      
      document.documentElement.dir = lang.code === 'AR' ? 'rtl' : 'ltr';
    },

    closeAd() {
      this.showAd = false;
    },

    toggleNewYearMessage() {
      this.showNewYearMessage = !this.showNewYearMessage;
    },

    closeNewYearMessage() {
      this.showNewYearMessage = false;
    },

    toggleSpecialOffer() {
      this.showSpecialOffer = !this.showSpecialOffer;
    },

    closeSpecialOffer() {
      this.showSpecialOffer = false;
    },

    // دالة التنقل بين الصفحات
    navigateTo(path) {
      console.log("Navigating to:", path);
      if (this.$route.path !== path) {
        this.$router.push(path);
      }
    },

    // التحقق من الصفحة النشطة
    isActive(path) {
      return this.$route.path === path;
    }
  }
};
</script>

<style>
/* استيراد خطوط وأيقونات */
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Cairo', sans-serif;
  background: #0A0C10;
  color: #ffffff;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  position: relative;
}

/* حاوية الصفحات */
.page-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding-bottom: 80px; /* مساحة للشريط السفلي */
}

/* اتجاه الصفحة */
#app.rtl {
  direction: rtl;
}

/* ===== الأزرار العائمة ===== */
.circle-btn {
  position: fixed;
  bottom: 100px; /* زيادة المسافة من الأسفل */
  width: 45px;
  height: 45px;
  background: #11151C;
  border: 2px solid #D4AF37;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #D4AF37;
  font-size: 20px;
  cursor: pointer;
  z-index: 9999;
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
  transition: all 0.3s ease;
  text-decoration: none;
}

.circle-btn:hover {
  transform: translateY(-5px) scale(1.1);
  box-shadow: 0 10px 25px rgba(212, 175, 55, 0.4);
  background: #D4AF37;
  color: #0A0C10;
}

.lang-code {
  font-size: 10px;
  font-weight: 700;
  margin-top: -5px;
  background: #D4AF37;
  color: #0A0C10;
  padding: 2px 4px;
  border-radius: 4px;
}

.lang-btn:hover .lang-code {
  background: #0A0C10;
  color: #D4AF37;
}

/* مواقع الأزرار */
.lang-btn {
  right: 15px;
  background: linear-gradient(135deg, #11151C, #1A1F2A);
}

.support-btn {
  right: 70px;
}

.instagram-btn {
  right: 125px;
}

.instagram-btn i {
  font-size: 22px;
  color: #D4AF37;
}

.instagram-btn:hover i {
  color: #0A0C10;
}

/* ===== زر بابلوين (سانتا) ===== */
.bubble-chat-btn {
  position: fixed;
  right: 180px;
  bottom: 100px; /* زيادة المسافة من الأسفل */
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #D4AF37, #F6E27A, #C5A028);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 9999;
  box-shadow: 0 5px 20px rgba(212, 175, 55, 0.4);
  transition: all 0.3s ease;
  border: 2px solid #ffffff;
}

.bubble-chat-btn:hover {
  transform: translateY(-5px) scale(1.1);
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.5);
}

.bubble-chat-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.2));
}

.bubble-notification {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #22c55e;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
  border: 2px solid #0A0C10;
}

/* ===== زر العرض الخاص المحدود ===== */
.special-offer-btn {
  position: fixed;
  right: 235px;
  bottom: 100px;
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53, #FF3B3B);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 9999;
  box-shadow: 0 5px 20px rgba(255, 59, 59, 0.4);
  transition: all 0.3s ease;
  border: 2px solid #ffffff;
  animation: specialPulse 2s infinite;
}

.special-offer-btn:hover {
  transform: translateY(-5px) scale(1.1);
  box-shadow: 0 10px 30px rgba(255, 59, 59, 0.6);
}

.special-offer-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.2));
}

.special-offer-notification {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #D4AF37;
  color: #0A0C10;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
  border: 2px solid #ffffff;
}

@keyframes specialPulse {
  0% { transform: scale(1); box-shadow: 0 5px 20px rgba(255, 59, 59, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 10px 30px rgba(255, 59, 59, 0.8); }
  100% { transform: scale(1); box-shadow: 0 5px 20px rgba(255, 59, 59, 0.4); }
}

/* ===== نافذة العرض الخاص ===== */
.special-offer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 12, 16, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.special-offer-window {
  width: 90%;
  max-width: 550px;
  background: #11151C;
  border-radius: 40px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 0 3px #FF6B6B;
  animation: specialSlide 0.4s ease;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

@keyframes specialSlide {
  from {
    transform: translateY(50px) scale(0.9);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.special-offer-header {
  background: linear-gradient(135deg, #FF6B6B, #FF8E53, #FF3B3B);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ffffff;
}

.special-offer-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.special-offer-title i {
  font-size: 24px;
  color: #ffffff;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.2));
}

.special-offer-title h2 {
  font-size: 20px;
  font-weight: 800;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.special-offer-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #ffffff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;
}

.special-offer-close-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: rotate(90deg);
}

.special-offer-badge {
  background: #D4AF37;
  padding: 12px;
  text-align: center;
}

.special-offer-badge span {
  font-size: 20px;
  font-weight: 800;
  color: #0A0C10;
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.special-offer-content {
  padding: 25px;
  max-height: 60vh;
  overflow-y: auto;
  color: #ffffff;
  scrollbar-width: thin;
  scrollbar-color: #FF6B6B #1A1F2A;
}

.special-offer-content::-webkit-scrollbar {
  width: 6px;
}

.special-offer-content::-webkit-scrollbar-track {
  background: #1A1F2A;
}

.special-offer-content::-webkit-scrollbar-thumb {
  background: #FF6B6B;
  border-radius: 10px;
}

.special-offer-intro {
  font-size: 16px;
  line-height: 1.8;
  margin-bottom: 20px;
  text-align: center;
  background: rgba(255, 107, 107, 0.1);
  padding: 15px;
  border-radius: 16px;
  border-right: 4px solid #FF6B6B;
}

.special-offer-levels {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 25px 0;
}

.offer-level {
  background: #1A1F2A;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 107, 107, 0.3);
  transition: all 0.3s;
}

.offer-level:hover {
  transform: translateX(-5px);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.3);
}

.level-badge {
  padding: 10px;
  font-weight: 800;
  text-align: center;
  color: #ffffff;
  font-size: 14px;
}

.level-1 { background: #4A90E2; }
.level-2 { background: #50C878; }
.level-3 { background: #FFB347; }
.level-4 { background: #9370DB; }
.level-5 { background: #FF6B6B; }

.level-details {
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 14px;
  flex-wrap: wrap;
}

.level-details i {
  color: #FF6B6B;
}

.level-reward {
  background: #D4AF37;
  color: #0A0C10;
  padding: 5px 10px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 13px;
}

.level-special {
  border: 2px solid #D4AF37;
  animation: glow 2s infinite;
}

@keyframes glow {
  0% { box-shadow: 0 0 5px #D4AF37; }
  50% { box-shadow: 0 0 20px #D4AF37; }
  100% { box-shadow: 0 0 5px #D4AF37; }
}

.special-offer-footer {
  background: rgba(255, 107, 107, 0.1);
  padding: 20px;
  border-radius: 16px;
  text-align: center;
  line-height: 1.8;
  border: 1px solid #FF6B6B;
}

.special-offer-footer-btn {
  padding: 20px;
  background: #11151C;
  border-top: 1px solid rgba(255, 107, 107, 0.2);
}

.special-offer-action-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #FF6B6B, #FF8E53, #FF3B3B);
  color: #ffffff;
  border: none;
  border-radius: 50px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 5px 20px rgba(255, 59, 59, 0.4);
}

.special-offer-action-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(255, 59, 59, 0.6);
}

/* ===== نافذة بابلوين ===== */
.bubble-chat-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 12, 16, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.bubble-chat-window {
  width: 90%;
  max-width: 450px;
  background: #11151C;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 2px #D4AF37;
  animation: bubbleSlide 0.3s ease;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

@keyframes bubbleSlide {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.bubble-chat-header {
  background: linear-gradient(135deg, #D4AF37, #F6E27A, #C5A028);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #0A0C10;
}

.bubble-chat-title {
  display: flex;
  align-items: center;
  gap: 15px;
}

.bubble-avatar {
  width: 50px;
  height: 50px;
  background: #0A0C10;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #D4AF37;
  border: 2px solid #D4AF37;
}

.bubble-sender {
  font-weight: 800;
  font-size: 18px;
}

.bubble-time {
  font-size: 12px;
  opacity: 0.8;
}

.bubble-close-btn {
  background: rgba(10, 12, 16, 0.2);
  border: none;
  color: #0A0C10;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.bubble-close-btn:hover {
  background: rgba(10, 12, 16, 0.4);
  transform: rotate(90deg);
}

.bubble-chat-body {
  padding: 25px;
  max-height: 500px;
  overflow-y: auto;
  background: #1A1F2A;
}

.bubble-message {
  position: relative;
  margin-bottom: 20px;
}

.bubble-received {
  text-align: right;
}

.bubble-tail {
  position: absolute;
  bottom: -8px;
  right: 10px;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #2A2F3A;
}

.bubble-content {
  background: #2A2F3A;
  padding: 15px 20px;
  border-radius: 18px;
  border-top-right-radius: 4px;
  display: inline-block;
  max-width: 100%;
  text-align: right;
  line-height: 1.6;
  font-size: 14px;
  color: #ffffff;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.bubble-message .bubble-time {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 5px;
  text-align: right;
}

.bubble-chat-footer {
  padding: 20px;
  background: #11151C;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
}

.bubble-action-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #D4AF37, #F6E27A, #C5A028);
  color: #0A0C10;
  border: none;
  border-radius: 50px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
}

.bubble-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(212, 175, 55, 0.4);
}

/* ===== قائمة اللغات ===== */
.lang-menu {
  position: fixed;
  bottom: 160px; /* زيادة المسافة من الأسفل */
  right: 15px;
  width: 220px;
  background: #11151C;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 2px #D4AF37;
  z-index: 9999;
  overflow: hidden;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.lang-menu-header {
  padding: 15px;
  background: linear-gradient(135deg, #D4AF37, #F6E27A);
  color: #0A0C10;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
}

.lang-menu-header i {
  font-size: 18px;
}

.lang-item {
  padding: 12px 15px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #ffffff;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.lang-item:last-child {
  border-bottom: none;
}

.lang-item:hover {
  background: #1A1F2A;
  color: #D4AF37;
}

.lang-item.active {
  background: rgba(212, 175, 55, 0.2);
  color: #D4AF37;
}

.lang-name {
  font-size: 14px;
}

.lang-code-small {
  font-size: 12px;
  padding: 3px 8px;
  background: rgba(212, 175, 55, 0.2);
  border-radius: 20px;
  color: #D4AF37;
}

/* ===== شريط التنقل السفلي ===== */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 75px;
  background: #11151C;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 2px solid #D4AF37;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.5);
  z-index: 9998; /* أقل من الأزرار العائمة */
  direction: rtl;
  pointer-events: auto; /* التأكد من أن الأزرار قابلة للنقر */
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 12px;
  flex: 1;
  height: 100%;
  pointer-events: auto; /* التأكد من أن الأزرار قابلة للنقر */
}

.nav-item i {
  font-size: 22px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.nav-item span {
  font-size: 11px;
  font-weight: 500;
}

.nav-item:hover {
  color: #D4AF37;
  background: rgba(212, 175, 55, 0.1);
}

.nav-item.active {
  color: #D4AF37;
}

.nav-item.active i {
  transform: translateY(-2px);
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
}

/* ===== إعلان Popup فاخر ===== */
.ad-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 12, 16, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10001;
}

.ad-box {
  background: #11151C;
  width: 90%;
  max-width: 500px;
  border-radius: 30px;
  overflow: hidden;
  border: 2px solid #D4AF37;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(212, 175, 55, 0.3);
}

.ad-header {
  background: linear-gradient(135deg, #D4AF37, #F6E27A, #C5A028);
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #0A0C10;
}

.ad-header h2 {
  margin: 0;
  font-size: 22px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.ad-header i {
  font-size: 24px;
}

.ad-close-btn {
  background: rgba(10, 12, 16, 0.2);
  border: none;
  color: #0A0C10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;
}

.ad-close-btn:hover {
  background: rgba(10, 12, 16, 0.4);
  transform: rotate(90deg);
}

.ad-content {
  padding: 25px;
  max-height: 60vh;
  overflow-y: auto;
  color: #ffffff;
  scrollbar-width: thin;
  scrollbar-color: #D4AF37 #1A1F2A;
}

.ad-content::-webkit-scrollbar {
  width: 6px;
}

.ad-content::-webkit-scrollbar-track {
  background: #1A1F2A;
}

.ad-content::-webkit-scrollbar-thumb {
  background: #D4AF37;
  border-radius: 10px;
}

.ad-welcome {
  background: rgba(212, 175, 55, 0.1);
  padding: 15px;
  border-radius: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-right: 4px solid #D4AF37;
}

.ad-welcome i {
  color: #D4AF37;
  font-size: 20px;
}

.ad-highlight {
  background: #1A1F2A;
  padding: 15px;
  border-radius: 16px;
  margin: 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.ad-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 15px 0;
}

.stat-item {
  background: #1A1F2A;
  padding: 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.stat-item i {
  color: #D4AF37;
}

.vip-table {
  background: #1A1F2A;
  border-radius: 16px;
  padding: 15px;
  margin: 20px 0;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.vip-table h3 {
  color: #D4AF37;
  text-align: center;
  margin-bottom: 15px;
}

.vip-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  font-size: 13px;
}

.vip-level {
  color: #D4AF37;
  font-weight: 700;
}

.vip-recharge {
  color: #F6E27A;
}

.vip-daily {
  color: #ffffff;
}

.commission-box {
  background: linear-gradient(135deg, #1A1F2A, #11151C);
  border-radius: 16px;
  padding: 15px;
  text-align: center;
}

.commission-box h4 {
  color: #D4AF37;
  margin-bottom: 10px;
}

.commission-row {
  display: flex;
  justify-content: center;
  gap: 20px;
  color: #ffffff;
}

.ad-btn {
  width: calc(100% - 40px);
  margin: 0 20px 25px 20px;
  padding: 15px;
  background: linear-gradient(135deg, #D4AF37, #F6E27A, #C5A028);
  color: #0A0C10;
  border: none;
  border-radius: 50px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 5px 20px rgba(212, 175, 55, 0.3);
}

.ad-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
}

/* حركات */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* تكييفات للهواتف */
@media (max-width: 768px) {
  .circle-btn,
  .bubble-chat-btn,
  .special-offer-btn {
    bottom: 90px;
    width: 40px;
    height: 40px;
    font-size: 18px;
  }
  
  .lang-btn { right: 10px; }
  .support-btn { right: 60px; }
  .instagram-btn { right: 110px; }
  .bubble-chat-btn { right: 160px; }
  .special-offer-btn { right: 210px; }
  
  .lang-menu {
    bottom: 150px;
    right: 10px;
    width: 200px;
  }
  
  .bubble-chat-window,
  .special-offer-window {
    width: 95%;
  }
  
  .ad-box {
    width: 95%;
  }
  
  .bottom-nav {
    height: 70px;
  }
  
  .nav-item i {
    font-size: 20px;
  }
  
  .nav-item span {
    font-size: 10px;
  }

  .level-details {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .lang-btn { right: 5px; }
  .support-btn { right: 50px; }
  .instagram-btn { right: 95px; }
  .bubble-chat-btn { right: 140px; }
  .special-offer-btn { right: 185px; }
  
  .circle-btn,
  .bubble-chat-btn,
  .special-offer-btn {
    bottom: 85px;
    width: 38px;
    height: 38px;
    font-size: 16px;
  }
  
  .bubble-chat-icon,
  .special-offer-icon {
    font-size: 20px;
  }
  
  .bottom-nav {
    height: 65px;
  }
  
  .nav-item i {
    font-size: 18px;
  }
  
  .nav-item span {
    font-size: 9px;
  }

  .special-offer-title h2 {
    font-size: 16px;
  }

  .level-details {
    flex-direction: column;
    text-align: center;
  }
}
</style>
