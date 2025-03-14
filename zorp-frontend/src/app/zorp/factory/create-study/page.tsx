'use client';

import { useCallback, useState } from 'react';
import type { BigNumber } from 'bignumber.js';
import type { Key } from 'openpgp';
import { useAccount, useWriteContract } from 'wagmi';
import { useContracts } from '@/contexts/Contracts';
import InputFileToGpgEncryptionKey from '@/components/features/InputFileToGpgEncryptionKey';
import IrysBalanceGet from '@/components/features/IrysBalanceGet';
import IrysUploadFileGpgKey from '@/components/features/IrysUploadFileGpgKey';
import ThemeSwitch from '@/components/features/ThemeSwitch';
import * as config from '@/lib/constants/wagmiConfig';

export default function ZorpFactoryWriteCreateStudy() {
	const className = '';

	// TODO: consider reducing need of keeping bot `Key` and `File` in memory at same time
	const [gpgKey, setGpgKey] = useState<null | { file: File; key: Key; }>(null);
	const [irysBalance, setIrysBalance] = useState<null | bigint | number | BigNumber>(null);
	const [irysUploadData, setIrysUploadData] = useState<null | { receipt: unknown; cid: string; }>(null);
	const [message, setMessage] = useState<string>('Info: connected wallet/provider required');
	const [ammount, setAmmount] = useState<null | bigint>(null);

	const { writeContractAsync } = useWriteContract({
		config: config.wagmiConfig,
	});

	const { address, isConnected } = useAccount();
	const { IZorpFactory } = useContracts();

	const handleZorpFactoryCreateStudyAmmount = useCallback((ammount: bigint) => {
		if (!ammount || ammount < 1) {
			setMessage('Waiting for positive study deposit ammount');
			setAmmount(null);
			return;
		}

		setAmmount(ammount);
	}, []);

	const handleZorpFactoryWriteCreateStudy = useCallback(() => {
		if (!isConnected) {
			const message = 'Warn: waiting on client to connect an account';
			console.warn('ZorpFactoryWriteCreateStudy', {message});
			setMessage(message)
			return;
		}

		if (!address?.toString().length) {
			const message = 'Warn: waiting on client to connect an account with an address';
			console.warn('ZorpFactoryWriteCreateStudy', {message});
			setMessage(message)
			return;
		}

		if (!ammount || ammount < 1) {
			setMessage('Waiting for positive study deposit ammount');
			setAmmount(null);
			return;
		}

		// if (!irysUploadData || !irysUploadData.cid || !irysUploadData.receipt) {
		if (!irysUploadData || !irysUploadData.cid) {
			const message = 'Warn: for Irys upload to report success';
			console.warn('ZorpFactoryWriteCreateStudy', {message});
			setMessage(message)
			return;
		}

		if (
			!IZorpFactory
			|| !IZorpFactory?.abi
			|| !Object.keys(IZorpFactory?.abi).length
			|| !IZorpFactory?.address.length
		) {
			const message = 'Error: cannot find IZorpFactory for current chain';
			console.error('ZorpFactoryWriteCreateStudy', {message});
			setMessage(message)
			return;
		}

		setMessage('Warn: starting blockchain write request to `ZorpFactory.createStudy`')
		writeContractAsync({
			abi: IZorpFactory.abi,
			address: IZorpFactory.address,
			functionName: 'createStudy',
			args: [
				address.toString(),
				irysUploadData.cid.toString(),
			],
			value: ammount,
		}).then((writeContractData) => {
			const message = `Result: transaction hash: ${writeContractData}`;
			console.warn('ZorpFactoryWriteCreateStudy', { message });
			setMessage(message)
		});
	}, [
		IZorpFactory,
		ammount,
		address,
		irysUploadData,
		isConnected,
		writeContractAsync,
	]);

	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Factory -- Create Study
			</h1>
			<div className="flex justify-center mt-8">
				<ThemeSwitch />
			</div>

			<hr />
			<InputFileToGpgEncryptionKey
				labelText="Public GPG key"
				setState={setGpgKey}
			/>

			<hr />
			<IrysBalanceGet
				labelText="Check Irys balance"
				setState={setIrysBalance}
			/>

			<hr />
			<IrysUploadFileGpgKey
				labelText="Irys upload GPG key file"
				setState={setIrysUploadData}
				gpgKey={gpgKey}
				irysBalance={irysBalance}
			/>

			<hr />
			<label>Study deposit amount:</label>
			<input
				type="number"
				onChange={(event) => {
					event.stopPropagation();
					event.preventDefault();
					handleZorpFactoryCreateStudyAmmount(BigInt(event.target.value));
				}}
			/>

			<hr />
			<button
				className={`zorp_factory_create_study zorp_factory_create_study__button ${className}`}
				onClick={(event) => {
					event.stopPropagation();
					event.preventDefault();
					console.warn('ZorpFactoryWriteCreateStudy', {event});
					handleZorpFactoryWriteCreateStudy();
				}}
			>Zorp Factory Create Study</button>

			<span>Status: {message}</span>
		</div>
	);
}
