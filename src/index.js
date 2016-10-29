// @flow

import root from "./root";
import Storage, {HAS_NATIVE_STORAGE_SUPPORT} from "./storage";
import type {StorageKind} from "./types";

if (HAS_NATIVE_STORAGE_SUPPORT) {
	Object.defineProperty(root, "__Storage", { value: root.Storage });
	Object.defineProperty(root, "__sessionStorage", { value: root.sessionStorage });
	Object.defineProperty(root, "__localStorage", { value: root.localStorage });
}

Object.defineProperty(root, "Storage", { value: Storage });
Object.defineProperty(root, "sessionStorage", { value: new Storage("sessionStorage") });
Object.defineProperty(root, "localStorage", { value: new Storage("localStorage") });
