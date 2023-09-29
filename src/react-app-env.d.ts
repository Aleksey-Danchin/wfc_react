/// <reference types="react-scripts" />

interface FrameData {
	canvas: HTMLCanvasElement;
	frequency: number;
	dataURL: string;
	size: number;

	leftDataUrl: string;
	rightDataUrl: string;
	bottomDataUrl: string;
	topDataUrl: string;

	leftNeighbours: Set<FrameData>;
	rightNeighbours: Set<FrameData>;
	bottomNeighbours: Set<FrameData>;
	topNeighbours: Set<FrameData>;

	leftNeighbour: FrameData | null;
	rightNeighbour: FrameData | null;
	bottomNeighbour: FrameData | null;
	topNeighbour: FrameData | null;
}
