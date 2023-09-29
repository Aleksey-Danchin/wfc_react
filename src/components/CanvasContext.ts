import { createContext, RefObject } from "react";

export const CanvasContext = createContext<{
	ref: RefObject<HTMLCanvasElement> | null;
	width: number;
	height: number;
}>({ ref: null, width: 0, height: 0 });
