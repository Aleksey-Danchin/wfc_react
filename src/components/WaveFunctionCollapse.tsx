import { FC, ReactNode, useContext, useEffect, useState } from "react";
import { WaveFunctionCollapseContext } from "./WaveFunctionCollapseContext";
import { PreloaderContext } from "./PreloaderContext";
import { cutFrames } from "../lib/util";

export interface WaveFunctionCollapseProps {
	image: string;
	size: number;
	offset?: number;
	rotate?: boolean;
	persist?: boolean;
	children?: ReactNode | ReactNode[];
}

export const WaveFunctionCollapse: FC<WaveFunctionCollapseProps> = ({
	image: name,
	size,
	offset = size,
	rotate = false,
	persist = false,
	children,
}) => {
	const { images } = useContext(PreloaderContext);
	const [frameDatas, setFrameDatas] = useState<FrameData[]>([]);
	const image = images[name];

	useEffect(() => {
		(async () => {
			if (!image || !size) {
				return;
			}

			console.time("frameDatas");
			const frameDatas = await cutFrames(image, size, offset, rotate);
			console.timeEnd("frameDatas");
			console.log(frameDatas);

			setFrameDatas(frameDatas);
		})();
	}, [image, rotate, size, persist, offset]);

	if (!image) {
		return <h1>Image for wfc not found.</h1>;
	}

	if (!frameDatas) {
		return <h1>Cutting . . .</h1>;
	}

	return (
		<WaveFunctionCollapseContext.Provider
			value={{ image, size, frameDatas }}
		>
			{children}
		</WaveFunctionCollapseContext.Provider>
	);
};
