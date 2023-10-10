import { getIntersection } from "./chart";

export const isImage = (x: any): x is HTMLImageElement =>
	x instanceof HTMLImageElement;

export const isCanvas = (x: any): x is HTMLCanvasElement =>
	x instanceof HTMLCanvasElement;

const angles = [90, 180, 270] as const;

export const dxy = [
	["leftNeighbours", -1, 0],
	["rightNeighbours", 1, 0],
	["bottomNeighbours", 0, 1],
	["topNeighbours", 0, -1],
] as const;

export const cutFrames = async (
	image: HTMLImageElement,
	size: number,
	offset: number,
	rotate: boolean
): Promise<FrameData[]> => {
	const frequency = new Map<string, FrequencyStore>();

	// Нарезка
	console.time("Нарезка");

	let y = 0;
	while (y + size <= image.height) {
		let x = 0;

		while (x + size <= image.width) {
			const frameData: FrameData = {
				id: -1,
				frequency: 0,
				x,
				y,
				// size,
				angle: 0,
				leftNeighbours: new Set<FrameData>(),
				rightNeighbours: new Set<FrameData>(),
				bottomNeighbours: new Set<FrameData>(),
				topNeighbours: new Set<FrameData>(),
			};

			const dataURL = imageToDataUrl(
				image,
				frameData.x,
				frameData.y,
				size,
				size
			);

			await delay();

			if (frequency.has(dataURL)) {
				const store = frequency.get(dataURL);

				if (store) {
					store.number++;
				}
			} else {
				const store: FrequencyStore = {
					frameDatas: new Set(),
					number: 0,
				};

				frequency.set(dataURL, store);
				store.frameDatas.add(frameData);
				store.number++;

				if (rotate) {
					for (const angle of angles) {
						const rotatedFrameData: FrameData = {
							id: -1,
							frequency: 0,
							x,
							y,
							// size,
							angle,
							leftNeighbours: new Set<FrameData>(),
							rightNeighbours: new Set<FrameData>(),
							bottomNeighbours: new Set<FrameData>(),
							topNeighbours: new Set<FrameData>(),
						};

						const rotatedDataURL = imageToDataUrl(
							image,
							rotatedFrameData.x,
							rotatedFrameData.y,
							size,
							size,
							rotatedFrameData.angle
						);

						await delay();

						if (!frequency.has(rotatedDataURL)) {
							store.frameDatas.add(rotatedFrameData);
							frequency.set(rotatedDataURL, store);
						}
					}
				}
			}

			x += offset;
		}

		y += offset;
	}
	console.timeEnd("Нарезка");

	//  Устанавливает частоту появления фрейма
	console.time("Устанавливает частоту появления фрейма");
	const frameDatasCollection = new Set<FrameData>();
	for (const store of frequency.values()) {
		const { number, frameDatas: fds } = store;

		for (const frameData of fds) {
			frameData.frequency = number;
			frameDatasCollection.add(frameData);
		}
	}
	const frameDatas: FrameData[] = Array.from(frameDatasCollection).sort(
		(a, b) => a.id - b.id
	);
	await delay();
	console.timeEnd("Устанавливает частоту появления фрейма");
	// Нарезка краев
	console.time("Нарезка краев");

	const leftDataUrls = new Map<FrameData, string>();
	const rightDataUrls = new Map<FrameData, string>();
	const bottomDataUrls = new Map<FrameData, string>();
	const topDataUrls = new Map<FrameData, string>();

	for (const finalFrame of frameDatas) {
		const [topDataUrl, rightDataUrl, bottomDataUrl, leftDataUrl] =
			initSideDataUrls(image, size, finalFrame);

		leftDataUrls.set(finalFrame, leftDataUrl);
		rightDataUrls.set(finalFrame, rightDataUrl);
		bottomDataUrls.set(finalFrame, bottomDataUrl);
		topDataUrls.set(finalFrame, topDataUrl);

		await delay();
	}
	console.timeEnd("Нарезка краев");

	// Ищем соседей
	console.time("Ищем соседей");
	for (let i = 0; i < frameDatas.length; i++) {
		const frameData1 = frameDatas[i];

		for (let j = i; j < frameDatas.length; j++) {
			const frameData2 = frameDatas[j];

			if (
				leftDataUrls.get(frameData1) === rightDataUrls.get(frameData2)
			) {
				frameData1.leftNeighbours.add(frameData2);
				frameData2.rightNeighbours.add(frameData1);
			}

			if (
				rightDataUrls.get(frameData1) === leftDataUrls.get(frameData2)
			) {
				frameData1.rightNeighbours.add(frameData2);
				frameData2.leftNeighbours.add(frameData1);
			}

			if (
				bottomDataUrls.get(frameData1) === topDataUrls.get(frameData2)
			) {
				frameData1.bottomNeighbours.add(frameData2);
				frameData2.topNeighbours.add(frameData1);
			}

			if (
				topDataUrls.get(frameData1) === bottomDataUrls.get(frameData2)
			) {
				frameData1.topNeighbours.add(frameData2);
				frameData2.bottomNeighbours.add(frameData1);
			}
		}
	}
	console.timeEnd("Ищем соседей");

	// Раздаем id
	frameDatas.forEach((frameDate, index) => (frameDate.id = index + 1));

	return frameDatas;
};

