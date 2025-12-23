import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED 
} from 'firebase/firestore';

// Configuración real proporcionada por el usuario
const firebaseConfig = {
  apiKey: "AIzaSyDhCIpnVvRRWurk3BpKzMW2O5xGVW5hRec",
  authDomain: "checkauto-app1.firebaseapp.com",
  projectId: "checkauto-app1",
  storageBucket: "checkauto-app1.firebasestorage.app",
  messagingSenderId: "496582868068",
  appId: "1:496582868068:web:22b34bf435d90d7be5f371"
};

const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Firestore with new persistence settings (fixing deprecation warning)
// We use persistentLocalCache with persistentMultipleTabManager to handle offline support across tabs
// Enabled experimentalForceLongPolling to address connection issues in restrictive network environments
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
    })
});