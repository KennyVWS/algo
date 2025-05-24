import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoadingScreen from "./components/loading_screen";
import ChooseCharacter from "./components/choose_character";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoadingScreen />} />
        <Route path="/choose_character" element={<ChooseCharacter />} />
      </Routes>
    </Router>
  );
}

export default App;
