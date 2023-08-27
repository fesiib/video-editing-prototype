import { collection, doc, setDoc } from 'firebase/firestore';
import {firestore} from './firebase';

/*
const pilots = collection(firestore, this.rootStore.collection);
		const pilotsSnapshot = await getDocs(pilots);
		const pilotsList = pilotsSnapshot.docs.map(doc => doc.data());
		const pilot = pilotsList.find(pilot => pilot.userId === this.userId);
		if (pilot) {
			this.curSessionIdx = pilot.curSessionIdx;
			this.curVideoIdx = pilot.curVideoIdx;
		} else {
			this.clearTask();
		}
*/