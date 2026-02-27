<template>
  <div class="container">
    <div class="card">
      <h2 class="title">تسجيل الدخول</h2>

      <!-- البريد الإلكتروني -->
      <label class="label">البريد الإلكتروني</label>
      <input
        type="email"
        v-model="email"
        placeholder="البريد الإلكتروني"
        class="input"
      />

      <!-- كلمة المرور -->
      <label class="label">كلمة المرور</label>
      <div class="input-box">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          placeholder="كلمة المرور"
          class="input"
        />
        <span class="toggle" @click="togglePassword">
          {{ showPassword ? "إخفاء" : "إظهار" }}
        </span>
      </div>

      <!-- زر تسجيل الدخول مع Loader -->
      <button class="btn" @click="loginUser" :disabled="loading">
        <span v-if="!loading">تسجيل الدخول</span>
        <span v-else class="loader"></span>
      </button>

      <p class="link">
        ليس لديك حساب؟
        <router-link to="/register">إنشاء حساب</router-link>
      </p>
    </div>
  </div>

  <!-- Popup إعلان -->
  <div id="companyAd" class="ad-overlay" v-if="showAd">
    <div class="ad-box">
      <h2>✨ إعلان ✨</h2>

      <div class="ad-content">
        <p>
          🎉🎉🎉🎉 مرحبا بالجميع! تأسست Mall of the world في سنغافورة في 20 أغسطس 2021 ومقرها حاليًا في منطقة الأعمال المركزية في سنغافورة. نحن شركة استثمار في التجارة الإلكترونية مع فريق تقني قوي وقوة مالية قوية.
          <br><br>
          يتعاون Mall of the world مع عشرات شركات التجارة الإلكترونية مثل Amazon و eBay و Tiktok و Aliexpress و Alibaba و Shopee ، إلخ. لمساعدة التجار على زيادة مبيعات المنتجات الخاصة بهم ، ويمكننا أيضًا تحقيق أرباح منه. عندما تتصاعد على منصتنا ، تشارك في مساعدة البائعين على زيادة المبيعات ، بحيث يمكنك أيضًا كسب المال منها. حتى يتمكن الجميع من إعادة الشحن بثقة ، هذا مشروع جيد لجني الأموال. 🔇🔇🔇
          <br><br>
          👍1: الحد الأدنى لمبلغ إعادة الشحن: 12 USDT ، الحد الأدنى للسحب النقدي: 3 USDT
          <br>
          💰2: تستثمر المنصة على مستوى العالم ، لذا فإن الاستثمار يدعم فقط إعادة شحن العملة المشفرة.
          <br>
          🌈3: وقت إعادة تعيين المهمة هو الساعة 12 ظهراً في سنغافورة. يمكنك الحصول على الربح من خلال استكمال أوامر التاجر كل يوم (مرة واحدة في اليوم ، صالحة لمدة 365 يومًا).
          <br>
          🕯4: يمكنك سحب النقد مرة واحدة فقط في اليوم ، لا يوجد حد زمني ، يمكنك سحب النقد في أي وقت ، ووقت الانسحاب هو 1 إلى 5 دقائق ، والحد الأدنى لمبلغ السحب هو 3 USDT ، ولا يوجد حد أعلى.
          <br><br>
          عندما يصل مبلغ إعادة الشحن إلى المبلغ المقابل التالي ، سيتم ترقية الحساب تلقائيًا إلى VIP. كلما زادت مبلغ إعادة الشحن ، كلما زاد عدد USDT في اليوم!
          <br><br>
          👍vip1: إعادة شحن 12 USDT ، الإيرادات اليومية 3 USDT
          <br>
          👍vip2: إعادة الشحن 52 USDT ، الدخل اليومي 13 USDT
          <br>
          👍vip3: إعادة شحن 100 USDT ، الدخل اليومي 26 USDT
          <br>
          👍vip4: إعادة شحن 300 USDT ، الدخل اليومي 82 USDT
          <br>
          👍VIP5: إعادة شحن 500 USDT ، الدخل اليومي 145 USDT
          <br>
          👍vip6: إعادة شحن 1500 USDT ، الدخل اليومي 479 USDT
          <br>
          👍VIP7: إعادة شحن 3000 USDT ، الدخل اليومي 1078 USDT
          <br>
          👍VIP8: إعادة شحن 5000 USDT ، الدخل اليومي 2000 USDT
          <br>
          👍vip9: إعادة شحن 10000 USDT ، الدخل اليومي USDT
          <br>
          👍VIP10: إعادة شحن 30000 USDT ، الدخل اليومي 17699 USDT
          <br>
          👍VIP11: إعادة شحن 90,000 دولار أمريكي ، الدخل اليومي 81,818 USDT
          <br><br>
          يمكن للمستخدمين Mall of the world الترويج لنظامنا الأساسي من خلال روابط التوصية ودعوة أصدقائك للانضمام إلينا على Facebook و Twitter و Instagram و YouTube و Tiktok و Kaokao و WhatsApp و Telegram. عندما يسجل شخص ما وينتهي من Top-Up ، تحصل على مكافأة تصل إلى 9 ٪.
          <br><br>
          🤝team المستوى 3 إعادة شحن مكافأة تصل إلى 9 ٪
          <br>
          🤝level 1 مكافأة إعادة شحن الأعضاء: 6 ٪
          <br>
          🤝level 2 مكافأة إعادة شحن الأعضاء: 2 ٪
          <br>
          🤝level 3 مكافأة إعادة شحن الأعضاء: 1 ٪
          <br>
          🤑team إعادة الشحن المستوى الأول البالغ 1000 دولار أمريكي ، ويمكنك الحصول على 60 USDT
          <br>
          🤑team إعادة الشحن الثانوي البالغ 1000 دولار أمريكي ، يمكنك الحصول على 20 USDT
          <br>
          🤑team المستوى 3 إعادة شحن 1000 USDT ، ويمكنك الحصول على 10 USDT
        </p>
      </div>

      <button @click="closeAd" class="ad-btn">أنا أعرف</button>
    </div>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import router from "../router";

