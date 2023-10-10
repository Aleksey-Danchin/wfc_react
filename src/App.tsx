import { FC, useEffect } from "react";
import { Canvas } from "./components/Canvas";
import { Chart } from "./components/Chart";
import { useImages } from "./hooks/useImages";
import { useFrames } from "./hooks/useFrames";
import { useTopology } from "./hooks/useTopology";

// const images = { schema: "./sets/schema.png" };
const sets = ["./sets/schema.png"];

// const data: ChartData = {
// 	collapsed: [0, 0, 1, -1, -1, 1],
// };

export const App: FC = () => {
	const {
		images,
		isLoading,
		isLoaded,
		isError: isImagesError,
		error: imagesError,
	} = useImages(sets);

	const {
		frameDatas,
		isCutting,
		isCutted,
		size,
		isError: isCutError,
		error: cutError,
	} = useFrames({
		image: images[0],
		size: 14,
		skip: !images[0],
		isPersist: true,
	});

	const { topology, potential, frameDatasCollection, getPosition, step } =
		useTopology({
			frameDatas,
		});

	useEffect(() => {
		const flag = setTimeout(step, 0);
		return () => clearTimeout(flag);
	}, [step]);

	if (!isLoaded && isLoading) {
		return <p>Loading . . .</p>;
	}

	if (isImagesError) {
		return (
			<p>
				{"message" in imagesError
					? imagesError.message
					: String(imagesError)}
			</p>
		);
	}

	if (!isCutted && isCutting) {
		return <p>Cutting . . .</p>;
	}

	if (isCutError) {
		return (
			<p>{"message" in cutError ? cutError.message : String(cutError)}</p>
		);
	}

	return (
		<>
			{/* <button onClick={() => step()}>Step by step</button> */}
			<Canvas fullscreenMode>
				<Chart
					image={images[0]}
					topology={topology}
					frameDatasCollection={frameDatasCollection}
					size={size}
				/>
			</Canvas>
		</>
	);
};
