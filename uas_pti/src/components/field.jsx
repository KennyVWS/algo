import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import StatsPlayer from "./stats_player";
import { useSpeedMode, SpeedToggleButton } from "./speed";
import "../field.css";
import ArrowKey from "./wasd_key";
import Task from "./task";

function Field() {
  const { isFastForward } = useSpeedMode();
  const location = useLocation();
  const navigate = useNavigate();

  const { characterName = "claire", playerName = "Player", stats: initialStats = {} } = location.state || {};
  const [showDialog, setShowDialog] = useState(false);
  const [currentLocationfield, setCurrentLocationfield] = useState(null);
  const [isPerformingActivity, setIsPerformingActivity] = useState(false);
  const [activityProgress, setActivityProgress] = useState(0);
  const [currentActivity, setCurrentActivity] = useState("");
  const [showTasks, setShowTasks] = useState(true);
  const [tasks, setTasks] = useState({});

  const [playerPos, setPlayerPos] = useState({ x: 2000, y: 1300 });
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(0.299);
  const [actualViewportSize, setActualViewportSize] = useState({ width: 0, height: 0 });

  const fieldRef = useRef(null);
  const playerRef = useRef(null);
  const activityIntervalRef = useRef(null);

  const WORLD_WIDTH = 3825;
  const WORLD_HEIGHT = 2008;
  const PLAYER_SIZE = 190;
  const PLAYER_SCALE = 1.5;
  const MOVE_SPEED = 25;
  const ACTIVITY_DURATION = 10000;
  const ACTIVITY_UPDATE_INTERVAL = 1000;

  const defaultStats = {
    meal: 50,
    sleep: 50,
    energy: 80,
    happiness: 50,
    cleanliness: 50,
    health: 80,
    money: 100,
    experience: 0,
    level: 1,
    skillPoints: 0,
    items: [],
  };

  const [playerStats, setPlayerStats] = useState(() => {
    const stats = { ...defaultStats };

    if (initialStats) {
      Object.keys(stats).forEach((key) => {
        if (key !== "items") {
          if (initialStats[key] !== undefined && !isNaN(Number(initialStats[key]))) {
            stats[key] = Number(initialStats[key]);
          }
        }
      });

      if (Array.isArray(initialStats.items)) {
        stats.items = [...initialStats.items];
      }
    }

    return stats;
  });

  // Initialize tasks
  useEffect(() => {
    const initialTaskState = {};
    const taskLocations = {
      field: [
        { id: "swing", name: "Sit on the Swing", priority: "daily" },
        { id: "picnic", name: "Have a Picnic", priority: "daily" },
        { id: "chair", name: "Rest on Chair", priority: "bonus" },
        { id: "fountain", name: "Near Fountain", priority: "bonus" },
      ],
    };

    const existingTasks = initialStats.tasks || {};

    Object.keys(taskLocations).forEach((location) => {
      taskLocations[location].forEach((task) => {
        const taskKey = `${location}-${task.id}`;
        initialTaskState[taskKey] = existingTasks[taskKey] || { ...task, completed: false };
      });
    });

    setTasks(initialTaskState);
  }, [initialStats.tasks]);

  const handleBackToMap = () => {
    navigate("/map", {
      state: {
        characterName,
        playerName,
        stats: {
          ...playerStats,
          tasks: tasks,
          lastVisitedLocation: "field", // Set this location as the last visited
        },
      },
    });
  };

  // Function to mark a task as completed
  const completeTask = (taskId) => {
    const taskKey = `field-${taskId}`;
    setTasks((prev) => ({
      ...prev,
      [taskKey]: {
        ...prev[taskKey],
        completed: true,
      },
    }));
  };

  // Function to toggle task completion (for manual toggling via UI)
  const toggleTaskCompletion = (taskId) => {
    const taskKey = `field-${taskId}`;
    setTasks((prev) => ({
      ...prev,
      [taskKey]: {
        ...prev[taskKey],
        completed: !prev[taskKey]?.completed,
      },
    }));
  };

  const performActivity = (activityName, statChanges) => {
    if (isPerformingActivity) return;

    setIsPerformingActivity(true);
    setCurrentActivity(activityName);
    setActivityProgress(0);
    setShowDialog(false);

    // Mark corresponding task as completed
    if (currentLocationfield === "Swing") {
      completeTask("swing");
    } else if (currentLocationfield === "Picnic") {
      completeTask("picnic");
    } else if (currentLocationfield === "Chair") {
      completeTask("chair");
    } else if (currentLocationfield === "Fountain") {
      completeTask("fountain");
    }

    if (isFastForward) {
      setPlayerStats((prev) => {
        const newStats = { ...prev };
        Object.keys(statChanges).forEach((stat) => {
          const change = Number(statChanges[stat]);
          if (isNaN(change)) return;

          if (stat === "money" || stat === "experience" || stat === "skillPoints") {
            const prevValue = Number(prev[stat]) || 0;
            newStats[stat] = Math.max(0, prevValue + change);
          } else {
            const prevValue = Number(prev[stat]) || 0;
            newStats[stat] = Math.min(100, Math.max(0, prevValue + change));
          }
        });
        return newStats;
      });

      setTimeout(() => {
        setActivityProgress(100);
        setTimeout(() => {
          setIsPerformingActivity(false);
          setCurrentActivity("");
          setActivityProgress(0);
        }, 500);
      }, 300);
    } else {
      const totalSteps = ACTIVITY_DURATION / ACTIVITY_UPDATE_INTERVAL;
      let currentStep = 0;

      const incrementalChanges = {};
      Object.keys(statChanges).forEach((stat) => {
        const change = Number(statChanges[stat]);
        if (isNaN(change)) return;
        incrementalChanges[stat] = change / totalSteps;
      });

      activityIntervalRef.current = setInterval(() => {
        currentStep++;
        const progress = (currentStep / totalSteps) * 100;
        setActivityProgress(progress);

        setPlayerStats((prev) => {
          const newStats = { ...prev };

          Object.keys(incrementalChanges).forEach((stat) => {
            const increment = Number(incrementalChanges[stat]);
            if (isNaN(increment)) return;

            if (stat === "money" || stat === "experience" || stat === "skillPoints") {
              const prevValue = Number(prev[stat]) || 0;
              newStats[stat] = Math.max(0, prevValue + increment);
            } else {
              const prevValue = Number(prev[stat]) || 0;
              newStats[stat] = Math.min(100, Math.max(0, prevValue + increment));
            }
          });

          return newStats;
        });

        if (currentStep >= totalSteps) {
          clearInterval(activityIntervalRef.current);
          setIsPerformingActivity(false);
          setActivityProgress(0);
          setCurrentActivity("");
        }
      }, ACTIVITY_UPDATE_INTERVAL);
    }
  };

  const handleEnterLocation = () => {
    console.log(`Performing activity at ${currentLocationfield}`);

    if (currentLocationfield === "Swing") {
      performActivity("Swinging", {
        sleep: -30,
        energy: -25,
        health: 20,
        happiness: 40,
        experience: 1,
      });
    } else if (currentLocationfield === "Picnic") {
      performActivity("Taking a Picnic", {
        happiness: 30,
        meal: 50,
        experience: 1,
      });
    } else if (currentLocationfield === "Chair") {
      performActivity("Sit", {
        happiness: 20,
        energy: 20,
        experience: 1,
      });
    } else if (currentLocationfield === "Fountain") {
      performActivity("Making a wish", {
        happiness: 40,
        money: -5,
        experience: 1,
      });
    }
  };

  useEffect(() => {
    return () => {
      if (activityIntervalRef.current) {
        clearInterval(activityIntervalRef.current);
      }
    };
  }, []);

  const isNearSwing = (x, y) => {
    return x >= 2450 && x <= 2825 && y >= 142 && y <= 475;
  };

  const isNearPicnic = (x, y) => {
    return x >= 750 && x <= 1150 && y >= 975 && y <= 1575;
  };

  const isNearChair = (x, y) => {
    return x >= 725 && x <= 1075 && y >= 200 && y <= 450;
  };

  const isNearFountain = (x, y) => {
    return x >= 1750 && x <= 2175 && y >= 700 && y <= 1175;
  };

  const dialogMessages = {
    Swing: "Do you want to use the swing?",
    Picnic: "Do you want to have a picnic?",
    Chair: "Do you want to sit on the chair?",
    Fountain: "Do you want to throw a coin and make a wish?",
  };

  const renderDialogMessage = (message) => {
    return message.split("\n").map((line, idx) => <p key={idx}>{line}</p>);
  };

  useEffect(() => {
    const updateViewportSize = () => {
      if (fieldRef.current) {
        setActualViewportSize({
          width: fieldRef.current.clientWidth,
          height: fieldRef.current.clientHeight,
        });
      }
    };

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);

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

  const handleArrowPress = (direction) => {
    setPlayerPos((prev) => {
      let newX = prev.x;
      let newY = prev.y;

      switch (direction) {
        case "up":
          newY = Math.max(0, prev.y - MOVE_SPEED);
          break;
        case "down":
          newY = Math.min(WORLD_HEIGHT - PLAYER_SIZE, prev.y + MOVE_SPEED);
          break;
        case "left":
          newX = Math.max(0, prev.x - MOVE_SPEED);
          break;
        case "right":
          newX = Math.min(WORLD_WIDTH - PLAYER_SIZE, prev.x + MOVE_SPEED);
          break;
        default:
          break;
      }

      return { x: newX, y: newY };
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isPerformingActivity) return;

      let direction = null;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          direction = "up";
          break;
        case "ArrowDown":
        case "s":
        case "S":
          direction = "down";
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          direction = "left";
          break;
        case "ArrowRight":
        case "d":
        case "D":
          direction = "right";
          break;
        default:
          break;
      }

      if (direction) {
        e.preventDefault();
        handleArrowPress(direction);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPerformingActivity, handleArrowPress]);

  useEffect(() => {
    if (isPerformingActivity) return;

    if (isNearSwing(playerPos.x, playerPos.y)) {
      setCurrentLocationfield("Swing");
      setShowDialog(true);
    } else if (isNearPicnic(playerPos.x, playerPos.y)) {
      setCurrentLocationfield("Picnic");
      setShowDialog(true);
    } else if (isNearChair(playerPos.x, playerPos.y)) {
      setCurrentLocationfield("Chair");
      setShowDialog(true);
    } else if (isNearFountain(playerPos.x, playerPos.y)) {
      setCurrentLocationfield("Fountain");
      setShowDialog(true);
    } else {
      setCurrentLocationfield(null);
      setShowDialog(false);
    }
  }, [playerPos, isPerformingActivity]);

  return (
    <div className="field-game-container">
      <div>
        <StatsPlayer stats={playerStats} onStatsUpdate={setPlayerStats} />
        <SpeedToggleButton />
      </div>

      <div className="field-game-viewport" ref={fieldRef}>
        {showDialog && currentLocationfield && !isPerformingActivity && (
          <div className="dialog fade-in-center">
            {renderDialogMessage(dialogMessages[currentLocationfield] || `Do you want to enter the ${currentLocationfield}?`)}
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
          className="field-game-world field-background"
          style={{
            width: `${WORLD_WIDTH}px`,
            height: `${WORLD_HEIGHT}px`,
            transform: `translate(-${cameraPos.x * zoomLevel}px, -${cameraPos.y * zoomLevel}px) scale(${zoomLevel})`,
            transformOrigin: "0 0",
          }}
        >
          <div
            className="field-player"
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
            <img src={`/assets/avatar/${characterName}.png`} alt={characterName} className="field-player-sprite" draggable={false} style={{ width: "100%", height: "100%" }} />
          </div>
        </div>
      </div>

      <div className="game-hud">
        <div className="player-info">
          <img src={`/assets/avatar/${characterName}.png`} alt={characterName} className="hud-avatar" />
          <div className="player-coords">
            {playerName.toUpperCase()} • X: {Math.floor(playerPos.x)} Y: {Math.floor(playerPos.y)}
            <button className="back-to-map-button-inline" onClick={handleBackToMap}>
              Back to Map
            </button>
          </div>
        </div>
        <div className="controls-hint">
          <div>🎮 Arrow Keys / WASD to move</div>
          <div>🗺️ Explore the field!</div>
        </div>
      </div>
      <ArrowKey onKeyPress={handleArrowPress} />

      <Task currentLocation="field" isInsideLocation={true} customPosition={{ top: "65px" }} externalTasks={tasks} onTaskComplete={toggleTaskCompletion} />
    </div>
  );
}

export default Field;
