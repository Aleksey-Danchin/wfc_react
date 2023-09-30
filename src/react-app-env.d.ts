/// <reference types="react-scripts" />

interface FrameData {
	canvas: HTMLCanvasElement;
	frequency: number;
	dataURL: string;
	size: number;

	leftNeighbours: Set<FrameData>;
	rightNeighbours: Set<FrameData>;
	bottomNeighbours: Set<FrameData>;
	topNeighbours: Set<FrameData>;

	leftNeighbour: FrameData | null;
	rightNeighbour: FrameData | null;
	bottomNeighbour: FrameData | null;
	topNeighbour: FrameData | null;
}

interface SerializeFrameData {
	frequency: number;
	dataURL: string;
	size: number;

	leftNeighbours: string[];
	rightNeighbours: string[];
	bottomNeighbours: string[];
	topNeighbours: string[];

	leftNeighbour: string | null;
	rightNeighbour: string | null;
	bottomNeighbour: string | null;
	topNeighbour: string | null;
}
