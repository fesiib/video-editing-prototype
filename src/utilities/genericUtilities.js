import { v4 as uuidv4 } from 'uuid';

export function randomUUID() {
	return uuidv4();
}

function sameText(text1, text2) {
	if (text1 === text2) {
		return true;
	}
	if (text1 === null || text2 === null) {
		return false;
	}
	text1 = text1.trim().lowerCase();
	text2 = text2.trim().lowerCase();
	
	if (text1.length !== text2.length) {
		return false;
	}

	for (let idx = 0; idx < text1.length; idx++) {
		if (text1[idx] !== text2[idx]) {
			return false;
		}
	}
	return true;
}

export function findSubstr(text, offset, targetText) {
	// if offset is correct
	// return [offset, offset + targetText.length];

	const targetTextLength = targetText.length;
	const textLength = text.length;

	const start = Math.min(textLength - targetTextLength + 1, Math.max(0, offset));

	for (let idx = start; idx < textLength - targetTextLength + 1; idx++) {
		if (text.slice(idx, idx + targetTextLength) === targetText) {
			return [idx, idx + targetTextLength];
		}
	}
	for (let idx = 0; idx < start; idx++) {
		if (text.slice(idx, idx + targetTextLength) === targetText) {
			return [idx, idx + targetTextLength];
		}
	}
	return null;
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

export function sliceTextArray(textArray, source, key) {
	let newTextArray = [];
	for (let single of textArray) {
		const text = single.text;
		const type = single.type;
		if (type.includes(key) === true || text.includes(source) === false) {
			newTextArray.push({
				text: text,
				type: type.slice(0),
			});
			continue;
		}
		const parts = text.split(source);
		for (let part_idx = 0; part_idx < parts.length - 1; part_idx++) {
			let part = parts[part_idx];
			if (part_idx === 0) {
				part = part.trimEnd();
			}
			else {
				part = part.trim();
			}
			if (part !== "") {
				newTextArray.push({
					text: part,
					type: type.slice(0),
				});
			}
			newTextArray.push({
				text: source,
				type: [...type.slice(0), key],
			});
		}
		let lastPart = parts[parts.length - 1];
		if (lastPart !== "") {
			newTextArray.push({
				text: lastPart.trimStart(),
				type: type.slice(0),
			});
		}
	}
	return newTextArray;
}