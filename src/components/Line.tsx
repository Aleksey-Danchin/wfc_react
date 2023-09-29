import { FC } from "react";
import { Figura } from "./Figura";

export interface LineProps {
	x1: number;
	y1: number;
	x2: number;
	y2: number;

	width?: number;
	color?: string;
}

export const Line: FC<LineProps> = ({
	x1,
	y1,
	x2,
	y2,
	width = 1,
	color = "black",
}) => {
	return (
		<Figura
			render={(canvas, context) => {
				console.log("line fired");
				context.beginPath();
				context.moveTo(x1, y1);
				context.strokeStyle = color;
				context.lineWidth = width;
				context.lineTo(x2, y2);
				context.stroke();
			}}
		/>
	);
};
