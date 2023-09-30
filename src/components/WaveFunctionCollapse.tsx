import { FC, ReactNode, useContext, useEffect, useState } from "react";
import { WaveFunctionCollapseContext } from "./WaveFunctionCollapseContext";
import { PreloaderContext } from "./PreloaderContext";
import { cutFrames } from "./util";

export interface WaveFunctionCollapseProps {
	image: string;
	size: number;
	rotate?: boolean;
	persist?: boolean;
	children?: ReactNode | ReactNode[];
}

export const WaveFunctionCollapse: FC<WaveFunctionCollapseProps> = ({
	image: name,
	size,
	rotate = false,
	persist = false,
	children,
}) => {
	const { images } = useContext(PreloaderContext);
	const [frameDatas, setFrameDatas] = useState<FrameData[]>([]);
	const image = images[name];

	useEffect(() => {
		if (!image || !size) {
			return;
		}

		const frameDatas = cutFrames(image, size, rotate, persist);
		setFrameDatas(frameDatas);
	}, [image, rotate, size, persist]);

	if (!image) {
		return <h1>Image for wfc not found.</h1>;
	}

	return (
		<WaveFunctionCollapseContext.Provider value={{ frameDatas }}>
			{children}
		</WaveFunctionCollapseContext.Provider>
	);
};
