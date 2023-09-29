import { FC, useContext, useEffect, useRef } from "react";
import { CanvasContext } from "./CanvasContext";

export type RenderFunction = (
	canvas: HTMLCanvasElement,
	context: CanvasRenderingContext2D
) => void;

export interface FiguraProps {
	render: RenderFunction;
}

export const Figura: FC<FiguraProps> = ({ render }) => {
	// const renderRef = useRef<RenderFunction>(render);
	const { ref } = useContext(CanvasContext);

	useEffect(() => {
		if (ref?.current) {
			const context = ref.current.getContext("2d");

			if (context) {
				// renderRef.current(ref.current, context);
				render(ref.current, context);
			}
		}
	}, [ref, render]);

	return null;
};
