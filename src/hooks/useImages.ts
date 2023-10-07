// import { create } from "zustand";
// import { immer } from "zustand/middleware/immer";

// export const useImages = create<{ images: HTMLImageElement[] }>()(
// 	immer((set) => ({
// 		images: [],
//         isLoading: false,
//         isError: false,
//         error: null,

//         load
// 		//   bees: 0,
// 		//   addBees: (by) =>
// 		//     set((state) => {
// 		//       state.bees += by
// 		//     }),
// 	}))
// )

import { useEffect, useState } from "react";
import { loadImage } from "../lib/util";

export type ReturnUseImages = {
	images: HTMLImageElement[];
	isLoading: boolean;
	isLoaded: boolean;
} & ({ isError: false; error: null } | { isError: true; error: any });

export function useImages(srcs: string[]): ReturnUseImages {
	const [images, setImages] = useState<HTMLImageElement[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);
	const [isError, setIsError] = useState(false);
	const [error, setError] = useState<null | any>(null);

	useEffect(() => {
		(async () => {
			setIsLoading(true);

			try {
				const images = await Promise.all(
					srcs.map((src) => loadImage(src))
				);

				setImages(images);
				setIsLoaded(true);
			} catch (error: any) {
				setError(error);
				setIsError(true);
			}

			setIsLoading(false);
		})();
	}, [srcs]);

	return { images, isLoading, isLoaded, isError, error };
}
