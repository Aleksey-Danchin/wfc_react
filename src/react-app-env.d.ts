/// <reference types="react-scripts" />

type ID = number;

interface FrameData {
	id: ID;

	// canvas: HTMLCanvasElement;
	frequency: number;
	// dataURL: string;

	x: number;
	y: number;
	size: number;

	leftNeighbours: Set<FrameData>;
	rightNeighbours: Set<FrameData>;
	bottomNeighbours: Set<FrameData>;
	topNeighbours: Set<FrameData>;
}

interface SerializeFrameData {
	id: ID;

	frequency: number;
	// dataURL: string;

	x: number;
	y: number;
	size: number;

	leftNeighbours: ID[];
	rightNeighbours: ID[];
	bottomNeighbours: ID[];
	topNeighbours: ID[];
}

interface FrequencyStore {
	dataUrls: Set<string>;
	frameDatas: Set<FrameData>;
	number: number;
}
