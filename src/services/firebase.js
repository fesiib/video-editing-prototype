import firebase from 'firebase/app';
import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

console.log("here " + process.env.REACT_APP_projectId);

const firebaseConfig = {
    apiKey: process.env.REACT_APP_firebaseKey,
    authDomain: process.env.REACT_APP_authDomain,
    projectId: process.env.REACT_APP_projectId,
    storageBucket: process.env.REACT_APP_storageBucket,
    messagingSenderId: process.env.REACT_APP_messagingSenderId,
    appId: process.env.REACT_APP_appId,
    measurementId: process.env.REACT_APP_measurementId,
};

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();

const analytics = firebaseApp.analytics();

const storage = firebaseApp.storage();

const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider()
export const signInWithGoogle = () => {
  auth.signInWithPopup(googleProvider).then((res) => {
    // user object
    console.log(res.user)
  }).catch((error) => {
    console.log(error.message)
  })
}
export const logOut = () => {
  auth.signOut().then(()=> {
    console.log('logged out')
  }).catch((error) => {
    console.log(error.message)
  })
}

export {db, storage, auth, analytics, firebaseApp, firebase as default};