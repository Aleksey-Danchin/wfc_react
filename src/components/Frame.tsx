import { FC, useContext } from "react";
import { WaveFunctionCollapseContext } from "./WaveFunctionCollapseContext";
import { Figura } from "./Figura";

export interface FrameProps {
	x: number;
	y: number;
}

export const Frame: FC<FrameProps> = ({ x: dx, y: dy }) => {
	const { image, frameDatas } = useContext(WaveFunctionCollapseContext);
	const frameData = frameDatas[35];

	if (!frameData) {
		return null;
	}

	const { x, y, size } = frameData;

	return (
		<Figura
			render={(canvas, context) => {
				context.beginPath();
				context.drawImage(image, x, y, size, size, dx, dy, size, size);
			}}
		/>
	);
};
