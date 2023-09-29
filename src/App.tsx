import { FC } from "react";
import { Canvas } from "./components/Canvas";
import { Preloader } from "./components/Preloader";
import { Picture } from "./components/Picture";
import { WaveFunctionCollapse } from "./components/WaveFunctionCollapse";

const images = { schema: "./sets/schema.png" };

export const App: FC = () => {
	return (
		<Preloader images={images}>
			<WaveFunctionCollapse image="schema" size={14} rotate>
				<Canvas fullscreenMode>
					<Picture
						image="cat"
						x={10}
						y={10}
						width={1920 / 5}
						height={1079 / 5}
					/>
				</Canvas>
			</WaveFunctionCollapse>
		</Preloader>
	);
};
