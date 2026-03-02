<template>
  <div class="withdraw-page">
    <div class="card">
      <div class="card-header">
        <h2 class="title">
          <i class="fas fa-hand-holding-usd"></i>
          سحب الأرباح
          <span class="title-glow">USDT</span>
        </h2>
        <p class="sub">قم بإدخال معلومات السحب الخاصة بك</p>
      </div>

      <!-- رصيد المستخدم -->
      <div class="balance-box">
        <div class="balance-icon">
          <i class="fas fa-wallet"></i>
        </div>
        <div class="balance-info">
          <span class="balance-label">رصيدك الحالي</span>
          <span class="balance-value">{{ balance }} USDT</span>
        </div>
      </div>

      <!-- حالة VIP -->
      <div v-if="userVipLevel" class="vip-status-box">
        <div class="vip-badge">
          <i class="fas fa-crown"></i>
          مستوى VIP {{ userVipLevel }}
        </div>
        <div class="withdraw-condition">
          <i class="fas fa-check-circle" :class="{ 'condition-met': balance >= minWithdrawAmount }"></i>
          <span>الحد الأدنى: <strong>{{ minWithdrawAmount }} USDT</strong></span>
        </div>
        <div class="withdraw-condition">
          <i class="fas fa-check-circle" :class="{ 'condition-met': isAllowedDay }"></i>
          <span>يوم السحب: <strong>{{ withdrawDay }}</strong></span>
        </div>
      </div>

      <div v-else class="vip-status-box error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>يجب أن يكون لديك اشتراك VIP للسحب</p>
      </div>

      <!-- رسائل الخطأ والنجاح -->
      <div v-if="message" class="message" :class="messageType">
        <i :class="messageType === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'"></i>
        {{ message }}
      </div>

      <!-- مبلغ السحب -->
      <div class="input-group">
        <label>
          <i class="fas fa-coins"></i>
          المبلغ
        </label>
        <div class="amount-input-wrapper">
          <input 
            type="number" 
            v-model="amount" 
            placeholder="0.00" 
            class="gold-input"
          />
          <span class="input-currency">USDT</span>
        </div>
      </div>

      <!-- الشبكة -->
      <div class="input-group">
        <label>
          <i class="fas fa-network-wired"></i>
          الشبكة
        </label>
        <div class="select-wrapper">
          <select v-model="network" class="gold-select">
            <option value="">اختر الشبكة</option>
            <option value="TRC20">TRC20</option>
            <option value="ERC20">ERC20</option>
            <option value="BEP20">BEP20</option>
          </select>
          <i class="fas fa-chevron-down select-arrow"></i>
        </div>
      </div>

      <!-- عنوان المحفظة -->
      <div class="input-group">
        <label>
          <i class="fas fa-qrcode"></i>
          عنوان المحفظة
        </label>
        <input 
          type="text" 
          v-model="wallet" 
          placeholder="أدخل عنوان محفظتك USDT" 
          class="gold-input"
        />
      </div>

      <!-- زر السحب -->
      <button 
        class="gold-button" 
        @click="submitWithdraw"
        :disabled="isLoading"
      >
        <i class="fas fa-paper-plane" v-if="!isLoading"></i>
        <i class="fas fa-spinner fa-spin" v-else></i>
        {{ isLoading ? 'جاري المعالجة...' : 'سحب الآن' }}
      </button>

      <!-- معلومات إضافية -->
      <div class="warning-box">
        <i class="fas fa-shield-alt"></i>
        <div class="warning-text">
          <p>سيتم خصم المبلغ من رصيدك فوراً</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, db } from "../firebase";
import { doc, getDoc, runTransaction, collection, addDoc, serverTimestamp } from "firebase/firestore";

