module.exports = {
  // ... autres configurations ...
  overrides: [
    {
      files: ["./app/pages/films/page.tsx"],
      rules: {
        "@typescript-eslint/no-unused-vars": "off", // Désactiver no-unused-vars pour ce fichier
        "react-hooks/exhaustive-deps": "off", // Désactiver exhaustive-deps pour ce fichier
      },
    },
    {
      files: ["./components/getMovie.tsx"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off", // Désactiver no-explicit-any pour ce fichier
      },
    },
    {
      files: ["./components/player/VideoPlayer.tsx"],
      rules: {
        "@typescript-eslint/no-unused-vars": "off", // Désactiver no-unused-vars pour ce fichier
        "react-hooks/exhaustive-deps": "off", // Désactiver exhaustive-deps pour ce fichier
      },
    },
    {
      files: ["./components/ui/hover-border-gradient.tsx"],
      rules: {
        "react-hooks/exhaustive-deps": "off", // Désactiver exhaustive-deps pour ce fichier
      },
    },
  ],
}; 