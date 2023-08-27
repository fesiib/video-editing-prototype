// Import the functions you need from the SDKs you need

import {initializeApp} from 'firebase/app';

import { getFirestore } from 'firebase/firestore';
import { GoogleAuthProvider, browserLocalPersistence, getAuth, onAuthStateChanged, setPersistence, signInWithPopup, signOut } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

const firebaseConfig = {
	apiKey: process.env.REACT_APP_firebaseKey,
    authDomain: process.env.REACT_APP_authDomain,
    projectId: process.env.REACT_APP_projectId,
    storageBucket: process.env.REACT_APP_storageBucket,
    messagingSenderId: process.env.REACT_APP_messagingSenderId,
    appId: process.env.REACT_APP_appId,
	databaseURL: null,
};

const firebaseApp = initializeApp(firebaseConfig);

const firestore = getFirestore(firebaseApp);

const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
	try {
		const result = await signInWithPopup(auth, googleProvider);
		return result;
	} catch (error) {
		return error.message;
	}  
}
const signOutFromGoogle = async () => {
	try {
		const result = await signOut(auth);
		return result;
	} catch (error) {
		return error.message;
	}
}

const authStateChanged = (callback) => {
	return onAuthStateChanged(auth, callback);
}

export { firebaseApp, firestore, signOutFromGoogle, signInWithGoogle, authStateChanged};