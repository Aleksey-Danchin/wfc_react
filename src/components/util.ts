export const isImage = (x: any): x is HTMLImageElement =>
	x instanceof HTMLImageElement;

export const isCanvas = (x: any): x is HTMLCanvasElement =>
	x instanceof HTMLCanvasElement;

const angles = [Math.PI / 4, Math.PI / 2, (Math.PI * 3) / 4];

export const cutFrames = (
	image: HTMLImageElement,
	size: number,
	rotate: boolean,
	isPersist: boolean = false
): FrameData[] => {
	const imageDataUrl = isPersist ? imageToDataUrl(image) : "";

	if (isPersist) {
		const json = localStorage.getItem(imageDataUrl);

		if (json) {
			return deserializeFrameDatas(json);
		}
	}

	const frequency = new Map<string, FrequencyStore>();

	// Нарезка
	console.time("Нарезка");
	for (let y = 0; y < Math.floor(image.height / size); y++) {
		for (let x = 0; x < Math.floor(image.width / size); x++) {
			const frameData: FrameData = {
				id: -1,
				frequency: 0,
				x: x * size,
				y: y * size,
				size,
				leftNeighbours: new Set<FrameData>(),
				rightNeighbours: new Set<FrameData>(),
				bottomNeighbours: new Set<FrameData>(),
				topNeighbours: new Set<FrameData>(),
			};

			const dataURL = imageToDataUrl(
				image,
				frameData.x,
				frameData.y,
				frameData.size,
				frameData.size
			);

			if (frequency.has(dataURL)) {
				const store = frequency.get(dataURL);

				if (store) {
					store.number++;
				}

				continue;
			}

			const store: FrequencyStore = {
				dataUrls: new Set(),
				frameDatas: new Set(),
				number: 0,
			};

			store.dataUrls.add(dataURL);
			store.frameDatas.add(frameData);
			store.number++;

			if (rotate) {
				for (const angle of angles) {
					const rotatedFrameData = createRotatedFrameData(
						image,
						frameData,
						angle
					);

					const rotatedDataURL = imageToDataUrl(
						image,
						rotatedFrameData.x,
						rotatedFrameData.y,
						rotatedFrameData.size,
						rotatedFrameData.size
					);

					store.dataUrls.add(rotatedDataURL);
					store.frameDatas.add(rotatedFrameData);
				}
			}
		}
	}
	console.timeEnd("Нарезка");

	//  Устанавливает частоту появления фрейма
	console.time("Устанавливает частоту появления фрейма");
	const frameDatas: FrameData[] = [];
	for (const store of frequency.values()) {
		const { number, frameDatas: fds } = store;

		for (const frameData of fds) {
			frameData.frequency = number;
			frameDatas.push(frameData);
		}
	}
	console.timeEnd("Устанавливает частоту появления фрейма");

	// Получаем версии тех же фреймов, но развернутых на 90, 180 и 270 градусов
	// console.time(
	// 	"Получаем версии тех же фреймов, но развернутых на 90, 180 и 270 градусов"
	// );
	// if (rotate) {
	// 	const angles = [Math.PI / 4, Math.PI / 2, (Math.PI * 3) / 4];

	// 	for (const frameData of frameDatas.values()) {
	// 		for (const angle of angles) {
	// 			const rotatedFrameData = createRotatedFrameData(
	// 				image,
	// 				frameData,
	// 				angle
	// 			);

	// 			const dataURL = imageToDataUrl(
	// 				image,
	// 				rotatedFrameData.x,
	// 				rotatedFrameData.y,
	// 				rotatedFrameData.size,
	// 				rotatedFrameData.size
	// 			);

	// 			if (!frameDatas.has(dataURL)) {
	// 				frameDatas.set(dataURL, rotatedFrameData);
	// 			}
	// 		}
	// 	}
	// }
	// console.timeEnd(
	// 	"Получаем версии тех же фреймов, но развернутых на 90, 180 и 270 градусов"
	// );

	// Нарезка краев
	console.time("Нарезка краев");

	const leftDataUrls = new Map<FrameData, string>();
	const rightDataUrls = new Map<FrameData, string>();
	const bottomDataUrls = new Map<FrameData, string>();
	const topDataUrls = new Map<FrameData, string>();

	frameDatas.forEach((finalFrame) => {
		const [topDataUrl, rightDataUrl, bottomDataUrl, leftDataUrl] =
			initSideDataUrls(image, finalFrame);

		leftDataUrls.set(finalFrame, leftDataUrl);
		rightDataUrls.set(finalFrame, rightDataUrl);
		bottomDataUrls.set(finalFrame, bottomDataUrl);
		topDataUrls.set(finalFrame, topDataUrl);
	});
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

	// Сериализация
	console.time("Сериализация");
	if (isPersist) {
		localStorage.setItem(imageDataUrl, serializeFrameDatas(frameDatas));
	}
	console.timeEnd("Сериализация");

	return frameDatas;
};

export const initSideDataUrls = (
	image: HTMLImageElement,
	frameData: FrameData
): [string, string, string, string] => {
	// TODO: Отрсовка напрямую из image для каждого края
	const { size, x, y } = frameData;
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

export const createRotatedFrameData = (
	image: HTMLImageElement,
	frameData: FrameData,
	angle: number
): FrameData => {
	const { x, y, size } = frameData;

	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d") as CanvasRenderingContext2D;

	canvas.width = size;
	canvas.height = size;

	context.drawImage(image, x, y, size, size, 0, 0, size, size);
	context.translate(size / 2, size / 2);
	context.rotate(angle);
	context.translate(-size / 2, -size / 2);

	const rotatedFrameData = {
		...frameData,

		canvas,
		dataURL: canvas.toDataURL("image/png"),

		leftNeighbours: new Set<FrameData>(),
		rightNeighbours: new Set<FrameData>(),
		bottomNeighbours: new Set<FrameData>(),
		topNeighbours: new Set<FrameData>(),
	};

	return rotatedFrameData;
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

export const imageToDataUrl = (
	image: HTMLImageElement | HTMLCanvasElement,
	x = 0,
	y = 0,
	width = image.width,
	height = image.height
): string => {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d") as CanvasRenderingContext2D;
	canvas.width = width;
	canvas.height = height;
	context.drawImage(image, x, y, width, height, 0, 0, width, height);
	return canvas.toDataURL("image/png");
};

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

const deserializeFrameDatas = (json: string): FrameData[] => {
	const items = JSON.parse(json) as SerializeFrameData[];
	const review = new Map<number, FrameData>();

	const frameDatas = items.map((item) => {
		const frameData: FrameData = {
			id: item.id,
			// canvas: document.createElement("canvas"),
			frequency: item.frequency,
			// dataURL: item.dataURL,

			x: item.x,
			y: item.y,
			size: item.size,

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
