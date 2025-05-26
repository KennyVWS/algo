// loading_screen.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function LoadingScreen() {
  const navigate = useNavigate();

  const handleNextClick = () => {
    navigate("/choose_character");
  };

  return (
    <div className="loading-screen bg-loading-screen fixed top-0 left-0 w-screen h-screen bg-no-repeat bg-center bg-cover z-1000 flex flex-col items-center justify-center">
      <h1 className="judul_load text-white text-judul uppercase flex flex-col items-center justify-center leading-[1.5] tracking-widest2 text-center select-none animate-fadeIn">
        <div className="fade-line animate-fadeInLine delay-[500ms]">UCUP</div>
        <div className="fade-line animate-fadeInLine delay-[1000ms]">MENJELAJAHI</div>
        <div className="fade-line animate-fadeInLine delay-[1500ms]">NUSANTARA</div>
      </h1>
      <button
        onClick={handleNextClick}
        className="nextButton font-pressstart text-btn rounded-[20px] py-[15px] px-[40px] cursor-pointer border-none transition-transform transition-shadow duration-500 opacity-0 animate-fadeInButton delay-[2000ms] shadow-btn-default bg-btn-gradient hover:scale-110 hover:shadow-btn-hover"
      >
        NEXT
      </button>
    </div>
  );
}

export default LoadingScreen;