export default {
  data() {
    return {
      email: "",
      password: "",
      showPassword: false,
      loading: false,
      showAd: false,
      adTimer: null
    };
  },

  mounted() {
    document.addEventListener('keydown', this.handleEscKey);
  },

  beforeUnmount() {
    document.removeEventListener('keydown', this.handleEscKey);
    if (this.adTimer) {
      clearTimeout(this.adTimer);
    }
  },

  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },

    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    getErrorMessage(error) {
      const errorMessages = {
        'auth/user-not-found': 'البريد الإلكتروني غير مسجل',
        'auth/wrong-password': 'كلمة المرور غير صحيحة',
        'auth/invalid-email': 'البريد الإلكتروني غير صالح',
        'auth/user-disabled': 'هذا الحساب معطل'
      };
      return errorMessages[error.code] || 'حدث خطأ غير متوقع: ' + error.message;
    },

    handleEscKey(event) {
      if (event.key === 'Escape' && this.showAd) {
        this.closeAd();
      }
    },

    async loginUser() {
      if (!this.email || !this.password) {
        return alert("يرجى تعبئة الحقول");
      }

      if (!this.validateEmail(this.email)) {
        return alert("البريد الإلكتروني غير صالح");
      }

      this.loading = true;

      try {
        const auth = getAuth();
        await signInWithEmailAndPassword(auth, this.email, this.password);

        const user = auth.currentUser;
        if (!user) {
          alert("حدث خطأ غير متوقع");
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().blocked === true) {
          alert("🚫 حسابك محظور. يرجى التواصل مع الدعم.");
          await auth.signOut();
          return;
        }

        // تسجيل دخول الأدمن (يفضل استخدام متغيرات البيئة)
        if (
          this.email === "azad.333388@gmail.com" &&
          this.password === "admin0997408001AZAD"
        ) {
          return router.push("/admin");
        }

        // تسجيل دخول المستخدم العادي
        router.push("/home");

        // إظهار الإعلان بعد تسجيل الدخول
        this.showAd = true;
        
        // إغلاق الإعلان تلقائياً بعد 30 ثانية
        this.adTimer = setTimeout(() => {
          this.closeAd();
        }, 30000);

      } catch (error) {
        alert(this.getErrorMessage(error));
      } finally {
        this.loading = false;
      }
    },

    closeAd() {
      this.showAd = false;
      if (this.adTimer) {
        clearTimeout(this.adTimer);
        this.adTimer = null;
      }
    }
  }
};
</script>

