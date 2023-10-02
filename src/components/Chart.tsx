import { FC, useMemo } from "react";
import { Frame } from "./Frame";

export interface ChartProps {
	data: ChartData;
}

export const Chart: FC<ChartProps> = ({ data }) => {
	const frames = useMemo(() => {
		const frames = [];

		console.log(data.collapsed, data.collapsed.length / 3);

		for (let i = 0; i < data.collapsed.length; i += 3) {
			const x = data.collapsed[i];
			const y = data.collapsed[i + 1];
			const id = data.collapsed[i + 2];

			frames.push(<Frame key={i} x={x} y={y} id={id} />);

			console.log({ x, y, id });
		}

		return frames;
	}, [data.collapsed]);

	return <>{frames}</>;
};
