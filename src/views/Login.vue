<template>
  <div class="container">
    <div class="card">
      <!-- الشعار والعنوان -->
      <div class="brand-header">
        <div class="logo">🌴</div>
        <h1 class="brand-title">Palm Treasure</h1>
      </div>
      <h2 class="title">تسجيل الدخول</h2>

      <!-- اختيار نوع تسجيل الدخول -->
      <div class="login-type-selector">
        <button
          class="type-btn"
          :class="{ active: loginType === 'email' }"
          @click="loginType = 'email'"
        >
          <i class="fas fa-envelope"></i>
          البريد
        </button>
        <button
          class="type-btn"
          :class="{ active: loginType === 'phone' }"
          @click="loginType = 'phone'"
        >
          <i class="fas fa-phone"></i>
          الهاتف
        </button>
        <button
          class="type-btn"
          :class="{ active: loginType === 'google' }"
          @click="loginType = 'google'"
        >
          <i class="fab fa-google"></i>
          جوجل
        </button>
      </div>

      <!-- تسجيل الدخول عبر البريد الإلكتروني -->
      <template v-if="loginType === 'email'">
        <label class="label">البريد الإلكتروني</label>
        <input
          v-model="email"
          type="email"
          placeholder="أدخل بريدك الإلكتروني"
          class="input"
          @keyup.enter="loginUser"
        />
        <label class="label">كلمة المرور</label>
        <div class="input-box">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="كلمة المرور"
            class="input"
            @keyup.enter="loginUser"
          />
          <span class="toggle" @click="togglePassword">
            {{ showPassword ? "إخفاء" : "إظهار" }}
          </span>
        </div>
        <button class="btn" @click="loginUser" :disabled="loading">
          <span v-if="!loading">تسجيل الدخول</span>
          <span v-else><i class="fas fa-spinner fa-spin"></i></span>
        </button>
      </template>

      <!-- تسجيل الدخول عبر الهاتف -->
      <template v-if="loginType === 'phone'">
        <label class="label">رقم الهاتف</label>
        <div class="phone-input-container">
          <select v-model="countryCode" class="country-select">
            <option value="">اختر الدولة</option>
            <option value="+966">🇸🇦 السعودية (+966)</option>
            <option value="+971">🇦🇪 الإمارات (+971)</option>
            <option value="+20">🇪🇬 مصر (+20)</option>
            <option value="+212">🇲🇦 المغرب (+212)</option>
            <option value="+216">🇹🇳 تونس (+216)</option>
            <option value="+213">🇩🇿 الجزائر (+213)</option>
            <option value="+218">🇱🇾 ليبيا (+218)</option>
            <option value="+964">🇮🇶 العراق (+964)</option>
            <option value="+961">🇱🇧 لبنان (+961)</option>
            <option value="+1">🇺🇸 أمريكا (+1)</option>
            <option value="+44">🇬🇧 بريطانيا (+44)</option>
            <option value="+33">🇫🇷 فرنسا (+33)</option>
            <option value="+49">🇩🇪 ألمانيا (+49)</option>
            <option value="+39">🇮🇹 إيطاليا (+39)</option>
            <option value="+34">🇪🇸 إسبانيا (+34)</option>
            <option value="+86">🇨🇳 الصين (+86)</option>
            <option value="+81">🇯🇵 اليابان (+81)</option>
            <option value="+82">🇰🇷 كوريا (+82)</option>
            <option value="+60">🇲🇾 ماليزيا (+60)</option>
            <option value="+62">🇮🇩 إندونيسيا (+62)</option>
            <option value="+63">🇵🇭 الفلبين (+63)</option>
            <option value="+65">🇸🇬 سنغافورة (+65)</option>
            <option value="+66">🇹🇭 تايلاند (+66)</option>
            <option value="+84">🇻🇳 فيتنام (+84)</option>
          </select>
          <input
            type="tel"
            v-model="phoneNumber"
            placeholder="رقم الهاتف"
            class="phone-input"
            :disabled="!countryCode"
            @input="validatePhoneNumber"
            @keyup.enter="loginUser"
          />
        </div>
        <span v-if="phoneError" class="error-message">{{ phoneError }}</span>
        <label class="label">كلمة المرور</label>
        <div class="input-box">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="كلمة المرور"
            class="input"
            @keyup.enter="loginUser"
          />
          <span class="toggle" @click="togglePassword">
            {{ showPassword ? "إخفاء" : "إظهار" }}
          </span>
        </div>
        <button class="btn" @click="loginUser" :disabled="loading">
          <span v-if="!loading">تسجيل الدخول</span>
          <span v-else><i class="fas fa-spinner fa-spin"></i></span>
        </button>
      </template>

      <!-- تسجيل الدخول عبر جوجل -->
      <template v-if="loginType === 'google'">
        <div class="google-login-container">
          <p class="google-desc">سجل الدخول باستخدام حسابك على جوجل بسهولة وأمان</p>
          <button class="google-btn" @click="loginWithGoogle" :disabled="loading">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
            <span v-if="!loading">تسجيل الدخول عبر جوجل</span>
            <span v-else><i class="fas fa-spinner fa-spin"></i></span>
          </button>
        </div>
      </template>

      <!-- رابط التسجيل -->
      <p class="link">
        ليس لديك حساب؟
        <router-link to="/register">إنشاء حساب جديد</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, googleProvider } from "../firebase";
