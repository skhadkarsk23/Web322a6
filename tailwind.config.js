/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs"], // Updated to include all .ejs files in the views folder
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [
      {
        blueLightBlue: {
          // Custom theme name
          primary: "#3B82F6", // Light blue for buttons and highlights
          secondary: "#1E40AF", // Dark blue for backgrounds
          accent: "#93C5FD", // Lighter blue accent for UI elements
          neutral: "#1F2937", // Dark gray for neutral elements
          "base-100": "#1E40AF", // Dark blue as the base background color
          "base-200": "#1D2A4D", // Slightly darker blue for card backgrounds
          "base-content": "#ffffff", // White text color for readability
          info: "#3B82F6", // Light blue for info
          success: "#10B981", // Green for success
          warning: "#F59E0B", // Yellow for warnings
          error: "#EF4444", // Red for errors
        },
      },
    ],
  },
};