'use client';

import { useId, useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpStudyWriteStartStudy() {
	const addressStudyAnvil = config.anvil.contracts.ZorpStudy[31337].address;

	const [addressStudy, setAddressStudy] = useState<`0x${string}`>(addressStudyAnvil);
	const [isFetching, setIsFetching] = useState<boolean>(false);
	const [receipt, setReceipt] = useState<string>('... pending');

	const addressStudyId = useId();

	const { address, isConnected } = useAccount();
	const { writeContractAsync } = useWriteContract();

	const { ZorpStudy } = useContracts();

	const assertsClient = {
		isAddressStudySet: addressStudy.length === addressStudyAnvil.length && addressStudy.startsWith('0x'),
		isAddressWalletSet: !!address && address.length === addressStudyAnvil.length && address.startsWith('0x'),
		isContractStudySet: !!ZorpStudy?.abi && !!Object.keys(ZorpStudy.abi).length && !!ZorpStudy?.address.length,
	};

	const { data: owner, isFetching: isFetchingOwner } = useReadContract({
		abi: (ZorpStudy as NonNullable<typeof ZorpStudy>).abi,
		address: (ZorpStudy as NonNullable<typeof ZorpStudy>).address,
		functionName: 'owner',
		args: [],
		query: {
			enabled: assertsClient.isAddressStudySet && assertsClient.isContractStudySet,
		},
	});

	const { data: study_status, isFetching: isFetchingStudyStatus } = useReadContract({
		abi: (ZorpStudy as NonNullable<typeof ZorpStudy>).abi,
		address: (ZorpStudy as NonNullable<typeof ZorpStudy>).address,
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
				onChange={(event) => {
					setAddressStudy(event.target.value as `0x${string}`);
				}}
				disabled={disabled}
			/>

			<button
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();

					if (!enabled) {
						console.warn('Missing required state', {
							isConnected,
							assertsClient,
							assertsBlockchain,
						});
						return;
					}

					setIsFetching(true);
					writeContractAsync({
						abi: (ZorpStudy as NonNullable<typeof ZorpStudy>).abi,
						address: (ZorpStudy as NonNullable<typeof ZorpStudy>).address,
						functionName: 'startStudy',
						args: [],
					}).then((response) => {
						if (!!response) {
							setReceipt(response);
						} else {
							setReceipt(`...  error with receipt response -> ${response}`);
						}
					}).catch((error) => {
						console.error(error);
						setReceipt(`...  error with writeContractAsync error -> ${error}`);
					}).finally(() => {
						setIsFetching(false);
					});
				}}
				disabled={disabled}
			>Start {enabled ? 'Available' : 'unavailable'}</button>

			<span>ZorpStudy start receipt: {receipt}</span>
		</div>
	);
}
