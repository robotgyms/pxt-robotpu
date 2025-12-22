// Compile-time smoke tests for RobotPU blocks
// These calls should type-check in the MakeCode environment
RobotPU.init("auto", "peu")
RobotPU.walk(0, 0)
RobotPU.walk(3, -0.5)
RobotPU.explore()
RobotPU.dance()
RobotPU.kick()
RobotPU.jump()
RobotPU.rest()
RobotPU.talk("Hello")
RobotPU.sing("#70REYY")
