import { FC } from "react";
import { Canvas } from "./components/Canvas";
import { Preloader } from "./components/Preloader";
import { WaveFunctionCollapse } from "./components/WaveFunctionCollapse";
import { Frame } from "./components/Frame";

const images = { schema: "./sets/schema.png" };

export const App: FC = () => {
	return (
		<Preloader images={images}>
			<WaveFunctionCollapse image="schema" size={14} rotate persist>
				<Canvas fullscreenMode>
					<Frame x={50} y={50} />
				</Canvas>
			</WaveFunctionCollapse>
		</Preloader>
	);
};
