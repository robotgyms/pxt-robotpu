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
    music.rest(music.beat(BeatFraction.Whole))
    music.rest(music.beat(BeatFraction.Double))
    started = 0
}

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
    music.rest(music.beat(BeatFraction.Whole))
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
Example program can be downloaded from https://makecode.microbit.org/S24031-00421-18959-80697

---

## Full quartet soundtrack template (Tenor / Whistle / Baritone / Bass)

This section provides a **runnable** quartet “soundtrack” template (4 independent parts) using `music.playTone(...)`.

Mapping used:

- `track = 0` = Tenor Solo (melody)
- `track = 1` = Whistle
- `track = 2` = Baritone
- `track = 3` = Bass

Tempo/time settings used:

- `music.setTempo(...)` (see MIDI note below)
- 2/4 feel (you express durations using `music.beat(BeatFraction.Quarter)` / `Eighth` / etc.)

To use this with the synchronization methods above:

- Keep your existing `radio` handlers.
- Fill `tracksFreqs[]` and `tracksDursMs[]` with the note sequences you want.

```typescript
robotPu.setChannel(166)
// Set your tempo here. The MIDI-extraction script below uses this BPM to convert ticks -> milliseconds.
music.setTempo(120)
music.setVolume(255)
let track = 0
let started = 0

function playTrack(freqs: number[], dursMs: number[]) {
    for (let i = 0; i < freqs.length; i++) {
        if (freqs[i] <= 0) music.rest(dursMs[i])
        else music.playTone(freqs[i], dursMs[i])
    }
}

let tracksFreqs: number[][] = [
    [0,294,330,330,294,262,330,392,330,330,294],
    [
        // Fill in
        0,392,392,392,392,392,392,392,392,392
    ],
    [
        // Fill in
        0,659,659,659,659,659,659,659,659,659
    ],
    [
        // Fill in
        523,523,523,523,523,523,523,523,523,523
    ]
]

let tracksDursMs: number[][] = [
    [
        5500,250,250,250,250,750,250,250,250,250
    ],
    [
        // Fill in
        4000,250,250,375,500,125,500,250,250,375
    ],
    [
        // Fill in
        2000,250,250,375,250,250,125,500,250,250
    ],
    [
        // Fill in
        250,250,375,250,250,125,500,250,250,375
    ]
]

function playSelectedTrack () {
    const n = tracksFreqs.length
    if (n <= 0) return
    const idx = ((track % n) + n) % n
    started = 1
    playTrack(tracksFreqs[idx], tracksDursMs[idx])
    started = 0
}

radio.onReceivedString(function (receivedString) {
    if (receivedString == "#puChorus") {
        playSelectedTrack()
    }
    robotPu.runStringCommand(receivedString)
})

radio.onReceivedValue(function (name, value) {
    robotPu.runKeyValueCommand(name, value)
})

input.onButtonPressed(Button.A, function () {
    track += 1
    basic.showNumber(((track % tracksFreqs.length) + tracksFreqs.length) % tracksFreqs.length)
})

input.onButtonPressed(Button.B, function () {
    track -= 1
    basic.showNumber(((track % tracksFreqs.length) + tracksFreqs.length) % tracksFreqs.length)
})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    playSelectedTrack()
})

```
upload to 4 robot PU's microbit. Press the button A or B to set sound track of each robot PU to 0,1,2,3.
Then load this gamepad program to gamepad's microbit:
 -https://makecode.microbit.org/_fq9VkJYgY8qM
When you make the gamepad face-down, the chorus of 4 robot PU will start.

Continue transcription workflow (repeatable):

- For each staff (Tenor/Whistle/Baritone/Bass), go **measure by measure**.
- For each measure, write a sequence of `tone(frequency, BeatFraction.X)` calls that add up to the measure length.
- Use `tone(0, ...)` for rests.

If you tell me which measure you want next (for example: “start at measure 1, Tenor Solo”), I’ll transcribe that measure into `tone(...)` calls and you can confirm it before we proceed.

If you paste note sequences from your score, I can help you convert each measure into `tone(frequency, BeatFraction. ...)` calls.

### Generate `freqs[]` + `durs[]` from the MIDI file (recommended)

If you have `Minions Banana Song.mid` in the project root, you can generate paste-ready arrays directly from MIDI.

The MIDI in this repo has 4 tracks (one channel each):

- Track 0: Elec. Piano (Classic)
- Track 1: Grand Piano
- Track 2: Music Box
- Track 3: Acoustic Gtr (Classic)

Suggested mapping to the quartet parts:

- Tenor Solo = Track 3 (Acoustic Gtr)
- Whistle = Track 2 (Music Box)
- Baritone = Track 0 (Elec. Piano)
- Bass = Track 1 (Grand Piano)

