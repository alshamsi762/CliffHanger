const Item = require('./item.js');
const Player = require('./player.js');


// Implementation of double linked List
function node(player)
{
  this.data = player;
  this.previous = null;
  this.next = null;
}

function doubleList()
{
  this.length = 0;  // we could use this to keep track of players alive!
  this.head = null;
  this.tail = null;
}

// function to add a player to the linked list
doubleList.prototype.addPlayer = function(player)
{
  var newPlayer = new node(player);

  if(this.length == 0)
  {
    this.head = newPlayer;
    this.tail = newPlayer;
    this.head.next = newPlayer;
    this.head.previous = newPlayer;
    this.tail.next = newPlayer;
    this.tail.previous = newPlayer;  // I think we need to set all of these to make it a double linked list and to loop around?

  }
  else
  {
    this.tail.next = newPlayer;
    newPlayer.previous = this.tail;
    newPlayer.next = this.head;
    this.tail = newPlayer;
    this.head.previous = newPlayer;
  }

  this.length++;

  return this.length;  // We can change this if we need to
};  // idk why there is a ; here?


// function to remove a player from the linked list
doubleList.prototype.removePlayer = function(id)  // we can search for the player's id to remove them?
{
  var message1 = {failure: 'Error: List is empty!'};
  var message2 = {failure: 'Error: Player not found!'};
  var nodeToRemove = null;
  var currentNode = this.head;
  var count = 0;

  if(this.length == 0)
  {
    throw new Error(message1.failure);
  }
  else
  {
    while(count < this.length)   // loop through the whole list
    {
      if(currentNode.data.id == id)
      {
        nodeToRemove = currentNode;   // if player found, set it to nodeToRemove
      }
      currentNode = currentNode.next;
      count++;
    }

    if(nodeToRemove == null)    // if not found
    {
      throw new Error(message2.failure);
    }
    else    // if found
    {
      if(nodeToRemove == this.head && this.length == 1)   // it is the only node
      {
        this.head = null;   // empty the list
        this.tail = null;
        this.length = 0;
      }
      else    // this should work for any other case since I made it a double linked list that loops.
      {
        nodeToRemove.previous.next = nodeToRemove.next;
        nodeToRemove.next.previous = nodeToRemove.previous;
        this.length--;
      }
    }
  }

  return this.length;  // We can change this if we need to
};


