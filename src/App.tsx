import { FC } from "react";
import { Canvas } from "./components/Canvas";
import { Preloader } from "./components/Preloader";
import { WaveFunctionCollapse } from "./components/WaveFunctionCollapse";
import { Chart } from "./components/Chart";
import { useImages } from "./hooks/useImages";
import { useFrames } from "./hooks/useFrames";

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
		isError: isCutError,
		error: cutError,
	} = useFrames({ image: images[0], size: 14, skip: !images[0] });

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

	return null;
	// return (
	// 	<Preloader images={images}>
	// 		<WaveFunctionCollapse image="schema" size={14} rotate persist>
	// 			<Canvas fullscreenMode>
	// 				<Chart data={data} />
	// 			</Canvas>
	// 		</WaveFunctionCollapse>
	// 	</Preloader>
	// );
};
