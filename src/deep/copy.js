/**
 * Deeply copies an object
 * @param {object} obj Object to Copy
 * @return {object}
*/
export const copy = (obj) => {
  if (null == obj || "object" != typeof obj) return obj;
  if (obj instanceof Date) {
    const copy_ = new Date();
    copy_.setTime(obj.getTime());
    return copy_;
  }
  if (obj instanceof Array) {
    const copy_ = [];
    for (var i = 0, len = obj.length; i < len; i++) {
      copy_[i] = copy(obj[i]);
    }
    return copy_;
  }
  /* istanbul ignore else */
  if (obj instanceof Object) {
    const copy_ = {};
    for (const attr in obj) {
      /* istanbul ignore else */
      if (obj.hasOwnProperty(attr)) copy_[attr] = copy(obj[attr]);
    }
    return copy_;
  }

  /* istanbul ignore next */
  throw new Error("Unable to copy obj this object.");
}