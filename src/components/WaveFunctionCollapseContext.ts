import { createContext } from "react";

export const WaveFunctionCollapseContext = createContext<{
	image: HTMLImageElement;
	frameDatas: FrameData[];
}>({ image: new Image(), frameDatas: [] });