module.exports = class Gameplay {

  //TODO Figure out turn timer.
  // Timer function. Check if player state is still Active after ten seconds
  // Would need to figure out how to track old and current position

  // Const. Linked List (Players), Array for all Items, # Alive, Turn Timer, currPlayer, currItem, fullTurnCount
  constructor(p1, p2, p3, p4) {
    // Linked list of players
    var sentinel = new Player(-1, 0, 0, null, null, null);
    var list = new doubleList();
    list.addPlayer(p1);
    list.addPlayer(p2);
    list.addPlayer(p3);
    list.addPlayer(p4);
    list.addPlayer(sentinel);

    this.playerList = list;


    // Array of all Items
    this.BASIC = 0;
    this.POTION10 = 1;
    this.POTION30 = 2;
    this.RADIUS = 3;    // radius attack
    this.TELEPORT = 4;
    this.TRAP = 5;
    this.LONG = 6;    // range attack, change name?
    this.STRONG = 7;    // stronger attack, more damage, change name?
    this.MOVEX2 = 8;

    var allItems = [0, 1, 2, 3, 4, 5, 6, 7, 8];    // not sure if this is feasible lol
    this.items = allItems;

    this.size = 100, this.width = 10;


    this.currPlayer = null, this.currItem = null, this.fullTurnCount = 0;
    this.topBounds = 99, this.lowerBounds = 0, this.leftOffset = 0, this.rightOffset = 9;
    this.board = [];
  }

  // Creates Board. Places players and items on board
  createBoard() {

    for(i = 0; i < 100; i++)
    {
      this.board.push(new Boardspace(i, null, null, null, 0));
    }

    // place players on corners
    this.currPlayer = this.playerList;
    console.log(this.board[0]);
    this.board[0].setPlayer(this.currPlayer);
    this.currPlayer = this.playerList.next;
    this.board[9].setPlayer(this.currPlayer);
    this.currPlayer = this.playerList.next.next.next;
    this.board[99].setPlayer(this.currPlayer);
    this.currPlayer = this.playerList.next.next.next;
    this.board[90].setPlayer(this.currPlayer);


    // TODO: place items on board



  }


  // Starts turn timer, calculate possible moves, set currentPlayer, change player state to Active. Disable "end turn"
  startTurnFor(player) {
    // Start turn timer

    // Calculate possible moves from player's position
    this.possibleMovesFrom(this.board[player.position]);

    // Change currentPlayer and currentItem to start of turn values
    this.currPlayer = player;
    // this.currItem = this.items[this.BASIC]; <= moved to moveTo()
    this.currPlayer.status = 1; // Change status to Active "1"

  }

  // Update Linked List, change player state to Idle
  endTurnFor(player) {
    // Reset turn timer?

    player.status = 0;
  }

  // Update currPlayer position, apply effects of any trap or add item, set currItem to Basic Attack and call possible attacks.
  // Enable "end turn" button
  moveTo(boardspace) {
    // Remove the player from their current boardspace
    this.board[this.currPlayer.position].removePlayer();

    // Move the player to the requested boardspace
    boardspace.setPlayer(this.currPlayer);

    // Check for traps, or items
    if (boardspace.hasTrap()) {
      // End player's turn
    }

    if (boardspace.hasLoot()) {
      if (boardspace.loot.itemType == 0) {  // Offensive
        var success = this.currPlayer.pushOffensiveItem(boardspace.loot);
        if (success) {
          boardspace.removeLoot();
        } else {
          // Inventory full
          //TODO UI Change
        }
      } else if (boardspace.loot.itemType == 1) { // Defensive
        var success = this.currPlayer.pushDefensiveItem(boardspace.loot);
        if (success) {
          boardspace.removeLoot();
        } else {
          // Inventory full
          //TODO UI Change
        }
      }
    }
    // Set the currentItem to the basic attack
    this.currItem = this.items[this.BASIC];

    // TODO Call possible attacks function

  }

  // Check if player, apply effects to player. Apply effects of item to the boardspace if any. End current player's turn
  attack(item, boardspace) {

  }

  // Sets the current players item to the currentItem (basic on first call). Waits for user input to select other item.
  // Check if Offensive or Defensive, calc possibleAttacks if applicable.
  chooseItem(item) {

  }

  // Called when user activates item. Checks if Offensive or Defensive. Attack if offens. Apply effects if defens.
  // remove item from player inventory.
  useItem(item) {

  }

  // Randomly drop an item on a random (valid) boardspace.
  dropItem() {
    var itemPos = 0;
    var item = null;
    itemPos = Math.floor(Math.random() * this.size + this.lowerBounds);
    while(this.board[itemPos].fallStage != 0 || this.board[itemPos].hasPlayer || this.board[itemPos].hasLoot)
    {
      itemPos = Math.floor(Math.random() * this.size + this.lowerBounds);
    }

    item = this.items[Math.floor(Math.random() * 8)];   // change the size of items array

    // Apply changes
    this.board[itemPos].setLoot(item);
    // Call UI

  }

  // Shrink the board. For each dropped, check if player is there, kill player if they are.
  shrinkBoard() {
    // change outer blocks to FALLEN and kill any players found
    for(i = lower; i < lower + 10; i++)   // lower row
    {
      this.board[i].fallStage = FALLEN;
      if(this.board[i].hasPlayer())
      {
        this.killPlayer(this.board[i].player);
      }

      this.board[top - i].fallStage = FALLEN;
      if(this.board[top - i].hasPlayer())
      {
        this.killPlayer(this.board[top - i].player);
      }
    }

    for(i = lower; i < top; i+=10)   // left column
    {
      this.board[i].fallStage = FALLEN;
      if(this.board[i].hasPlayer())
      {
        this.killPlayer(this.board[i].player);
      }

      this.board[top - i].fallStage = FALLEN;
      if(this.board[top - i].hasPlayer())
      {
        this.killPlayer(this.board[top - i].player);
      }
    }


    // change boundaries
    this.width -= 2;
    this.size = this.width * this.width;
    this.lowerBounds += 10;
    this.topBounds -= 10;
    this.rightOffset--;
    this.leftOffset++;
    // call UI
    // call this in shouldShrinkBoard

  }

  // Remove player from linked list. Call any animations
  killPlayer(player) {
    this.playerList.removePlayer(player.id);
    // should we set the player to null?
    // call any animations
  }

  // Check attributes of boardspace
  canMoveTo(boardspace) {
    return boardspace.playerCanEnter();
  }

  // Check boardspaces around currPlayer's boardspace. Display in UI
  possibleMovesFrom(boardspace) {
    var pos = boardspace.position;
    if(pos + 10 <= this.topBounds && canMoveTo(this.board[pos + 10]))
    {
      // can move up
    }
    if((pos % 10) != this.rightOffset && canMoveTo(this.board[pos + 1]))
    {
      // can move right
    }
    if(pos - 10 >= this.lowerBounds && canMoveTo(this.board[pos - 10]))
    {
      // can move down
    }
    if((pos % 10) != this.leftOffset && canMoveTo(this.board[pos - 1]))
    {
      // can move left
    }
  }

  // Use currPlayer pos. and item to display possible attacks. Display in UI
  possibleAttacksBy(item) {

  }

  // Check full-turn count. Change fallStage before blocks should fall.
  shouldShrinkBoard() {
    var count = this.fullTurnCount;
    if(count == 4 || count == 11 || count == 20)
    {
      var top = this.topBounds, lower = this.lowerBounds, right = this.rightOffset, left = this.leftOffset;

      // change outer blocks to UNSTABLE
      for(i = lower; i < lower + 10; i++)   // lower row
      {
        this.board[i].fallStage = UNSTABLE;
        this.board[top - i].fallStage = UNSTABLE;
      }
      // for(i = top; i > top - 10; i--)   // top row
      // {
      //   this.board[i].fallStage = UNSTABLE;
      // }
      for(i = lower; i < top; i+=10)   // left column
      {
        this.board[i].fallStage = UNSTABLE;
        this.board[top - i].fallStage = UNSTABLE;
      }
      // for(i = top; i > lower; i-=10)   // right column
      // {
      //   this.board[i].fallStage = UNSTABLE;
      // }
    }
    if(count == 5 || count == 12 || count == 21)    // After 5 - 7 - 9 turns
    {
      // call shrinkBoarb
      shrinkBoard();
    }

  }

  // Check if only one player alive.
  hasEnded() {
    if(this.playerList.length == 2)   // one for player, one for sentinel?
    {
      // return true?
    }
  }

  // if currPlayer reached sentinel, Increment fullTurnCount and currPlayer.next
  nextTurn() {
    var player = this.currPlayer;
    if(player != null && player.id == -1)
    {
      this.fullTurnCount++;
      this.currPlayer = this.currPlayer.next;
    }
  }

  // calculate moves required to go from a to b
  // used to drop items at the beginning of the game
  movesFrom(a, b)
  {
    var diff = Math.abs(a - b);
    var moves = 0;
    moves = moves + Math.floor(diff / 10) + (diff % 10);
    return moves;
  }

  initialDrop()
  {
    var count = 0;
    var itemPos = 0;
    var item = null;
    while(count < 10)
    {
      // item = call amjad's algorithm
      item = this.items[Math.floor(Math.random() * 8)];
      itemPos = Math.floor(Math.random() * 100);

      // makes sure no item is dropped less than 2 moves away from all players
      while(movesFrom(0, itemPos) < 2 || movesFrom(9, itemPos) < 2 || movesFrom(90, itemPos) < 2 || movesFrom(99, itemPos) < 2)
      {
        itemPos = Math.floor(Math.random() * 100);
      }
      this.board[itemPos].setLoot(item);
      count++;
    }
  }

  // Amjad's algorithm
  randomItem()
  {
    // HARD AF! Probably going to use Andrew's instead
    var item;
    item = this.items[Math.floor(Math.random() * 20)];
    return item;
  }


}