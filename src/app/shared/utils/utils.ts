import moment from 'moment';

export class Utils {
  static generateRandomId() {
    return moment().unix().toString();
  }
}
