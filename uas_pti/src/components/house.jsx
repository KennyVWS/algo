// house.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StatsPlayer from "./stats_player";
import "../house.css";

function House() {
  const location = useLocation();
  const navigate = useNavigate();

  const { characterName = "claire", playerName = "Player" } = location.state || {};
  const [showDialog, setShowDialog] = useState(false);
  const [currentLocationHouse, setCurrentLocationHouse] = useState(null);
  const [isPerformingActivity, setIsPerformingActivity] = useState(false);
  const [activityProgress, setActivityProgress] = useState(0);
  const [currentActivity, setCurrentActivity] = useState("");

  const [playerPos, setPlayerPos] = useState({ x: 2000, y: 1300 });
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(0.299);
  const [actualViewportSize, setActualViewportSize] = useState({ width: 0, height: 0 });

  const houseRef = useRef(null);
  const playerRef = useRef(null);
  const activityIntervalRef = useRef(null);

  const WORLD_WIDTH = 3825;
  const WORLD_HEIGHT = 2008;
  const PLAYER_SIZE = 190;
  const PLAYER_SCALE = 1.5;
  const MOVE_SPEED = 25;
  const ACTIVITY_DURATION = 10000;
  const ACTIVITY_UPDATE_INTERVAL = 1000;

  const [playerStats, setPlayerStats] = useState({
    meal: 50,
    sleep: 50,
    health: 80,
    energy: 80,
    happiness: 50,
    cleanliness: 50,
    money: 100,
    experience: 0,
    level: 1,
    skillPoints: 0,
    items: [],
  });

  const capitalize = (s) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const performActivity = (activityName, statChanges) => {
    if (isPerformingActivity) return;

    setIsPerformingActivity(true);
    setCurrentActivity(activityName);
    setActivityProgress(0);
    setShowDialog(false);

    const totalSteps = ACTIVITY_DURATION / ACTIVITY_UPDATE_INTERVAL;
    let currentStep = 0;

    // Calculate incremental changes per step
    const incrementalChanges = {};
    Object.keys(statChanges).forEach((stat) => {
      incrementalChanges[stat] = statChanges[stat] / totalSteps;
    });

    activityIntervalRef.current = setInterval(() => {
      currentStep++;
      const progress = (currentStep / totalSteps) * 100;
      setActivityProgress(progress);

      // Update stats gradually
      setPlayerStats((prev) => {
        const newStats = { ...prev };

        Object.keys(incrementalChanges).forEach((stat) => {
          if (stat === "cleanliness" && statChanges[stat] === 100) {
            // Special case for cleanliness - set to 100 immediately
            newStats[stat] = 100;
          } else {
            newStats[stat] = Math.min(100, Math.max(0, prev[stat] + incrementalChanges[stat]));
          }
        });

        return newStats;
      });

      if (currentStep >= totalSteps) {
        // Activity completed
        clearInterval(activityIntervalRef.current);
        setIsPerformingActivity(false);
        setActivityProgress(0);
        setCurrentActivity("");
      }
    }, ACTIVITY_UPDATE_INTERVAL);
  };

  const handleEnterLocation = () => {
    console.log(`Performing activity at ${currentLocationHouse}`);

    if (currentLocationHouse === "Bed") {
      // Tidur: +Sleep, +Energy, +Health, +Mood
      performActivity("Sleeping", {
        sleep: 30,
        energy: 25,
        health: 20,
        happiness: 15,
      });
    } else if (currentLocationHouse === "Bath") {
      // Mandi: Cleanliness = 100, +Mood
      performActivity("Taking a bath", {
        cleanliness: 100,
        happiness: 20,
      });
    } else if (currentLocationHouse === "Kitchen") {
      // Makan: +Meal, +Mood
      performActivity("Eating", {
        meal: 40,
        happiness: 15,
      });
    } else if (currentLocationHouse === "Cat") {
      // Main kucing: +Mood
      performActivity("Playing with cat", {
        happiness: 25,
      });
    } else if (currentLocationHouse === "Shelf") {
      // Naro barang ke lemari: No stat changes but still takes time
      performActivity("Organizing items", {});
    } else if (currentLocationHouse === "Music") {
      // Main musik: +Mood
      performActivity("Playing music", {
        happiness: 20,
      });
    }
  };

  // Clean up activity interval on unmount
  useEffect(() => {
    return () => {
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }
    };
  }, []);

  const handleZoom = useCallback(
    (delta) => {
      setZoomLevel((prevZoom) => {
        let minZoomCalculated = 0.1;

        if (actualViewportSize.width > 0 && WORLD_WIDTH > 0 && actualViewportSize.height > 0 && WORLD_HEIGHT > 0) {
          const minZoomX = actualViewportSize.width / WORLD_WIDTH;
          const minZoomY = actualViewportSize.height / WORLD_HEIGHT;
          minZoomCalculated = Math.max(minZoomX, minZoomY);
        }

        const minZoom = Math.max(0.1, minZoomCalculated);
        return Math.max(minZoom, Math.min(2, prevZoom + delta));
      });
    },
    [actualViewportSize.width, actualViewportSize.height, WORLD_WIDTH, WORLD_HEIGHT]
  );

  const isNearBed = (x, y) => {
    return x >= 450 && x <= 700 && y >= 142 && y <= 450;
  };
  const isNearBath = (x, y) => {
    return x >= 142 && x <= 1092 && y >= 1015 && y <= 1617;
  };
  const isNearKitchen = (x, y) => {
    return x >= 2932 && x <= 3682 && y >= 142 && y <= 1417;
  };
  const isNearCat = (x, y) => {
    return x >= 1992 && x <= 2242 && y >= 1342 && y <= 1642;
  };
  const isNearShelf = (x, y) => {
    return x >= 1157 && x <= 1382 && y >= 142 && y <= 467;
  };
  const isNearMusic = (x, y) => {
    return x >= 2632 && x <= 2782 && y >= 267 && y <= 492;
  };

  const dialogMessages = {
    Bed: "Do you want to sleep?",
    Bath: "Do you want to take a bath?",
    Kitchen: "Do you want to eat?",
    Cat: "Do you want to play with the cat?",
    Shelf: "Do you want to organize items?",
    Music: "Do you want to play music?",
  };

  const renderDialogMessage = (message) => {
    return message.split("\n").map((line, idx) => <p key={idx}>{line}</p>);
  };

  // Get actual viewport size
  useEffect(() => {
    const updateViewportSize = () => {
      if (houseRef.current) {
        setActualViewportSize({
          width: houseRef.current.clientWidth,
          height: houseRef.current.clientHeight,
        });
      }
    };

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);

  // Handle camera movement
  useEffect(() => {
    if (actualViewportSize.width === 0 || actualViewportSize.height === 0 || zoomLevel === 0) return;

    const scaledWorldWidth = WORLD_WIDTH * zoomLevel;
    const scaledWorldHeight = WORLD_HEIGHT * zoomLevel;

    const viewportWidthInWorld = actualViewportSize.width / zoomLevel;
    const viewportHeightInWorld = actualViewportSize.height / zoomLevel;

    let targetCameraX = playerPos.x - viewportWidthInWorld / 2;
    let targetCameraY = playerPos.y - viewportHeightInWorld / 2;

    if (scaledWorldWidth < actualViewportSize.width) {
      targetCameraX = (WORLD_WIDTH - viewportWidthInWorld) / 2;
    } else {
      targetCameraX = Math.max(0, Math.min(WORLD_WIDTH - viewportWidthInWorld, targetCameraX));
    }

    if (scaledWorldHeight < actualViewportSize.height) {
      targetCameraY = (WORLD_HEIGHT - viewportHeightInWorld) / 2;
    } else {
      targetCameraY = Math.max(0, Math.min(WORLD_HEIGHT - viewportHeightInWorld, targetCameraY));
    }

    setCameraPos({ x: targetCameraX, y: targetCameraY });
  }, [playerPos, zoomLevel, actualViewportSize, WORLD_WIDTH, WORLD_HEIGHT]);

  // Handle player movement
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent movement during activities
      if (isPerformingActivity) return;

      setPlayerPos((prev) => {
        let newX = prev.x;
        let newY = prev.y;
        const playerHalfSize = (PLAYER_SIZE * PLAYER_SCALE) / 2;

        switch (e.key.toLowerCase()) {
          case "arrowup":
          case "w":
            newY = Math.max(playerHalfSize, prev.y - MOVE_SPEED);
            break;
          case "arrowdown":
          case "s":
            newY = Math.min(WORLD_HEIGHT - playerHalfSize, prev.y + MOVE_SPEED);
            break;
          case "arrowleft":
          case "a":
            newX = Math.max(playerHalfSize, prev.x - MOVE_SPEED);
            break;
          case "arrowright":
          case "d":
            newX = Math.min(WORLD_WIDTH - playerHalfSize, prev.x + MOVE_SPEED);
            break;
          default:
            return prev;
        }
        return { x: newX, y: newY };
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [MOVE_SPEED, PLAYER_SCALE, PLAYER_SIZE, WORLD_HEIGHT, WORLD_WIDTH, isPerformingActivity]);

  // Effect to show dialog when player is near a specific location
  useEffect(() => {
    if (isPerformingActivity) return; // Don't show dialogs during activities

    if (isNearBed(playerPos.x, playerPos.y)) {
      setCurrentLocationHouse("Bed");
      setShowDialog(true);
    } else if (isNearBath(playerPos.x, playerPos.y)) {
      setCurrentLocationHouse("Bath");
      setShowDialog(true);
    } else if (isNearKitchen(playerPos.x, playerPos.y)) {
      setCurrentLocationHouse("Kitchen");
      setShowDialog(true);
    } else if (isNearCat(playerPos.x, playerPos.y)) {
      setCurrentLocationHouse("Cat");
      setShowDialog(true);
    } else if (isNearShelf(playerPos.x, playerPos.y)) {
      setCurrentLocationHouse("Shelf");
      setShowDialog(true);
    } else if (isNearMusic(playerPos.x, playerPos.y)) {
      setCurrentLocationHouse("Music");
      setShowDialog(true);
    } else {
      setCurrentLocationHouse(null);
      setShowDialog(false);
    }
  }, [playerPos, isPerformingActivity]);

  return (
    <div className="house-game-container">
      <div className="house-game-viewport" ref={houseRef}>
        {showDialog && currentLocationHouse && !isPerformingActivity && (
          <div className="dialog fade-in-center">
            {renderDialogMessage(dialogMessages[currentLocationHouse] || `Do you want to enter the ${currentLocationHouse}?`)}
            <button className="yes-btn" onClick={handleEnterLocation}>
              Yes
            </button>
            <button className="no-btn" onClick={() => setShowDialog(false)}>
              No
            </button>
          </div>
        )}

        {isPerformingActivity && (
          <div className="activity-overlay">
            <div className="activity-info">
              <h3>{currentActivity}...</h3>
              <div className="activity-progress-bar">
                <div className="activity-progress-fill" style={{ width: `${activityProgress}%` }} />
              </div>
              <p>{Math.round(activityProgress)}%</p>
            </div>
          </div>
        )}

        <div
          className="house-game-world house-background"
          style={{
            width: `${WORLD_WIDTH}px`,
            height: `${WORLD_HEIGHT}px`,
            transform: `translate(-${cameraPos.x * zoomLevel}px, -${cameraPos.y * zoomLevel}px) scale(${zoomLevel})`,
            transformOrigin: "0 0",
          }}
        >
          <div
            className="house-player"
            ref={playerRef}
            style={{
              left: `${playerPos.x}px`,
              top: `${playerPos.y}px`,
              width: `${PLAYER_SIZE}px`,
              height: `${PLAYER_SIZE}px`,
              transform: `translate(-50%, -50%) scale(${PLAYER_SCALE})`,
              position: "absolute",
            }}
          >
            <img src={`/assets/avatar/${characterName}.png`} alt={characterName} className="house-player-sprite" draggable={false} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      </div>

      <div className="house-game-hud">
        <div className="house-player-info">
          <img src={`/assets/avatar/${characterName}.png`} alt={characterName} className="house-hud-avatar" />
          <div className="house-player-coords">
            {playerName.toUpperCase()} • X: {Math.floor(playerPos.x)} Y: {Math.floor(playerPos.y)}
          </div>
        </div>
        <div className="house-stats-container">
          <StatsPlayer stats={playerStats} onStatsUpdate={setPlayerStats} />
        </div>
        <div className="house-controls-hint">
          <div>🎮 Arrow Keys / WASD to move</div>
          <div>🗺️ Explore the house!</div>
        </div>
      </div>
    </div>
  );
}

export default House;
