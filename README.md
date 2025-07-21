# 🔮 Numerology Lifepath Calculator

A comprehensive numerology web application with Chinese zodiac compatibility analysis, built with modular JavaScript architecture and extensive historical data.

## ✨ Features

- **Advanced Numerology Calculations**
  - Lifepath numbers with master number rules (11, 22, 33, 28)
  - Personal year number calculations
  - Multi-family member support (up to 5 members)

- **Chinese Zodiac Integration**
  - Accurate zodiac calculations using verified lunar calendar dates
  - 130+ years of historical Chinese New Year data (1920-2050)
  - 20-year compatibility timeline display

- **Compatibility Analysis**
  - Enemy years highlighting (opposing zodiac pairs)
  - Friendly years highlighting (compatible zodiac groups)
  - Current year compatibility status for each family member

- **Interesting Dates Discovery**
  - Find numerologically significant dates in any year
  - Advanced filtering by day number or lifepath value
  - Master numbers and special number detection

- **Modern Architecture**
  - Modular JavaScript design for scalability
  - JSON data files for easy expansion
  - Responsive CSS Grid/Flexbox layout
  - Progressive enhancement and fallback support

## 📁 Project Structure

```
numerology-calculator/
├── index.html                 # Main HTML structure
├── css/
│   ├── main.css              # Core application styles
│   ├── components.css        # Component-specific styles
│   └── responsive.css        # Mobile/responsive styles
├── js/
│   ├── app.js                # Main application controller
│   ├── numerology.js         # Numerology calculation engine
│   ├── zodiac.js             # Chinese zodiac system
│   ├── ui.js                 # DOM manipulation and UI updates
│   └── filters.js            # Date filtering functionality
├── data/
│   ├── chinese-new-year.json # Chinese New Year dates (1920-2050)
│   ├── zodiac-animals.json   # Zodiac animal data with emojis
│   └── compatibility.json    # Enemy/friendly relationships
├── config/
│   └── app-config.js         # Application configuration
└── README.md                 # This documentation
```

## 🚀 Getting Started

### Quick Start
1. Open `index.html` in a web browser
2. Enter birth dates for family members
3. Click "Calculate Family Numerology"
4. Explore the results and interesting dates

### Local Development
```bash
# For local development with a web server:
python -m http.server 8000
# or
npx serve .
# Then open http://localhost:8000
```

## 🎯 Core Calculations

### Lifepath Number Rules
- Split date components preserving master numbers (11, 22, 33)
- Special handling for number 28 (non-reducing)
- Year processing in two-digit pairs
- Reduction continues until single digit or special number

### Chinese Zodiac Accuracy
- Uses verified Chinese New Year dates from authoritative sources
- Handles lunar calendar boundaries correctly
- Fallback estimation for dates outside lookup table
- Precise start/end dates for each zodiac period

### Compatibility System
- **Enemy Pairs**: Rat↔Horse, Ox↔Goat, Tiger↔Monkey, Rabbit↔Rooster, Dragon↔Dog, Snake↔Pig
- **Friend Groups**: 
  - Water/Earth: Rat, Ox, Dragon, Monkey
  - Earth/Metal: Ox, Snake, Rooster  
  - Wood/Fire: Tiger, Horse, Dog
  - Wood/Water: Rabbit, Goat, Pig
- **Self-Compatibility**: Each sign is friendly with itself

## 📊 Data Files

### chinese-new-year.json
Contains 130+ years of verified Chinese New Year dates with metadata:
```json
{
  "metadata": {
    "source": "Chinese Astrology Authority",
    "dateRange": "1920-2050"
  },
  "dates": {
    "2025": {"date": "2025-01-29", "zodiac": "snake"}
  }
}
```

### zodiac-animals.json
Complete zodiac animal data with emojis, elements, and traits:
```json
{
  "animals": {
    "snake": {
      "name": "Snake",
      "emoji": "🐍",
      "element": "Fire",
      "traits": ["Wise", "Intuitive", "Graceful"]
    }
  }
}
```

### compatibility.json
Comprehensive compatibility relationships:
```json
{
  "enemies": {"rat": "horse"},
  "friendGroups": [
    ["rat", "ox", "dragon", "monkey"]
  ]
}
```

## 🔧 Configuration

All settings centralized in `config/app-config.js`:
```javascript
const APP_CONFIG = {
  app: {
    maxFamilyMembers: 5
  },
  numerology: {
    masterNumbers: [11, 22, 33],
    specialNumbers: [28]
  },
  zodiac: {
    timelineYears: 10
  }
}
```

## 🎨 Styling System

### Component-Based CSS
- **main.css**: Core typography, layout, colors
- **components.css**: Specific component styling
- **responsive.css**: Mobile breakpoints, print styles, accessibility

### Design Features
- Gradient backgrounds and shadows
- Color-coded compatibility indicators
- Smooth animations and transitions
- Print-friendly layouts
- High contrast mode support

## 📱 Browser Support

- **Modern Browsers**: Full functionality
- **Older Browsers**: Graceful degradation with fallbacks
- **Mobile**: Responsive design with touch-friendly controls
- **Print**: Optimized print layouts

## 🔍 Development Tools

### Console Commands
```javascript
debugNumerology()    // Show debug information
exportNumerology()   // Download results as JSON
resetNumerology()    // Reset to initial state
```

### Performance Monitoring
- Page load time tracking
- Calculation performance metrics
- Error logging and reporting
- Memory usage optimization

## 📈 Future Expansion

The modular architecture supports easy addition of:
- Additional numerology systems (Pythagorean, Chaldean)
- More calendar systems (Hebrew, Islamic, Hindu)
- Extended historical datasets (centuries of data)
- Advanced compatibility algorithms
- Multiple language support
- Cloud data synchronization

## 🤝 Contributing

To add new features or data:
1. Add data files to `/data/` directory
2. Create new modules in `/js/` directory
3. Update configuration in `/config/app-config.js`
4. Add corresponding CSS to appropriate files
5. Update this README with new features

## 📄 License

This project is open source and available under the MIT License.

---

**Version 2.0.0** - Modular Architecture Release  
Built with ❤️ for numerology enthusiasts and astrology lovers