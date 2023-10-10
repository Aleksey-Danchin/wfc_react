import { FC, useMemo } from "react";
import { Figura } from "./Figura";

export interface ChartProps {
	image: HTMLImageElement;
	topology: Topology<number>;
	frameDatasCollection: FrameDatasCollection;
	size: number;
}

export const Chart: FC<ChartProps> = ({
	image,
	topology,
	frameDatasCollection,
	size,
}) => {
	const frames = useMemo(() => {
		const frames = [];

		for (const y of topology.keys()) {
			const row = topology.get(y);

			if (row === undefined) {
				continue;
			}

			for (const x of row.keys()) {
				const id = row.get(x);

				if (id === undefined) {
					continue;
				}

				const frameData = frameDatasCollection.get(id);

				if (!frameData) {
					continue;
				}

				frames.push(
					<Figura
						key={frames.length}
						render={(canvas, context) => {
							context.beginPath();
							context.drawImage(
								image,
								frameData.x,
								frameData.y,
								size,
								size,
								canvas.width / 2 + x * size,
								canvas.height / 2 + y * size,
								size,
								size
							);
						}}
					/>
				);
			}
		}

		return frames;
	}, [frameDatasCollection, image, size, topology]);

	return <>{frames}</>;
};
