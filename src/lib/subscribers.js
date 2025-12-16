import { db } from './firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    where,
    deleteDoc,
    doc
} from 'firebase/firestore';

const SUBSCRIBERS_COLLECTION = 'subscribers';

// Subscribe to newsletter
export const subscribeToNewsletter = async (email) => {
    try {
        // Check if email already exists
        const q = query(
            collection(db, SUBSCRIBERS_COLLECTION),
            where('email', '==', email.toLowerCase())
        );
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
            return { success: false, message: 'Email already subscribed' };
        }

        // Add new subscriber
        await addDoc(collection(db, SUBSCRIBERS_COLLECTION), {
            email: email.toLowerCase(),
            subscribedAt: serverTimestamp(),
            status: 'active'
        });

        return { success: true, message: 'Successfully subscribed!' };
    } catch (error) {
        console.error('Subscribe error:', error);
        return { success: false, message: 'Failed to subscribe. Please try again.' };
    }
};

// Get all subscribers (admin only)
export const getAllSubscribers = async () => {
    try {
        // Simple query without orderBy to avoid index requirement
        const snapshot = await getDocs(collection(db, SUBSCRIBERS_COLLECTION));
        const subscribers = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Sort client-side
        return subscribers.sort((a, b) => {
            const dateA = a.subscribedAt?.toDate?.() || new Date(0);
            const dateB = b.subscribedAt?.toDate?.() || new Date(0);
            return dateB - dateA;
        });
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        return [];
    }
};

// Get subscriber count
export const getSubscriberCount = async () => {
    try {
        const q = query(
            collection(db, SUBSCRIBERS_COLLECTION),
            where('status', '==', 'active')
        );
        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (error) {
        console.error('Error getting subscriber count:', error);
        return 0;
    }
};

// Delete subscriber (admin only)
export const deleteSubscriber = async (subscriberId) => {
    try {
        await deleteDoc(doc(db, SUBSCRIBERS_COLLECTION, subscriberId));
        return { success: true, message: 'Subscriber deleted successfully' };
    } catch (error) {
        console.error('Error deleting subscriber:', error);
        return { success: false, message: 'Failed to delete subscriber' };
    }
};
