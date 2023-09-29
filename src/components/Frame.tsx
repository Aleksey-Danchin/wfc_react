import { FC, useContext } from "react";
import { WaveFunctionCollapseContext } from "./WaveFunctionCollapseContext";
import { Picture } from "./Picture";

export interface FrameProps {
	x: number;
	y: number;
}

export const Frame: FC<FrameProps> = ({ x, y }) => {
	// const { image } = useContext(WaveFunctionCollapseContext);

	// if (!image) {
	// 	return null;
	// }

	// return <Picture image={image} x={x} y={y} />;
	return null;
};