import router from "../router";

export default {
  name: "Login",
  data() {
    return {
      loginType: "email",
      email: "",
      countryCode: "",
      phoneNumber: "",
      password: "",
      showPassword: false,
      loading: false,
      phoneError: ""
    };
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword;
    },

    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },

    validatePhoneNumber() {
      if (!this.countryCode) {
        this.phoneError = "الرجاء اختيار رمز الدولة";
        return false;
      }
      if (!this.phoneNumber) {
        this.phoneError = "الرجاء إدخال رقم الهاتف";
        return false;
      }
      const cleanPhone = this.phoneNumber.replace(/[^0-9]/g, "");
      if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        this.phoneError = "رقم الهاتف يجب أن يكون بين 7 و 15 رقم";
        return false;
      }
      this.phoneError = "";
      return true;
    },

    generatePhoneEmail(phone) {
      return `phone_${phone.replace(/[^0-9]/g, "")}@palm-treasure.local`;
    },

    getErrorMessage(error) {
      const errorMessages = {
        "auth/user-not-found": "البريد الإلكتروني غير مسجل",
        "auth/wrong-password": "كلمة المرور غير صحيحة",
        "auth/invalid-email": "البريد الإلكتروني غير صحيح",
        "auth/user-disabled": "الحساب معطل",
        "auth/too-many-requests": "حاولت عدة مرات، حاول لاحقاً",
        "auth/popup-closed-by-user": "تم إغلاق نافذة تسجيل الدخول",
        "auth/network-request-failed": "فشل الاتصال بالإنترنت"
      };
      return errorMessages[error.code] || error.message;
    },

    async loginUser() {
      if (this.loginType === "email") {
        if (!this.validateEmail(this.email)) {
          alert("الرجاء إدخال بريد إلكتروني صحيح");
          return;
        }
      } else if (this.loginType === "phone") {
        if (!this.validatePhoneNumber()) return;
      }

      if (this.password.length < 6) {
        alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
        return;
      }

      this.loading = true;
      const auth = getAuth();

      try {
        let loginEmail = this.email;
        if (this.loginType === "phone") {
          this.fullPhoneNumber = this.countryCode + this.phoneNumber;
          loginEmail = this.generatePhoneEmail(this.fullPhoneNumber);
        }

        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, this.password);
        const user = userCredential.user;
        
        // توجيه الأدمن لصفحة الإدارة
        const admins = ["azad.333388@gmail.com", "admin2@gmail.com", "owner@gmail.com"];
        if (admins.includes(user.email)) {
          router.push("/admin");
        } else {
          router.push("/home");
        }
      } catch (error) {
        alert(this.getErrorMessage(error));
      } finally {
        this.loading = false;
      }
    },

    async loginWithGoogle() {
      this.loading = true;
      const auth = getAuth();
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // التحقق من وجود المستخدم في Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          // إنشاء مستخدم جديد إذا لم يكن موجوداً
          const referralCode = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            phoneNumber: "",
            balance: 0,
            vipLevel: 0,
            referralCode: referralCode,
            invitedBy: "",
            level2: "",
            level3: "",
            createdAt: serverTimestamp(),
            loginMethod: "google",
            lastLogin: serverTimestamp()
          });

          console.log("✅ تم إنشاء حساب جديد عبر جوجل");
        } else {
          // تحديث آخر وقت دخول للمستخدم الموجود
          await setDoc(
            userDocRef,
            {
              lastLogin: serverTimestamp(),
              loginMethod: "google"
            },
            { merge: true }
          );

          console.log("✅ تم تسجيل الدخول بنجاح");
        }

        // توجيه الأدمن لصفحة الإدارة
        const admins = ["azad.333388@gmail.com", "admin2@gmail.com", "owner@gmail.com"];
        if (admins.includes(user.email)) {
          router.push("/admin");
        } else {
          router.push("/home");
        }
      } catch (error) {
        console.error("❌ خطأ في تسجيل الدخول عبر جوجل:", error);
        alert(this.getErrorMessage(error));
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #0a0c10;
  padding: 20px;
  direction: rtl;
}