Run this command locally to print arrays you can paste into `tracksFreqs[]` / `tracksDursMs[]`:

```bash
.venv/bin/python - <<'PY'
import mido

mid = mido.MidiFile('Minions Banana Song.mid')
TPB = mid.ticks_per_beat

# BPM used to convert ticks -> milliseconds.
# Keep this in sync with the MakeCode program's music.setTempo(...)
BPM = 120

def midi_note_to_freq(n: int) -> int:
    return int(round(440.0 * (2.0 ** ((n - 69) / 12.0))))

def ticks_to_ms(dt: int) -> int:
    return int(round((dt / TPB) * (60000.0 / BPM)))

def extract_monophonic(track: mido.MidiTrack):
    t=0
    active=set()
    segments=[]
    last_t=0
    def current_pitch():
        return max(active) if active else None

    for msg in track:
        t += msg.time
        if msg.type not in ('note_on','note_off'):
            continue
        if msg.type=='note_on' and msg.velocity>0:
            if t>last_t:
                p=current_pitch()
                segments.append((p, t-last_t))
                last_t=t
            active.add(msg.note)
        else:
            if t>last_t:
                p=current_pitch()
                segments.append((p, t-last_t))
                last_t=t
            active.discard(msg.note)

    freqs=[]
    durs_ms=[]
    for pitch, dt in segments:
        if dt<=0:
            continue
        f = 0 if pitch is None else midi_note_to_freq(pitch)
        freqs.append(f)
        durs_ms.append(ticks_to_ms(dt))
    return freqs, durs_ms

def js_array_int(arr):
    return '[' + ','.join(str(x) for x in arr) + ']'

mapping = {
    'TENOR': 3,
    'WHISTLE': 2,
    'BARITONE': 0,
    'BASS': 1,
}

for role, ti in mapping.items():
    freqs, durs_ms = extract_monophonic(mid.tracks[ti])
    print('\nROLE', role, 'TRACK', ti)
    print('FREQS', js_array_int(freqs))
    print('DURS_MS', js_array_int(durs_ms))
PY
```

Notes:

- This extraction is monophonic (one note at a time). If a MIDI track contains chords, it will keep the highest note.
- If you want a different mapping, swap the track numbers in `mapping`.

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

---

## Synchronization methods (practical options)

When multiple robots must start a song together, there are a few common synchronization strategies. Each has tradeoffs in complexity vs accuracy.

### A. Manual count-in (simplest)

- Someone counts “3, 2, 1, go” and everyone presses the logo.
- Works for demos, but humans introduce large timing error.

### B. Radio START trigger (good)

- A conductor micro:bit sends a single radio message like `START`.
- Each robot starts when the message is received.
- Better than humans, but there can still be small arrival-time differences between robots.

**Conductor code (send START)**

```typescript
radio.setGroup(166)

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    radio.sendString("START")
})
```

**Robot code (start on receive)**

Paste this near the bottom of the quartet program (where radio handlers are registered).

```typescript
radio.setGroup(166)

radio.onReceivedString(function (msg: string) {
    if (msg == "START") {
        // pick role and start immediately
        track = robotPu.channel() % 4
        if (track == 0) track1()
        else if (track == 1) track2()
        else if (track == 2) track3()
        else track4()
    }
})
```

### C. Start-at-timestamp (best on micro:bit)

- Conductor sends a **future start time** such as `startAt = control.millis() + 800`.
- Each robot waits until its own `control.millis()` reaches `startAt` before starting.
- Even if radio packets arrive at slightly different times, robots still start together.

Why it’s better than `START`:

- Radio packet delivery time varies. A shared future timestamp makes the start time deterministic.
- You can also send tempo and other “settings” before the start.

Minimal conductor example:

```typescript
radio.setGroup(166)

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    const startAt = control.millis() + 800
    radio.sendValue("startAt", startAt)
})
```

Minimal robot example:

```typescript
radio.setGroup(166)
let startAt = -1

radio.onReceivedValue(function (name: string, value: number) {
    if (name == "startAt") {
        startAt = value
        control.inBackground(function () {
            while (control.millis() < startAt) {
                basic.pause(5)
            }
            track = robotPu.channel() % 4
            if (track == 0) track1()
            else if (track == 1) track2()
            else if (track == 2) track3()
            else track4()
        })
    }
})
```

### D. Tempo/beat agreement (important)

Even with a synchronized start, the robots can drift if they don’t share the same tempo.

- Conductor broadcasts a tempo like `bpm=120`.
- Robots call `music.setTempo(bpm)` before starting.

**Conductor code (broadcast BPM)**

