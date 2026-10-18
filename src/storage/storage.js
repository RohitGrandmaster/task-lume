import AsyncStorage from '@react-native-async-storage/async-storage';

async function setItem(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn('[storage] setItem error for key ' + key, err);
    return false;
  }
}

async function getItem(key, fallback = null) {
  try {
    const value = await AsyncStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    return JSON.parse(value);
  } catch (err) {
    console.warn('[storage] getItem error for key ' + key, err);
    return fallback;
  }
}

async function removeItem(key) {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (err) {
    console.warn('[storage] removeItem error for key ' + key, err);
    return false;
  }
}

export {
  setItem,
  getItem,
  removeItem,
};
