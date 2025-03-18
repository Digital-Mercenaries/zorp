'use client';

import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Key } from 'openpgp';
import { encryptedMessageFromFile } from '@/lib/utils/openpgp';

export default function EncryptedMessageFromInputFile({
	className = '',
	labelText = 'Data to encrypt and submit',
	setState,
	gpgKey,
	encryptionKey,
}: {
	className?: string;
	setState: (study_encrypted_message: null | Uint8Array) => void;
	labelText: string;
	gpgKey: null | { file: File; key: Key; };
	encryptionKey: null | { response: Response; key: Key; };
}) {
	const [file, setFile] = useState<null | File>(null);
	const [message, setMessage] = useState<string>('Info: waiting for public GPG encryption keys and or input file');

	useQuery({
		enabled: !!file && !!gpgKey && !!gpgKey.key && !!encryptionKey && !!encryptionKey.key,
		queryKey: ['message_recipients'],
		// TODO: investigate circular reference errors in tests possibly propagating to web-clients
		// queryKey: ['message_recipients', [gpgKey?.key, encryptionKey?.key]],
		queryFn: async () => {
			// TODO: investigate why TypeScript and `useQuery` don't sync-up on `enabled`
			if (!gpgKey?.key) {
				const message = 'Warn: input GPG encryption key';
				setMessage(message);
				return;
			}

			if (!encryptionKey?.key) {
				const message = 'Warn: study GPG encryption key';
				setMessage(message);
				return;
			}

			if (!file) {
				const message = 'Warn: need an input file to encrypt';
				setMessage(message);
				return;
			}

			try {
				const encryptedMessage = await encryptedMessageFromFile({
					file,
					keys:[gpgKey.key, encryptionKey.key],
				});

				const message = 'Success: encrypted file with provided GPG keys?!';
				setMessage(message);
				setState(encryptedMessage);
				return encryptedMessage;
			} catch (error: unknown) {
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

				console.error('EncryptedMessageFromInputFile ->', { message, error });
				setMessage(message);
				setState(null);
			}
		},
	});

	const onChangeHandler = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		event.stopPropagation();
		event.preventDefault();
		if (!!event.target.files?.length) {
			setFile(event.target.files[0]);
			// TODO: update test(s) to allow for _proper_ usage
			// setFile(event.target.files.item(0));
		} else {
			setFile(null);
		}
	}, [ setFile ]);

	return (
		<>
			<label className={`file_encrypt file_encrypt__label ${className}`}>{labelText}</label>
			<input
				className={`file_encrypt file_encrypt__input ${className}`}
				type="file"
				onChange={onChangeHandler}
			/>
			<span className={`file_encrypt file_encrypt__span ${className}`}>{message}</span>
		</>
	);
}
