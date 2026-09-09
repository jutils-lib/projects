
// ---------------------------------------------------------
// GAME MENU
// ---------------------------------------------------------

// Get the game menu element.
const gameMenu = $('#game-menu');

// Keeps track of whether the menu is currently visible.
let isVisible = false;

// Toggle the game menu when the three-dot menu button is clicked.
$('#menu').on('click', function () {

// If the menu is currently visible, hide it.
if(isVisible) {
gameMenu.css('display', 'none');

// Otherwise, display the menu using CSS Grid.
} else {
gameMenu.css('display', 'grid');  
}

// Reverse the visibility state.
isVisible = !isVisible;
});


// Close the menu when clicking somewhere outside the menu.
$('html').on('click', function (e) {

/*
     * Get the menu button, the buttons inside the game menu,
     * and the menu itself.
     *
     * If the clicked element is not any of these elements,
     * the click happened outside the menu.
     */
if($('#menu, #game-menu > button, #game-menu').unwrap().every(el => e.target !== el)) {
// Hide the menu.
gameMenu.hide();

// Keep the visibility state synchronized with the UI.
isVisible = false;
}
});


// ---------------------------------------------------------
// GAME ELEMENTS
// ---------------------------------------------------------

// Element displaying the remaining countdown time.
const countdown = $('#countdown');

// Element displaying the computer's score.
const computerScore = $('#c-score');

// Element displaying the user's score.
const userScore = $('#u-score');

// Button used to start the game.
const startGame = $('#start-game');

// The three buttons representing the user's choices.
const userButtons = $('#user > .btn');

// The three buttons representing the computer's choices.
const computerButtons = $('#computer > .btn');


// ---------------------------------------------------------
// START GAME
// ---------------------------------------------------------
startGame.on('click', function (e) {

// Hide the Start Game button once the game begins.
$(e.target).hide();

// Create a one-second interval for the countdown.
const interval = $.interval(() => {

// When the countdown reaches zero,
// the user has failed to make a choice.
if(parseInt(countdown.text()) === 0) {

 /*
             * End the round.
             *
             * false tells resetRound() that the user
             * did NOT interact before the countdown ended.
             *
             * Therefore, the computer receives the point.
             */ 
 resetRound(interval, e.target, false);
} else {

// Decrease the displayed countdown by one second.
countdown.text(x => x - 1); 
}
}, 1000);


/*
     * Randomly select the computer's choice.
     *
     * $.randInt(0, 2) produces:
     *
     * 0 → rock
     * 1 → paper
     * 2 → scissors
     */
const computerChoice = $.randInt(0, 2);


// -----------------------------------------------------
    // RESTART GAME
    // -----------------------------------------------------
$('#restart-game').on('click', function () {

/*
         * Restart the current round.
         *
         * true tells resetRound() that the user
         * intentionally interacted with the game.
         */
resetRound(interval, e.target, true);
});


// -----------------------------------------------------
    // USER CHOICE
    // -----------------------------------------------------
    
// Listen for the user selecting one of the three choices.    
userButtons.on('click', x => {

/*
         * Get the computer button corresponding to the
         * computer's randomly selected choice.
         *
         * For example:
         *
         * computerChoice = 0 → first computer button
         * computerChoice = 1 → second computer button
         * computerChoice = 2 → third computer button
         */
const c = computerButtons.at(computerChoice);

/*
         * Highlight both the user's selected button and
         * the computer's selected button.
         */
 $(x.target).add(c).css('background', 'blue');
 
 /*
         * Disable all choice buttons so the user cannot
         * make another selection during this round.
         */ userButtons.add(computerButtons).prop('disabled', true);
         
/*
         * Wait two seconds so the user can see the selected
         * choices before resetting the round.
         */         
 $.timeout(() => resetRound(interval, e.target, true), 2000);
 
/*
         * Get the index stored on the clicked user button.
         *
         * The index identifies the user's choice:
         *
         * 0 → rock
         * 1 → paper
         * 2 → scissors
         */
 const userChoice = $(x.target).attr('index');

// Compare the user's choice against the computer's choice.
 determineWinner(userChoice, computerChoice);
});
});


