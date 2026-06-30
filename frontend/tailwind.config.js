/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        mitti: "#64748B",
        saffron: "#2563EB",
        marigold: "#0EA5E9",
        neem: "#16A34A",
        ink: "#0F172A",
        paper: "#F8FAFC",
        line: "#E2E8F0"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.10)",
        lift: "0 22px 60px rgba(37, 99, 235, 0.14)"
      }
    }
  },
  plugins: []
};
