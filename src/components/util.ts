export const isImage = (x: any): x is HTMLImageElement =>
	x instanceof HTMLImageElement;

export const isCanvas = (x: any): x is HTMLCanvasElement =>
	x instanceof HTMLCanvasElement;

export const cutFrames = (
	image: HTMLImageElement,
	size: number,
	rotate: boolean
): FrameData[] => {
	const frameDatas = new Map<string, FrameData>();
	const frequency = new Map<string, number>();

	// Нарезка
	console.time("Нарезка");
	for (let y = 0; y < Math.floor(image.height / size); y++) {
		for (let x = 0; x < Math.floor(image.width / size); x++) {
			const dataFrame = cutFrame(image, x, y, size);

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
	console.timeEnd("Нарезка");

	//  Устанавливает частоту появления фрейма
	console.time("Устанавливает частоту появления фрейма");

	for (const dataURL of frameDatas.keys()) {
		const number = frequency.get(dataURL) as number;
		// @ts-ignore
		frameDatas.get(dataURL).frequency = number;
	}
	console.timeEnd("Устанавливает частоту появления фрейма");

	// Получаем версии тех же фреймов, но развернутых на 90, 180 и 270 градусов
	console.time(
		"Получаем версии тех же фреймов, но развернутых на 90, 180 и 270 градусов"
	);
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
	console.timeEnd(
		"Получаем версии тех же фреймов, но развернутых на 90, 180 и 270 градусов"
	);

	const finalFrameDates = Array.from(frameDatas.values());

	// Ищем соседей
	console.time("Ищем соседей");

	for (let i = 0; i < finalFrameDates.length; i++) {
		const frameData1 = finalFrameDates[i];

		for (let j = 0; j < finalFrameDates.length; j++) {
			const frameData2 = finalFrameDates[j];

			if (frameData1.leftDataUrl === frameData2.rightDataUrl) {
				frameData1.leftNeighbours.add(frameData2);
				frameData2.rightNeighbours.add(frameData1);
			}

			if (frameData1.rightDataUrl === frameData2.leftDataUrl) {
				frameData1.rightNeighbours.add(frameData2);
				frameData2.leftNeighbours.add(frameData1);
			}

			if (frameData1.bottomDataUrl === frameData2.topDataUrl) {
				frameData1.bottomNeighbours.add(frameData2);
				frameData2.topNeighbours.add(frameData1);
			}

			if (frameData1.topDataUrl === frameData2.bottomDataUrl) {
				frameData1.topNeighbours.add(frameData2);
				frameData2.bottomNeighbours.add(frameData1);
			}
		}
	}
	console.timeEnd("Ищем соседей");

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

		leftDataUrl: "",
		rightDataUrl: "",
		bottomDataUrl: "",
		topDataUrl: "",

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

	return initSideDataUrls(frameData);
};

export const initSideDataUrls = (frameData: FrameData): FrameData => {
	const { canvas, size } = frameData;

	// TopDataUrl
	const topDataCanvas = document.createElement("canvas");
	// prettier-ignore
	const topDataContext = topDataCanvas.getContext("2d") as CanvasRenderingContext2D;
	topDataCanvas.width = size;
	topDataCanvas.height = 1;
	topDataContext.drawImage(canvas, 0, 0, size, 1, 0, 0, size, 1);
	frameData.topDataUrl = topDataCanvas.toDataURL("image/png");

	// BottomDataUrl
	const bottomDataCanvas = document.createElement("canvas");
	// prettier-ignore
	const bottomDataContext = bottomDataCanvas.getContext("2d") as CanvasRenderingContext2D;
	bottomDataCanvas.width = size;
	bottomDataCanvas.height = 1;
	bottomDataContext.drawImage(canvas, 0, size - 1, size, 1, 0, 0, size, 1);
	frameData.bottomDataUrl = bottomDataCanvas.toDataURL("image/png");

	// LeftDataUrl
	const leftDataCanvas = document.createElement("canvas");
	// prettier-ignore
	const leftDataContext = leftDataCanvas.getContext("2d") as CanvasRenderingContext2D;
	leftDataCanvas.width = 1;
	leftDataCanvas.height = size;
	leftDataContext.drawImage(canvas, 0, 0, 1, size, 0, 0, 1, size);
	frameData.leftDataUrl = leftDataCanvas.toDataURL("image/png");

	// RightDataUrl
	const rightDataCanvas = document.createElement("canvas");
	// prettier-ignore
	const rightDataContext = rightDataCanvas.getContext("2d") as CanvasRenderingContext2D;
	rightDataCanvas.width = 1;
	rightDataCanvas.height = size;
	rightDataContext.drawImage(canvas, size - 1, 0, 1, size, 0, 0, 1, size);
	frameData.rightDataUrl = rightDataCanvas.toDataURL("image/png");

	return frameData;
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

	return initSideDataUrls(rotatedFrameData);
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
