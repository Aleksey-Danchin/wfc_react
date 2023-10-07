import { FC, useContext, useMemo } from "react";
import { Frame } from "./Frame";
import { CanvasContext } from "./CanvasContext";
import { WaveFunctionCollapseContext } from "./WaveFunctionCollapseContext";

export interface ChartProps {
	data: ChartData;
}

export const Chart: FC<ChartProps> = ({ data }) => {
	const { width, height } = useContext(CanvasContext);
	const { size } = useContext(WaveFunctionCollapseContext);

	const frames = useMemo(() => {
		const frames = [];

		for (let i = 0; i < data.collapsed.length; i += 3) {
			const x = data.collapsed[i];
			const y = data.collapsed[i + 1];
			const id = data.collapsed[i + 2];

			frames.push(
				<Frame
					key={i}
					x={width / 2 + x * size}
					y={height / 2 + y * size}
					id={id}
				/>
			);
		}

		return frames;
	}, [data.collapsed, height, size, width]);

	return <>{frames}</>;
};