```typescript
radio.setGroup(166)
let bpm = 120

input.onButtonPressed(Button.A, function () {
    bpm += 5
})

input.onButtonPressed(Button.B, function () {
    bpm -= 5
})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    bpm = Math.max(60, Math.min(200, bpm))
    radio.sendValue("bpm", bpm)
})
```

**Robot code (apply BPM)**

```typescript
let bpm = 120

radio.onReceivedValue(function (name: string, value: number) {
    if (name == "bpm") {
        bpm = value
        music.setTempo(bpm)
    }
})
```

Tip:

- If you use **start-at-timestamp**, send `bpm` first, then send `startAt`.

### E. Resync / “bar beacons” (optional)

For long songs, you can periodically broadcast a “bar number” or “beat number” so everyone can correct drift.

Simple pattern:

- Conductor sends a `barStartAt` timestamp every bar.
- Robots re-align to the newest `barStartAt` (small corrections) and continue.

**Conductor code (bar beacon loop)**

```typescript
radio.setGroup(166)

let bpm = 120
let running = false

function barMs(): number {
    return Math.idiv(60000, bpm) * 4
}

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    running = !running
})

basic.forever(function () {
    if (!running) {
        basic.pause(50)
        return
    }

    const now = control.millis()
    const barStartAt = now + 200
    radio.sendValue("barStartAt", barStartAt)
    basic.pause(barMs())
})
```

**Robot code (use bar beacons)**

```typescript
let barStartAt = -1

radio.onReceivedValue(function (name: string, value: number) {
    if (name == "barStartAt") {
        barStartAt = value
    }
})

// In your track code, check barStartAt occasionally and correct timing.
// A simple approach is to wait for barStartAt before starting the *next* phrase/bar.
```

Notes:

- Resync is most useful if you also make your track code “bar aware” (split into phrases).
- For this quartet example (pre-written `music.playTone(...)` sequences), resync is harder unless you refactor tracks into bar-sized chunks.

### F. Leader/follower (conductor) pattern

If you want one robot to act as a “leader” instead of a separate conductor micro:bit:

- Pick one Robot PU as **leader**.
- Leader broadcasts `bpm` and `startAt`.
- Followers listen and start.

Leader can be chosen by channel, for example:

- if `robotPu.channel() % 4 == 0` then leader

**Leader snippet (broadcast)**

```typescript
radio.setGroup(166)
let bpm = 120

function amLeader(): boolean {
    return (robotPu.channel() % 4) == 0
}

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (!amLeader()) return
    radio.sendValue("bpm", bpm)
    radio.sendValue("startAt", control.millis() + 800)
})
```

Followers use the same receiver logic shown above in method C/D.

---

## Synchronized Minion chorus: one conductor + many Robot PUs

In this pattern:

- All Robot PUs run the same quartet code.
- Each robot selects its part using `track = robotPu.channel() % 4`.
- A conductor micro:bit starts all robots together.

### A. Conductor micro:bit code (broadcast tempo + startAt)

Flash this to your *conductor* (a gamepad micro:bit or any micro:bit).

```typescript
radio.setGroup(166)

let bpm = 120

input.onButtonPressed(Button.A, function () {
    bpm += 5
})

input.onButtonPressed(Button.B, function () {
    bpm -= 5
})

// Press logo to start everyone together
input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    bpm = Math.max(60, Math.min(200, bpm))
    radio.sendValue("bpm", bpm)

    // Start a bit in the future so all robots can receive the packet
    const startAt = control.millis() + 800
    radio.sendValue("startAt", startAt)
})
```

### B. Robot PU code change (listen for startAt)

Add this receiver logic to the quartet program (near the bottom where radio handlers are registered). It will start the correct track **in sync**.

```typescript
let startAt = -1
let bpm = 120

radio.onReceivedValue(function (name: string, value: number) {
    // keep existing:
    // robotPu.runKeyValueCommand(name, value)

    if (name == "bpm") {
        bpm = value
    } else if (name == "startAt") {
        startAt = value
        control.inBackground(function () {
            // apply shared tempo before starting
            music.setTempo(bpm)

            // wait until the agreed start time
            while (control.millis() < startAt) {
                basic.pause(5)
            }

            // select the role and start that part
            track = robotPu.channel() % 4
            if (track == 0) track1()
            else if (track == 1) track2()
            else if (track == 2) track3()
            else track4()
        })
    }
})
```

Notes:

- `control.inBackground(...)` prevents the radio callback from blocking.
- Using `startAt` is more reliable than “start immediately on receive”.
- If you already use `radio.onReceivedValue` for `robotPu.runKeyValueCommand(...)`, merge the logic into one handler.

---

## Testing checklist

- Flash the quartet code to all Robot PUs.
- Set each robot’s channel so `channel % 4` covers 0,1,2,3.
- Flash the conductor code to a controller micro:bit.
- Press logo on the conductor and confirm all robots begin together.
