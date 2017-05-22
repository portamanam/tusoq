/*  
 *  Name: friendlist-array.js
 *  Function: prepare functions for easy and efficient friendlist array management
 */

// Export functions
module.exports = {
  /*  
   *  Function: add new user ID into friendlist array
   *  Params: uid (int) - new friend ID
   *          friendlistArray (array) - sorted array (ascending) of IDs (integers)
   */
  addToArray: function (friendId, friendname , friendlistArray) {
    // Check if user is already on friendlist and get position in array to put him
    console.log("addToArray friendId --> " + friendId);
    console.log("addToArray friendname --> " + friendname);
    const friendOnList = this.friendOnList(friendId, friendname , friendlistArray);


    if(!friendOnList.isPresent){
      //friendlistArray.splice(friendOnList.position, 0, uid)
      console.log("addToArray friendlistarray Before Push--> " + friendlistArray);
      friendlistArray.push(
          {friendid: friendId, friendusername: friendname}
      );

      console.log("addToArray friendlistarray After Push --> " + friendlistArray);

    }

    return friendlistArray;
  },

  /*  
   *  Function: remove user ID from friendlist array
   *  Params: uid (int) - new friend ID
   *          friendlistArray (array) - sorted array (ascending) of IDs (integers)
   */
  removeFromArray: function (friendId, friendname , friendlistArray) 
  {
    // Check if user is already on friendlist and get his position in array
    console.log("removeFromArray friendId --> " + friendId);
    console.log("removeFromArray friendname --> " + friendname);
    const friendOnList = this.friendOnList(friendId, friendname, friendlistArray);
    
    if(friendOnList.isPresent)
    {
      friendlistArray.splice(friendOnList.position, 1)
    }

    return friendlistArray;
  },

  /*  
   *  Function: checks if user ID is on friendlist array and gets array position (key)
   *            of that ID or position where that ID should be inserted
   *  Params: uid (int) - new friend ID
   *          friendlistArray (array) - sorted array (ascending) of IDs (integers)
   *  Returns: { isPresent: true/false; position: x }
   *           "x" is the array key dependending on "isPresent" value:
   *           if isPresent === true: "x" is the array key of searched ID
   *           if isPresent === false: "x" is the array key where ID should be inserted
   */
  friendOnList: function (friendid, friendname , friendlistArray) {
    // Get position of "uid" or where it should be inserted in "friendlistArray"
    console.log("friendOnList friendId --> " + friendid);
    console.log("friendOnList friendname --> " + friendname);
    const position = this.locationOf(friendid, friendlistArray);

     console.log("friendOnList position --> " + position);

    //(friendlistArray[position]).friendusername = friendname;

    const response = {
      isPresent: parseFloat((friendlistArray[position]).friendid) === parseFloat(friendid),
      position: position
    }

    return response;
  },

  /*  
   *  Function: returns position of element in sorted array if that element is present,
   *            if it's not present, gets position where it should be inserted to keep 
   *            the array sorted. Implements binary search.
   *  Params: element (number) - element to look for in array "arr"
   *          arr (array) - sorted (ascending) array of numbers
   *          start (int) - array key describing from where to start looking
   *          end (int) - array key +1, describing the end of range of our search
   */
  locationOf: function (element, arr, start = 0, end = arr.length) {
    // Get middle key in our array
    let pivot = Math.floor(start + (end - start) / 2);

    // If pivot points to our element in array, return pivot
    if(parseFloat(arr[pivot]) === parseFloat(element)){
      return pivot;
    }
    
    // If 1 position remains
    if(end-start <= 1){
      // If array element is bigger then what we are looking for
      if(arr[pivot] > element){
        // Return current position (insert the element here, so bigger one will be after)
        return pivot;
      }else{
        // Return next position (insert the element next, so smaller will be before)
        return pivot+1;
      }
    }

    // More then 1 position left
    // If element of current position is smaller then what we search for
    if(arr[pivot] < element){
      // Search in half of array with bigger elements
      return this.locationOf(element, arr, pivot, end);
    }else{
      // Search in half of array with smaller elements
      return this.locationOf(element, arr, start, pivot);
    }
  }
};