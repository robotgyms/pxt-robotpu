 # 🎤 Lesson: Robot PU Minion Chorus Quartet (4 tracks via radio channel)
 
 ## Introduction
 
 This lesson turns **four Robot PUs** into a “Minion chorus quartet”.
 
 Each robot plays **one vocal track**, and the track is selected automatically from the robot’s **radio channel number**.
 
 You can line up multiple Robot PUs and quickly assign them different parts by changing channel.
 
 ## Problem definition
 
 We want a simple way to coordinate multiple robots so that:
 
 - each Robot PU plays exactly one of **4** song parts
 - the selection is deterministic and easy to configure
 - robots can share the same code, but behave differently based on their **radio channel**
 
 ## Basic diea of solutions
 
 - **4 tracks**: implement `track1()`, `track2()`, `track3()`, `track4()`.
 - **Channel → track mapping**: use:
 
   `trackIndex = robotPu.channel() % 4`
 
   which maps channels to tracks like:
 
   - channel % 4 == 0 → track1
   - channel % 4 == 1 → track2
   - channel % 4 == 2 → track3
   - channel % 4 == 3 → track4
 
 - **Quick assignment**: use buttons to change the radio channel, then press the logo to start singing the mapped track.
 
 ## Implemenation
 
 Copy this program into your MakeCode **JavaScript** editor.
 
 Notes before you run:
 
 - Button **A** increments channel.
 - Button **B** decrements channel.
 - **Logo** starts the singing track selected by `channel % 4`.
 - `robotPu.greet()` initializes Robot PU.
 
 ```typescript
function track3 () {
    music.rest(music.beat(BeatFraction.Breve))
    started = 1
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Whole))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Whole))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Whole))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Whole))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(494, music.beat(BeatFraction.Quarter))
    music.playTone(494, music.beat(BeatFraction.Quarter))
    music.playTone(494, music.beat(BeatFraction.Quarter))
    music.playTone(494, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(494, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(494, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(494, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(370, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Whole))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Whole))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Whole))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(740, music.beat(BeatFraction.Quarter))
    music.playTone(740, music.beat(BeatFraction.Quarter))
    music.playTone(659, music.beat(BeatFraction.Quarter))
    music.playTone(659, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Half))
    music.playTone(494, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(370, music.beat(BeatFraction.Half))
    music.playTone(370, music.beat(BeatFraction.Half))
    music.playTone(370, music.beat(BeatFraction.Half))
    music.playTone(370, music.beat(BeatFraction.Quarter))
    music.playTone(370, music.beat(BeatFraction.Quarter))
    music.playTone(370, music.beat(BeatFraction.Quarter))
    music.playTone(370, music.beat(BeatFraction.Half))
    music.playTone(370, music.beat(BeatFraction.Quarter))
    music.playTone(370, music.beat(BeatFraction.Whole))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Whole))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.rest(music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Double))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Whole))
    music.playTone(440, music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Double))
    started = 0
}
// press button A to walk forward in circles
input.onButtonPressed(Button.A, function () {
    robotPu.changeChannel(1)
})
function track4 () {
    started = 1
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Whole))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Whole))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Whole))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Whole))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(494, music.beat(BeatFraction.Quarter))
    music.playTone(494, music.beat(BeatFraction.Quarter))
    music.playTone(494, music.beat(BeatFraction.Quarter))
    music.playTone(494, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(494, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(494, music.beat(BeatFraction.Quarter))
    music.playTone(554, music.beat(BeatFraction.Quarter))
    music.playTone(494, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(370, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Whole))
    music.playTone(196, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(370, music.beat(BeatFraction.Half))
    music.playTone(392, music.beat(BeatFraction.Half))
    music.playTone(370, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(196, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(370, music.beat(BeatFraction.Half))
    music.playTone(392, music.beat(BeatFraction.Half))
    music.playTone(370, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(294, music.beat(BeatFraction.Half))
    music.playTone(370, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(494, music.beat(BeatFraction.Half))
    music.playTone(523, music.beat(BeatFraction.Half))
    music.playTone(494, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(370, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Half))
    music.playTone(262, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(370, music.beat(BeatFraction.Half))
    music.playTone(392, music.beat(BeatFraction.Half))
    music.playTone(370, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(247, music.beat(BeatFraction.Half))
    music.rest(music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Double))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Half))
    music.playTone(440, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Whole))
    music.playTone(220, music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Double))
    started = 0
}
function track1 () {
    music.rest(music.beat(BeatFraction.Breve))
    music.rest(music.beat(BeatFraction.Breve))
    music.rest(music.beat(BeatFraction.Double))
    music.rest(music.beat(BeatFraction.Whole))
    started = 1
    music.playTone(247, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(247, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Whole))
    music.playTone(220, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(247, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Whole))
    music.playTone(220, music.beat(BeatFraction.Whole))
    music.playTone(247, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(247, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Whole))
    music.playTone(220, music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Whole))
    music.playTone(196, music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Double))
    music.rest(music.beat(BeatFraction.Breve))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Whole))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Whole))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(294, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Whole))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(247, music.beat(BeatFraction.Quarter))
    music.playTone(247, music.beat(BeatFraction.Quarter))
    music.playTone(247, music.beat(BeatFraction.Quarter))
    music.playTone(247, music.beat(BeatFraction.Quarter))
    music.playTone(247, music.beat(BeatFraction.Half))
    music.playTone(247, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(294, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(294, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(294, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(294, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(440, music.beat(BeatFraction.Whole))
    music.playTone(440, music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Double))
    started = 0
}
function track2 () {
    music.rest(music.beat(BeatFraction.Breve))
    music.rest(music.beat(BeatFraction.Breve))
    started = 1
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Whole))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Whole))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Whole))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Whole))
    music.playTone(330, music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Double))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Half))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Whole))
    music.playTone(208, music.beat(BeatFraction.Half))
    music.playTone(208, music.beat(BeatFraction.Quarter))
    music.playTone(208, music.beat(BeatFraction.Quarter))
    music.playTone(208, music.beat(BeatFraction.Whole))
    music.playTone(208, music.beat(BeatFraction.Quarter))
    music.playTone(208, music.beat(BeatFraction.Quarter))
    music.playTone(208, music.beat(BeatFraction.Quarter))
    music.playTone(208, music.beat(BeatFraction.Quarter))
    music.playTone(208, music.beat(BeatFraction.Whole))
    music.playTone(208, music.beat(BeatFraction.Half))
    music.playTone(208, music.beat(BeatFraction.Quarter))
    music.playTone(208, music.beat(BeatFraction.Quarter))
    music.playTone(208, music.beat(BeatFraction.Half))
    music.playTone(208, music.beat(BeatFraction.Quarter))
    music.playTone(208, music.beat(BeatFraction.Quarter))
    music.playTone(370, music.beat(BeatFraction.Quarter))
    music.playTone(370, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(330, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(247, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(247, music.beat(BeatFraction.Half))
    music.playTone(247, music.beat(BeatFraction.Half))
    music.playTone(277, music.beat(BeatFraction.Half))
    music.playTone(247, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(247, music.beat(BeatFraction.Quarter))
    music.playTone(247, music.beat(BeatFraction.Quarter))
    music.playTone(247, music.beat(BeatFraction.Quarter))
    music.playTone(247, music.beat(BeatFraction.Quarter))
    music.playTone(247, music.beat(BeatFraction.Half))
    music.playTone(247, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(247, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(247, music.beat(BeatFraction.Quarter))
    music.playTone(277, music.beat(BeatFraction.Quarter))
    music.playTone(247, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(247, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Half))
    music.playTone(220, music.beat(BeatFraction.Quarter))
    music.playTone(220, music.beat(BeatFraction.Whole))
    music.playTone(220, music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Double))
    started = 0
}
// Register the event listener for incoming string messages
radio.onReceivedString(function (receivedString) {
    robotPu.runStringCommand(receivedString)
})
// press button B to walk backward in circles
input.onButtonPressed(Button.B, function () {
    robotPu.changeChannel(-1)
})
// listen to radio messages for commands of key value pairs
radio.onReceivedValue(function (name, value) {
    robotPu.runKeyValueCommand(name, value)
})
// press logo button to dance using set mode
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    track = robotPu.channel() % 4
    if (track == 0) {
        track1()
    } else if (track == 1) {
        track2()
    } else if (track == 2) {
        track3()
    } else {
        track4()
    }
})
let track = 0
let started = 0
// Initialize robot by ask it to greet
robotPu.greet()

```

