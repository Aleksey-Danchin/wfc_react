import { createContext } from "react";

export const PreloaderContext = createContext<{
	images: Record<string, HTMLImageElement>;
}>({ images: {} });
