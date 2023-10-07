import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { CanvasContext } from "./CanvasContext";

export interface CanvasProps {
	width?: number;
	height?: number;
	fullscreenMode?: boolean;
	children?: ReactNode | ReactNode[];
}

export const Canvas: FC<CanvasProps> = ({
	width: initWidth = 300,
	height: initHeight = 300,
	fullscreenMode = false,
	children,
}) => {
	const ref = useRef<HTMLCanvasElement>(null);
	const [width, setWidth] = useState(initWidth);
	const [height, setHeight] = useState(initHeight);

	useEffect(() => {
		const canvas = ref.current;

		if (!canvas || !fullscreenMode) {
			return;
		}

		const resizeHandler: () => any = () => {
			canvas.width = document.body.clientWidth;
			canvas.height = document.body.clientHeight;

			setWidth(canvas.width);
			setHeight(canvas.height);
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