<style scoped>
/* الخلفية الرئيسية - أسود فاخر */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  min-height: 100vh;
  background: #0A0C10;
  direction: rtl;
}

/* كرت تسجيل الدخول - رمادي غامق */
.card {
  background: #11151C;
  width: 90%;
  max-width: 380px;
  padding: 35px 25px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

/* العنوان - ذهبي فاخر */
.title {
  text-align: center;
  margin-bottom: 25px;
  font-weight: 700;
  font-size: 28px;
  background: linear-gradient(135deg, #D4AF37, #F6E27A, #C5A028);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 10px rgba(212, 175, 55, 0.3);
}

/* تسميات الحقول */
.label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #D4AF37;
  font-size: 14px;
  letter-spacing: 0.5px;
}

/* حقول الإدخال */
.input {
  width: 100%;
  padding: 14px 12px;
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  background: #1A1F2A;
  color: #ffffff;
  font-size: 15px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
  background: #1E2430;
}

.input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

/* حقل كلمة المرور مع زر الإظهار/الإخفاء */
.input-box {
  position: relative;
  width: 100%;
}

.toggle {
  position: absolute;
  left: 15px;
  top: 12px;
  color: #D4AF37;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 2px 8px;
  border-radius: 6px;
  background: rgba(212, 175, 55, 0.1);
}

.toggle:hover {
  background: rgba(212, 175, 55, 0.2);
  color: #F6E27A;
}

/* زر تسجيل الدخول - ذهبي متدرج */
.btn {
  width: 100%;
  padding: 14px;
  border: none;
  background: linear-gradient(135deg, #D4AF37, #F6E27A, #C5A028);
  color: #0A0C10;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 10px 0 15px;
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #B8962E, #D4AF37, #B8962E);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.4);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  filter: grayscale(20%);
}

/* رابط إنشاء حساب */
.link {
  text-align: center;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;
}

.link a {
  color: #D4AF37;
  text-decoration: none;
  font-weight: 600;
  margin-right: 5px;
  transition: all 0.3s ease;
  border-bottom: 1px solid transparent;
}

.link a:hover {
  color: #F6E27A;
  border-bottom-color: #D4AF37;
}

/* Loader - ذهبي */
.loader {
  width: 22px;
  height: 22px;
  border: 3px solid #0A0C10;
  border-top: 3px solid #D4AF37;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== إعلان فاخر ===== */
.ad-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 12, 16, 0.95);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  direction: rtl;
}

.ad-box {
  background: #11151C;
  width: 90%;
  max-width: 450px;
  border-radius: 24px;
  padding: 0;
  text-align: center;
  border: 1px solid rgba(212, 175, 55, 0.3);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(212, 175, 55, 0.2);
  overflow: hidden;
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ad-box h2 {
  background: linear-gradient(135deg, #D4AF37, #F6E27A, #C5A028);
  color: #0A0C10;
  padding: 18px;
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 1px;
  border-bottom: 2px solid #D4AF37;
}

.ad-content {
  max-height: 350px;
  overflow-y: auto;
  padding: 20px;
  font-size: 14px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  text-align: right;
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
  background: linear-gradient(135deg, #D4AF37, #C5A028);
  border-radius: 10px;
}

.ad-content p {
  margin: 0;
  white-space: pre-line;
}

.ad-btn {
  background: transparent;
  color: #D4AF37;
  border: 2px solid #D4AF37;
  padding: 14px 30px;
  margin: 0 20px 25px 20px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  transition: all 0.3s ease;
  width: calc(100% - 40px);
  letter-spacing: 0.5px;
}

.ad-btn:hover {
  background: linear-gradient(135deg, #D4AF37, #F6E27A, #C5A028);
  color: #0A0C10;
  border-color: transparent;
  transform: scale(1.02);
  box-shadow: 0 5px 20px rgba(212, 175, 55, 0.4);
}

/* تأثيرات إضافية */
.card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(135deg, #D4AF37, transparent, #C5A028);
  border-radius: 22px;
  z-index: -1;
  opacity: 0.3;
}

.card {
  position: relative;
}

/* تحسين للهواتف */
@media (max-width: 480px) {
  .card {
    width: 95%;
    padding: 25px 15px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .ad-box {
    width: 95%;
  }
  
  .ad-content {
    max-height: 300px;
  }
}
</style>