export const initSideDataUrls = (
	image: HTMLImageElement,
	size: number,
	frameData: FrameData
): [string, string, string, string] => {
	// TODO: Отрсовка напрямую из image для каждого края
	const { x, y } = frameData;
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d") as CanvasRenderingContext2D;
	canvas.width = size;
	canvas.height = size;
	context.drawImage(image, x, y, size, size, 0, 0, size, size);

	// TopDataUrl
	const topDataCanvas = document.createElement("canvas");
	// prettier-ignore
	const topDataContext = topDataCanvas.getContext("2d") as CanvasRenderingContext2D;
	topDataCanvas.width = size;
	topDataCanvas.height = 1;
	topDataContext.drawImage(canvas, 0, 0, size, 1, 0, 0, size, 1);
	const topDataUrl = topDataCanvas.toDataURL("image/png");

	// BottomDataUrl
	const bottomDataCanvas = document.createElement("canvas");
	// prettier-ignore
	const bottomDataContext = bottomDataCanvas.getContext("2d") as CanvasRenderingContext2D;
	bottomDataCanvas.width = size;
	bottomDataCanvas.height = 1;
	bottomDataContext.drawImage(canvas, 0, size - 1, size, 1, 0, 0, size, 1);
	const bottomDataUrl = bottomDataCanvas.toDataURL("image/png");

	// LeftDataUrl
	const leftDataCanvas = document.createElement("canvas");
	// prettier-ignore
	const leftDataContext = leftDataCanvas.getContext("2d") as CanvasRenderingContext2D;
	leftDataCanvas.width = 1;
	leftDataCanvas.height = size;
	leftDataContext.drawImage(canvas, 0, 0, 1, size, 0, 0, 1, size);
	const leftDataUrl = leftDataCanvas.toDataURL("image/png");

	// RightDataUrl
	const rightDataCanvas = document.createElement("canvas");
	// prettier-ignore
	const rightDataContext = rightDataCanvas.getContext("2d") as CanvasRenderingContext2D;
	rightDataCanvas.width = 1;
	rightDataCanvas.height = size;
	rightDataContext.drawImage(canvas, size - 1, 0, 1, size, 0, 0, 1, size);
	const rightDataUrl = rightDataCanvas.toDataURL("image/png");

	return [topDataUrl, rightDataUrl, bottomDataUrl, leftDataUrl];
};

export const loadImage = (src: string) =>
	new Promise<HTMLImageElement>((resolve, reject) => {
		try {
			const image = new Image();
			image.onload = () => resolve(image);
			image.src = src;
		} catch (error: any) {
			reject(error);
		}
	});

export const imageToCanvas = (
	image: HTMLImageElement | HTMLCanvasElement,
	x = 0,
	y = 0,
	width = image.width,
	height = image.height,
	angle = 0
) => {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d") as CanvasRenderingContext2D;

	canvas.width = width;
	canvas.height = height;
	context.drawImage(image, x, y, width, height, 0, 0, width, height);

	if (angle) {
		context.translate(width / 2, height / 2);
		context.rotate((angle * Math.PI) / 180);
		context.translate(-width / 2, -height / 2);
	}

	return canvas;
};

