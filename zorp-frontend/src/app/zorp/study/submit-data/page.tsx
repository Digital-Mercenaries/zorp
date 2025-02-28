'use client';

import { useEffect, useState } from 'react';

import {
	useAccount,
	useReadContract,
	useWalletClient,
	useWriteContract
} from 'wagmi';

import ThemeSwitch from '@/components/features/ThemeSwitch';

import InputFileToGpgEncryptionKey from '@/components/features/InputFileToGpgEncryptionKey';
import IrysBalanceGet from '@/components/features/IrysBalanceGet';
import IrysFetchFileGpgKey from '@/components/features/IrysFetchFileGpgKey';
import InputFileToEncryptedMessage from '@/components/features/InputFileToEncryptedMessage';

import * as config from '@/lib/constants/wagmiConfig';

import { abi as ZorpStudyABI } from 'abi/IZorpStudy.json';

import type { BigNumber } from 'bignumber.js';
import type { Key } from 'openpgp';
import type { WebIrysOpts } from '@/@types/irys';

export default function ZorpStudySubmitData() {
	const { address, connector, isConnected } = useAccount();
	const [provider, setProvider] = useState<null | unknown>(null);

	useEffect(() => {
		if (isConnected && connector) {
			// eslint-disable-next-line no-console
			console.log('ZorpStudySubmitData', {isConnected, address});
			connector.getProvider().then((gottenProvider) => {
				setProvider(gottenProvider);
			});
		} else {
			// eslint-disable-next-line no-console
			console.log('ZorpStudySubmitData -- Not connected');
		}
	}, [address, connector, isConnected]);

	// TODO: consider reducing need of keeping bot `Key` and `File` in memory at same time
	const [gpgKey, setGpgKey] = useState<null | { file: File; key: Key; }>(null);

	const [irysBalance, setIrysBalance] = useState<null | number | BigNumber>(null);

	const [irysUploadData, setIrysUploadData] = useState<null | { receipt: unknown; cid: string; }>(null);

	const [encryptionKey, setEncryptionKey] = useState<null | { response: Response; key: Key; }>(null);

	const [encryptedMessage, setEncryptedMessage] = useState<null | Uint8Array>(null);

	const irysBalanceThreshold = 0.1;
	const webIrysOpts: WebIrysOpts = {
		token: 'WAT'
	};


	return (
		<div className="w-full flex flex-col">
			<h1 className="flex flex-col sm:flex-row justify-center items-center text-4xl font-bold">
				Zorp Study -- Submit Data
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
				webIrysOpts={webIrysOpts}
				address={address}
			/>

			<hr />

			<IrysFetchFileGpgKey setState={setEncryptionKey} />

			<hr />

			<hr />
				<InputFileToEncryptedMessage
					labelText='Data to encrypt and submit'
					setState={setEncryptedMessage}
					gpgKey={gpgKey}
					encryptionKey={encryptionKey}
				/>
			<hr />
		</div>
	);
}
