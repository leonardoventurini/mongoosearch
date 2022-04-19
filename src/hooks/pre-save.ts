import * as utils from '../utils'

export async function preSave() {
  this._mexp = {
    wasNew: this.isNew,
  }
  if (!this.isNew) {
    this._mexp.unset = utils.getUndefineds(this, this.esOptions().mapping)
  }
}
