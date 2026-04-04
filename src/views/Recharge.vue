<template>
  <div class="recharge-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="back-btn" @click="$router.back()">
        <i class="fas fa-chevron-right"></i>
      </div>
      <h1 class="page-title">إيداع العملات الرقمية</h1>
      <div class="history-btn" @click="$router.push('/transactions')">
        <i class="fas fa-history"></i>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- Step 1: Select Asset & Network -->
      <div class="section-card">
        <div class="section-header">
          <span class="step-num">1</span>
          <h2 class="section-title">اختيار الشبكة</h2>
        </div>
        
        <div class="asset-selector">
          <div class="asset-icon">
            <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" alt="USDT">
          </div>
          <div class="asset-info">
            <span class="asset-name">USDT</span>
            <span class="asset-fullname">Tether US</span>
          </div>
        </div>

        <div class="network-grid">
          <div 
            v-for="(addr, net) in addresses" 
            :key="net"
            class="network-item"
            :class="{ active: network === net }"
            @click="network = net"
          >
            <span class="network-name">{{ net }}</span>
            <i v-if="network === net" class="fas fa-check-circle"></i>
          </div>
        </div>
        
        <div class="network-warning">
          <i class="fas fa-exclamation-triangle"></i>
          <span>تأكد من اختيار الشبكة الصحيحة لتجنب فقدان الأموال.</span>
        </div>
      </div>

      <!-- Step 2: Deposit Details -->
      <div class="section-card">
        <div class="section-header">
          <span class="step-num">2</span>
          <h2 class="section-title">تفاصيل الإيداع</h2>
        </div>

        <div class="qr-container">
          <div class="qr-wrapper">
            <img :src="getQr(network)" :alt="network" class="qr-image" />
            <div class="qr-overlay" v-if="loading">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
          </div>
          <p class="qr-hint">امسح رمز QR للإيداع</p>
        </div>

        <div class="address-box">
          <label class="input-label">عنوان الإيداع ({{ network }})</label>
          <div class="address-input-wrapper">
            <input 
              type="text" 
              :value="getAddress(network)" 
              readonly 
              class="address-field"
              ref="addrInput"
            />
            <button class="copy-action" @click="copyAddress">
              <i :class="copied ? 'fas fa-check' : 'far fa-copy'"></i>
            </button>
          </div>
          <transition name="fade">
            <span v-if="copied" class="copy-success">تم النسخ بنجاح!</span>
          </transition>
        </div>
      </div>

      <!-- Step 3: Confirm Transaction -->
      <div class="section-card">
        <div class="section-header">
          <span class="step-num">3</span>
          <h2 class="section-title">تأكيد العملية</h2>
        </div>

        <div class="form-group">
          <label class="input-label">المبلغ المراد إيداعه</label>
          <div class="input-wrapper">
            <input 
              type="number" 
              v-model.number="amount" 
              placeholder="0.00" 
              class="main-input"
            />
            <span class="input-suffix">USDT</span>
          </div>
        </div>

        <div class="form-group">
          <label class="input-label">معرف المعاملة (TxID / Hash)</label>
          <div class="input-wrapper">
            <input 
              type="text" 
              v-model="txid" 
              placeholder="أدخل معرف العملية هنا" 
              class="main-input"
            />
          </div>
          <p class="input-hint">أدخل الـ Hash الخاص بالعملية لضمان سرعة التأكيد.</p>
        </div>

        <button class="submit-btn" @click="submit" :disabled="loading">
          <span v-if="!loading">تأكيد الإيداع</span>
          <i v-else class="fas fa-circle-notch fa-spin"></i>
        </button>

        <transition name="slide-up">
          <div v-if="message" :class="['status-msg', messageType]">
            <i :class="messageType === 'error' ? 'fas fa-times-circle' : 'fas fa-check-circle'"></i>
            {{ message }}
          </div>
        </transition>
      </div>

      <!-- Important Notes -->
      <div class="notes-section">
        <h3 class="notes-title">ملاحظات هامة:</h3>
        <ul class="notes-list">
          <li>الحد الأدنى للإيداع هو <strong>10 USDT</strong>.</li>
          <li>سيتم إضافة الرصيد بعد <strong>3 تأكيدات</strong> على الشبكة.</li>
          <li>تأكد من إرسال <strong>USDT</strong> فقط إلى هذا العنوان.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default {
  name: "Recharge",
  data() {
    return {
      network: "TRC20",
      amount: null,
      txid: "",
      copied: false,
      loading: false,
      message: "",
      messageType: "info",
      addresses: {
        TRC20: "TC9YKMxacLkvJLA6JbQVGofnjumTqkaUjD",
        ERC20: "0x17e488f699CC96E4dd05e4E2c869789534E2F634",
        BEP20: "0x17e488f699CC96E4dd05e4E2c869789534E2F634",
        SOL: "GgVi3xNRUQeJrNqt8Hg3eBJx5B8yuyggjNvvHxxKVnTR",
      },
      userEmail: "",
      userId: "",
    };
  },
  created() {
    const auth = getAuth();
    auth.onAuthStateChanged((u) => {
      if (u) {
        this.userEmail = u.email;
        this.userId = u.uid;
      }
    });
  },
  methods: {
    getQr(net) {
      return `/qr/${net}.png`;
    },
    getAddress(net) {
      return this.addresses[net] || "";
    },
    async copyAddress() {
      const text = this.getAddress(this.network);
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        this.copied = true;
        setTimeout(() => (this.copied = false), 2000);
      } catch (err) {
        const input = this.$refs.addrInput;
        input.select();
        document.execCommand("copy");
        this.copied = true;
        setTimeout(() => (this.copied = false), 2000);
      }
    },
    async submit() {
      this.message = "";
      if (!this.userId) {
        this.message = "يرجى تسجيل الدخول أولاً";
        this.messageType = "error";
        return;
      }
      if (!this.amount || this.amount <= 0) {
        this.message = "الرجاء إدخال مبلغ صالح";
        this.messageType = "error";
        return;
      }
      if (!this.txid || this.txid.trim() === "") {
        this.message = "الرجاء إدخال معرف التحويل (TxID)";
        this.messageType = "error";
        return;
      }
      this.loading = true;
      try {
        await addDoc(collection(db, "payments"), {
          userId: this.userId,
          email: this.userEmail,
          amount: this.amount,
          txid: this.txid,
          network: this.network,
          status: "pending",
          createdAt: serverTimestamp(),
        });
        await addDoc(collection(db, "transactions"), {
          userId: this.userId,
          email: this.userEmail,
          type: "recharge",
          amount: this.amount,
          network: this.network,
          txid: this.txid,
          status: "pending",
          reason: "",
          adminMessage: "",
          createdAt: serverTimestamp(),
        });
        this.message = "تم إرسال طلب التعبئة بنجاح! سيتم التحقق منه قريباً.";
        this.messageType = "success";
        this.amount = null;
        this.txid = "";
      } catch (error) {
        console.error(error);
        this.message = "حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقاً.";
        this.messageType = "error";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.recharge-container {
  min-height: 100vh;
  background-color: #0b0e11;
  color: #eaecef;
  padding-bottom: 40px;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: #181a20;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #2b2f36;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.back-btn, .history-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
}

.back-btn:hover, .history-btn:hover {
  background: #2b2f36;
}

.content-wrapper {
  max-width: 600px;
  margin: 0 auto;
  padding: 15px;
}

.section-card {
  background: #181a20;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid #2b2f36;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.step-num {
  background: #fcd535;
  color: #0b0e11;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.asset-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #2b2f36;
  border-radius: 12px;
  margin-bottom: 20px;
}

.asset-icon img {
  width: 32px;
  height: 32px;
}

.asset-name {
  display: block;
  font-weight: 600;
  font-size: 16px;
}

.asset-fullname {
  display: block;
  font-size: 12px;
  color: #848e9c;
}

.network-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 15px;
}

.network-item {
  padding: 12px;
  background: #2b2f36;
  border: 1px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s;
}

.network-item.active {
  border-color: #fcd535;
  background: rgba(252, 213, 53, 0.05);
}

.network-item.active .network-name {
  color: #fcd535;
}

.network-item i {
  color: #fcd535;
  font-size: 14px;
}

.network-name {
  font-weight: 500;
  font-size: 14px;
}

.network-warning {
  display: flex;
  gap: 8px;
  background: rgba(240, 185, 11, 0.1);
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
  color: #f0b90b;
}

.qr-container {
  text-align: center;
  margin-bottom: 25px;
}

.qr-wrapper {
  position: relative;
  display: inline-block;
  background: #fff;
  padding: 10px;
  border-radius: 12px;
  margin-bottom: 10px;
}

.qr-image {
  width: 160px;
  height: 160px;
  display: block;
}

.qr-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(24, 26, 32, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.qr-hint {
  font-size: 13px;
  color: #848e9c;
}

.address-box {
  position: relative;
}

.input-label {
  display: block;
  font-size: 13px;
  color: #848e9c;
  margin-bottom: 8px;
}

.address-input-wrapper {
  display: flex;
  background: #2b2f36;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.address-input-wrapper:focus-within {
  border-color: #fcd535;
}

.address-field {
  flex: 1;
  background: transparent;
  border: none;
  padding: 14px;
  color: #eaecef;
  font-family: monospace;
  font-size: 13px;
  outline: none;
}

.copy-action {
  background: #3b3f46;
  border: none;
  color: #fcd535;
  padding: 0 15px;
  cursor: pointer;
  transition: background 0.2s;
}

.copy-action:hover {
  background: #4b4f56;
}

.copy-success {
  position: absolute;
  bottom: -22px;
  right: 0;
  font-size: 11px;
  color: #0ecb81;
}

.form-group {
  margin-bottom: 20px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #2b2f36;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-color: #fcd535;
}

.main-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 14px;
  color: #eaecef;
  font-size: 15px;
  outline: none;
}

.input-suffix {
  padding: 0 15px;
  color: #848e9c;
  font-weight: 600;
  font-size: 14px;
}

.input-hint {
  font-size: 12px;
  color: #848e9c;
  margin-top: 6px;
}

.submit-btn {
  width: 100%;
  background: #fcd535;
  color: #0b0e11;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s, opacity 0.2s;
  margin-top: 10px;
}

.submit-btn:hover {
  opacity: 0.9;
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status-msg {
  margin-top: 15px;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-msg.success {
  background: rgba(14, 203, 129, 0.1);
  color: #0ecb81;
}

.status-msg.error {
  background: rgba(246, 70, 93, 0.1);
  color: #f6465d;
}

.notes-section {
  padding: 10px;
}

.notes-title {
  font-size: 14px;
  font-weight: 600;
  color: #848e9c;
  margin-bottom: 10px;
}

.notes-list {
  padding-right: 20px;
  margin: 0;
}

.notes-list li {
  font-size: 12px;
  color: #848e9c;
  margin-bottom: 6px;
  line-height: 1.6;
}

.notes-list li strong {
  color: #eaecef;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.3s ease-out;
}
.slide-up-enter-from {
  transform: translateY(10px);
  opacity: 0;
}

@media (max-width: 480px) {
  .network-grid {
    grid-template-columns: 1fr;
  }
  
  .qr-image {
    width: 140px;
    height: 140px;
  }
}
</style>
