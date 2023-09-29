import { createContext } from "react";

export const WaveFunctionCollapseContext = createContext<{
	frameDatas: FrameData[];
}>({ frameDatas: [] });
