module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        pressstart: ['"Press Start 2P"', "system-ui"],
      },
      backgroundImage: {
        "loading-screen": "url('/assets/locations/loading_screen.jpg')",
        "choose-character": "url('/assets/locations/choose_screen.jpg')",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInLine: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInButton: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 2s ease-in-out forwards",
        fadeInLine: "fadeInLine 0.5s ease-in-out forwards",
        fadeInButton: "fadeInButton 0.8s ease-in-out forwards",
      },
      colors: {
        "green-light": "#8cb369",
        "green-dark": "#5a8c3b",
        "shadow-green": "#3b5a30",
        "text-gray": "#4d4d4d",
      },
      boxShadow: {
        "btn-default": "2px 2px 10px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(255,255,255,0.1)",
        "btn-hover": "6px 6px 15px rgba(90,140,59,0.6), inset -2px -2px 7px rgba(255,255,255,0.3)",
      },
      letterSpacing: {
        widest2: "2px",
      },
      borderRadius: {
        btn: "20px",
      },
      fontSize: {
        judul: "36px",
        btn: "15px",
      },
      zIndex: {
        1000: "1000",
      },
    },
  },
  plugins: [],
};
