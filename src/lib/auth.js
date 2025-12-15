import { auth } from './firebase';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

// Sign in admin - anyone with valid Firebase Auth credentials is an admin
export const signInAdmin = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        return {
            uid: user.uid,
            email: user.email,
            name: user.displayName || email.split('@')[0],
            role: 'admin'
        };
    } catch (error) {
        console.error('Sign in error:', error);
        throw error;
    }
};

// Sign out admin
export const signOutAdmin = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
};

// Get current admin - if user is logged in, they are admin
export const getCurrentAdmin = async () => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();

            if (!user) {
                resolve(null);
                return;
            }

            resolve({
                uid: user.uid,
                email: user.email,
                name: user.displayName || user.email.split('@')[0],
                role: 'admin'
            });
        });
    });
};

// Subscribe to auth state changes
export const subscribeToAuthState = (callback) => {
    return onAuthStateChanged(auth, (user) => {
        if (!user) {
            callback(null);
            return;
        }

        callback({
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            role: 'admin'
        });
    });
};
