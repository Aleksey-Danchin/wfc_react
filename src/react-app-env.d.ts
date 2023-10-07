/// <reference types="react-scripts" />

type ID = number;

interface FrameData {
	id: ID;

	// canvas: HTMLCanvasElement;
	frequency: number;
	// dataURL: string;

	x: number;
	y: number;
	// size: number;
	angle: 0 | 90 | 180 | 270;

	leftNeighbours: Set<FrameData>;
	rightNeighbours: Set<FrameData>;
	bottomNeighbours: Set<FrameData>;
	topNeighbours: Set<FrameData>;
}

type FrameDatasCollection = Map<ID, FrameData>;

interface SerializeFrameData {
	id: ID;

	frequency: number;
	// dataURL: string;

	x: number;
	y: number;
	// size: number;
	angle: 0 | 90 | 180 | 270;

	leftNeighbours: ID[];
	rightNeighbours: ID[];
	bottomNeighbours: ID[];
	topNeighbours: ID[];
}

interface FrequencyStore {
	frameDatas: Set<FrameData>;
	number: number;
}

interface ChartData {
	collapsed: number[];
}

type Topology<T> = Map<number, Map<number, T>>;
type Potential = Topology<Set<FrameData>>;
