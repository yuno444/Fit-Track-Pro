# Fit-Track-Pro
CSE 4550: Software Engineering

## React Native prototype (Expo)

A cross-platform prototype now lives in `mobile/` with:

- Login screen (email + password)
- Local session persistence with AsyncStorage
- Bottom tab navigation (Dashboard, Workouts placeholder, Recipes placeholder, Profile)
- Dashboard summary cards and action button
- Profile form with local save + logout

### Run steps

1. Install Node.js LTS (if not already installed): [https://nodejs.org/](https://nodejs.org/)
2. Open a terminal in this folder:
   - `cd "c:\Users\Owner\OneDrive\Documents\Cursor Projects\Fit-Track-Pro\mobile"`
3. Install dependencies:
   - `npm install`
   - `npx expo install --fix`
4. Start Expo:
   - `npx expo start --clear`
5. Preview on phone:
   - Install **Expo Go** on iPhone/Android
   - Scan the QR code shown in the terminal

### Notes

- This is a prototype only (no backend auth, no cloud sync, no HealthKit).
- Existing Swift package files were kept as-is in the repository root.
