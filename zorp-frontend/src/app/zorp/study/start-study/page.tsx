'use client';

import { useCallback, useId, useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyWriteStartStudy() {
	const addressStudyAnvil = config.anvil.contracts.IZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [isFetching, setIsFetching] = useState<boolean>(false);
	const [receipt, setReceipt] = useState<string>('... pending');

	const addressStudyId = useId();

	const { address, isConnected } = useAccount();
	const { writeContractAsync } = useWriteContract();

	const { IZorpStudy } = useContracts();

	const assertsClient = {
		isAddressStudySet: addressStudy.length === addressStudyAnvil.length && addressStudy.startsWith('0x'),
		isAddressWalletSet: !!address && address.length === addressStudyAnvil.length && address.startsWith('0x'),
		isContractStudySet: !!IZorpStudy?.abi && !!Object.keys(IZorpStudy.abi).length && !!IZorpStudy?.address.length,
	};

	const { data: owner, isFetching: isFetchingOwner } = useReadContract({
		abi: IZorpStudy.abi,
		address: IZorpStudy.address,
		functionName: 'owner',
		args: [],
		query: {
			enabled: assertsClient.isAddressStudySet && assertsClient.isContractStudySet,
		},
	});

	const { data: study_status, isFetching: isFetchingStudyStatus } = useReadContract({
		abi: IZorpStudy.abi,
		address: IZorpStudy.address,
		functionName: 'study_status',
		args: [],
		query: {
			enabled: assertsClient.isAddressStudySet && assertsClient.isContractStudySet,
		},
	});

	const assertsBlockchain = {
		isAddressOwnerSet: !!(owner as `0x${string}`)
										&& (owner as `0x${string}`).length === addressStudyAnvil.length
										&& (owner as `0x${string}`).startsWith('0x'),
		isStudyOwner: address == owner,
		isStudyInactive: study_status == 0,
	};

	const disabled = isFetching
								|| isFetchingOwner
								|| isFetchingStudyStatus
								|| !isConnected;

	const enabled = isConnected
								&& assertsClient.isAddressStudySet
								&& assertsClient.isAddressWalletSet
								&& assertsClient.isContractStudySet
								&& assertsBlockchain.isAddressOwnerSet
								&& assertsBlockchain.isStudyOwner
								&& assertsBlockchain.isStudyInactive;

	const handleChangeStudyAddress = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
		setAddressStudy(event.target.value as `0x${string}`);
	}, [ setAddressStudy ]);

	const handleOnClick = useCallback(async () => {
		if (!enabled) {
			return;
		}

		setIsFetching(true);

		try {
			const response = await writeContractAsync({
				abi: IZorpStudy.abi,
				address: IZorpStudy.address,
				functionName: 'startStudy',
				args: [],
			});

			if (!!response) {
				setReceipt(response);
			} else {
				setReceipt(`...  error with receipt response -> ${response}`);
			}
		} catch (error) {
			let message = 'Error: ';
			if (!!error && typeof error == 'object') {
				if ('message' in error) {
					message += error.message;
				} else if ('toString' in error) {
					message += error.toString();
				} else {
					message += `Novel error detected -> ${error}`;
				}
			} else {
				message += `Novel error detected -> ${error}`;
			}

			console.error('ZorpStudyWriteStartStudy ->', { message, error });
			setReceipt(message);
			return error;
		} finally {
			setIsFetching(false);
		}
	}, [
		IZorpStudy,
		enabled,
		setIsFetching,
		setReceipt,
		writeContractAsync,
	]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Start
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<label htmlFor={addressStudyId}>ZORP Study Address:</label>
			<input
				id={addressStudyId}
				value={addressStudy}
				onChange={handleChangeStudyAddress}
				disabled={disabled}
			/>

			<button
				onClick={async (event) => {
					event.preventDefault();
					event.stopPropagation();
					await handleOnClick();
				}}
				disabled={disabled}
			>Start {enabled ? 'Available' : 'unavailable'}</button>

			<span>ZorpStudy start receipt: {receipt}</span>
		</div>
	);
}
