\"\"\"
Smart Waste Management & Bin Level Detection System
--------------------------------------------------
Python IoT Virtual Bin Telemetry Simulator & CSV Logger
File: main.py

This script emulates multiple physical smart containers, performing standard
ultrasonic math calculations, analyzing ambient decays (with temp, hum, gases),
outputting reports, updating local CSV logs, and serving as a backup server.
Ideal for course submission and portfolio showcase when hardware is absent.
\"\"\"

import os
import csv
import time
import random
from datetime import datetime

# Configurations
LOG_FILE_PATH = "data/bin_telemetry_history.csv"
SIMULATION_INTERVAL = 4.0  # seconds

# Simulated Bin Models
smart_bins = [
    {
        "id": "BIN-ADMIN-01",
        "name": "Admin Building Trash Bin",
        "location": "Academic block, Entrance Main Ground",
        "depth_cm": 40.0,
        "current_waste_cm": 6.0, # distance from bottom (waste height)
        "hourly_accum_rate": 2.4, # cm per hour
        "temp_base": 22.0,
        "gas_base": 180.0
    },
    {
        "id": "BIN-FOOD-02",
        "name": "Cafeteria Organic Wet Waste Bin",
        "location": "Food Court block Area (Wet Waste Enclosure)",
        "depth_cm": 30.0,
        "current_waste_cm": 15.0,
        "hourly_accum_rate": 5.1, # high rate of wet waste
        "temp_base": 28.5, # decay heat
        "gas_base": 420.0  # highly odorous decay
    },
    {
        "id": "BIN-CAMPUS-03",
        "name": "Main Campus Plaza Public Bin",
        "location": "Central Green Lawn Pathway",
        "depth_cm": 35.0,
        "current_waste_cm": 2.0,
        "hourly_accum_rate": 1.2,
        "temp_base": 20.0,
        "gas_base": 120.0
    }
]

def initialize_database():
    \"\"\"Builds CSV database headers if file is initially absent.\"\"\"
    os.makedirs("data", exist_ok=True)
    if not os.path.exists(LOG_FILE_PATH):
        with open(LOG_FILE_PATH, mode="w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            writer.writerow([
                "Timestamp", "Bin ID", "Bin Name", "Measured Distance (cm)",
                "Fill Percentage (%)", "Temperature (°C)", "Humidity (%)",
                "Organic Gases (PPM)", "Active Status", "Alert Flag"
            ])
        print(f"[DATABASE] Configured clean historical storage: {LOG_FILE_PATH}")

def calculate_sensor_telemetry(bin_item):
    \"\"\"
    Simulates real physical sensor acquisition routines.
    HC-SR04 measures distance from top, so:
    Distance = total_depth - waste_height
    \"\"\"
    total_depth = bin_item["depth_cm"]
    waste_height = bin_item["current_waste_cm"]
    
    # Calculate ultrasonic echo distance (the empty space above waste)
    distance_cm = max(2.0, total_depth - waste_height)
    # Add minimal wave bounce jitter noise (representing dust/obstructions)
    wave_noise = random.uniform(-0.15, 0.15)
    distance_cm = round(distance_cm + wave_noise, 2)
    
    # Map back to calibrated percentages
    fill_pct = ((total_depth - distance_cm) / total_depth) * 100.0
    fill_pct = round(max(0.0, min(100.0, fill_pct)), 1)
    
    # Simulate DHT11 temperature + decay heat (bacterial activity grows temp)
    decay_modifier = (fill_pct / 100.0) * 6.5
    room_variance = random.uniform(-0.5, 0.5)
    temperature = round(bin_item["temp_base"] + decay_modifier + room_variance, 1)
    
    # Simulate humidity
    humidity = round(55.0 + (fill_pct * 0.35) + random.uniform(-2.0, 2.0), 1)
    humidity = min(100.0, humidity)
    
    # Simulate MQ-135 Gas telemetry (accumulates methane when full)
    decay_gases = (fill_pct / 100.0) ** 2 * 350.0
    gas_ppm = round(bin_item["gas_base"] + decay_gases + random.uniform(-5.0, 5.0), 0)
    
    # Status levels map
    status = "Empty"
    alert = False
    if fill_pct >= 80.0:
        status = "CRITICAL FULL"
        alert = True
    elif fill_pct >= 50.0:
        status = "HALF-FULL"
    else:
        status = "HEALTHY SPACE"
        
    return {
        "bin_id": bin_item["id"],
        "bin_name": bin_item["name"],
        "distance_cm": distance_cm,
        "fill_pct": fill_pct,
        "temp": temperature,
        "humidity": humidity,
        "gas_ppm": gas_ppm,
        "status": status,
        "alert": alert
    }

def log_telemetry_to_csv(data):
    \"\"\"Appends live telemetries into localized files.\"\"\"
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    alert_status = "⚠️ RED ALERT" if data["alert"] else "✅ HEALTHY"
    
    with open(LOG_FILE_PATH, mode="a", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow([
            timestamp, data["bin_id"], data["bin_name"], data["distance_cm"],
            data["fill_pct"], data["temp"], data["humidity"],
            data["gas_ppm"], data["status"], alert_status
        ])

def execute_simulation_loop():
    \"\"\"Continuous runtime loop pushing increments to simulate reality.\"\"\"
    initialize_database()
    print(\"\\n=======================================================\")
    print(\"🚀 IoT Smart Waste Bin Telemetry Simulator Core Active\")
    print(f\"Press CTRL+C to abort. Data logs: {LOG_FILE_PATH}\")
    print(\"=======================================================\")
    
    try:
        cycle_num = 1
        while True:
            print(f\"\\n--- [SIMULATOR CYCLE ANALYSIS #{cycle_num}] ---\")
            
            for bin_model in smart_bins:
                # 1. Accumulate new waste progressively
                fill_delta = (bin_model["hourly_accum_rate"] / 3600.0) * SIMULATION_INTERVAL * 250.0 # Speeded up for classroom demonstration
                bin_model["current_waste_cm"] = min(bin_model["depth_cm"] - 1.0, bin_model["current_waste_cm"] + fill_delta)
                
                # 2. Extract calculations
                metrics = calculate_sensor_telemetry(bin_model)
                
                # 3. Save logs
                log_telemetry_to_csv(metrics)
                
                # 4. Print results
                alert_badge = \"[🚨 OVERFLOW ALERT]\" if metrics[\"alert\"] else \"[OK]\"
                print(f\"🏢 Node: {metrics['bin_id']} | {metrics['bin_name']}\")
                print(f\"   📏 Dist: {metrics['distance_cm']} cm | 🗑️ Fill: {metrics['fill_pct']}% | {alert_badge}\")
                print(f\"   🌡️ Temp: {metrics['temp']}°C | 💨 VOC Gas: {metrics['gas_ppm']} PPM | State: {metrics['status']}\")
                
                # Emulate municipal clearing immediately if full for virtual demonstration
                if metrics[\"alert\"]:
                    print(f\"   🚛 [DISPATCH LOGISTICS] Cleared {metrics['bin_id']}! Resetting waste state.\")
                    bin_model["current_waste_cm"] = random.uniform(0.5, 3.0) # Reset to nearly empty
                    
            sys_time = datetime.now().strftime(\"%H:%M:%S\")
            print(f\"🕒 Cycle finished safely at {sys_time}. Waiting {SIMULATION_INTERVAL}s...\")
            time.sleep(SIMULATION_INTERVAL)
            cycle_num += 1
            
    except KeyboardInterrupt:
        print(\"\\n[ABORTED] Simulation discontinued safely by user.\")

if __name__ == \"__main__\":
    execute_simulation_loop()
