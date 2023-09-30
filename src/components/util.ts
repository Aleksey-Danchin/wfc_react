export const isImage = (x: any): x is HTMLImageElement =>
	x instanceof HTMLImageElement;

export const isCanvas = (x: any): x is HTMLCanvasElement =>
	x instanceof HTMLCanvasElement;

export const cutFrames = (
	image: HTMLImageElement,
	size: number,
	rotate: boolean,
	isPersist: boolean = false
): FrameData[] => {
	const imageDataUrl = isPersist ? getDataUrl(image) : "";

	if (isPersist) {
		const json = localStorage.getItem(imageDataUrl);

		if (json) {
			return deserializeFrameDatas(json);
		}
	}

	const frameDatas = new Map<string, FrameData>();
	const frequency = new Map<string, number>();

	// Нарезка
	for (let y = 0; y < Math.floor(image.height / size); y++) {
		for (let x = 0; x < Math.floor(image.width / size); x++) {
			const dataFrame = cutFrame(image, x * size, y * size, size);

			if (!frameDatas.has(dataFrame.dataURL)) {
				frameDatas.set(dataFrame.dataURL, dataFrame);
			}

			if (!frequency.has(dataFrame.dataURL)) {
				frequency.set(dataFrame.dataURL, 0);
			}

			// prettier-ignore
			// @ts-ignore
			frequency.set(dataFrame.dataURL, frequency.get(dataFrame.dataURL) + 1);
		}
	}
	//  Устанавливает частоту появления фрейма
	for (const dataURL of frameDatas.keys()) {
		const number = frequency.get(dataURL) as number;
		// @ts-ignore
		frameDatas.get(dataURL).frequency = number;
	}
	// Получаем версии тех же фреймов, но развернутых на 90, 180 и 270 градусов

	if (rotate) {
		const angles = [Math.PI / 4, Math.PI / 2, (Math.PI * 3) / 4];

		for (const frameData of frameDatas.values()) {
			for (const angle of angles) {
				const rotatedFrameData = createRotatedFrameData(
					frameData,
					angle
				);

				if (!frameDatas.has(rotatedFrameData.dataURL)) {
					frameDatas.set(rotatedFrameData.dataURL, rotatedFrameData);
				}
			}
		}
	}
	// Нарезка краев
	const finalFrameDates = Array.from(frameDatas.values());

	const leftDataUrls = new Map<string, string>();
	const rightDataUrls = new Map<string, string>();
	const bottomDataUrls = new Map<string, string>();
	const topDataUrls = new Map<string, string>();

	finalFrameDates.forEach((finalFrame) => {
		const [topDataUrl, rightDataUrl, bottomDataUrl, leftDataUrl] =
			initSideDataUrls(finalFrame);

		leftDataUrls.set(finalFrame.dataURL, leftDataUrl);
		rightDataUrls.set(finalFrame.dataURL, rightDataUrl);
		bottomDataUrls.set(finalFrame.dataURL, bottomDataUrl);
		topDataUrls.set(finalFrame.dataURL, topDataUrl);
	});

	// Ищем соседей
	for (let i = 0; i < finalFrameDates.length; i++) {
		const frameData1 = finalFrameDates[i];

		for (let j = i; j < finalFrameDates.length; j++) {
			const frameData2 = finalFrameDates[j];

			if (
				leftDataUrls.get(frameData1.dataURL) ===
				rightDataUrls.get(frameData2.dataURL)
			) {
				frameData1.leftNeighbours.add(frameData2);
				frameData2.rightNeighbours.add(frameData1);
			}

			if (
				rightDataUrls.get(frameData1.dataURL) ===
				leftDataUrls.get(frameData2.dataURL)
			) {
				frameData1.rightNeighbours.add(frameData2);
				frameData2.leftNeighbours.add(frameData1);
			}

			if (
				bottomDataUrls.get(frameData1.dataURL) ===
				topDataUrls.get(frameData2.dataURL)
			) {
				frameData1.bottomNeighbours.add(frameData2);
				frameData2.topNeighbours.add(frameData1);
			}

			if (
				topDataUrls.get(frameData1.dataURL) ===
				bottomDataUrls.get(frameData2.dataURL)
			) {
				frameData1.topNeighbours.add(frameData2);
				frameData2.bottomNeighbours.add(frameData1);
			}
		}
	}
	if (isPersist) {
		localStorage.setItem(
			imageDataUrl,
			serializeFrameDatas(finalFrameDates)
		);
	}

	return finalFrameDates;
};

export const cutFrame = (
	image: HTMLImageElement,
	x: number,
	y: number,
	size: number
): FrameData => {
	const frameData: FrameData = {
		canvas: document.createElement("canvas"),
		frequency: 0,
		dataURL: "",
		size,

		leftNeighbours: new Set<FrameData>(),
		rightNeighbours: new Set<FrameData>(),
		bottomNeighbours: new Set<FrameData>(),
		topNeighbours: new Set<FrameData>(),

		leftNeighbour: null,
		rightNeighbour: null,
		bottomNeighbour: null,
		topNeighbour: null,
	};

	const { canvas } = frameData;
	const context = canvas.getContext("2d") as CanvasRenderingContext2D;

	canvas.width = size;
	canvas.height = size;

	context.drawImage(image, x, y, size, size, 0, 0, size, size);
	frameData.dataURL = canvas.toDataURL("image/png");

	return frameData;
};