// ---------------------------------------------------------
// RESET ROUND
// ---------------------------------------------------------

function resetRound(interval, el, userInteract) {

// Stop the countdown interval.
interval.cancel();

// Show the Start Game button again.
$(el).show();


 /*
     * Reset both sets of choice buttons.
     *
     * Re-enable the buttons so they can be selected
     * in the next round.
     *
     * Remove the blue selection background.
     */
[userButtons, computerButtons].forEach(btn => {
 $(btn).prop('disabled', false);
 $(btn).css('background', 'none');
}); 

// Reset the countdown back to ten seconds.
countdown.text(10);


/*
     * Remove the user's click listener.
     *
     * This prevents the previous round's listener from
     * remaining attached after the round has ended.
     */
userButtons.off('click');  
$('#restart-game').off('click'); 


/*
     * If the user did not interact before the countdown
     * reached zero, the computer wins automatically.
     */
if(!userInteract) {

// Increase the computer's stored score by one.
$.storage.set('computer', x => parseInt(x ?? 0) + 1);

// Update the displayed score and announce the winner.
loadGameScore('COMPUTER');   
}
}


// ---------------------------------------------------------
// DETERMINE WINNER
// ---------------------------------------------------------

function determineWinner(user, computer) {

/*
     * The index of each choice corresponds to the button index:
     *
     * 0 → rock
     * 1 → paper
     * 2 → scissors
     */
const choices = ['rock', 'paper', 'scissors']; 

// Convert the user's numeric choice into its name.
const userChoice = choices[user];

// Convert the computer's numeric choice into its name.
const computerChoice = choices[computer];

// Will contain the name of the winner.
let winner;

// Same choices means the round is a draw.
if(userChoice === computerChoice) {
alert('It was a Draw');

// No score is awarded for a draw.
return;

// Check whether the user has a winning combination.
} else if((userChoice === 'scissors' && computerChoice === 'paper') || (userChoice === 'paper' && computerChoice === 'rock') || userChoice === 'rock' && computerChoice === 'scissors') {

// The user won this round.
winner = 'USER';

// Increase the user's stored score by one.
$.storage.set('user', x => parseInt(x ?? 0) + 1);
} else {

// If the user didn't win or draw, the computer wins.
winner = 'COMPUTER';

// Increase the computer's stored score by one.
$.storage.set('computer', x => parseInt(x ?? 0) + 1);
} 

// Update the displayed scores and announce the winner.
loadGameScore(winner);
}


// ---------------------------------------------------------
// LOAD SCORE
// ---------------------------------------------------------

function loadGameScore(winner) {

/*
     * Retrieve the saved computer score.
     *
     * If no score exists yet, use zero.
     */
const cScore = $.storage.get('computer') ?? 0;


/*
     * Retrieve the saved user score.
     *
     * If no score exists yet, use zero.
     */
const uScore = $.storage.get('user') ?? 0;

// Display the computer's score.
computerScore.text(cScore);  

// Display the user's score.
userScore.text(uScore);  


/*
     * If a winner was supplied, announce the result.
     *
     * When loadGameScore() is called without an argument,
     * no alert is displayed.
     */ 
if(winner) alert('The winner is: ' + winner);
}


// ---------------------------------------------------------
// INITIAL SCORE
// ---------------------------------------------------------

/*
 * Load the saved scores when the page starts.
 *
 * This allows scores stored from a previous session
 * to appear immediately.
 */
loadGameScore();


// ---------------------------------------------------------
// CLEAR SCORE
// ---------------------------------------------------------

$('#clear-score').on('click', function () {

// Remove the saved user score.
$.storage.remove(['user', 'computer']);

/*
     * Reload the page after 500ms.
     *
     * The reload resets the displayed score back to zero
     * because the stored scores have been removed.
     */
$.reload(500);
});
