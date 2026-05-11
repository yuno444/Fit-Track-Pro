# Fit-Track-Pro
CSE 4550: Software Engineering

## React Native prototype (Expo). V2 Protoype Contains:

- Login screen (email + password)
- Local session persistence with AsyncStorage
- Bottom tab navigation (Dashboard, Workouts with plans + logged sessions, Recipes, Profile)
- Create workout plan (saved locally)
- Discover recipes through saved ingredients
- Dashboard summary cards, and graphed metrics (weight change, weekly nutrition, weekly training volume)
- Profile form with local save + logout

### Run steps

1. Install Node.js LTS (if not already installed): [https://nodejs.org/](https://nodejs.org/)
2. Open a terminal in the folder that contains Fit-Track-Pro\mobile, e.g.:
   - `cd "c:\Users\Owner\Documents\Projects\Fit-Track-Pro\mobile"`
3. Install dependencies in terminal:
   - `npm install`
   - Optional: `npx expo-doctor` (should report no issues on a fresh install)
4. Start Expo to view the app:
   - `npx expo start --clear`
5. Preview on phone:
   - Install **Expo Go** on iPhone/Android
   - Scan the QR code shown in the terminal

### Notes

- This app targets Expo SDK 54 to match current Expo Go. Avoid running the command `npx expo install --fix`, otherwise the tool may downgrade the project and break Expo Go.
- If `npm audit` gives issues in the terminal, do not run `npm audit fix --force` (it can pin an older Expo and break the app). Use `npm audit fix` only without `--force`.
