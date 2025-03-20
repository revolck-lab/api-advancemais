const format = {
  formatText: async (text) => {
    const words = text.split(/\s+/);

    const formattedText = words.map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });

    return formattedText.join(" ");
  },
  formatEmail: async (email) => {
    if (email) {
      return email.toLowerCase();
    }
    return null;
  },
};

module.exports = format;
