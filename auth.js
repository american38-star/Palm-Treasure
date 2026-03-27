import { defineStore } from 'pinia'
import { ref } from 'vue'
import CryptoJS from 'crypto-js'

// مفتاح التشفير - يفضل وضعه في متغيرات البيئة
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'your-32-character-encryption-key!'

// خدمة التشفير المدمجة
const encryptionService = {
  encrypt(data) {
    try {
      const jsonString = JSON.stringify(data)
      return CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString()
    } catch (error) {
      console.error('Encryption error:', error)
      return null
    }
  },

  decrypt(encryptedData) {
    try {
      if (!encryptedData) return null
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8)
      if (!decryptedString) return null
      return JSON.parse(decryptedString)
    } catch (error) {
      console.error('Decryption error:', error)
      return null
    }
  },

  setItem(key, value) {
    const encrypted = this.encrypt(value)
    if (encrypted) {
      localStorage.setItem(key, encrypted)
      return true
    }
    return false
  },

  getItem(key) {
    const encrypted = localStorage.getItem(key)
    if (!encrypted) return null
    return this.decrypt(encrypted)
  },

  removeItem(key) {
    localStorage.removeItem(key)
  }
}

export const useAuthStore = defineStore('auth', () => {

  // -------------------------------
  // قراءة الـ Token بشكل آمن
  // -------------------------------
  const decryptedToken = encryptionService.getItem('token')
  const token = ref(decryptedToken || '')

  // -------------------------------
  // قراءة بيانات المستخدم بشكل آمن
  // -------------------------------
  const decryptedUser = encryptionService.getItem('user')
  const user = ref(decryptedUser || null)

  // -------------------------------
  // إضافة userId (الـ UID الخاص بالمستخدم)
  // -------------------------------
  const userId = ref(user.value?.uid || '')

  // -------------------------------
  // اللغة (غير حساسة)
  // -------------------------------
  const lang = ref(localStorage.getItem('lang') || 'ar')
  
  // التحقق من وجود document قبل استخدامه (للتوافق مع SSR)
  if (typeof document !== 'undefined') {
    document.documentElement.dir = lang.value === 'ar' ? 'rtl' : 'ltr'
  }

  // -------------------------------
  // تخزين معلومات المستخدم بشكل آمن مع التشفير
  // -------------------------------
  function setAuth(t, u) {
    token.value = t
    user.value = u
    userId.value = u?.uid || ''
    
    if (t) {
      encryptionService.setItem('token', t)
    } else {
      encryptionService.removeItem('token')
    }
    
    if (u) {
      encryptionService.setItem('user', u)
    } else {
      encryptionService.removeItem('user')
    }
  }

  // -------------------------------
  // تسجيل الخروج
  // -------------------------------
  function logout() {
    token.value = ''
    user.value = null
    userId.value = ''
    encryptionService.removeItem('token')
    encryptionService.removeItem('user')
  }

  // -------------------------------
  // تغيير اللغة
  // -------------------------------
  function setLang(code) {
    lang.value = code
    localStorage.setItem('lang', code)
    if (typeof document !== 'undefined') {
      document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    }
  }

  return {
    token,
    user,
    userId,
    lang,
    setAuth,
    logout,
    setLang,
  }
})
