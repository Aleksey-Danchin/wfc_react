import { FC, ReactNode, useEffect, useRef } from "react";
import { CanvasContext } from "./CanvasContext";

export interface CanvasProps {
	width?: number;
	height?: number;
	fullscreenMode?: boolean;
	children?: ReactNode | ReactNode[];
}

export const Canvas: FC<CanvasProps> = ({
	width = 300,
	height = 300,
	fullscreenMode = false,
	children,
}) => {
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = ref.current;

		if (!canvas || !fullscreenMode) {
			return;
		}

		const resizeHandler: () => any = () => {
			canvas.width = document.body.clientWidth;
			canvas.height = document.body.clientHeight;
		};

		resizeHandler();
		canvas.addEventListener("resize", resizeHandler);

		return () => canvas.removeEventListener("resize", resizeHandler);
	}, [fullscreenMode]);

	return (
		<CanvasContext.Provider value={{ ref, width, height }}>
			<canvas ref={ref} width={width} height={height}></canvas>
			{children}
		</CanvasContext.Provider>
	);
};