export const imageToDataUrl = (
	image: HTMLImageElement | HTMLCanvasElement,
	x = 0,
	y = 0,
	width = image.width,
	height = image.height,
	angle = 0
) => imageToCanvas(image, x, y, width, height, angle).toDataURL("image/png");

export const serializeFrameDatas = (frameDatas: FrameData[]): string => {
	const items = frameDatas.map(({ ...frameData }) => {
		const item: SerializeFrameData = {
			...frameData,
			leftNeighbours: [],
			rightNeighbours: [],
			bottomNeighbours: [],
			topNeighbours: [],
		};

		return item;
	});

	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const frameData = frameDatas[i];

		for (const leftNeighbour of frameData.leftNeighbours) {
			item.leftNeighbours.push(leftNeighbour.id);
		}

		for (const rightNeighbour of frameData.rightNeighbours) {
			item.rightNeighbours.push(rightNeighbour.id);
		}

		for (const bottomNeighbour of frameData.bottomNeighbours) {
			item.bottomNeighbours.push(bottomNeighbour.id);
		}

		for (const topNeighbour of frameData.topNeighbours) {
			item.topNeighbours.push(topNeighbour.id);
		}
	}

	return JSON.stringify(items);
};

export const deserializeFrameDatas = (json: string): FrameData[] => {
	const items = JSON.parse(json) as SerializeFrameData[];
	const review = new Map<number, FrameData>();

	const frameDatas = items.map((item) => {
		const frameData: FrameData = {
			id: item.id,
			frequency: item.frequency,
			angle: item.angle,

			x: item.x,
			y: item.y,
			// size: item.size,

			leftNeighbours: new Set(),
			rightNeighbours: new Set(),
			bottomNeighbours: new Set(),
			topNeighbours: new Set(),
		};

		review.set(item.id, frameData);

		return frameData;
	});

	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		const frameData = frameDatas[i];

		for (const leftNeighbour of item.leftNeighbours) {
			frameData.leftNeighbours.add(
				review.get(leftNeighbour) as FrameData
			);
		}

		for (const rightNeighbour of item.rightNeighbours) {
			frameData.rightNeighbours.add(
				review.get(rightNeighbour) as FrameData
			);
		}

		for (const bottomNeighbour of item.bottomNeighbours) {
			frameData.bottomNeighbours.add(
				review.get(bottomNeighbour) as FrameData
			);
		}

		for (const topNeighbour of item.topNeighbours) {
			frameData.topNeighbours.add(review.get(topNeighbour) as FrameData);
		}
	}

	return frameDatas;
};

export const delay = (timeout: number = 0) =>
	new Promise((resolve) => setTimeout(resolve, timeout));

export const serializeTopology = (topology: Topology<ID>): string => {
	const array: number[] = [];

	for (const y of topology.keys()) {
		const row = topology.get(y);

		if (!row) {
			continue;
		}

		for (const x of row.keys()) {
			const id = row.get(x);

			if (id === undefined) {
				continue;
			}

			array.push(x, y, id);
		}
	}

	return JSON.stringify(array);
};

export const deserializeTopology = (json: string | number[]): Topology<ID> => {
	const array = typeof json === "string" ? JSON.parse(json) : json;
	const topology: Topology<ID> = new Map();

	for (let i = 0; i < array.length; i += 3) {
		const x = array[i];
		const y = array[i + 1];
		const id = array[i + 2];

		if (!topology.has(y)) {
			topology.set(y, new Map());
		}

		topology.get(y)?.set(x, id);
	}

	return topology;
};

