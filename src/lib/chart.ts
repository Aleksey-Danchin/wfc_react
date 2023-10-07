export const collapse = (
	frameDatas: FrameData[],
	chart: ChartData
): ChartData => {
	let maxX = Infinity;
	let minX = -Infinity;
	let maxY = -Infinity;
	let minY = Infinity;

	for (let i = 0; i < chart.collapsed.length; i += 3) {
		const x = chart.collapsed[i];
		const y = chart.collapsed[i + 1];

		maxX = Math.max(maxX, x);
		minX = Math.min(minX, x);

		maxY = Math.max(maxY, y);
		minY = Math.min(minY, y);
	}

	maxX += 1;
	minX -= 1;
	maxY += 1;
	minY -= 1;

	const topology = new Map<
		number,
		Map<number, FrameData | null | FrameData[]>
	>();

	for (let y = minY - 1; y <= maxY + 1; y++) {
		const row = new Map<number, FrameData | null | FrameData[]>();

		for (let x = minX - 1; x <= maxX + 1; x++) {
			row.set(x, null);
		}

		topology.set(y, row);
	}

	for (let i = 0; i < chart.collapsed.length; i += 3) {
		const x = chart.collapsed[i];
		const y = chart.collapsed[i + 1];
		const frameId = chart.collapsed[i + 2];
		const frameData = frameDatas.find(
			(frameData) => frameData.id === frameId
		);

		if (!frameData) {
			throw Error("frameData not found");
		}

		topology.get(y)?.set(x, frameData);
	}

	for (let y = minY - 1; y <= maxY + 1; y++) {
		for (let x = minX - 1; x <= maxX + 1; x++) {
			const field = topology.get(y)?.get(x);

			if (field === null) {
				let top = topology.get(y - 1)?.get(x);
				let right = topology.get(y)?.get(x + 1);
				let bottom = topology.get(y + 1)?.get(x);
				let left = topology.get(y)?.get(x - 1);

				const topVariants = new Set<FrameData>();
				const rightVariants = new Set<FrameData>();
				const bottomVariants = new Set<FrameData>();
				const leftVariants = new Set<FrameData>();

				if (top) {
					if (!Array.isArray(top)) {
						top = [top];
					}

					for (const item of top) {
						for (const neighbour of item.bottomNeighbours) {
							topVariants.add(neighbour);
						}
					}
				}

				if (right) {
					if (!Array.isArray(right)) {
						right = [right];
					}

					for (const item of right) {
						for (const neighbour of item.leftNeighbours) {
							rightVariants.add(neighbour);
						}
					}
				}

				if (bottom) {
					if (!Array.isArray(bottom)) {
						bottom = [bottom];
					}

					for (const item of bottom) {
						for (const neighbour of item.topNeighbours) {
							bottomVariants.add(neighbour);
						}
					}
				}

				if (left) {
					if (!Array.isArray(left)) {
						left = [left];
					}

					for (const item of left) {
						for (const neighbour of item.rightNeighbours) {
							leftVariants.add(neighbour);
						}
					}
				}
			}
		}
	}

	return chart;
};

export function getIntersection<T>(collections: Set<T>[]) {
	const ctrl = collections[0];
	const restCollections = collections.slice(1);

	return new Set(
		Array.from(ctrl.values()).filter((item) =>
			restCollections.every((collection) => collection.has(item))
		)
	);
}

// function getIntersection<T>(...collections: Array<T>[]): Array<T>;
// function getIntersection<T>(...collections: Set<T>[]): Set<T>;

// function getIntersection<T>(...collections: Array<T>[] | Set<T>[]) {
// 	if (!collections.length) {
// 		throw Error("not found collections");
// 	}

// 	const isArray = Array.isArray(collections[0]);

// 	if (collections.length === 1) {
// 		return isArray
// 			? (collections[0] as Array<T>).slice(0)
// 			: new Set(collections[0]);
// 	}

// 	if (isArray) {
// 		collections = collections.map((collection) => new Set(collection));
// 	}

// 	const sets = collections as Set<T>[];
// 	const otherSets = sets.slice(1);
// 	const intersection = Array.from(sets[0]).filter((item) =>
// 		otherSets.every((set) => set.has(item))
// 	);

// 	return isArray ? intersection : new Set(intersection);
// }