export default {
  name: "Withdraw",
  
  data() {
    return {
      balance: 0,
      amount: "",
      network: "",
      wallet: "",
      isLoading: false,
      message: "",
      messageType: "info",
      userVipLevel: null,
      minWithdrawAmount: 5,
      vipLimits: {
        1: 5, 2: 25, 3: 50, 4: 160, 5: 530,
        6: 820, 7: 1120, 8: 2400, 9: 5300, 10: 11300,
        11: 26000, 12: 56000, 13: 120000, 14: 260000
      },
      withdrawDays: {
        1: "السبت", 2: "السبت", 3: "الأحد", 4: "الأحد",
        5: "الاثنين", 6: "الاثنين", 7: "الثلاثاء", 8: "الثلاثاء",
        9: "الأربعاء", 10: "الأربعاء", 11: "الخميس", 12: "الخميس",
        13: "الجمعة", 14: "الجمعة"
      }
    };
  },

  computed: {
    withdrawDay() {
      return this.withdrawDays[this.userVipLevel] || "";
    },

    isAllowedDay() {
      if (!this.userVipLevel) return false;
      
      const dayMap = {
        "السبت": "Saturday",
        "الأحد": "Sunday",
        "الاثنين": "Monday",
        "الثلاثاء": "Tuesday",
        "الأربعاء": "Wednesday",
        "الخميس": "Thursday",
        "الجمعة": "Friday"
      };
      
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
      const allowedDay = this.withdrawDays[this.userVipLevel];
      
      return today === dayMap[allowedDay];
    }
  },

  async created() {
    await this.loadUserData();
  },

  methods: {
    async loadUserData() {
      const user = auth.currentUser;
      if (!user) {
        this.$router.push("/login");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          this.balance = userSnap.data().balance || 0;
        }

        const vipRef = doc(db, "users", user.uid, "vip", "current");
        const vipSnap = await getDoc(vipRef);
        
        if (vipSnap.exists()) {
          this.userVipLevel = vipSnap.data().level;
          this.minWithdrawAmount = this.vipLimits[this.userVipLevel] || 5;
        } else {
          this.showMessage("لا يوجد اشتراك VIP نشط", "error");
        }
      } catch (error) {
        console.error("خطأ:", error);
        this.showMessage("حدث خطأ في تحميل البيانات", "error");
      }
    },

    showMessage(msg, type) {
      this.message = msg;
      this.messageType = type;
      setTimeout(() => {
        this.message = "";
      }, 5000);
    },

    async submitWithdraw() {
      // منع النقر المتكرر
      if (this.isLoading) return;
      
      // إخفاء الرسائل السابقة
      this.message = "";

      // التحقق من وجود مستخدم
      const user = auth.currentUser;
      if (!user) {
        this.showMessage("الرجاء تسجيل الدخول مرة أخرى", "error");
        return;
      }

      // التحقق من VIP
      if (!this.userVipLevel) {
        this.showMessage("يجب أن يكون لديك اشتراك VIP للسحب", "error");
        return;
      }

      // التحقق من اليوم
      if (!this.isAllowedDay) {
        this.showMessage(`السحب متاح فقط يوم ${this.withdrawDay}`, "error");
        return;
      }

      // التحقق من المبلغ
      if (!this.amount || this.amount <= 0) {
        this.showMessage("الرجاء إدخال مبلغ صحيح", "error");
        return;
      }

      // التحقق من تطابق المبلغ مع الحد الأدنى
      if (Number(this.amount) !== this.minWithdrawAmount) {
        this.showMessage(`مبلغ السحب يجب أن يكون بالضبط ${this.minWithdrawAmount} USDT`, "error");
        return;
      }

      // التحقق من الرصيد
      if (this.balance < this.minWithdrawAmount) {
        this.showMessage(`رصيدك غير كاف. تحتاج إلى ${this.minWithdrawAmount} USDT`, "error");
        return;
      }

      // التحقق من الشبكة
      if (!this.network) {
        this.showMessage("الرجاء اختيار الشبكة", "error");
        return;
      }

      // التحقق من عنوان المحفظة
      if (!this.wallet || this.wallet.length < 20) {
        this.showMessage("الرجاء إدخال عنوان محفظة صحيح", "error");
        return;
      }

      // بدء عملية السحب
      this.isLoading = true;

      try {
        const userRef = doc(db, "users", user.uid);
        const withdrawAmount = Number(this.amount);

        // تنفيذ المعاملة
        await runTransaction(db, async (transaction) => {
          const userDoc = await transaction.get(userRef);
          
          if (!userDoc.exists()) {
            throw new Error("المستخدم غير موجود");
          }

          const userData = userDoc.data();
          
          // التحقق النهائي
          if (userData.balance < withdrawAmount) {
            throw new Error("الرصيد غير كاف");
          }

          if (userData.blocked) {
            throw new Error("حسابك محظور من السحب");
          }

          // تحديث الرصيد
          transaction.update(userRef, {
            balance: userData.balance - withdrawAmount
          });

          // إنشاء طلب سحب
          const withdrawRef = doc(collection(db, "withdraw_requests"));
          transaction.set(withdrawRef, {
            userId: user.uid,
            userEmail: user.email,
            amount: withdrawAmount,
            network: this.network,
            wallet: this.wallet,
            status: "pending",
            createdAt: serverTimestamp(),
            vipLevel: this.userVipLevel
          });
        });

        // تسجيل المعاملة
        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          userEmail: user.email,
          type: "withdraw",
          amount: withdrawAmount,
          network: this.network,
          wallet: this.wallet,
          status: "pending",
          createdAt: serverTimestamp()
        });

        // تحديث الرصيد
        this.balance -= withdrawAmount;
        
        // عرض رسالة النجاح
        this.showMessage("✅ تم إرسال طلب السحب بنجاح", "success");
        
        // تفريغ الحقول
        this.amount = "";
        this.network = "";
        this.wallet = "";

      } catch (error) {
        console.error("خطأ:", error);
        this.showMessage(error.message || "حدث خطأ أثناء السحب", "error");
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.withdraw-page {
  min-height: 100vh;
  background: #0A0C10;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
}

.card {
  background: #11151C;
  width: 100%;
  max-width: 500px;
  border-radius: 30px;
  padding: 30px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.card-header {
  text-align: center;
  margin-bottom: 25px;
}

.title {
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 8px;
}

.title i {
  color: #D4AF37;
  font-size: 32px;
}

.title-glow {
  background: linear-gradient(135deg, #D4AF37, #F6E27A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 900;
}

.sub {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.balance-box {
  background: linear-gradient(135deg, #1A1F2A, #11151C);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.balance-icon {
  width: 50px;
  height: 50px;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #D4AF37;
}

.balance-icon i {
  font-size: 24px;
  color: #D4AF37;
}

.balance-info {
  flex: 1;
}

.balance-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
}

.balance-value {
  font-size: 28px;
  font-weight: 800;
  color: #D4AF37;
}

.vip-status-box {
  background: linear-gradient(135deg, #1A1F2A, #11151C);
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 25px;
  border: 1px solid #D4AF37;
}

.vip-status-box.error {
  border-color: #ef4444;
  text-align: center;
  color: #ef4444;
}

.vip-status-box.error i {
  font-size: 24px;
  margin-bottom: 10px;
}

.vip-badge {
  display: inline-block;
  background: linear-gradient(135deg, #D4AF37, #F6E27A);
  color: #0A0C10;
  padding: 8px 16px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 15px;
}

.vip-badge i {
  margin-left: 5px;
}

.withdraw-condition {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.withdraw-condition i {
  color: #666;
  font-size: 16px;
}

.withdraw-condition i.condition-met {
  color: #22c55e;
}

.withdraw-condition strong {
  color: #D4AF37;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #D4AF37;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}

.gold-input {
  width: 100%;
  padding: 14px 20px;
  border-radius: 16px;
  background: #1A1F2A;
  color: #ffffff;
  border: 2px solid rgba(212, 175, 55, 0.3);
  font-size: 15px;
  transition: all 0.3s ease;
}

.gold-input:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
}

.amount-input-wrapper {
  position: relative;
}

.input-currency {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #D4AF37;
  font-weight: 700;
  font-size: 15px;
  background: rgba(212, 175, 55, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.select-wrapper {
  position: relative;
}

.gold-select {
  width: 100%;
  padding: 14px 20px;
  border-radius: 16px;
  background: #1A1F2A;
  color: #ffffff;
  border: 2px solid rgba(212, 175, 55, 0.3);
  font-size: 15px;
  cursor: pointer;
  appearance: none;
}

.gold-select:focus {
  outline: none;
  border-color: #D4AF37;
}

.select-arrow {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #D4AF37;
  pointer-events: none;
  font-size: 14px;
}

.gold-button {
  width: 100%;
  padding: 16px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #D4AF37, #F6E27A);
  color: #0A0C10;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
  box-shadow: 0 5px 20px rgba(212, 175, 55, 0.3);
}

.gold-button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
}

.gold-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message {
  margin: 15px 0;
  padding: 15px 20px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid;
}

.message.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border-color: #22c55e;
}

.message.error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: #ef4444;
}

.warning-box {
  background: rgba(212, 175, 55, 0.05);
  border-right: 4px solid #D4AF37;
  padding: 15px;
  border-radius: 12px;
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.warning-box i {
  color: #D4AF37;
  font-size: 20px;
}

.warning-text p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0;
}

.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 480px) {
  .card {
    padding: 20px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .balance-value {
    font-size: 24px;
  }
}
</style>
