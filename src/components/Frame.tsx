import { FC, useContext } from "react";
import { WaveFunctionCollapseContext } from "./WaveFunctionCollapseContext";
import { Figura } from "./Figura";

export interface FrameProps {
	x: number;
	y: number;
}

export const Frame: FC<FrameProps> = ({ x, y }) => {
	const { frameDatas } = useContext(WaveFunctionCollapseContext);
	const frame = frameDatas[0];

	if (!frame) {
		return null;
	}

	return (
		<Figura
			render={(canvas, context) => {
				context.beginPath();
				context.drawImage(frame.canvas, x, y);
			}}
		/>
	);
};
