<template>
  <div class="profile-page">
    <div v-if="loading" class="loading-container">
      <div class="gold-spinner"></div>
      <p class="loading-text">جاري تحميل بيانات الحساب...</p>
    </div>

    <div v-else class="profile-container">
      <!-- رأس الصفحة - صورة المستخدم -->
      <div class="profile-header">
        <div class="avatar-box">
          <div class="avatar-circle">
            {{ userData.username ? userData.username.charAt(0).toUpperCase() : 'U' }}
          </div>
        </div>
        <h2 class="username-display">{{ userData.username || "المستخدم" }}</h2>
      </div>

      <!-- قسم البيانات الأساسية (نظام الحقول الذهبية) -->
      <div class="fields-section">
        <h3 class="section-label"><i class="fas fa-user-circle"></i> معلومات الحساب</h3>
        
        <!-- حقل معرف المستخدم -->
        <div class="gold-field">
          <label><i class="fas fa-id-badge"></i> معرف المستخدم (ID)</label>
          <div class="field-input-group">
            <input type="text" :value="userData.uid" readonly class="gold-input-field">
            <button class="field-action-btn" @click="copy(userData.uid)">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>

        <!-- حقل البريد الإلكتروني -->
        <div class="gold-field">
          <label><i class="fas fa-envelope"></i> البريد الإلكتروني</label>
          <div class="field-input-group">
            <input type="text" :value="userData.email || 'غير مسجل'" readonly class="gold-input-field">
            <button class="field-action-btn" @click="copy(userData.email)" v-if="userData.email">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>

        <!-- حقل رقم الهاتف -->
        <div class="gold-field">
          <label><i class="fas fa-phone-alt"></i> رقم الهاتف</label>
          <div class="field-input-group">
            <input type="text" :value="userData.phoneNumber || 'لم يتم الربط بعد'" readonly class="gold-input-field">
            <button class="field-action-btn link-btn" @click="openPhoneModal">
              <i class="fas fa-link"></i> {{ userData.phoneNumber ? 'تحديث' : 'ربط الآن' }}
            </button>
          </div>
        </div>

        <!-- حقل كود الإحالة -->
        <div class="gold-field" v-if="userData.referralCode">
          <label><i class="fas fa-share-nodes"></i> كود الإحالة الخاص بك</label>
          <div class="field-input-group">
            <input type="text" :value="userData.referralCode" readonly class="gold-input-field highlight-gold">
            <button class="field-action-btn" @click="copy(userData.referralCode)">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- قسم الرصيد (نظام الحقول الذهبية) -->
      <div class="fields-section">
        <h3 class="section-label"><i class="fas fa-chart-line"></i> الرصيد والبيانات</h3>
        
        <!-- حقل الرصيد الحالي -->
        <div class="gold-field balance-field">
          <label><i class="fas fa-wallet"></i> الرصيد المتاح (USDT)</label>
          <div class="field-input-group">
            <input type="text" :value="Number(userData.balance).toFixed(2)" readonly class="gold-input-field balance-text">
            <span class="currency-tag">USDT</span>
          </div>
        </div>

        <!-- حقل تاريخ التسجيل -->
        <div class="gold-field">
          <label><i class="fas fa-calendar-day"></i> تاريخ الانضمام</label>
          <input type="text" :value="formattedDate" readonly class="gold-input-field">
        </div>
      </div>

      <!-- أزرار التحكم -->
      <div class="action-buttons">
        <button class="main-gold-btn" @click="openChangePasswordModal">
          <i class="fas fa-key"></i> تغيير كلمة المرور
        </button>
        
        <button class="outline-gold-btn" @click="copyReferralLink" v-if="userData.referralCode">
          <i class="fas fa-link"></i> نسخ رابط الدعوة
        </button>

        <button class="danger-btn" @click="logout">
          <i class="fas fa-sign-out-alt"></i> تسجيل الخروج
        </button>
      </div>
    </div>

    <!-- نافذة ربط الهاتف (تصميم ذهبي وأسود) -->
    <div v-if="showPhoneModal" class="gold-modal-overlay" @click.self="closePhoneModal">
      <div class="gold-modal">
        <div class="modal-head">
          <h3><i class="fas fa-mobile-screen-button"></i> ربط رقم الهاتف</h3>
          <button @click="closePhoneModal" class="close-x">×</button>
        </div>
        <div class="modal-body">
          <div class="gold-field">
            <label>اختر الدولة ورقم الهاتف</label>
            <div class="phone-input-box">
              <select v-model="phoneForm.countryCode" class="country-select" @change="updatePhoneLimit">
                <option value="">الرمز</option>
                <option value="+966">🇸🇦 السعودية (+966)</option>
                <option value="+971">🇦🇪 الإمارات (+971)</option>
                <option value="+965">🇰🇼 الكويت (+965)</option>
                <option value="+974">🇶🇦 قطر (+974)</option>
                <option value="+973">🇧🇭 البحرين (+973)</option>
                <option value="+968">🇴🇲 عمان (+968)</option>
                <option value="+962">🇯🇴 الأردن (+962)</option>
                <option value="+20">🇪🇬 مصر (+20)</option>
                <option value="+964">🇮🇶 العراق (+964)</option>
                <option value="+963">🇸🇾 سوريا (+963)</option>
                <option value="+961">🇱🇧 لبنان (+961)</option>
                <option value="+218">🇱🇾 ليبيا (+218)</option>
                <option value="+216">🇹🇳 تونس (+216)</option>
                <option value="+213">🇩🇿 الجزائر (+213)</option>
                <option value="+212">🇲🇦 المغرب (+212)</option>
                <option value="+222">🇲🇷 موريتانيا (+222)</option>
                <option value="+249">🇸🇩 السودان (+249)</option>
                <option value="+967">🇾🇪 اليمن (+967)</option>
                <option value="+970">🇵🇸 فلسطين (+970)</option>
                <option value="+90">🇹🇷 تركيا (+90)</option>
              </select>
              <input 
                type="tel" 
                v-model="phoneForm.phone" 
                :placeholder="'رقم الهاتف'" 
                class="gold-input-field"
                @input="handlePhoneInput"
              >
            </div>
            <!-- عداد الأرقام المطلوب تحت الحقل مباشرة -->
            <p class="phone-hint" v-if="phoneForm.countryCode">
              <i class="fas fa-info-circle"></i> 
              يجب إدخال <span>{{ phoneLimit }}</span> أرقام لهذا الرمز (أدخلت: {{ phoneForm.phone.length }})
            </p>
          </div>
          <div class="gold-field">
            <label>كلمة المرور للتأكيد</label>
            <input type="password" v-model="phoneForm.password" placeholder="أدخل كلمة المرور" class="gold-input-field">
          </div>
          <p v-if="phoneError" class="error-txt">{{ phoneError }}</p>
          <p v-if="phoneSuccess" class="success-txt">{{ phoneSuccess }}</p>
          <button class="main-gold-btn" @click="updatePhoneNumber" :disabled="phoneLoading">
            {{ phoneLoading ? 'جاري المعالجة...' : 'تأكيد الربط' }}
          </button>
        </div>
      </div>
    </div>

    <!-- نافذة تغيير كلمة المرور (تصميم ذهبي وأسود) -->
    <div v-if="showChangePasswordModal" class="gold-modal-overlay" @click.self="closeChangePasswordModal">
      <div class="gold-modal">
        <div class="modal-head">
          <h3><i class="fas fa-key"></i> تغيير كلمة المرور</h3>
          <button @click="closeChangePasswordModal" class="close-x">×</button>
        </div>
        <div class="modal-body">
          <div class="gold-field">
            <label>كلمة المرور الحالية</label>
            <input type="password" v-model="passwordForm.currentPassword" class="gold-input-field">
          </div>
          <div class="gold-field">
            <label>كلمة المرور الجديدة</label>
            <input type="password" v-model="passwordForm.newPassword" class="gold-input-field">
          </div>
          <div class="gold-field">
            <label>تأكيد كلمة المرور</label>
            <input type="password" v-model="passwordForm.confirmPassword" class="gold-input-field">
          </div>
          <p v-if="passwordError" class="error-txt">{{ passwordError }}</p>
          <p v-if="passwordSuccess" class="success-txt">{{ passwordSuccess }}</p>
          <button class="main-gold-btn" @click="updatePassword" :disabled="passwordLoading">
            {{ passwordLoading ? 'جاري التحديث...' : 'حفظ التغييرات' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export default {
  name: "Profile",
  data() {
    return {
      loading: true,
      showChangePasswordModal: false,
      showPhoneModal: false,
      passwordLoading: false,
      phoneLoading: false,
      passwordError: "",
      passwordSuccess: "",
      phoneError: "",
      phoneSuccess: "",
      phoneLimit: 9,
      passwordForm: { currentPassword: "", newPassword: "", confirmPassword: "" },
      phoneForm: { countryCode: "+966", phone: "", password: "" },
      userData: { email: "", phoneNumber: "", uid: "", createdAt: "", balance: 0, username: "", referralCode: "" }
    };
  },
  computed: {
    formattedDate() {
      if (!this.userData.createdAt) return "غير متوفر";
      let date;
      if (this.userData.createdAt.toDate) {
        date = this.userData.createdAt.toDate();
      } else if (this.userData.createdAt.seconds) {
        date = new Date(this.userData.createdAt.seconds * 1000);
      } else {
        date = new Date(this.userData.createdAt);
      }
      return isNaN(date.getTime()) ? "غير متوفر" : date.toLocaleDateString("ar-EG", { year: 'numeric', month: 'long', day: 'numeric' });
    },
    referralLink() { return `${window.location.origin}/register?ref=${this.userData.referralCode}`; }
  },
  created() { this.loadUserData(); },
  methods: {
    async loadUserData() {
      onAuthStateChanged(auth, async (user) => {
        if (!user) { this.loading = false; this.$router.push("/login"); return; }
        try {
          const userSnap = await getDoc(doc(db, "users", user.uid));
          if (userSnap.exists()) {
            const data = userSnap.data();
            this.userData = {
              email: data.email || user.email || "",
              phoneNumber: data.phoneNumber || "",
              uid: user.uid,
              createdAt: data.createdAt || user.metadata.creationTime,
              balance: data.balance ?? 0,
              username: data.username || (data.email ? data.email.split("@")[0] : "مستخدم"),
              referralCode: data.referralCode || user.uid.substring(0, 6),
            };
          }
        } catch (err) { console.error("Error loading profile:", err); }
        this.loading = false;
      });
    },
    copy(text) { if (!text) return; navigator.clipboard.writeText(text); alert("تم النسخ بنجاح ✓"); },
    copyReferralLink() { this.copy(this.referralLink); },
    openChangePasswordModal() { this.showChangePasswordModal = true; this.passwordError = ""; this.passwordSuccess = ""; },
    closeChangePasswordModal() { this.showChangePasswordModal = false; },
    
    translateError(error) {
      const code = error.code || error.message;
      if (code.includes('wrong-password') || code.includes('invalid-credential')) {
        return 'كلمة المرور غير صحيحة';
      }
      switch (code) {
        case 'auth/user-not-found': return 'المستخدم غير موجود';
        case 'auth/too-many-requests': return 'محاولات كثيرة جداً، يرجى المحاولة لاحقاً';
        case 'auth/network-request-failed': return 'خطأ في الاتصال بالشبكة';
        case 'auth/weak-password': return 'كلمة المرور الجديدة ضعيفة جداً';
        default: return 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى';
      }
    },

    async updatePassword() {
      this.passwordError = "";
      if (!this.passwordForm.currentPassword) { this.passwordError = "يرجى إدخال كلمة المرور الحالية"; return; }
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) { this.passwordError = "كلمات المرور الجديدة غير متطابقة"; return; }
      
      this.passwordLoading = true;
      try {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, this.passwordForm.currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, this.passwordForm.newPassword);
        this.passwordSuccess = "تم تحديث كلمة المرور بنجاح ✓";
        setTimeout(() => this.closeChangePasswordModal(), 2000);
      } catch (e) { 
        this.passwordError = this.translateError(e);
      }
      this.passwordLoading = false;
    },

    openPhoneModal() { this.showPhoneModal = true; this.phoneError = ""; this.phoneSuccess = ""; this.updatePhoneLimit(); },
    closePhoneModal() { this.showPhoneModal = false; },
    
    updatePhoneLimit() {
      const limits = {
        "+966": 9, "+971": 9, "+965": 8, "+974": 8, "+973": 8, "+968": 8, 
        "+962": 9, "+20": 10, "+964": 10, "+963": 9, "+961": 8, "+218": 9,
        "+216": 8, "+213": 9, "+212": 9, "+222": 8, "+249": 9, "+967": 9,
        "+970": 9, "+90": 10
      };
      this.phoneLimit = limits[this.phoneForm.countryCode] || 10;
      if (this.phoneForm.phone.length > this.phoneLimit) {
        this.phoneForm.phone = this.phoneForm.phone.substring(0, this.phoneLimit);
      }
    },

    handlePhoneInput(e) {
      this.phoneForm.phone = e.target.value.replace(/\D/g, '');
      if (this.phoneForm.phone.length > this.phoneLimit) {
        this.phoneForm.phone = this.phoneForm.phone.substring(0, this.phoneLimit);
      }
    },

    async updatePhoneNumber() {
      this.phoneError = "";
      if (!this.phoneForm.countryCode) { this.phoneError = "الرجاء اختيار رمز الدولة"; return; }
      if (this.phoneForm.phone.length !== this.phoneLimit) { 
        this.phoneError = `رقم الهاتف لهذه الدولة يجب أن يكون ${this.phoneLimit} أرقام`; 
        return; 
      }
      if (!this.phoneForm.password) { this.phoneError = "الرجاء إدخال كلمة المرور للتأكيد"; return; }
      
      this.phoneLoading = true;
      try {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, this.phoneForm.password);
        await reauthenticateWithCredential(user, credential);
        const fullPhone = this.phoneForm.countryCode + this.phoneForm.phone;
        await updateDoc(doc(db, "users", user.uid), { phoneNumber: fullPhone });
        this.userData.phoneNumber = fullPhone;
        this.phoneSuccess = "تم ربط رقم الهاتف بنجاح ✓";
        setTimeout(() => this.closePhoneModal(), 2000);
      } catch (e) { 
        this.phoneError = this.translateError(e);
      }
      this.phoneLoading = false;
    },
    async logout() { await signOut(auth); this.$router.push("/login"); }
  }
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #000000;
  color: #ffffff;
  padding: 20px;
  padding-top: 60px;
  padding-bottom: 100px;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
}

