// @flow

let root;
try { root = self; } catch (e) { try { root = global; } catch (e) { root = window; } }
export default root;