import { useCallback, useMemo, useState } from "react";
import {
	collapseStep,
	createPotential,
	deserializeTopology,
} from "../lib/util";

export const useTopology = ({
	frameDatas,
	initState = [],
}: {
	frameDatas: FrameData[];
	initState?: number[];
}) => {
	// TODO: перенести в useFrames
	const frameDatasCollection = useMemo(() => {
		const frameDatasCollection: FrameDatasCollection = new Map();

		for (const frameData of frameDatas) {
			frameDatasCollection.set(frameData.id, frameData);
		}

		return frameDatasCollection;
	}, [frameDatas]);

	const [[topology, potential], setState] = useState(() => {
		const topology = deserializeTopology(initState);
		const potential = createPotential(topology, frameDatasCollection);
		return [topology, potential];
	});

	const getPosition = useCallback(
		(x: number, y: number) => {
			const id = topology.get(y)?.get(x);
			return id ? frameDatasCollection.get(id) : null;
		},
		[frameDatasCollection, topology]
	);

	// const step = useCallback(() => {
	// 	const [nexTopology, nextPotential] = collapseStep(
	// 		topology,
	// 		frameDatasCollection,
	// 		frameDatas,
	// 		potential
	// 	);

	// 	setState([nexTopology, nextPotential]);
	// }, [frameDatas, frameDatasCollection, potential, topology]);

	const step = () => {
		const [nexTopology, nextPotential] = collapseStep(
			topology,
			frameDatasCollection,
			frameDatas,
			potential
		);

		setState([nexTopology, nextPotential]);
	};

	return { topology, potential, frameDatasCollection, getPosition, step };
};
