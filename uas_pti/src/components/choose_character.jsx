import React, { useState } from "react";
import "../styles.css"; // Pastikan file CSS ini ada dan sesuai

const characters = [
  { id: 1, name: "claire" },
  { id: 2, name: "kai" },
  { id: 3, name: "karen" },
];

function ChooseCharacter() {
  const [name, setName] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState(0);

  const handlePrevious = () => {
    setSelectedCharacter((prev) => (prev === 0 ? characters.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedCharacter((prev) => (prev === characters.length - 1 ? 0 : prev + 1));
  };

  const arrowButtonBaseClass = "p-2 rounded-[20px] text-white text-[40px] leading-none transition-colors duration-300 select-none hover:text-emerald-400"; // Contoh hover:text-emerald-400

  return (
    <div className="character-screen bg-loading-screen fixed top-0 left-0 w-screen h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center pt-16 sm:pt-20 z-[1000] px-4 overflow-y-auto">
      <h1 className="judul pt-[20px] sm:pt-[45px] text-white text-[30px] sm:text-[36px] uppercase flex flex-col items-center leading-[1.5] tracking-[2px] text-center select-none animate-fadeIn">
        <span className="fade-line animate-fadeInLine delay-[500ms]">CHOOSE YOUR</span>
        <span className="fade-line animate-fadeInLine delay-[1000ms]">CHARACTER</span>
      </h1>

      <div className="flex items-center justify-center mt-10 sm:mt-16 gap-4 sm:gap-8">
        <button onClick={handlePrevious} className={arrowButtonBaseClass} aria-label="Previous Character">
          &#8592;
        </button>
        <div className="w-[240px] sm:w-[280px] h-[320px] sm:h-[360px] bg-black/70 rounded-[20px] flex flex-col items-center justify-center p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative transition-all duration-300">
          <div className="w-[160px] sm:w-[200px] h-[200px] sm:h-[250px] rounded-[15px] overflow-hidden shadow-btn-default mb-4 transition-all duration-300">
            <img src={`/assets/avatar/${characters[selectedCharacter].name}.png`} alt={characters[selectedCharacter].name} className="w-full h-full object-cover" draggable={false} />
          </div>
          <span className="text-white text-[18px] sm:text-[20px] font-pressstart uppercase tracking-widest2 select-none transition-all duration-300">{characters[selectedCharacter].name}</span>
        </div>
        <button onClick={handleNext} className={arrowButtonBaseClass} aria-label="Next Character">
          &#8594;
        </button>
      </div>

      <div className="pt-[20px] mt-10 sm:mt-12 flex flex-col items-center gap-5 w-[220px]">
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="font-pressstart text-sm py-3 px-5 bg-white/90 rounded-[20px] text-gray-800 placeholder-gray-500 text-center shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
        />
        <div className="pt-[20px]">
          <button
            disabled={!name.trim()}
            className={`leading-[1.5] nextButton font-pressstart text-[15px] rounded-[20px] py-[15px] px-[20px] sm:px-[40px] cursor-pointer border-none transition-all duration-500 shadow-btn-default hover:scale-110 hover:shadow-btn-hover animate-fadeInButton delay-[2000ms] w-full
    ${!name.trim() ? "opacity-50 cursor-not-allowed" : "opacity-100"}`}
          >
            START EXPLORING!
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChooseCharacter;
