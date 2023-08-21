import { v4 as uuidv4 } from 'uuid';

export function randomUUID() {
	return uuidv4();
}

export function flattenObject(object) {
	const flattened = {};
	if (object === null) {
		return flattened;
	}
	if (typeof object !== "object") {
		return object;
	}
	for (let key of Object.keys(object)) {
		if (typeof object[key] === "object") {
			const subObject = flattenObject(object[key]);
			for (let subKey of Object.keys(subObject)) {
				flattened[`${key}.${subKey}`] = subObject[subKey];
			}
		}
		else {
			flattened[key] = object[key];
		}
	}
	return flattened;
}

export function unFlattenObject(object) {
	const unFlattened = {};
	if (object === null) {
		return unFlattened;
	}
	if (typeof object !== "object") {
		return object;
	}
	for (let key of Object.keys(object)) {
		const keyParts = key.split(".");
		if (keyParts.length > 1) {
			const subObject = {};
			subObject[keyParts.slice(1).join(".")] = object[key];
			unFlattened[keyParts[0]] = unFlattenObject(subObject);
		}
		else {
			unFlattened[key] = object[key];
		}
	}
	return unFlattened;
}

export function isNumeric(value) {
	if (typeof value !== "string") {
		return false;
	}
	return !isNaN(value) && !isNaN(parseFloat(value)) && isFinite(value);
}

export function roundNumber(value, decimals) {
	return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function adaptCoordinate(coorindate, objectSize, projectSize, canvasSize) {
	return (canvasSize / 2) + (coorindate + (objectSize / 2) - (projectSize / 2));
	//return (canvasSize / 2) + (coorindate - (projectSize / 2));
}

export function groundCoordinate(coordinate, objectSize, projectSize, canvasSize) {
	return coordinate - (canvasSize / 2) + (projectSize / 2) - (objectSize / 2);
	//return coordinate - (canvasSize / 2) + (projectSize / 2);
}

export function rotatePoint({ x, y }, angle) {
	const rad = angle * Math.PI / 180;
	const rcos = Math.cos(rad);
	const rsin = Math.sin(rad);
	return { x: x * rcos - y * rsin, y: y * rcos + x * rsin };
};