.profile-container {
  max-width: 450px;
  margin: 0 auto;
}

/* رأس الصفحة */
.profile-header {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-box {
  position: relative;
  display: inline-block;
  margin-bottom: 15px;
}

.avatar-circle {
  width: 90px;
  height: 90px;
  background-color: #111111;
  border: 2px solid #D4AF37;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  color: #D4AF37;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
}

.username-display {
  font-size: 20px;
  color: #D4AF37;
  font-weight: 700;
}

/* نظام الحقول الذهبية */
.fields-section {
  margin-bottom: 25px;
}

.section-label {
  font-size: 15px;
  color: #D4AF37;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-right: 3px solid #D4AF37;
  padding-right: 10px;
}

.gold-field {
  margin-bottom: 15px;
}

.gold-field label {
  display: block;
  font-size: 12px;
  color: #888888;
  margin-bottom: 5px;
  margin-right: 5px;
}

.field-input-group {
  display: flex;
  gap: 8px;
}

.gold-input-field {
  flex: 1;
  background-color: #111111;
  border: 1px solid #333333;
  border-radius: 10px;
  padding: 10px 12px;
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  width: 100%;
}

.gold-input-field:focus {
  border-color: #D4AF37;
}

.highlight-gold {
  color: #D4AF37 !important;
  font-weight: bold;
}

.field-action-btn {
  background-color: #111111;
  border: 1px solid #D4AF37;
  color: #D4AF37;
  padding: 0 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
}

.field-action-btn:hover {
  background-color: #D4AF37;
  color: #000000;
}

.link-btn {
  min-width: 80px;
  justify-content: center;
}

/* الرصيد */
.balance-field .gold-input-field {
  border-color: #D4AF37;
  background-color: rgba(212, 175, 55, 0.05);
}

.balance-text {
  font-size: 22px !important;
  font-weight: 900 !important;
  color: #D4AF37 !important;
  text-align: center;
}

.currency-tag {
  background-color: #D4AF37;
  color: #000000;
  padding: 0 12px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  font-weight: 800;
  font-size: 13px;
}

/* الأزرار */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 25px;
}

