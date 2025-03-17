'use client';

import { useCallback, useId, useState } from 'react';
import { useReadContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyReadSubmittedData() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [index, setIndex] = useState<number>(0);

	const addressStudyId = useId();
	const indexId = useId();

	const { IZorpStudy } = useContracts();

	const { data: submitted_data, isFetching } = useReadContract({
		abi: IZorpStudy.abi,
		address: IZorpStudy.address,
		functionName: 'submitted_data',
		args: [index],
		query: {
			enabled: addressStudy.length === addressStudyAnvil.length
						&& addressStudy.startsWith('0x')
						&& !!IZorpStudy?.abi
						&& !!Object.keys(IZorpStudy.abi).length
						&& !!IZorpStudy?.address.length
						&& !!index
						&& index > 0
		},
	});

	const handleChangeStudyAddress = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setAddressStudy(event.target.value as `0x${string}`);
	}, [ setAddressStudy ]);

	const handleChangeDataIndex = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(event.target.value);
		if (!isNaN(value)) {
			setIndex(value);
		}
	}, [ setIndex ]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Submitted data
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<label htmlFor={addressStudyId}>ZORP Study Address:</label>
			<input
				id={addressStudyId}
				value={addressStudy}
				onChange={handleChangeStudyAddress}
				disabled={isFetching}
			/>

			<label htmlFor={indexId}>ZORP data index:</label>
			<input
				id={indexId}
				value={index}
				onChange={handleChangeDataIndex}
				disabled={isFetching}
			/>

			<span>ZorpStudy data CID: {
				!!(submitted_data as string)?.length ? submitted_data as string : 'null'
			}</span>
		</div>
	);
}
