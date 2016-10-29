// @flow

import type {StorageMap, StorageKind} from "./types";
import root from "./root";

export const HAS_NATIVE_STORAGE_SUPPORT = "localStorage" in root && "sessionStorage" in root;

/**
 * Shims the 'Storage' object on the window object as specified by w3c here: https://www.w3.org/TR/webstorage/.
 * In case storage is not possible, for instance in IE < 8, in IE < 11 on the file:// protocol or in Safari
 * browsers in Incognito mode, it will fallback to a custom implementation that works like sessionStorage and
 * successfully lives on after the session has ended but dies when the browser window closes.
 * @author Frederik Wessberg
 * @version 1.0.0
 */
export default class Storage {

	/**
	 * The amount of items in the collection.
	 * @type {number}
	 */
	length: number = 0;

	/**
	 * Each Storage object provides access to a list of key/value pairs, which are sometimes
	 * called items. Keys are strings. Any string (including the empty string) is a valid key.
	 * Values are similarly strings.
	 * @type {StorageMap}
	 * @private
	 */
	_items: StorageMap = {};

	/**
	 * The StorageKind of this Storage instance. Kan be 'localStorage' or 'sessionStorage'.
	 * @type {StorageKind}
	 */
	_kind:	StorageKind;

	/**
	 * Whether or not we are using the fallback implementation of Web Storage.
	 * @type {boolean}
	 */
	_usingFallback: boolean = false;

	/**
	 * Initializes a new Storage instance.
	 * @param   {StorageKind} kind - The kind of storage this is.
	 * @returns {Storage}            The newly constructed Storage instance.
	 */
	constructor (kind: StorageKind) {
		this._kind = kind;
		this._usingFallback = !HAS_NATIVE_STORAGE_SUPPORT;
		if (this._usingFallback) this._getState();
	}

	/**
	 * Gets the initial storage state from the 'name' property on the root object.
	 * This is a hack, but it makes it possible to use sessionStorage on all browsers, even in incognito-mode.
	 * @returns {void}
	 */
	_getState (): void {
		this._items = JSON.parse(root.name);
		this.length = Object.getOwnPropertyNames(this._items).length;
	}

	/**
	 * Binds the current state to the 'name' property on the window object.
	 * @returns {void}
	 */
	_updateState (): void {
		root.name = JSON.stringify(this._items);
	}

	/**
	 * The key(n) method must return the name of the nth key in the list.
	 * The order of keys is user-agent defined, but must be consistent within an
	 * object so long as the number of keys doesn't change.
	 * (Thus, adding or removing a key may change the order of the keys,
	 * but merely changing the value of an existing key must not.)
	 * If n is greater than or equal to the number of key/value pairs in the object,
	 * then this method must return null.
	 * @param   {number} index
	 * @returns {?string}
	 */
	key (index: number): ?string {
		if (!this._usingFallback) root[`__${this._kind}`].key(index);

		const keyName = Object.getOwnPropertyNames(this._items)[index];
		return keyName || null;
	}

	/**
	 * The getItem(key) method must return the current value associated with the given key.
	 * If the given key does not exist in the list associated with the object then this
	 * method must return null.
	 * @param   {string} key
	 * @returns {?string}
	 */
	getItem (key: string): ?string {
		if (!this._usingFallback) return root[`__${this._kind}`].getItem(key);
		const item = this._items[key];
		return item !== undefined ? item : null;
	}

	/**
	 * The setItem(key, value) method must first check if a key/value pair
	 * with the given key already exists in the list associated with the object.
	 * If it does not, then a new key/value pair must be added to the list,
	 * with the given key and with its value set to value.
	 *
	 * If the given key does exist in the list, and its value is not equal to value,
	 * then it must have its value updated to value. If its previous value is equal to value,
	 * then the method must do nothing.
	 *
	 * @param   {string} key
	 * @param   {string} value
	 * @returns {void}
	 */
	setItem (key: string, value: string): void {
		try {
			root[`__${this._kind}`].setItem(key, value);
			this.length = root[`__${this._kind}`].length;
			return;
		} catch (e) {
			// If this is an exception, its' almost certainly a 'QuotaExceededError' which occurs if in Incognito-mode in
			// Safari or the local storage capacity has been reached. Nevertheless we fallback to the 'window.name'
			// implementation in that case.
			this._usingFallback = true;
			const oldValue = this.getItem(key);
			const newValue = value.toString();
			const hadKey	 = key in this._items;
			if (oldValue !== newValue) {
				this._items[key] = newValue;

				root.dispatchEvent(new Event("storage", {
					key,
					oldValue,
					newValue,
					url: location.href,
					storageArea: this,
					composed: false,
					bubbles: true,
					cancelable: false
				}));

				this._updateState();
				if (!hadKey) this.length++;
			}
		}
	}

	/**
	 * The removeItem(key) method must cause the key/value pair with the given key
	 * to be removed from the list associated with the object, if it exists.
	 * If no item with that key exists, the method must do nothing.
	 *
	 * The setItem() and removeItem() methods must be atomic with respect to failure.
	 * In the case of failure, the method does nothing. That is, changes to the data
	 * storage area must either be successful, or the data storage area must not be
	 * changed at all.
	 * @param   {DOMString} key
	 * @returns {void}
	 */
	removeItem (key: string): void {
		if (!this._usingFallback) {
			root[`__${this._kind}`].removeItem(key);
			this.length = root[`__${this._kind}`].length;
			return;
		}

		let oldValue = this.getItem(key);
		const hadKey = key in this._items;
		// Remove the key from the collection.
		delete this._items[key];

		root.dispatchEvent(new Event("storage", {
			key,
			oldValue,
			newValue: null,
			url: location.href,
			storageArea: this,
			composed: false,
			bubbles: true,
			cancelable: false
		}));

		if (oldValue != null) oldValue = null;
		this._updateState();
		if (hadKey) this.length--;
	}

	/**
	 * The clear() method must atomically cause the list associated with the
	 * object to be emptied of all key/value pairs, if there are any. If there are none,
	 * then the method must do nothing.
	 * @returns {void}
	 */
	clear (): void {
		if (!this._usingFallback) return root[`__${this._kind}`].clear();

		this._items = {};

		root.dispatchEvent(new Event("storage", {
			key: null,
			oldValue: null,
			newValue: null,
			url: location.href,
			storageArea: this,
			composed: false,
			bubbles: true,
			cancelable: false
		}));
		this._updateState();
		this.length = 0;
	}
}
