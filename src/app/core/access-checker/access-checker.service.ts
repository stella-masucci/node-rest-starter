import path from 'path';

import { config } from '../../../dependencies';
import { AccessCheckerProvider } from './access-checker.provider';
import { CacheEntryDocument } from './cache/cache-entry.model';
import cacheEntryService from './cache/cache-entry.service';

class AccessCheckerService {
	provider: AccessCheckerProvider;

	/**
	 * Get the entry. Tries to get the entry from the cache, if not
	 * found, gets the entry from the access checker provider
	 */
	async get(key): Promise<Record<string, unknown>> {
		if (null == key) {
			return Promise.reject(new Error('key cannot be null or undefined'));
		}

		const result = await cacheEntryService.read(key);

		// If the result is in the cache (and not expired), use it
		if (result && Date.now() - result.ts.getTime() < this.getCacheExpire()) {
			// The result is in the cache, so use it
			return result.value;
		}

		// If it isn't in the cache, or it's expired, get it from the provider
		try {
			const provider = await this.getProvider();

			// No result was found, so query access provider for it
			const _result = await provider.get(key);
			try {
				// Store it in the cache
				const cacheEntry = await cacheEntryService.upsert(key, _result);

				// Return the saved value if possible
				return cacheEntry?.value ?? _result;
			} catch (err) {
				// Failures saving to the cache are not critical,
				// so ignore them and return the result.
				return _result;
			}
		} catch (ex) {
			return Promise.reject(
				new Error(
					`Error retrieving entry from the access checker provider: ${ex.message}`
				)
			);
		}
	}

	/**
	 * Get the entry from the access checker provider and update the cache
	 */
	async refreshEntry(key: string): Promise<CacheEntryDocument | null> {
		if (null == key) {
			return Promise.reject(new Error('key cannot be null or undefined'));
		}

		const provider = await this.getProvider();

		try {
			// Hit the provider for the id
			const result = await provider.get(key);

			// Store it in the cache if it was found
			return cacheEntryService.upsert(key, result);
		} catch (ex) {
			return Promise.reject(
				new Error(
					`Error refreshing entry from the access checker provider: ${ex.message}`
				)
			);
		}
	}

	getCacheExpire() {
		return config.auth?.accessChecker?.cacheExpire ?? 1000 * 60 * 60 * 24;
	}

	/**
	 * Initializes the provider only once. Use the getProvider() method
	 * to create and/or retrieve this singleton
	 */
	async getProvider(): Promise<AccessCheckerProvider> {
		if (!this.provider) {
			const acConfig = config.auth?.accessChecker;
			if (!acConfig.provider?.file) {
				return Promise.reject(
					new Error('Invalid accessChecker provider configuration.')
				);
			}
			try {
				const { default: Provider } = await import(
					path.posix.resolve(acConfig.provider.file)
				);
				this.provider = new Provider(acConfig.provider.config);
			} catch (err) {
				throw new Error('Failed to load access checker provider.');
			}
		}
		return this.provider;
	}
}

export = new AccessCheckerService();