## Technical explaination

### A. Why “channel % 4” works

`robotPu.channel()` returns the current radio group ID.

Using modulo:

- keeps the mapping stable
- allows you to use any channel number (0–255)
- guarantees you always land in one of 4 tracks

This is a common technique for distributing roles among identical devices.

### B. How the tracks are triggered

The code triggers tracks only when you press the **logo button**:

- read `robotPu.channel()`
- compute `track = channel % 4`
- call `track1..track4()` based on the value

Buttons A/B only change the channel; they do not start singing.

### C. Radio listeners

This program also registers:

- `radio.onReceivedString(...)` → `robotPu.runStringCommand(...)`
- `radio.onReceivedValue(...)` → `robotPu.runKeyValueCommand(name, value)`

So you can control Robot PU over radio while preparing the quartet.

## Testing

### A. Single-robot test

- Flash the program to one Robot PU.
- Press **A** a few times to change channel.
- Press the **logo** to start singing.
- Verify you get different tracks when `channel % 4` changes.

### B. Quartet test (4 robots)

- Flash the same program to **4 Robot PUs**.
- Set each robot to a different channel group such that `channel % 4` differs:
  - Robot 1: channel 0 (track1)
  - Robot 2: channel 1 (track2)
  - Robot 3: channel 2 (track3)
  - Robot 4: channel 3 (track4)
- Press the **logo** on each robot to start its part.

Tip:

- If the track start timing matters, try counting down and pressing the logo buttons together.

## Next steps

- **Synchronize start time by radio**
  - broadcast a single “START” message from a controller micro:bit
  - have all robots start their track when they receive it

- **Add choreography**
  - on beat boundaries, call `robotPu.dance()` / `robotPu.walk(...)` to make the chorus look alive

- **Add a conductor UI**
  - a separate micro:bit to assign channels and broadcast start/stop commands

