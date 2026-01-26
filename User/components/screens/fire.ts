// components/screens/fire.ts
import { initializeApp, getApps, getApp } from "firebase/app";
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyDjmsafO-yN1AkH4haiulbn3i0ldQq7SUg",
    authDomain: "otp-verification-75924.firebaseapp.com",
    projectId: "otp-verification-75924",
    storageBucket: "otp-verification-75924.firebasestorage.app",
    messagingSenderId: "1064403680841",
    appId: "1:1064403680841:web:15cd19a01ea81cbf648998",
    measurementId: "G-GZ3841CNVT"
};

// Singleton App Initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * Singleton Auth Initialization
 * This prevents the "Component auth has not been registered yet" error
 * by checking if an auth instance exists before trying to initialize it.
 */
let auth: Auth;

try {
    // Try to get existing instance
    auth = getAuth(app);
} catch (e) {
    // If it fails, it means it hasn't been initialized yet
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
}

export { app, auth, firebaseConfig };