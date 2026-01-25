# Taste of Zimbabwe (Traditional Recipes)

![Project Banner](https://via.placeholder.com/1200x300?text=Taste+of+Zimbabwe)

Welcome to **Taste of Zimbabwe**, a premium culinary application dedicated to preserving and sharing the rich heritage of Zimbabwean cuisine. This app connects users with authentic traditional recipes, powered by modern technology including AI ingredient scanning, real-time community sharing, and multi-language support.

**Created by:** Praise Masunga (PraiseTechzw)

---

## 🚀 Features

### 🌟 Core Functionality
-   **Explore Traditional Recipes**: Browse a curated collection of authentic Zimbabwean dishes (Sadza, Dovi, Muriwo, etc.).
-   **Smart Search & Filters**: Filter recipes by category (Grains, Relishes, Meats, Drinks) or search by ingredients.
-   **Multi-Language Support**: Fully localized in **English**, **Shona**, and **Ndebele** to serve the local community.
-   **Fixed Header Navigation**: Smooth UI with a sticky header ensuring navigation is always accessible.

### 🤖 AI-Powered Chef
-   **Ingredient Scanning**: Snap a photo of ingredients using the camera.
-   **Gemini AI Integration**: Our advanced AI analyzes the image to identify ingredients and generates a complete, authentic recipe (Ingredients, Steps, Nutrition) on the fly.
-   **Save AI Recipes**: Generated recipes can be saved directly to your personal collection.

### ☁️ Real-Time & Backend
-   **Supabase Integration**: Robust backend for real-time data synchronization.
-   **Community Sharing**: Users can create and upload their own recipes to the cloud.
-   **Live Updates**: Instant updates across devices.

### 💰 Monetization
-   **AdMob Integration**: Seamlessly integrated banner ads for sustainable monetization.
-   **Safety First**: Crash-proof implementation for Expo Go (development) with full native ad support in production builds.

---

## 📱 User Interface (UI/UX)

The application boasts a modern, clean, and culturally inspired interface:

-   **Explore Screen**: Features a fixed header with language toggle, trending recipes carousel, and category filters.
-   **Create Screen**: A user-friendly form for submitting recipes with image upload placeholders.
-   **AI Modal**: An elegant overlay that handles the AI generation process with loading states and structured result presentation.
-   **Native Feel**: Built with React Native and Expo for a buttery smooth experience on both Android and iOS.

---

## 🛠 Tech Stack

-   **Framework**: [React Native](https://reactnative.dev/) (via [Expo](https://expo.dev/))
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/)
-   **Backend**: [Supabase](https://supabase.com/)
-   **AI**: [Google Gemini API](https://ai.google.dev/)
-   **Ads**: [React Native Google Mobile Ads](https://github.com/invertase/react-native-google-mobile-ads)
-   **Localization**: `i18n-js` & `expo-localization`
-   **UI Components**: `react-native-reanimated`, `@expo/vector-icons`

---

## ⚙️ Installation & Setup

Follow these steps to get the project running on your local machine.

### Prerequisites
-   Node.js (v18 or higher)
-   npm or yarn
-   Expo Go app on your mobile device (or Android Studio/Xcode for simulators)

### Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/PraiseTechzw/taste-of-zimbabwe.git
    cd taste-of-zimbabwe
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory and add your API keys:
    ```bash
    EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
    EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
    EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the App**
    ```bash
    npx expo start
    ```
    Scan the QR code with your Expo Go app.

---

## 📄 AdMob Verification

For production, ensure your `app-ads.txt` is properly hosted:
1.  Navigate to the `public/app-ads.txt` file.
2.  Upload this file to the root of your developer website (e.g., `https://yourwebsite.com/app-ads.txt`).

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started.

Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) in all interactions.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Praise Masunga (PraiseTechzw)**

*   **GitHub**: [@PraiseTechzw](https://github.com/PraiseTechzw)
*   **Role**: Lead Developer & Creator

---

*Built with ❤️ for Zimbabwe*
