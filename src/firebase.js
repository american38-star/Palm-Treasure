// ===============================
// firebase.js — الإصدار النهائي (مصحح)
// ===============================

import { initializeApp } from "firebase/app";
import {
getAuth,
sendPasswordResetEmail
} from "firebase/auth";

import {
getFirestore,
collection,
query,
where,
orderBy,
getDocs,
doc,
getDoc
} from "firebase/firestore";

import { getStorage } from "firebase/storage";

import {
getAnalytics,
isSupported
} from "firebase/analytics";

import { getFunctions } from "firebase/functions";

// -------------------------------------------
// إعدادات Firebase الخاصة بتطبيقك
// -------------------------------------------
const firebaseConfig = {
apiKey: "AIzaSyDa0XdGA05G3vt-enGPBfDTD16K4OdoMik",
authDomain: "american-54cbd.firebaseapp.com",
projectId: "american-54cbd",
storageBucket: "american-54cbd.appspot.com",
messagingSenderId: "166955679884",
appId: "1:166955679884:web:5d8701f7ed3e3f78d33ba9",
measurementId: "G-ZL7XR4VCV3"
};

// -------------------------------------------
// تشغيل Firebase
// -------------------------------------------
const app = initializeApp(firebaseConfig);

// -------------------------------------------
// تشغيل Analytics بدون أخطاء
// -------------------------------------------
let analytics = null;

isSupported().then((supported) => {
if (supported) {
try {
analytics = getAnalytics(app);
} catch (err) {
console.warn("Analytics disabled:", err);
}
}
});

// -------------------------------------------
// التصدير الأساسي
// -------------------------------------------
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// -------------------------------------------
// 🔥 جلب بيانات المستخدم (حل مشكلة VIP + الرصيد)
// -------------------------------------------
export const getUserData = async (uid) => {
try {
const docRef = doc(db, "users", uid);
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  return docSnap.data();
} else {
  console.warn("❌ المستخدم غير موجود");
  return null;
}

} catch (error) {
console.error("❌ خطأ في جلب المستخدم:", error);
return null;
}
};

// -------------------------------------------
// 🔥 جلب VIP من subcollection (حل مشكلة VIP)
// -------------------------------------------
export const getUserVIP = async (uid) => {
try {
const vipRef = collection(db, "users", uid, "vip");
const snapshot = await getDocs(vipRef);

if (!snapshot.empty) {
  return snapshot.docs[0].data();
} else {
  return null;
}

} catch (error) {
console.error("❌ خطأ في جلب VIP:", error);
return null;
}
};

// -------------------------------------------
// 🔥 جلب سجل السحب
// -------------------------------------------
export const getWithdrawLogs = async (userId) => {
try {
const q = query(
collection(db, "withdraw_logs"),
where("userId", "==", userId),
orderBy("createdAt", "desc")
);

const snapshot = await getDocs(q);

return snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

} catch (error) {
console.error("❌ خطأ في جلب السحب:", error);
return [];
}
};

// -------------------------------------------
// 🔥 جلب سجل التعبئة
// -------------------------------------------
export const getRechargeLogs = async (userId) => {
try {
const q = query(
collection(db, "recharge_logs"),
where("userId", "==", userId),
orderBy("createdAt", "desc")
);

const snapshot = await getDocs(q);

return snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));

} catch (error) {
console.error("❌ خطأ في جلب التعبئة:", error);
return [];
}
};

// -------------------------------------------
// المعاملات
// -------------------------------------------
export const getTransactionsByUserId = async (userId) => {
try {
const q = query(
collection(db, "transactions"),
where("userId", "==", userId),
orderBy("createdAt", "desc")
);
const snapshot = await getDocs(q);
return snapshot.docs.map(doc => ({
id: doc.id,
...doc.data()
}));
} catch (error) {
console.error("❌ خطأ في جلب المعاملات:", error);
return [];
}
};

// -------------------------------------------
export { analytics };
export { sendPasswordResetEmail };
