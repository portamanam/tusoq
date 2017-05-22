/*  
 *  Name: express-validator-config.js
 *  Function: Adds custom functions to validate data sent in API requests
 */

// Export
module.exports = {
  // Prepare custom validators to our validation module
  customValidators: {
    // Checks if sent UID is correct (non-negative Integer)
    isUID: function(value) {
      return (typeof value !== 'object')
        && !isNaN(value) 
        && (function(x) { return (x | 0) === x; })(parseFloat(value)) 
        && (value >= 0);
    },

    // Checks if sent DELETE :id is correctly formated: UID + '-' + UID
    // and UIDs are not the same
    isProperDeleteId: function(value) {
      if(typeof value !== 'string'){
        return false;
      }

      const UIDs = value.split('-');

      return UIDs.length === 2
        && UIDs[0] !== UIDs[1]
        && this.isUID(UIDs[0])
        && this.isUID(UIDs[1]);
    },

    // Checks if values are not equal
    notEqual: function(value, notEqual) {
      return value !== notEqual;
    }
  }
};