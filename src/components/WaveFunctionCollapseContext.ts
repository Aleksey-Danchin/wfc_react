import { createContext } from "react";

export const WaveFunctionCollapseContext = createContext<{
	image: HTMLImageElement;
	size: number;
	frameDatas: FrameData[];
}>({ image: new Image(), size: 0, frameDatas: [] });
