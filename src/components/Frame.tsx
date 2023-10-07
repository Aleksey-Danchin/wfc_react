import { FC, useContext } from "react";
import { WaveFunctionCollapseContext } from "./WaveFunctionCollapseContext";
import { Figura } from "./Figura";
import { imageToCanvas } from "../lib/util";

export interface FrameProps {
	x: number;
	y: number;
	id: number;
}

export const Frame: FC<FrameProps> = ({ x: dx, y: dy, id }) => {
	const { image, size, frameDatas } = useContext(WaveFunctionCollapseContext);
	const frameData = frameDatas.find((frameData) => frameData.id === id);

	if (!frameData) {
		return null;
	}

	return (
		<Figura
			render={(_, context) => {
				const canvas = imageToCanvas(
					image,
					frameData.x,
					frameData.y,
					size,
					size,
					frameData.angle
				);

				context.beginPath();
				context.drawImage(canvas, dx, dy);
			}}
		/>
	);
};