.main-gold-btn {
  background-color: #D4AF37;
  color: #000000;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.outline-gold-btn {
  background-color: transparent;
  border: 1px solid #D4AF37;
  color: #D4AF37;
  border-radius: 10px;
  padding: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.danger-btn {
  background-color: transparent;
  border: 1px solid #ff4444;
  color: #ff4444;
  border-radius: 10px;
  padding: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 5px;
}

/* النوافذ */
.gold-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.9);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}

.gold-modal {
  background: #000000;
  border: 1px solid #D4AF37;
  border-radius: 15px;
  width: 100%; max-width: 380px;
  padding: 20px;
}

.modal-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 15px; color: #D4AF37;
}

.close-x {
  background: none; border: none; color: #D4AF37; font-size: 24px; cursor: pointer;
}

.phone-input-box {
  display: flex; flex-direction: column; gap: 10px;
}

.country-select {
  background: #111111; border: 1px solid #333333; border-radius: 10px;
  padding: 10px; color: #D4AF37; font-weight: bold; outline: none;
  font-size: 13px; width: 100%;
}

.phone-hint {
  font-size: 11px;
  color: #888888;
  margin-top: 8px;
  margin-right: 5px;
}

.phone-hint span {
  color: #D4AF37;
  font-weight: bold;
}

.error-txt { color: #ff4444; font-size: 12px; margin-bottom: 10px; text-align: center; background: rgba(255,68,68,0.1); padding: 8px; border-radius: 8px; }
.success-txt { color: #44ff44; font-size: 12px; margin-bottom: 10px; text-align: center; background: rgba(68,255,68,0.1); padding: 8px; border-radius: 8px; }

.loading-container { text-align: center; padding: 80px 0; }
.gold-spinner {
  width: 40px; height: 40px; border: 2px solid rgba(212, 175, 55, 0.1);
  border-top-color: #D4AF37; border-radius: 50%; animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
