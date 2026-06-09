\"\"\"
Smart Waste Management & Bin Level Detection System
--------------------------------------------------
Python Secondary Simulation - Sensor Mathematics and Regression Models
File: python_simulation/sim_core.py

Defines standard ultrasonic conversions, regression curves for bin filling patterns,
and exports mock simulation dataset for model training.
\"\"\"

import json
import math
import random

def calibrate_ultrasonic_depth(time_echo_microseconds, air_temp_celsius=25.0):
    \"\"\"
    Converts microsecond echo pulse to centimeters.
    Accounts for air temperature adjustments on speed of sound:
    v = 331.3 + 0.606 * Temp (°C) [m/s]
    \"\"\"
    # Speed of sound in m/s
    speed_of_sound_ms = 331.3 + (0.606 * air_temp_celsius)
    # Speed in cm / microsecond
    speed_cm_us = (speed_of_sound_ms * 100.0) / 1000000.0
    
    # Distance = (echo_duration * speed) / 2
    distance_cm = (time_echo_microseconds * speed_cm_us) / 2.0
    return round(distance_cm, 3)

def generate_random_linear_accum(current_pct, hour_interval=1.0):
    \"\"\"
    Simulates simple waste accumulation with custom stochastic jumps
    simulating randomized visitor trash drops.
    \"\"\"
    base_rate = random.uniform(1.5, 4.5) * hour_interval
    # 2% chance of a high throw-in of packaging material
    if random.random() < 0.05:
        base_rate += random.uniform(15.0, 30.0)
        
    next_pct = min(100.0, current_pct + base_rate)
    return round(next_pct, 2)

if __name__ == "__main__":
    print("[MATRICES] Calibrating Speed of Sound across relative temperatures:")
    for temp in [0.0, 15.0, 25.0, 40.0]:
        test_duration = 1500.0 # microseconds
        dist = calibrate_ultrasonic_depth(test_duration, temp)
        print(f"   At {temp}°C | Echo Duration: {test_duration}μs | Calculated distance: {dist} cm")
        
    print("\n[STOCHASTIC] Simulating state progression over next 6 intervals:")
    state = 10.0
    for i in range(1, 7):
        state = generate_random_linear_accum(state)
        print(f"   Interval #{i}: Telemetry Fill Percent = {state}%")
