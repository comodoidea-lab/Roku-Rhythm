const USER_DATA_KEY = "fortune-user-data";
const SETTINGS_KEY = "fortune-settings";

export function saveUserData(userData) {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

export function loadUserData() {
  const value = localStorage.getItem(USER_DATA_KEY);
  return value ? JSON.parse(value) : null;
}

export function clearUserData() {
  localStorage.removeItem(USER_DATA_KEY);
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettings() {
  const value = localStorage.getItem(SETTINGS_KEY);
  return value ? JSON.parse(value) : null;
}
