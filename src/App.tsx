import { FC } from "react";
import { Canvas } from "./components/Canvas";
import { Preloader } from "./components/Preloader";
import { WaveFunctionCollapse } from "./components/WaveFunctionCollapse";
import { Chart } from "./components/Chart";

const images = { schema: "./sets/schema.png" };

const data: ChartData = {
	collapsed: [0, 0, 1, 14, 0, 2, 28, 0, 3],
};

export const App: FC = () => {
	return (
		<Preloader images={images}>
			<WaveFunctionCollapse image="schema" size={14} rotate persist>
				<Canvas fullscreenMode>
					<Chart data={data} />
				</Canvas>
			</WaveFunctionCollapse>
		</Preloader>
	);
};
