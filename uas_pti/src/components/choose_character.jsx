import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

const characters = [
  { id: 1, name: "claire" },
  { id: 2, name: "kai" },
  { id: 3, name: "karen" },
];

function ChooseCharacter() {
  const [name, setName] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(0);
  const navigate = useNavigate();

  const handlePrevious = () => {
    setSelectedCharacter((prev) => (prev === 0 ? characters.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedCharacter((prev) => (prev === characters.length - 1 ? 0 : prev + 1));
  };

  const handleStartExploring = () => {
    if (name.trim()) {
      navigate("/map", {
        state: {
          playerName: name,
          characterName: characters[selectedCharacter].name,
        },
      });
    }
  };

  return (
    <div className="character-screen bg-loading-screen fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 py-8 z-[1000]">
      <div className="glass-card w-full max-w-[400px] sm:max-w-[450px] rounded-[30px] p-6 sm:p-8 flex flex-col items-center gap-6 shadow-2xl animate-fadeIn">
        <h1 className="judul_chara text-white text-[26px] sm:text-[32px] uppercase text-center font-bold tracking-wider select-none leading-tight">Choose Your Character</h1>

        <div className="flex items-center justify-center gap-4 sm:gap-6">
          <button onClick={handlePrevious} className="arrow_button p-2 hover:scale-110 transition-transform rounded-[10px] flex items-center justify-center">
            <img src="/assets/icons/left_arrow.svg" alt="Left" className="max-w-[20px]" />
          </button>

          <div className="flex flex-col items-center gap-3">
            <div className="w-[160px] sm:w-[180px] h-[200px] sm:h-[220px] overflow-hidden rounded-[20px] shadow-lg">
              <img src={`/assets/avatar/${characters[selectedCharacter].name}.png`} alt={characters[selectedCharacter].name} className="w-full h-full object-cover" draggable={false} />
            </div>
          </div>

          <button onClick={handleNext} className="arrow_button p-2 hover:scale-110 transition-transform rounded-[10px] flex items-center justify-center">
            <img src="/assets/icons/right_arrow.svg" alt="Right" className="max-w-[20px]" />
          </button>
        </div>

        <input type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="glass-input w-md h-[30px] text-[25px] m-[10px] text-center py-3 px-4 text-gray-800 placeholder-gray-500" />

        <button
          onClick={handleStartExploring} // Panggil fungsi ini saat button diklik
          disabled={!name.trim()}
          className={
            "button_start w-xl text-[14px] rounded-[20px] py-[14px] px-[20px] transition-all duration-300 shadow-btn-default hover:scale-105 hover:shadow-btn-hover " +
            (!name.trim() ? "opacity-50 cursor-not-allowed" : "opacity-100 bg-emerald-500 text-white")
          }
        >
          Start Exploring!
        </button>
      </div>
    </div>
  );
}

export default ChooseCharacter;