.card {
  background: #11151c;
  width: 100%;
  max-width: 400px;
  padding: 30px 25px;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(212, 175, 55, 0.1);
}

.brand-header {
  text-align: center;
  margin-bottom: 25px;
}

.logo {
  font-size: 60px;
  margin-bottom: 10px;
}

.brand-title {
  color: #d4af37;
  font-size: 22px;
  font-weight: 800;
  margin: 0;
  letter-spacing: 1px;
}

.title {
  color: #ffffff;
  text-align: center;
  font-size: 20px;
  margin-bottom: 25px;
  font-weight: 600;
}

.login-type-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  background: #1a1f2a;
  padding: 5px;
  border-radius: 12px;
}

.type-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.type-btn.active {
  background: #d4af37;
  color: #0a0c10;
}

.type-btn:hover {
  background: rgba(212, 175, 55, 0.2);
}

.label {
  display: block;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
}

.input,
.country-select,
.phone-input {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 15px;
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  background: #1a1f2a;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.phone-input-container {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.country-select {
  width: 120px;
  margin-bottom: 0;
}

.phone-input {
  margin-bottom: 0;
  flex: 1;
}

.input:focus,
.country-select:focus,
.phone-input:focus {
  outline: none;
  border-color: #d4af37;
  background: #1e2430;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
}

.input-box {
  position: relative;
  width: 100%;
  margin-bottom: 15px;
}

.toggle {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #d4af37;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  user-select: none;
}

.btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: linear-gradient(135deg, #d4af37, #f6e27a);
  color: #0a0c10;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-login-container {
  text-align: center;
  padding: 20px 0;
}

.google-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  margin-bottom: 15px;
}

.google-btn {
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #ffffff;
  color: #333;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
}

.google-btn img {
  width: 18px;
  height: 18px;
}

.google-btn:hover:not(:disabled) {
  background: #f1f1f1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.google-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.link {
  text-align: center;
  margin-top: 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.link a {
  color: #d4af37;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.link a:hover {
  text-decoration: underline;
}

.error-message {
  color: #ff6b6b;
  font-size: 12px;
  margin-top: -10px;
  margin-bottom: 15px;
  display: block;
}

@media (max-width: 480px) {
  .card {
    padding: 25px 20px;
  }

  .brand-title {
    font-size: 20px;
  }

  .title {
    font-size: 18px;
  }

  .login-type-selector {
    gap: 5px;
  }

  .type-btn {
    font-size: 11px;
    gap: 4px;
  }
}
</style>