export const initSideDataUrls = (
	frameData: FrameData
): [string, string, string, string] => {
	const { canvas, size } = frameData;

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
	frameData: FrameData,
	angle: number
): FrameData => {
	const { size } = frameData;

	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d") as CanvasRenderingContext2D;

	canvas.width = size;
	canvas.height = size;

	context.drawImage(frameData.canvas, 0, 0, size, size, 0, 0, size, size);
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

export const getDataUrl = (
	image: HTMLImageElement | HTMLCanvasElement
): string => {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d") as CanvasRenderingContext2D;
	canvas.width = image.width;
	canvas.height = image.height;
	context.drawImage(image, 0, 0);
	return canvas.toDataURL("image/png");
};

export const serializeFrameDatas = (frameDatas: FrameData[]): string => {
	const items: any[] = frameDatas.map(({ canvas, ...frameData }, index) => ({
		...frameData,
	}));

	for (const item of items) {
		if (item.leftNeighbour) {
			item.leftNeighbour = item.leftNeighbour.dataURL;
		}

		if (item.rightNeighbour) {
			item.rightNeighbour = item.rightNeighbour.dataURL;
		}

		if (item.bottomNeighbour) {
			item.bottomNeighbour = item.bottomNeighbour.dataURL;
		}

		if (item.topNeighbour) {
			item.topNeighbour = item.topNeighbour.dataURL;
		}
	}

	for (const item of items) {
		const leftNeighbours = new Set<FrameData>(item.leftNeighbours);
		const rightNeighbours = new Set<FrameData>(item.rightNeighbours);
		const bottomNeighbours = new Set<FrameData>(item.bottomNeighbours);
		const topNeighbours = new Set<FrameData>(item.topNeighbours);

		item.leftNeighbours = [];
		item.rightNeighbours = [];
		item.bottomNeighbours = [];
		item.topNeighbours = [];

		for (const leftNeighbour of leftNeighbours) {
			item.leftNeighbours.push(leftNeighbour.dataURL);
		}

		for (const rightNeighbour of rightNeighbours) {
			item.rightNeighbours.push(rightNeighbour.dataURL);
		}

		for (const bottomNeighbour of bottomNeighbours) {
			item.bottomNeighbours.push(bottomNeighbour.dataURL);
		}

		for (const topNeighbour of topNeighbours) {
			item.topNeighbours.push(topNeighbour.dataURL);
		}
	}

	return JSON.stringify(items);
};

const deserializeFrameDatas = (json: string): FrameData[] => {
	const items = JSON.parse(json) as SerializeFrameData[];
	const review = new Map<string, FrameData>();

	const frameDatas = items.map((item) => {
		const frameData: FrameData = {
			canvas: document.createElement("canvas"),
			frequency: item.frequency,
			dataURL: item.dataURL,
			size: item.size,

			leftNeighbours: new Set(),
			rightNeighbours: new Set(),
			bottomNeighbours: new Set(),
			topNeighbours: new Set(),

			leftNeighbour: null,
			rightNeighbour: null,
			bottomNeighbour: null,
			topNeighbour: null,
		};

		review.set(item.dataURL, frameData);

		return frameData;
	});

	for (const item of items) {
		if (item.leftNeighbour) {
			(review.get(item.dataURL) as FrameData).leftNeighbour = review.get(
				item.leftNeighbour
			) as FrameData;
		}

		if (item.rightNeighbour) {
			(review.get(item.dataURL) as FrameData).rightNeighbour = review.get(
				item.rightNeighbour
			) as FrameData;
		}

		if (item.bottomNeighbour) {
			(review.get(item.dataURL) as FrameData).bottomNeighbour =
				review.get(item.bottomNeighbour) as FrameData;
		}

		if (item.topNeighbour) {
			(review.get(item.dataURL) as FrameData).topNeighbour = review.get(
				item.topNeighbour
			) as FrameData;
		}
	}

	for (const item of items) {
		for (const leftNeighbour of item.leftNeighbours) {
			(review.get(item.dataURL) as FrameData).leftNeighbours.add(
				review.get(leftNeighbour) as FrameData
			);
		}

		for (const rightNeighbour of item.rightNeighbours) {
			(review.get(item.dataURL) as FrameData).rightNeighbours.add(
				review.get(rightNeighbour) as FrameData
			);
		}

		for (const bottomNeighbour of item.bottomNeighbours) {
			(review.get(item.dataURL) as FrameData).bottomNeighbours.add(
				review.get(bottomNeighbour) as FrameData
			);
		}

		for (const topNeighbour of item.topNeighbours) {
			(review.get(item.dataURL) as FrameData).topNeighbours.add(
				review.get(topNeighbour) as FrameData
			);
		}
	}

	for (const frameData of frameDatas) {
		const { canvas, dataURL } = frameData;
		const context = canvas.getContext("2d") as CanvasRenderingContext2D;
		const image = new Image();
		image.src = dataURL;
		canvas.width = image.width;
		canvas.height = image.height;
		// prettier-ignore
		context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
	}

	return frameDatas;
};
