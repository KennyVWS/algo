import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import "../styles.css";

function Map() {
  const location = useLocation();
  const { characterName = "claire", playerName = "Player" } = location.state || {};

  const [playerPos, setPlayerPos] = useState({ x: 400, y: 300 });
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const mapRef = useRef(null);
  const playerRef = useRef(null);

  const WORLD_WIDTH = 3700;
  const WORLD_HEIGHT = 1954;
  const PLAYER_SIZE = 40;
  const MOVE_SPEED = 8;

  // Update viewport size saat window resize
  useEffect(() => {
    const handleResize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const cameraCenterX = playerPos.x - viewportSize.width / 2;
    const cameraCenterY = playerPos.y - viewportSize.height / 2;

    const clampedX = Math.max(0, Math.min(WORLD_WIDTH - viewportSize.width, cameraCenterX));
    const clampedY = Math.max(0, Math.min(WORLD_HEIGHT - viewportSize.height, cameraCenterY));

    setCameraPos({ x: clampedX, y: clampedY });
  }, [playerPos, viewportSize]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      setPlayerPos((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        switch (e.key) {
          case "ArrowUp":
          case "w":
          case "W":
            newY = Math.max(0, prev.y - MOVE_SPEED);
            break;
          case "ArrowDown":
          case "s":
          case "S":
            newY = Math.min(WORLD_HEIGHT - PLAYER_SIZE, prev.y + MOVE_SPEED);
            break;
          case "ArrowLeft":
          case "a":
          case "A":
            newX = Math.max(0, prev.x - MOVE_SPEED);
            break;
          case "ArrowRight":
          case "d":
          case "D":
            newX = Math.min(WORLD_WIDTH - PLAYER_SIZE, prev.x + MOVE_SPEED);
            break;
          default:
            return prev;
        }

        return { x: newX, y: newY };
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="game-container">
      <div className="game-viewport" ref={mapRef}>
        <div 
          className="game-world map-background" 
          style={{ 
            transform: `translate(-${cameraPos.x}px, -${cameraPos.y}px)`,
            width: `${WORLD_WIDTH}px`,
            height: `${WORLD_HEIGHT}px`
          }}
        >
          <div className="player" ref={playerRef} style={{ left: playerPos.x, top: playerPos.y }}>
            <img src={`/assets/avatar/${characterName}.png`} alt={characterName} className="player-sprite" draggable={false} />
            <div className="player-shadow" />
          </div>
        </div>
      </div>

      <div className="game-hud">
        <div className="mini-map">
          <div className="mini-map-world">
            <div
              className="mini-map-player"
              style={{
                left: (playerPos.x / WORLD_WIDTH) * 100 + "%",
                top: (playerPos.y / WORLD_HEIGHT) * 100 + "%",
              }}
            />
            <div
              className="mini-map-viewport"
              style={{
                left: (cameraPos.x / WORLD_WIDTH) * 100 + "%",
                top: (cameraPos.y / WORLD_HEIGHT) * 100 + "%",
                width: (viewportSize.width / WORLD_WIDTH) * 100 + "%",
                height: (viewportSize.height / WORLD_HEIGHT) * 100 + "%",
              }}
            />
          </div>
        </div>

        <div className="player-info">
          <img src={`/assets/avatar/${characterName}.png`} alt={characterName} className="hud-avatar" />
          <div className="player-coords">
            {playerName.toUpperCase()} • X: {Math.floor(playerPos.x)} Y: {Math.floor(playerPos.y)}
          </div>
        </div>

        <div className="controls-hint">
          <div>🎮 Arrow Keys / WASD to move</div>
          <div>🗺️ Explore the village!</div>
        </div>
      </div>
    </div>
  );
}

export default Map;