export const createPotential = (
	topology: Topology<ID>,
	frameDatasCollection: FrameDatasCollection
): Potential => {
	const preparation: Topology<Set<FrameData>[]> = new Map();

	for (const cy of topology.keys()) {
		const row = topology.get(cy);

		if (!row) {
			continue;
		}

		for (const cx of row.keys()) {
			const id = row.get(cx);

			if (!id) {
				continue;
			}

			for (const [side, dx, dy] of dxy) {
				const x = cx + dx;
				const y = cy + dy;

				const neighbourId = topology.get(y)?.get(x);

				if (neighbourId) {
					continue;
				}

				if (!preparation.has(y)) {
					preparation.set(y, new Map());
				}

				const row = preparation.get(y);
				if (!row) {
					continue;
				}

				if (!row.has(x)) {
					row.set(x, []);
				}

				const collection = row.get(x);
				if (!collection) {
					continue;
				}

				const neighbours = frameDatasCollection.get(id)?.[side];

				if (!neighbours) {
					continue;
				}

				collection.push(neighbours);
			}
		}
	}

	const potential: Potential = new Map();

	for (const y of preparation.keys()) {
		const row = preparation.get(y);

		if (!row) {
			continue;
		}

		for (const x of row.keys()) {
			const collections = row.get(x);

			if (!collections) {
				continue;
			}

			if (!potential.has(y)) {
				potential.set(y, new Map());
			}

			const frameDatas = potential.get(y);
			if (!frameDatas) {
				continue;
			}

			const variants = getIntersection(collections);
			frameDatas.set(x, variants);
		}
	}

	return potential;
};

export const collapseStep = (
	topology: Topology<ID>,
	frameDatasCollection: FrameDatasCollection,
	frameDatas: FrameData[],
	potential: Potential
): [Topology<ID>, Potential] => {
	if (!frameDatas.length) {
		throw Error("frameDatas empty");
	}

	if (topology.size === 0) {
		topology.set(0, new Map());
		topology.get(0)?.set(0, getRandomFrom(frameDatas).id);

		return [
			new Map(topology),
			createPotential(topology, frameDatasCollection),
		];
	}

	if (!potential.size) {
		potential = createPotential(topology, frameDatasCollection);

		if (!potential.size) {
			throw Error("Potential is empty");
		}
	}

	const controller = new Map<number, [number, number][]>();
	for (const y of potential.keys()) {
		const row = potential.get(y);

		if (!row) {
			continue;
		}

		for (const x of row.keys()) {
			const variants = row.get(x);

			if (!variants) {
				continue;
			}

			const size = variants.size;
			if (!controller.has(size)) {
				controller.set(size, []);
			}

			controller.get(size)?.push([x, y]);
		}
	}

	const numbers = Array.from(controller.keys())
		.filter((n) => n !== 0)
		.sort((a, b) => a - b);

	for (const number of numbers) {
		const coordinats = controller.get(number);

		if (!coordinats) {
			continue;
		}

		const [x, y] = getRandomFrom(coordinats);
		const variants = potential.get(y)?.get(x);

		if (!variants) {
			continue;
		}

		if (topology.get(y)?.get(x)) {
			throw Error("Cell already collapsed.");
		}

		// const frameData = getRandomFrom(variants);
		const frameData = getRandomFromWithWeight(
			variants,
			Array.from(variants.values()).map((variant) => variant.frequency)
		);

		// TODO: обновить ссылку на новый второй уровень топологии

		let row = topology.get(y);

		if (!row) {
			row = new Map<number, number>();
			topology.set(y, row);
		}

		row.set(x, frameData.id);
		topology.set(y, row);
		break;
	}

	const nextTopology = new Map(topology);
	const nextPotential = createPotential(nextTopology, frameDatasCollection);

	return [nextTopology, nextPotential];
};

export const getRandomFrom = <T>(items: Array<T> | Set<T>) => {
	const array = Array.from(items);

	if (!array.length) {
		throw Error("Empty array");
	}

	const index = Math.floor(Math.random() * array.length);
	return array[index];
};

export const getRandomFromWithWeight = <T>(
	items: Array<T> | Set<T>,
	weight: number[]
): T => {
	const array = Array.from(items);

	if (!array.length) {
		throw Error("Empty array");
	}

	const totalSum = weight.reduce((a, b) => a + b);
	const number = Math.floor(Math.random() * totalSum + 1);

	let sum = 0;
	for (let i = 0; i < array.length; i++) {
		sum += weight[i];

		if (sum >= number) {
			return array[i];
		}
	}

	return array.at(-1) as T;
};
